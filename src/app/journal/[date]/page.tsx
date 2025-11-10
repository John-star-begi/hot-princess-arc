'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, loadJournal } from '@/lib/journal';

export default function JournalByDate() {
  const { date } = useParams<{ date: string }>();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        const existing = await loadJournal(user.id, date);
        setEntry(existing);
        setLoading(false);
      } catch {
        window.location.href = '/login';
      }
    })();
  }, [date]);

  if (loading)
    return (
      <div className="text-center text-rose-700/70 mt-20 animate-pulse">
        Loading your reflection…
      </div>
    );

  if (!entry)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="rounded-3xl bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(255,180,170,0.25)] p-8 space-y-4 max-w-md">
          <h1 className="font-serif italic text-rose-900 text-xl">Journal — {date}</h1>
          <p className="text-rose-700/70 italic">
            No reflections logged for this day
          </p>
        </div>
        <a href="/dashboard" className="mt-6 text-sm text-rose-700/80 hover:text-rose-900 underline">
          ← Back to Dashboard
        </a>
      </div>
    );

  const prettyDate = new Date(date).toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  function Row({ k, v }: { k: string; v: any }) {
    if (v === null || v === undefined || v === '') return null;
    const out = Array.isArray(v) ? v.join(', ') : String(v);
    return (
      <div className="flex justify-between">
        <span className="font-medium">{k}</span>
        <span>{out}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] px-4 py-10">
      <div className="rounded-3xl bg-white/50 backdrop-blur-xl shadow-[0_8px_30px_rgba(255,180,170,0.25)] p-6 space-y-5 max-w-md w-full">
        <h1 className="text-center font-serif italic text-rose-900 text-xl mb-3">{prettyDate}</h1>
        <p className="text-center text-sm text-rose-700">Phase: <span className="font-medium">{entry.phase}</span></p>

        {/* 🔥 Warmth & Temperature */}
        <Section title="Warmth and Temperature">
          <Row k="Warm after eating" v={entry.warm_after_eating} />
          <Row k="Hands and feet warmth" v={entry.hands_feet_warmth} />
          <Row k="Morning temp °C" v={entry.temp_morning_c} />
          <Row k="Evening temp °C" v={entry.temp_evening_c} />
        </Section>

        {/* ⚡ Energy & Mood */}
        <Section title="Energy and Mood">
          <Row k="Energy level" v={entry.energy_level} />
          <Row k="Mood stability" v={entry.mood_stability} />
          <Row k="Mid afternoon slump" v={entry.mid_afternoon_slump} />
          <Row k="Anxiety or irritability" v={entry.anxiety} />
        </Section>

        {/* 🍽️ Digestion & Appetite */}
        <Section title="Digestion and Appetite">
          <Row k="Appetite" v={entry.appetite} />
          <Row k="Bloating or gas" v={entry.bloating2} />
          <Row k="After meals felt" v={entry.post_meal} />
          <Row k="Bowel movement" v={entry.bowel} />
        </Section>

        {/* 💗 Hormonal Signals */}
        <Section title="Hormonal Signals">
          <Row k="Breast tenderness" v={entry.breast_tenderness} />
          <Row k="Discharge" v={entry.discharge} />
          <Row k="Libido" v={entry.libido} />
        </Section>

        {/* 🦴 Hair / Skin / Nails */}
        <Section title="Hair, Skin, Nails">
          <Row k="Hair shedding" v={entry.hair_shedding} />
          <Row k="Skin" v={entry.skin} />
          <Row k="Nails" v={entry.nails} />
        </Section>

        {/* 💪 Training & Recovery */}
        <Section title="Training and Recovery">
          <Row k="Activity" v={entry.activity} />
          <Row k="Effort" v={entry.effort} />
          <Row k="Felt energized after" v={entry.felt_energized} />
        </Section>

        {/* 🧂 Electrolytes & Hydration */}
        <Section title="Electrolytes and Hydration">
          <Row k="Salt craving" v={entry.salt_craving} />
          <Row k="OJ + salt + honey drink" v={entry.oj_salt_honey} />
          <Row k="Cramps or twitches" v={entry.cramps_twitches} />
        </Section>

        {/* 🌙 Sleep */}
        <Section title="Sleep">
          <Row k="Bedtime" v={entry.bedtime} />
          <Row k="Woke" v={entry.woke} />
          <Row k="Fell asleep easily" v={entry.fell_asleep_easily} />
          <Row k="Night wakings" v={entry.night_wakings} />
        </Section>

        {/* ✍️ One-Line Reflection */}
        <Section title="Reflection">
          <div className="italic text-rose-700/80">“{entry.one_line_reflection || '—'}”</div>
        </Section>

        {/* 🌕 Cycle-aware reflection */}
        {entry.phase === 'menstrual' && (
          <Section title="Menstrual reflections">
            <Row k="Flow" v={entry.m_flow} />
            <Row k="Clotting" v={entry.m_clotting} />
            <Row k="Cramps or pain" v={entry.m_cramps_pain} />
            <Row k="Energy recovery by Day 3 to 4" v={entry.m_energy_recovery_by_day3} />
            <Row k="Mood calmness" v={entry.m_mood_calmness} />
            <Row k="Warmth returning" v={entry.m_warmth_returning} />
            <Row k="Digestion improving" v={entry.m_digestion_improving} />
          </Section>
        )}
        {entry.phase === 'follicular' && (
          <Section title="Follicular reflections">
            <Row k="Energy rising" v={entry.f_energy_rising} />
            <Row k="Motivation and focus better" v={entry.f_motivation_focus_better} />
            <Row k="Water retention" v={entry.f_water_retention} />
            <Row k="Skin clarity" v={entry.f_skin_clarity} />
            <Row k="Any anxiety or restlessness" v={entry.f_anxiety_or_restlessness} />
            <Row k="Basal temp stable" v={entry.f_basal_temp_stable} />
          </Section>
        )}
        {entry.phase === 'ovulation' && (
          <Section title="Ovulation reflections">
            <Row k="Mucus clear and stretchy" v={entry.o_sign_mucus_clear} />
            <Row k="Mid cycle pain" v={entry.o_sign_midcycle_pain} />
            <Row k="High libido" v={entry.o_sign_high_libido} />
            <Row k="Breast tenderness" v={entry.o_sign_breast_tenderness} />
            <Row k="Ovulation felt strong" v={entry.o_felt_strong} />
            <Row k="Inflammation" v={entry.o_inflammation} />
            <Row k="Sleep quality" v={entry.o_sleep_quality} />
            <Row k="Appetite change" v={entry.o_appetite_change} />
          </Section>
        )}
        {entry.phase === 'luteal' && (
          <Section title="Luteal reflections">
            <Row k="Temperature stable" v={entry.l_temperature_stable} />
            <Row k="Mood stability" v={entry.l_mood_stability} />
            <Row k="Sleep quality" v={entry.l_sleep_quality} />
            <Row k="Cravings" v={entry.l_cravings} />
            <Row k="PMS signs" v={entry.l_pms_signs} />
            <Row k="Pre spotting" v={entry.l_pre_spotting} />
            <Row k="Energy" v={entry.l_energy} />
          </Section>
        )}
      </div>

      <a href="/dashboard" className="mt-6 text-sm text-rose-700/80 hover:text-rose-900 underline">
        ← Back to Dashboard
      </a>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 text-rose-800">
      <h2 className="text-rose-900 font-medium">{title}</h2>
      <div className="rounded-2xl bg-white/60 p-4 shadow-[0_8px_20px_rgba(255,180,170,0.18)]">
        {children}
      </div>
    </div>
  );
}
