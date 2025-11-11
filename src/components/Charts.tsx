'use client';

import { useEffect, useMemo, useState, ReactElement } from 'react';
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

  energy_level: number | null;
  mood_stability: number | null;
  hands_feet_warmth: number | null;
  temp_morning_c: number | null;
  temp_evening_c: number | null;
  fell_asleep_easily: boolean | null;
  night_wakings: number | null;
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
  const [loading, setLoading] = useState(true);
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

      if (s) setSettings({ start_date: s.start_date, cycle_length: Number(s.cycle_length) });

      const arr = Array.isArray(j) ? j : [];
      const normalized: JournalRow[] = arr.map((r: Record<string, any>) => ({
        date: String(r.date ?? ''),
        phase: (r.phase ?? null) as PhaseKey | null,
        energy_level: r.energy_level ?? null,
        mood_stability: r.mood_stability ?? null,
        hands_feet_warmth: r.hands_feet_warmth ?? null,
        temp_morning_c: r.temp_morning_c ?? null,
        temp_evening_c: r.temp_evening_c ?? null,
        fell_asleep_easily: r.fell_asleep_easily ?? null,
        night_wakings: r.night_wakings ?? null,
        felt_energized: r.felt_energized ?? null,
        appetite: r.appetite ?? null,
        bloating2: r.bloating2 ?? null,
        post_meal: r.post_meal ?? null,
        notes: r.notes ?? null,
      }));

      setRows(normalized);
      setLoading(false);
    })();
  }, []);

  /* ---------- Derived ---------- */

  if (loading) return <p>Loading charts…</p>;
  if (!settings) return <p className="text-gray-600">Add your cycle settings to begin.</p>;

  const startD = new Date(settings.start_date);
  const basePoints = rows.map((r) => {
    const d = new Date(r.date);
    const cd = cycleDay(d, startD, settings.cycle_length);
    const phase = (r.phase ?? (phaseForDay(cd, settings.cycle_length) as PhaseKey)) as PhaseKey;
    return { date: r.date, cycleDay: cd, phase };
  });

  const energyMoodData = basePoints.map((bp, i) => ({
    ...bp,
    energy: rows[i]?.energy_level ?? 0,
    mood: rows[i]?.mood_stability ?? 0,
  }));

  const temperatureData = basePoints.map((bp, i) => ({
    ...bp,
    morning: Number(rows[i]?.temp_morning_c ?? 0),
    evening: Number(rows[i]?.temp_evening_c ?? 0),
    warmth: rows[i]?.hands_feet_warmth ?? 0,
  }));

  const sleepData = basePoints.map((bp, i) => ({
    ...bp,
    asleepEasy: rows[i]?.fell_asleep_easily ? 1 : 0,
    nightWakings: rows[i]?.night_wakings ?? 0,
    energized: rows[i]?.felt_energized ? 1 : 0,
  }));

  const digestionData = basePoints.map((bp, i) => ({
    ...bp,
    appetiteScore: appetiteToScore(rows[i]?.appetite ?? null),
    bloatingScore: bloatingToScore(rows[i]?.bloating2 ?? null),
    postMealScore: postMealToScore(rows[i]?.post_meal ?? null),
  }));

  const bands = phaseBands(settings.cycle_length);

  /* ---------- Chart Builder ---------- */
  const chartContent: ReactElement = (() => {
    switch (view) {
      case 'energy_mood':
        return (
          <LineChart data={energyMoodData}>
            <CartesianGrid vertical={false} stroke="rgba(125,85,80,0.08)" />
            <XAxis dataKey="cycleDay" domain={[1, settings.cycle_length]} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            {bands.map((b) => (
              <ReferenceArea key={b.phase} x1={b.start} x2={b.end} y1={0} y2={5} fillOpacity={0.08} />
            ))}
            <Line dataKey="energy" stroke={COLORS.energy} strokeWidth={2.5} dot={false} />
            <Line dataKey="mood" stroke={COLORS.mood} strokeWidth={2.5} dot={false} />
          </LineChart>
        );
      case 'temperature':
        return (
          <LineChart data={temperatureData}>
            <CartesianGrid vertical={false} stroke="rgba(125,85,80,0.08)" />
            <XAxis dataKey="cycleDay" domain={[1, settings.cycle_length]} />
            <YAxis domain={[0, 40]} />
            <Tooltip />
            {bands.map((b) => (
              <ReferenceArea key={b.phase} x1={b.start} x2={b.end} y1={0} y2={40} fillOpacity={0.08} />
            ))}
            <Line dataKey="morning" stroke={COLORS.morning} strokeWidth={2.5} dot={false} />
            <Line dataKey="evening" stroke={COLORS.evening} strokeWidth={2.5} dot={false} />
            <Line dataKey="warmth" stroke={COLORS.warmth} strokeWidth={2.5} dot={false} />
          </LineChart>
        );
      case 'sleep':
        return (
          <LineChart data={sleepData}>
            <CartesianGrid vertical={false} stroke="rgba(125,85,80,0.08)" />
            <XAxis dataKey="cycleDay" domain={[1, settings.cycle_length]} />
            <YAxis domain={[0, 3]} />
            <Tooltip />
            {bands.map((b) => (
              <ReferenceArea key={b.phase} x1={b.start} x2={b.end} y1={0} y2={3} fillOpacity={0.08} />
            ))}
            <Line dataKey="asleepEasy" stroke={COLORS.asleepEasy} strokeWidth={2.5} dot={false} />
            <Line dataKey="nightWakings" stroke={COLORS.nightWakings} strokeWidth={2.5} dot={false} />
            <Line dataKey="energized" stroke={COLORS.energized} strokeWidth={2.5} dot={false} />
          </LineChart>
        );
      case 'digestion':
        return (
          <BarChart data={digestionData}>
            <CartesianGrid vertical={false} stroke="rgba(125,85,80,0.08)" />
            <XAxis dataKey="cycleDay" domain={[1, settings.cycle_length]} />
            <YAxis domain={[0, 3]} />
            <Tooltip />
            {bands.map((b) => (
              <ReferenceArea key={b.phase} x1={b.start} x2={b.end} y1={0} y2={3} fillOpacity={0.08} />
            ))}
            <Bar dataKey="appetiteScore" fill={COLORS.appetite} />
            <Bar dataKey="bloatingScore" fill={COLORS.bloating} />
            <Bar dataKey="postMealScore" fill={COLORS.postMeal} />
          </BarChart>
        );
      default:
        return <div />; // fallback div instead of null (fixes Vercel type error)
    }
  })();

  return (
    <div className="w-full">
      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {(['energy_mood', 'temperature', 'sleep', 'digestion', 'phase_trends'] as ViewKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`px-3 py-1.5 rounded-full text-sm ${
              view === k ? 'bg-[#FFD7C8] text-rose-900 shadow' : 'bg-[#FFF3EB] text-rose-800 hover:brightness-105'
            }`}
          >
            {k.replace('_', ' ')}
          </button>
        ))}
      </div>

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
