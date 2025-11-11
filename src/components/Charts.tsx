'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { cycleDay, phaseForDay, phasePalette } from '@/lib/phase';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

/* ---------- Types ---------- */

type PhaseKey = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
type ViewKey = 'energy_mood' | 'temperature' | 'sleep' | 'digestion' | 'phase_trends';

type Settings = {
  start_date: string;
  cycle_length: number;
};

type JournalRow = {
  date: string;
  phase: PhaseKey | null;

  energy_level: number | null;      // 1-5
  mood_stability: number | null;    // 1-5

  hands_feet_warmth: number | null; // 1-5
  temp_morning_c: number | null;
  temp_evening_c: number | null;

  fell_asleep_easily: boolean | null;
  night_wakings: number | null;     // 0-3
  felt_energized: boolean | null;

  appetite: 'low' | 'normal' | 'strong' | null;
  bloating2: 'none' | 'mild' | 'severe' | null;
  post_meal: 'sleepy' | 'stable' | 'energized' | null;

  notes?: string | null;
};

type ChartPointBase = { date: string; cycleDay: number; phase: PhaseKey };
type EnergyMoodPoint = ChartPointBase & { energy: number; mood: number };
type TemperaturePoint = ChartPointBase & { morning: number; evening: number; warmth: number };
type SleepPoint = ChartPointBase & { asleepEasy: number; nightWakings: number; energized: number };
type DigestionPoint = ChartPointBase & { appetiteScore: number; bloatingScore: number; postMealScore: number };
type PhaseAverages = { phase: PhaseKey; energy: number; mood: number; warmth: number; morning: number; evening: number };

/* ---------- Helpers ---------- */

const COLORS: Record<string, string> = {
  energy: '#CDEDC7',
  mood: '#F7A7A7',
  warmth: '#D1B3FF',
  morning: '#7DB3FF',
  evening: '#FF9FB1',
  asleepEasy: '#9ADBC1',
  nightWakings: '#F7C566',
  energized: '#B6A1E1',
  appetite: '#F6C0A3',
  bloating: '#E99DA1',
  postMeal: '#A2D7D1',
};

function phaseBands(cycleLength: number) {
  const bands: { phase: PhaseKey; start: number; end: number }[] = [];
  let currentPhase = phaseForDay(1, cycleLength) as PhaseKey;
  let start = 1;
  for (let d = 2; d <= cycleLength; d++) {
    const p = phaseForDay(d, cycleLength) as PhaseKey;
    if (p !== currentPhase) {
      bands.push({ phase: currentPhase, start, end: d - 1 });
      currentPhase = p;
      start = d;
    }
  }
  bands.push({ phase: currentPhase, start, end: cycleLength });
  return bands;
}

function appetiteToScore(a: JournalRow['appetite']): number {
  if (a === 'low') return 1;
  if (a === 'normal') return 2;
  if (a === 'strong') return 3;
  return 0;
}
function bloatingToScore(b: JournalRow['bloating2']): number {
  if (b === 'none') return 0;
  if (b === 'mild') return 1;
  if (b === 'severe') return 2;
  return 0;
}
function postMealToScore(p: JournalRow['post_meal']): number {
  if (p === 'sleepy') return 1;
  if (p === 'stable') return 2;
  if (p === 'energized') return 3;
  return 0;
}

/* ---------- Component ---------- */

export function Charts() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<ViewKey>('energy_mood');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: s } = await supabase
        .from('settings')
        .select('start_date, cycle_length')
        .eq('user_id', user.id)
        .maybeSingle();

      const since = new Date();
      since.setDate(since.getDate() - 180);
      const sinceStr = since.toISOString().slice(0, 10);

      const { data: j } = await supabase
        .from('journals')
        .select(
          'date, phase, energy_level, mood_stability, hands_feet_warmth, temp_morning_c, temp_evening_c, fell_asleep_easily, night_wakings, felt_energized, appetite, bloating2, post_meal, notes'
        )
        .gte('date', sinceStr)
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (s) {
        setSettings({ start_date: s.start_date, cycle_length: Number(s.cycle_length) });
      } else {
        setSettings(null);
      }

      // Safe normalization for Vercel / strict TS
      const jRows: unknown = j;
      const arr = Array.isArray(jRows) ? jRows : [];
      const normalized: JournalRow[] = arr.map((r: Record<string, unknown>) => ({
        date: String(r.date ?? ''),
        phase: (r.phase ?? null) as PhaseKey | null,
        energy_level: (r.energy_level ?? null) as number | null,
        mood_stability: (r.mood_stability ?? null) as number | null,
        hands_feet_warmth: (r.hands_feet_warmth ?? null) as number | null,
        temp_morning_c: (r.temp_morning_c ?? null) as number | null,
        temp_evening_c: (r.temp_evening_c ?? null) as number | null,
        fell_asleep_easily: (r.fell_asleep_easily ?? null) as boolean | null,
        night_wakings: (r.night_wakings ?? null) as number | null,
        felt_energized: (r.felt_energized ?? null) as boolean | null,
        appetite: (r.appetite ?? null) as 'low' | 'normal' | 'strong' | null,
        bloating2: (r.bloating2 ?? null) as 'none' | 'mild' | 'severe' | null,
        post_meal: (r.post_meal ?? null) as 'sleepy' | 'stable' | 'energized' | null,
        notes: (r.notes ?? null) as string | null,
      }));

      setRows(normalized);
      setLoading(false);
    })();
  }, []);

  /* ---------- Derived data ---------- */

  const basePoints = useMemo<ChartPointBase[]>(() => {
    if (!settings) return [];
    const startD = new Date(settings.start_date);
    return rows.map((r) => {
      const d = new Date(r.date);
      const cd = cycleDay(d, startD, settings.cycle_length);
      const phase = (r.phase ?? (phaseForDay(cd, settings.cycle_length) as PhaseKey)) as PhaseKey;
      return { date: r.date, cycleDay: cd, phase };
    });
  }, [rows, settings]);

  const energyMoodData = useMemo<EnergyMoodPoint[]>(() => {
    return basePoints.map((bp, i) => ({
      ...bp,
      energy: rows[i]?.energy_level ?? 0,
      mood: rows[i]?.mood_stability ?? 0,
    }));
  }, [basePoints, rows]);

  const temperatureData = useMemo<TemperaturePoint[]>(() => {
    return basePoints.map((bp, i) => ({
      ...bp,
      morning: Number(rows[i]?.temp_morning_c ?? 0),
      evening: Number(rows[i]?.temp_evening_c ?? 0),
      warmth: rows[i]?.hands_feet_warmth ?? 0,
    }));
  }, [basePoints, rows]);

  const sleepData = useMemo<SleepPoint[]>(() => {
    return basePoints.map((bp, i) => ({
      ...bp,
      asleepEasy: rows[i]?.fell_asleep_easily ? 1 : 0,
      nightWakings: rows[i]?.night_wakings ?? 0,
      energized: rows[i]?.felt_energized ? 1 : 0,
    }));
  }, [basePoints, rows]);

  const digestionData = useMemo<DigestionPoint[]>(() => {
    return basePoints.map((bp, i) => ({
      ...bp,
      appetiteScore: appetiteToScore(rows[i]?.appetite ?? null),
      bloatingScore: bloatingToScore(rows[i]?.bloating2 ?? null),
      postMealScore: postMealToScore(rows[i]?.post_meal ?? null),
    }));
  }, [basePoints, rows]);

  const phaseAverages = useMemo<PhaseAverages[]>(() => {
    const acc: Record<PhaseKey, { energy: number; mood: number; warmth: number; morning: number; evening: number; count: number }> = {
      menstrual: { energy: 0, mood: 0, warmth: 0, morning: 0, evening: 0, count: 0 },
      follicular: { energy: 0, mood: 0, warmth: 0, morning: 0, evening: 0, count: 0 },
      ovulation:  { energy: 0, mood: 0, warmth: 0, morning: 0, evening: 0, count: 0 },
      luteal:     { energy: 0, mood: 0, warmth: 0, morning: 0, evening: 0, count: 0 },
    };
    temperatureData.forEach((p, idx) => {
      const ph = p.phase;
      const r = rows[idx];
      acc[ph].energy  += r?.energy_level ?? 0;
      acc[ph].mood    += r?.mood_stability ?? 0;
      acc[ph].warmth  += r?.hands_feet_warmth ?? 0;
      acc[ph].morning += Number(r?.temp_morning_c ?? 0);
      acc[ph].evening += Number(r?.temp_evening_c ?? 0);
      acc[ph].count  += 1;
    });
    const result = (Object.keys(acc) as PhaseKey[]).map((k) => {
      const v = acc[k];
      const c = Math.max(1, v.count);
      return {
        phase: k,
        energy: +(v.energy / c).toFixed(1),
        mood: +(v.mood / c).toFixed(1),
        warmth: +(v.warmth / c).toFixed(1),
        morning: +(v.morning / c).toFixed(1),
        evening: +(v.evening / c).toFixed(1),
      };
    });
    const order: PhaseKey[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];
    result.sort((a, b) => order.indexOf(a.phase) - order.indexOf(b.phase));
    return result;
  }, [temperatureData, rows]);

  /* ---------- UI ---------- */

  if (loading) return <p>Loading charts…</p>;
  if (!settings) return <p className="text-gray-600">Add your cycle settings to begin.</p>;

  const ToggleButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition ${
        active ? 'bg-[#FFD7C8] text-rose-900 shadow' : 'bg-[#FFF3EB] text-rose-800 hover:brightness-105'
      }`}
    >
      {label}
    </button>
  );

  const bands = phaseBands(settings.cycle_length);

  // Build a single child element for ResponsiveContainer (fixes “multiple children” error)
  const chartContent = (() => {
    switch (view) {
      case 'energy_mood':
        return (
          <LineChart data={energyMoodData} margin={{ top: 16, right: 10, bottom: 8, left: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(125, 85, 80, 0.08)" />
            <XAxis
              dataKey="cycleDay"
              type="number"
              domain={[1, settings.cycle_length]}
              tickFormatter={(v: number) => `Day ${v}`}
              tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }}
            />
            <YAxis domain={[0, 5]} tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,249,243,0.95)',
                boxShadow: '0 8px 24px rgba(255,180,170,0.25)',
              }}
            />
            {bands.map((b) => (
              <ReferenceArea
                key={`${b.phase}-${b.start}-${b.end}`}
                x1={b.start}
                x2={b.end}
                y1={0}
                y2={5}
                fill={(phasePalette as Record<string, string>)[b.phase] || '#eee'}
                fillOpacity={0.08}
                ifOverflow="extendDomain"
              />
            ))}
            <Line type="monotone" dataKey="energy" stroke={COLORS.energy} strokeWidth={2.6} dot={false} />
            <Line type="monotone" dataKey="mood" stroke={COLORS.mood} strokeWidth={2.6} dot={false} />
          </LineChart>
        );

      case 'temperature':
        return (
          <LineChart data={temperatureData} margin={{ top: 16, right: 10, bottom: 8, left: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(125, 85, 80, 0.08)" />
            <XAxis
              dataKey="cycleDay"
              type="number"
              domain={[1, settings.cycle_length]}
              tickFormatter={(v: number) => `Day ${v}`}
              tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }}
            />
            <YAxis domain={[0, 40]} tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,249,243,0.95)',
                boxShadow: '0 8px 24px rgba(255,180,170,0.25)',
              }}
            />
            {bands.map((b) => (
              <ReferenceArea
                key={`${b.phase}-${b.start}-${b.end}`}
                x1={b.start}
                x2={b.end}
                y1={0}
                y2={40}
                fill={(phasePalette as Record<string, string>)[b.phase] || '#eee'}
                fillOpacity={0.08}
                ifOverflow="extendDomain"
              />
            ))}
            <Line type="monotone" dataKey="morning" stroke={COLORS.morning} strokeWidth={2.6} dot={false} />
            <Line type="monotone" dataKey="evening" stroke={COLORS.evening} strokeWidth={2.6} dot={false} />
            <Line type="monotone" dataKey="warmth" stroke={COLORS.warmth} strokeWidth={2.4} dot={false} />
          </LineChart>
        );

      case 'sleep':
        return (
          <LineChart data={sleepData} margin={{ top: 16, right: 10, bottom: 8, left: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(125, 85, 80, 0.08)" />
            <XAxis
              dataKey="cycleDay"
              type="number"
              domain={[1, settings.cycle_length]}
              tickFormatter={(v: number) => `Day ${v}`}
              tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }}
            />
            <YAxis domain={[0, 3]} tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,249,243,0.95)',
                boxShadow: '0 8px 24px rgba(255,180,170,0.25)',
              }}
            />
            {bands.map((b) => (
              <ReferenceArea
                key={`${b.phase}-${b.start}-${b.end}`}
                x1={b.start}
                x2={b.end}
                y1={0}
                y2={3}
                fill={(phasePalette as Record<string, string>)[b.phase] || '#eee'}
                fillOpacity={0.08}
                ifOverflow="extendDomain"
              />
            ))}
            <Line type="monotone" dataKey="asleepEasy" stroke={COLORS.asleepEasy} strokeWidth={2.6} dot={false} />
            <Line type="monotone" dataKey="nightWakings" stroke={COLORS.nightWakings} strokeWidth={2.6} dot={false} />
            <Line type="monotone" dataKey="energized" stroke={COLORS.energized} strokeWidth={2.6} dot={false} />
          </LineChart>
        );

      case 'digestion':
        return (
          <BarChart data={digestionData} margin={{ top: 16, right: 10, bottom: 8, left: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(125, 85, 80, 0.08)" />
            <XAxis
              dataKey="cycleDay"
              type="number"
              domain={[1, settings.cycle_length]}
              tickFormatter={(v: number) => `Day ${v}`}
              tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }}
            />
            <YAxis domain={[0, 3]} tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,249,243,0.95)',
                boxShadow: '0 8px 24px rgba(255,180,170,0.25)',
              }}
            />
            {bands.map((b) => (
              <ReferenceArea
                key={`${b.phase}-${b.start}-${b.end}`}
                x1={b.start}
                x2={b.end}
                y1={0}
                y2={3}
                fill={(phasePalette as Record<string, string>)[b.phase] || '#eee'}
                fillOpacity={0.08}
                ifOverflow="extendDomain"
              />
            ))}
            <Bar dataKey="appetiteScore" fill={COLORS.appetite} radius={[6, 6, 0, 0]} />
            <Bar dataKey="bloatingScore" fill={COLORS.bloating} radius={[6, 6, 0, 0]} />
            <Bar dataKey="postMealScore" fill={COLORS.postMeal} radius={[6, 6, 0, 0]} />
          </BarChart>
        );

      case 'phase_trends':
        return (
          <LineChart data={phaseAverages} margin={{ top: 16, right: 10, bottom: 8, left: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(125, 85, 80, 0.08)" />
            <XAxis
              dataKey="phase"
              type="category"
              tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }}
            />
            <YAxis domain={[0, 5]} tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,249,243,0.95)',
                boxShadow: '0 8px 24px rgba(255,180,170,0.25)',
              }}
            />
            <Line type="monotone" dataKey="energy" stroke={COLORS.energy} strokeWidth={2.6} dot />
            <Line type="monotone" dataKey="mood" stroke={COLORS.mood} strokeWidth={2.6} dot />
            <Line type="monotone" dataKey="warmth" stroke={COLORS.warmth} strokeWidth={2.6} dot />
          </LineChart>
        );

      default:
        return null;
    }
  })();

  return (
    <div className="w-full">
      {/* Toggle Bar */}
      <div className="flex flex-wrap gap-2 mb-3">
        <ToggleButton label="Energy & Mood" active={view === 'energy_mood'} onClick={() => setView('energy_mood')} />
        <ToggleButton label="Temperature" active={view === 'temperature'} onClick={() => setView('temperature')} />
        <ToggleButton label="Sleep" active={view === 'sleep'} onClick={() => setView('sleep')} />
        <ToggleButton label="Digestion" active={view === 'digestion'} onClick={() => setView('digestion')} />
        <ToggleButton label="Cycle Trends" active={view === 'phase_trends'} onClick={() => setView('phase_trends')} />
      </div>

      {/* Chart (single child inside ResponsiveContainer) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="relative h-[260px] w-full overflow-hidden"
        >
          <ResponsiveContainer width="100%" height="100%">
            {chartContent}
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
