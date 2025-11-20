'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { getUser, loadUserSettings, loadJournal, saveJournal, JournalForm } from '@/lib/journal';
import { cycleDay, phaseForDay } from '@/lib/phase';

type PhaseSlug = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';

/* ---------- Timezone safe date helpers ---------- */
function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateOnly(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/* ---------- Helper: turn journal form into text ---------- */
function buildJournalText(form: JournalForm, phase: PhaseSlug, date: string): string {
  const lines: string[] = [];

  lines.push(`date: ${date}`);
  lines.push(`cycle phase: ${phase}`);
  lines.push('');

  const yesNo = (v: boolean | null | undefined) =>
    v === true ? 'yes' : v === false ? 'no' : 'not recorded';

  const push = (label: string, value: any) => {
    if (value === undefined || value === null || value === '') return;
    lines.push(`${label}: ${value}`);
  };

  // warmth and temperature
  lines.push('warmth and temperature');
  push('warm after eating', form.warm_after_eating);
  push('hands and feet warmth (1 to 5)', form.hands_feet_warmth);
  push('morning temp °C', form.temp_morning_c);
  push('evening temp °C', form.temp_evening_c);
  lines.push('');

  // energy and mood
  lines.push('energy and mood');
  push('energy level (1 to 5)', form.energy_level);
  push('mood stability (1 to 5)', form.mood_stability);
  push('mid afternoon slump', yesNo(form.mid_afternoon_slump));
  push('anxiety or irritability', form.anxiety);
  lines.push('');

  // digestion and appetite
  lines.push('digestion and appetite');
  push('appetite', form.appetite);
  push('bloating or gas', form.bloating2);
  push('after meals you felt', form.post_meal);
  push('bowel movement', form.bowel);
  lines.push('');

  // hormonal signals
  lines.push('hormonal signals');
  push('breast tenderness', form.breast_tenderness);
  push('discharge', form.discharge);
  push('libido', form.libido);
  lines.push('');

  // hair skin nails
  lines.push('hair skin nails');
  push('hair shedding', form.hair_shedding);
  push('skin', form.skin);
  push('nails', form.nails);
  lines.push('');

  // training and recovery
  lines.push('training and recovery');
  push('activity type', form.activity);
  push('effort (1 to 5)', form.effort);
  push('felt energized after', yesNo(form.felt_energized));
  lines.push('');

  // electrolytes and hydration
  lines.push('electrolytes and hydration');
  push('salt craving', form.salt_craving);
  push('oj with salt and honey', yesNo(form.oj_salt_honey));
  push('cramps or twitches', yesNo(form.cramps_twitches));
  lines.push('');

  // sleep
  lines.push('sleep');
  push('bedtime', form.bedtime);
  push('woke', form.woke);
  push('fell asleep easily', yesNo(form.fell_asleep_easily));
  if (form.night_wakings !== null && form.night_wakings !== undefined) {
    push('night wakings', form.night_wakings);
  }
  lines.push('');

  // one line reflection
  lines.push('one line reflection');
  push('reflection', form.one_line_reflection);
  lines.push('');

  // cycle specific
  if (phase === 'menstrual') {
    lines.push('menstrual details');
    push('flow', form.m_flow);
    push('clotting', form.m_clotting);
    push('cramps or pain (1 to 5)', form.m_cramps_pain);
    push('energy recovery by day 3 to 4', yesNo(form.m_energy_recovery_by_day3));
    push('mood calmness (1 to 5)', form.m_mood_calmness);
    push('warmth returning since period start', yesNo(form.m_warmth_returning));
    push('digestion improving versus pre period', yesNo(form.m_digestion_improving));
    lines.push('');
  }

  if (phase === 'follicular') {
    lines.push('follicular details');
    push('energy rising', yesNo(form.f_energy_rising));
    push('motivation and focus better than during period', yesNo(form.f_motivation_focus_better));
    push('water retention or puffiness', yesNo(form.f_water_retention));
    push('skin clarity', form.f_skin_clarity);
    push('anxiety or restlessness', yesNo(form.f_anxiety_or_restlessness));
    push('basal temperature stable', yesNo(form.f_basal_temp_stable));
    lines.push('');
  }

  if (phase === 'ovulation') {
    lines.push('ovulation details');
    push('mucus clear and stretchy', yesNo(form.o_sign_mucus_clear));
    push('mid cycle pain', yesNo(form.o_sign_midcycle_pain));
    push('high libido', yesNo(form.o_sign_high_libido));
    push('breast tenderness', yesNo(form.o_sign_breast_tenderness));
    push('ovulation felt strong', yesNo(form.o_felt_strong));
    push('inflammation (joints bloating headache)', yesNo(form.o_inflammation));
    push('sleep quality', form.o_sleep_quality);
    push('appetite change', form.o_appetite_change);
    lines.push('');
  }

  if (phase === 'luteal') {
    lines.push('luteal details');
    push('temperature stable', yesNo(form.l_temperature_stable));
    push('mood stability', form.l_mood_stability);
    push('sleep quality', form.l_sleep_quality);
    if (form.l_cravings && form.l_cravings.length > 0) {
      push('cravings', form.l_cravings.join(', '));
    }
    push('pms signs', form.l_pms_signs);
    push('pre spotting or pink discharge', yesNo(form.l_pre_spotting));
    push('energy (1 to 5)', form.l_energy);
    lines.push('');
  }

  if (form.notes) {
    lines.push('extra notes');
    lines.push(form.notes);
    lines.push('');
  }

  return lines.join('\n');
}

/* ---------- Main component ---------- */
export default function JournalModal({ onClose }: { onClose: () => void }) {
  const today = formatDateOnly(new Date());

  const [form, setForm] = useState<JournalForm>({});
  const [userSettings, setUserSettings] = useState<{ start_date: string; cycle_length: number } | null>(null);
  const [message, setMessage] = useState('');
  const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);
  const [phase, setPhase] = useState<PhaseSlug>('unknown');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        const settings = await loadUserSettings(user.id);
        if (settings) {
          setUserSettings(settings);
          const cd = cycleDay(
            parseDateOnly(today),
            parseDateOnly(settings.start_date),
            settings.cycle_length
          );
          setPhase(phaseForDay(cd) as PhaseSlug);
        }

        const existing = await loadJournal(user.id, today);
        if (existing) {
          setIsAlreadyLogged(true);
          setForm({ ...existing });
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [today]);

  function setField<K extends keyof JournalForm>(key: K, value: JournalForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const lutealCravingOptions = ['sugar', 'fat', 'salt'] as const;

  const PhaseBlock = useMemo(() => {
    if (phase === 'menstrual') {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-rose-900">Menstrual</h3>
          <div className="grid gap-2">
            <SelectRow label="Flow" value={form.m_flow ?? null} onChange={(v) => setField('m_flow', v as any)}
              options={[['light','Light'],['normal','Normal'],['heavy','Heavy']]} />
            <SelectRow label="Clotting" value={form.m_clotting ?? null} onChange={(v) => setField('m_clotting', v as any)}
              options={[['none','None'],['mild','Mild'],['frequent','Frequent']]} />
            <NumberRow label="Cramps or pain (1 to 5)" value={form.m_cramps_pain ?? null} onChange={(n) => setField('m_cramps_pain', n as any)} min={1} max={5} />
            <YesNoRow label="Energy recovery by Day 3 to 4" value={form.m_energy_recovery_by_day3 ?? null} onChange={(b) => setField('m_energy_recovery_by_day3', b)} />
            <NumberRow label="Mood calmness (1 to 5)" value={form.m_mood_calmness ?? null} onChange={(n) => setField('m_mood_calmness', n as any)} min={1} max={5} />
            <YesNoRow label="Warmth returning since period start" value={form.m_warmth_returning ?? null} onChange={(b) => setField('m_warmth_returning', b)} />
            <YesNoRow label="Digestion improving versus pre-period" value={form.m_digestion_improving ?? null} onChange={(b) => setField('m_digestion_improving', b)} />
          </div>
        </div>
      );
    }
    if (phase === 'follicular') {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-rose-900">Follicular</h3>
          <div className="grid gap-2">
            <YesNoRow label="Energy rising" value={form.f_energy_rising ?? null} onChange={(b) => setField('f_energy_rising', b)} />
            <YesNoRow label="Motivation and focus better than during period" value={form.f_motivation_focus_better ?? null} onChange={(b) => setField('f_motivation_focus_better', b)} />
            <YesNoRow label="Any water retention or puffiness" value={form.f_water_retention ?? null} onChange={(b) => setField('f_water_retention', b)} />
            <SelectRow label="Skin clarity" value={form.f_skin_clarity ?? null} onChange={(v) => setField('f_skin_clarity', v as any)}
              options={[['improving','Improving'],['same','Same'],['worse','Worse']]} />
            <YesNoRow label="Any anxiety or restlessness" value={form.f_anxiety_or_restlessness ?? null} onChange={(b) => setField('f_anxiety_or_restlessness', b)} />
            <YesNoRow label="Basal temperature stable" value={form.f_basal_temp_stable ?? null} onChange={(b) => setField('f_basal_temp_stable', b)} />
          </div>
        </div>
      );
    }
    if (phase === 'ovulation') {
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-rose-900">Ovulation</h3>
          <div className="grid gap-2">
            <YesNoRow label="Mucus clear and stretchy" value={form.o_sign_mucus_clear ?? null} onChange={(b) => setField('o_sign_mucus_clear', b)} />
            <YesNoRow label="Mid-cycle pain" value={form.o_sign_midcycle_pain ?? null} onChange={(b) => setField('o_sign_midcycle_pain', b)} />
            <YesNoRowRow label="High libido" value={form.o_sign_high_libido ?? null} onChange={(b) => setField('o_sign_high_libido', b)} />
            <YesNoRow label="Breast tenderness" value={form.o_sign_breast_tenderness ?? null} onChange={(b) => setField('o_sign_breast_tenderness', b)} />
            <YesNoRow label="Did ovulation feel strong" value={form.o_felt_strong ?? null} onChange={(b) => setField('o_felt_strong', b)} />
            <YesNoRow label="Any inflammation like joints, bloating, headache" value={form.o_inflammation ?? null} onChange={(b) => setField('o_inflammation', b)} />
            <SelectRow label="Sleep quality" value={form.o_sleep_quality ?? null} onChange={(v) => setField('o_sleep_quality', v as any)}
              options={[['good','Good'],['poor','Poor']]} />
            <SelectRow label="Appetite change" value={form.o_appetite_change ?? null} onChange={(v) => setField('o_appetite_change', v as any)}
              options={[['increase','Increase'],['decrease','Decrease']]} />
          </div>
        </div>
      );
    }
    if (phase === 'luteal') {
      const selected = new Set(form.l_cravings ?? []);
      function toggleCraving(value: string) {
        const next = new Set(selected);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        setField('l_cravings', Array.from(next));
      }
      return (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-rose-900">Luteal</h3>
          <div className="grid gap-2">
            <YesNoRow label="Temperature stable" value={form.l_temperature_stable ?? null} onChange={(b) => setField('l_temperature_stable', b)} />
            <SelectRow label="Mood stability" value={form.l_mood_stability ?? null} onChange={(v) => setField('l_mood_stability', v as any)}
              options={[['good','Good'],['irritable','Irritable'],['low','Low']]} />
            <SelectRow label="Sleep quality" value={form.l_sleep_quality ?? null} onChange={(v) => setField('l_sleep_quality', v as any)}
              options={[['good','Good'],['interrupted','Interrupted']]} />
            <div>
              <label className="block text-sm text-rose-800 mb-1">Cravings</label>
              <div className="flex gap-2">
                {lutealCravingOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCraving(c)}
                    className={`px-3 py-1 rounded-full text-sm ${selected.has(c) ? 'bg-rose-300/50 text-rose-900' : 'bg-rose-50 text-rose-700'}`}
                  >
                    {c[0].toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <SelectRow label="PMS signs" value={form.l_pms_signs ?? null} onChange={(v) => setField('l_pms_signs', v as any)}
              options={[['none','None'],['mild','Mild'],['strong','Strong']]} />
            <YesNoRow label="Any pre-spotting or pink discharge" value={form.l_pre_spotting ?? null} onChange={(b) => setField('l_pre_spotting', b)} />
            <NumberRow label="Energy (1 to 5)" value={form.l_energy ?? null} onChange={(n) => setField('l_energy', n as any)} min={1} max={5} />
          </div>
        </div>
      );
    }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, form]);

  const journalText = useMemo(
    () => buildJournalText(form, phase, today),
    [form, phase, today]
  );

  async function handleSave() {
    try {
      const user = await getUser();
      const { message } = await saveJournal(user.id, today, form, userSettings ?? undefined);
      setMessage(message);
      setIsAlreadyLogged(true);
    } catch {
      setMessage('Error saving ❌');
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(journalText);
      setMessage('Copied to clipboard ✅');
    } catch {
      setMessage('Could not copy ❌');
    }
  }

  function handlePrintPdf() {
    try {
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
      });

      // soft background
      doc.setFillColor(255, 249, 243); // #FFF9F3
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(90, 40, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);

      const marginLeft = 15;
      const marginTop = 20;
      const maxWidth = 180;

      const lines = doc.splitTextToSize(journalText, maxWidth);
      doc.text(lines, marginLeft, marginTop);

      doc.save(`journal-${today}.pdf`);
      setMessage('PDF downloaded ✅');
    } catch (err) {
      console.error(err);
      setMessage('Could not generate PDF ❌');
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalysis(null);
    setMessage('');
    try {
      const res = await fetch('/api/analyze-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, phase, text: journalText }),
      });
      if (!res.ok) {
        throw new Error('bad response');
      }
      const json = await res.json();
      setAnalysis(json.analysis ?? 'No analysis returned');
    } catch (err) {
      console.error(err);
      setMessage('Could not analyze today ❌');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gradient-to-b from-[#FFF9F3] to-[#FFEAE3] rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-auto p-6 shadow-[0_8px_30px_rgba(255,180,170,0.25)] overflow-y-auto max-h-[90vh]"
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-playfair italic text-rose-900">
              Log your journal
            </h2>
            <button onClick={onClose} className="text-rose-500 text-xl hover:text-rose-700">✕</button>
          </div>

          {isAlreadyLogged && (
            <p className="text-center text-rose-700 mb-4 italic">
              Already logged for today
            </p>
          )}

          {/* 1. Warmth and temperature */}
          <Section title="Warmth and Temperature">
            <SelectRow
              label="Did you feel warm after eating"
              value={form.warm_after_eating ?? null}
              onChange={(v) => setField('warm_after_eating', v as any)}
              options={[
                ['no_cold','No, cold'],
                ['somewhat','Somewhat'],
                ['comfortably_warm','Comfortably warm']
              ]}
              disabled={isAlreadyLogged}
            />
            <NumberRow
              label="Hands and feet warmth today (1 cold to 5 warm)"
              value={form.hands_feet_warmth ?? null}
              onChange={(n) => setField('hands_feet_warmth', n as any)}
              min={1}
              max={5}
              disabled={isAlreadyLogged}
            />
            <TwoInputsRow
              labelLeft="Morning temp °C"
              labelRight="Evening temp °C"
              leftValue={form.temp_morning_c ?? null}
              rightValue={form.temp_evening_c ?? null}
              onLeft={(n) => setField('temp_morning_c', n as any)}
              onRight={(n) => setField('temp_evening_c', n as any)}
              disabled={isAlreadyLogged}
            />
          </Section>

          {/* 2. Energy and mood */}
          <Section title="Energy and Mood">
            <NumberRow label="Energy level (1 to 5)" value={form.energy_level ?? null} onChange={(n)=>setField('energy_level', n as any)} min={1} max={5} disabled={isAlreadyLogged} />
            <NumberRow label="Mood stability (1 to 5)" value={form.mood_stability ?? null} onChange={(n)=>setField('mood_stability', n as any)} min={1} max={5} disabled={isAlreadyLogged} />
            <YesNoRow label="Mid-afternoon slump" value={form.mid_afternoon_slump ?? null} onChange={(b)=>setField('mid_afternoon_slump', b)} disabled={isAlreadyLogged}/>
            <SelectRow label="Anxiety or irritability today" value={form.anxiety ?? null} onChange={(v)=>setField('anxiety', v as any)}
              options={[['none','None'],['mild','Mild'],['moderate','Moderate'],['high','High']]} disabled={isAlreadyLogged} />
          </Section>

          {/* 3. Digestion and appetite */}
          <Section title="Digestion and Appetite">
            <SelectRow label="Appetite" value={form.appetite ?? null} onChange={(v)=>setField('appetite', v as any)}
              options={[['low','Low'],['normal','Normal'],['strong','Strong']]} disabled={isAlreadyLogged}/>
            <SelectRow label="Bloating or gas" value={form.bloating2 ?? null} onChange={(v)=>setField('bloating2', v as any)}
              options={[['none','None'],['mild','Mild'],['severe','Severe']]} disabled={isAlreadyLogged}/>
            <SelectRow label="After meals you felt" value={form.post_meal ?? null} onChange={(v)=>setField('post_meal', v as any)}
              options={[['sleepy','Sleepy'],['stable','Stable'],['energized','Energized']]} disabled={isAlreadyLogged}/>
            <SelectRow label="Bowel movement quality" value={form.bowel ?? null} onChange={(v)=>setField('bowel', v as any)}
              options={[['normal','Normal'],['loose','Loose'],['hard','Hard'],['greasy','Greasy']]} disabled={isAlreadyLogged}/>
          </Section>

          {/* 4. Hormonal signals */}
          <Section title="Hormonal Signals">
            <SelectRow label="Breast tenderness" value={form.breast_tenderness ?? null} onChange={(v)=>setField('breast_tenderness', v as any)}
              options={[['none','None'],['mild','Mild'],['noticeable','Noticeable']]} disabled={isAlreadyLogged}/>
            <SelectRow label="Discharge type" value={form.discharge ?? null} onChange={(v)=>setField('discharge', v as any)}
              options={[['dry','Dry'],['sticky','Sticky'],['creamy','Creamy'],['watery_eggwhite','Watery or egg white']]} disabled={isAlreadyLogged}/>
            <SelectRow label="Libido" value={form.libido ?? null} onChange={(v)=>setField('libido', v as any)}
              options={[['low','Low'],['normal','Normal'],['high','High']]} disabled={isAlreadyLogged}/>
          </Section>

          {/* 5. Hair skin nails */}
          <Section title="Hair, Skin, Nails">
            <SelectRow label="Hair shedding" value={form.hair_shedding ?? null} onChange={(v)=>setField('hair_shedding', v as any)}
              options={[['none','None'],['slight','Slight'],['noticeable','Noticeable']]} disabled={isAlreadyLogged}/>
            <SelectRow label="Skin" value={form.skin ?? null} onChange={(v)=>setField('skin', v as any)}
              options={[['glowing','Glowing'],['dry','Dry'],['oily','Oily'],['breaking_out','Breaking out']]} disabled={isAlreadyLogged}/>
            <SelectRow label="Nails" value={form.nails ?? null} onChange={(v)=>setField('nails', v as any)}
              options={[['strong','Strong'],['peeling','Peeling'],['brittle','Brittle']]} disabled={isAlreadyLogged}/>
          </Section>

          {/* 6. Training and recovery */}
          <Section title="Training and Recovery">
            <SelectRow label="Activity type" value={form.activity ?? null} onChange={(v)=>setField('activity', v as any)}
              options={[['rest','Rest'],['walk','Walk'],['pilates','Pilates'],['weights','Weights']]} disabled={isAlreadyLogged}/>
            <NumberRow label="Effort (1 to 5)" value={form.effort ?? null} onChange={(n)=>setField('effort', n as any)} min={1} max={5} disabled={isAlreadyLogged}/>
            <YesNoRow label="Felt energized after" value={form.felt_energized ?? null} onChange={(b)=>setField('felt_energized', b)} disabled={isAlreadyLogged}/>
          </Section>

          {/* 7. Electrolytes and hydration */}
          <Section title="Electrolytes and Hydration">
            <SelectRow label="Salt craving" value={form.salt_craving ?? null} onChange={(v)=>setField('salt_craving', v as any)}
              options={[['none','None'],['mild','Mild'],['strong','Strong']]} disabled={isAlreadyLogged}/>
            <YesNoRow label="Orange juice with salt and honey drink today" value={form.oj_salt_honey ?? null} onChange={(b)=>setField('oj_salt_honey', b)} disabled={isAlreadyLogged}/>
            <YesNoRow label="Any cramps or twitches" value={form.cramps_twitches ?? null} onChange={(b)=>setField('cramps_twitches', b)} disabled={isAlreadyLogged}/>
          </Section>

          {/* 8. Sleep */}
          <Section title="Sleep">
            <TimePairRow
              labelLeft="Bedtime"
              labelRight="Woke"
              leftValue={form.bedtime ?? null}
              rightValue={form.woke ?? null}
              onLeft={(v)=>setField('bedtime', v as any)}
              onRight={(v)=>setField('woke', v as any)}
              disabled={isAlreadyLogged}
            />
            <YesNoRow label="Fell asleep easily" value={form.fell_asleep_easily ?? null} onChange={(b)=>setField('fell_asleep_easily', b)} disabled={isAlreadyLogged}/>
            <SelectRow label="Night wakings" value={form.night_wakings?.toString() ?? null} onChange={(v)=>setField('night_wakings', parseInt(v,10) as any)}
              options={[['0','0'],['1','1'],['2','2+']]} disabled={isAlreadyLogged}/>
          </Section>

          {/* 9. One line reflection */}
          <Section title="One line reflection">
            <textarea
              className="w-full rounded-2xl bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] p-3 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:outline-none"
              placeholder="Today I felt ___. Tomorrow I will adjust ___."
              value={form.one_line_reflection ?? ''}
              onChange={(e)=>setField('one_line_reflection', e.target.value)}
              disabled={isAlreadyLogged}
            />
          </Section>

          {/* 10. Cycle aware block */}
          {PhaseBlock}

          {!isAlreadyLogged && (
            <button
              onClick={handleSave}
              className="w-full mt-5 rounded-full bg-gradient-to-r from-[#FFD7C8] to-[#F7A7A7] text-white py-3 font-medium shadow-[0_8px_25px_rgba(255,180,170,0.4)] hover:brightness-105 transition"
            >
              Save Entry
            </button>
          )}

          {message && <p className="text-center text-rose-700 mt-3 text-sm">{message}</p>}

          {/* export and analyze area – only when already logged */}
          {isAlreadyLogged && (
            <div className="mt-4">
              <p className="text-center text-rose-800 text-sm mb-2">
                export and insights
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="flex-1 rounded-full bg-white/80 border border-[#FFD7C8] text-rose-800 py-2 text-sm shadow-sm hover:bg-white transition"
                >
                  print pdf
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 rounded-full bg-white/80 border border-[#FFD7C8] text-rose-800 py-2 text-sm shadow-sm hover:bg-white transition"
                >
                  copy to clipboard
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="flex-1 rounded-full bg-gradient-to-r from-[#FFD7C8] to-[#F7A7A7] text-white py-2 text-sm shadow-[0_6px_18px_rgba(255,180,170,0.4)] hover:brightness-105 transition disabled:opacity-60"
                  disabled={analyzing}
                >
                  {analyzing ? 'analyzing…' : 'analyze'}
                </button>
              </div>

              {analysis && (
                <div className="mt-3 rounded-2xl bg-white/70 p-3 text-xs text-rose-900 whitespace-pre-wrap">
                  {analysis}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Small UI helpers ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/60 p-4 mb-4 shadow-[0_8px_20px_rgba(255,180,170,0.18)]">
      <h3 className="text-rose-900 font-medium mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SelectRow({
  label, value, onChange, options, disabled
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  options: [string, string][];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-rose-800 mb-1">{label}</label>
      <select
        className="w-full rounded-full bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] px-4 py-2 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:outline-none"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="" disabled>Choose</option>
        {options.map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
    </div>
  );
}

function NumberRow({
  label, value, onChange, min=1, max=5, disabled
}: {
  label: string;
  value: number | null | undefined;
  onChange: (v: number) => void;
  min?: number; max?: number;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-rose-800 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        className="w-full rounded-full bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] px-4 py-2 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:outline-none"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? NaN : parseInt(e.target.value, 10))}
        disabled={disabled}
      />
    </div>
  );
}

function TwoInputsRow({
  labelLeft, labelRight, leftValue, rightValue, onLeft, onRight, disabled
}: {
  labelLeft: string; labelRight: string;
  leftValue: number | null; rightValue: number | null;
  onLeft: (n: number) => void; onRight: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm text-rose-800 mb-1">{labelLeft}</label>
        <input
          type="number" step="0.1"
          className="w-full rounded-full bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] px-4 py-2 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:outline-none"
          value={leftValue ?? ''}
          onChange={(e)=> onLeft(e.target.value === '' ? NaN : parseFloat(e.target.value))}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm text-rose-800 mb-1">{labelRight}</label>
        <input
          type="number" step="0.1"
          className="w-full rounded-full bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] px-4 py-2 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:outline-none"
          value={rightValue ?? ''}
          onChange={(e)=> onRight(e.target.value === '' ? NaN : parseFloat(e.target.value))}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function TimePairRow({
  labelLeft, labelRight, leftValue, rightValue, onLeft, onRight, disabled
}: {
  labelLeft: string; labelRight: string;
  leftValue: string | null; rightValue: string | null;
  onLeft: (v: string) => void; onRight: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm text-rose-800 mb-1">{labelLeft}</label>
        <input
          type="time"
          className="w-full rounded-full bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] px-4 py-2 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:outline-none"
          value={leftValue ?? ''}
          onChange={(e)=> onLeft(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm text-rose-800 mb-1">{labelRight}</label>
        <input
          type="time"
          className="w-full rounded-full bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] px-4 py-2 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:outline-none"
          value={rightValue ?? ''}
          onChange={(e)=> onRight(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function YesNoRow({
  label, value, onChange, disabled
}: {
  label: string;
  value: boolean | null | undefined;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-rose-800 mb-1">{label}</label>
      <div className="flex gap-2">
        <button type="button" onClick={()=>onChange(true)}
          className={`px-3 py-1 rounded-full text-sm ${value === true ? 'bg-rose-300/50 text-rose-900' : 'bg-rose-50 text-rose-700'}`}
          disabled={disabled}
        >Yes</button>
        <button type="button" onClick={()=>onChange(false)}
          className={`px-3 py-1 rounded-full text-sm ${value === false ? 'bg-rose-300/50 text-rose-900' : 'bg-rose-50 text-rose-700'}`}
          disabled={disabled}
        >No</button>
      </div>
    </div>
  );
}

// slight variant to avoid label collision
function YesNoRowRow(props: {
  label: string;
  value: boolean | null | undefined;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return <YesNoRow {...props} />;
}
