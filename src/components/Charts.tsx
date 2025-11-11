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
import { motion } from 'framer-motion';

/* ---------- Types ---------- */
type PhaseKey = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
type ViewKey = 'energy_mood' | 'temperature' | 'sleep' | 'digestion' | 'phase_trends';
type CycleScope = 'current' | 'all';

type Settings = { start_date: string; cycle_length: number };

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
};

/* ---------- Helpers ---------- */
const COLORS = {
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

// Safe phase function
function safePhaseForDay(day: number, length: number): PhaseKey {
  try {
    const p = phaseForDay(day, length);
    if (p === 'menstrual' || p === 'follicular' || p === 'ovulation' || p === 'luteal') return p;
    return 'menstrual';
  } catch {
    return 'menstrual';
  }
}

function phaseBands(cycleLength: number) {
  const len = Math.max(21, Math.min(40, Number(cycleLength) || 28));
  const bands: { phase: PhaseKey; start: number; end: number }[] = [];
  let cur = safePhaseForDay(1, len);
  let start = 1;
  for (let d = 2; d <= len; d++) {
    const p = safePhaseForDay(d, len);
    if (p !== cur) {
      bands.push({ phase: cur, start, end: d - 1 });
      cur = p;
      start = d;
    }
  }
  bands.push({ phase: cur, start, end: len });
  return bands;
}

const appetiteScore = (a: JournalRow['appetite']) =>
  a === 'low' ? 1 : a === 'normal' ? 2 : a === 'strong' ? 3 : 0;

const bloatingScore = (b: JournalRow['bloating2']) =>
  b === 'none' ? 0 : b === 'mild' ? 1 : b === 'severe' ? 2 : 0;

const postMealScore = (p: JournalRow['post_meal']) =>
  p === 'sleepy' ? 1 : p === 'stable' ? 2 : p === 'energized' ? 3 : 0;

/* ---------- Component ---------- */
export function Charts() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [view, setView] = useState<ViewKey>('energy_mood');
  const [scope, setScope] = useState<CycleScope>('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } = { user: null } } = await supabase.auth.getUser();
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
      since.setDate(since.getDate() - 365);
      const sinceStr = since.toISOString().slice(0, 10);

      const { data: j } = await supabase
        .from('journals')
        .select(
          'date, phase, energy_level, mood_stability, hands_feet_warmth, temp_morning_c, temp_evening_c, fell_asleep_easily, night_wakings, felt_energized, appetite, bloating2, post_meal'
        )
        .gte('date', sinceStr)
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      setSettings(
        s && s.start_date
          ? { start_date: s.start_date, cycle_length: Number(s.cycle_length) || 28 }
          : null
      );
      setRows(Array.isArray(j) ? (j as JournalRow[]) : []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p>Loading charts…</p>;
  if (!settings) return <p className="text-gray-600">Add your cycle settings to begin.</p>;
  if (!rows.length) return <p className="text-gray-600">No journal data yet.</p>;

  const safeCycleLength = Math.max(21, Math.min(40, Number(settings.cycle_length) || 28));
  let startD: Date;
  try {
    startD = new Date(settings.start_date);
    if (isNaN(startD.getTime())) throw new Error();
  } catch {
    return <p className="text-gray-600">Invalid start date.</p>;
  }

  const allPoints = useMemo(() => {
    return rows.map((r) => {
      const d = new Date(r.date);
      const cd = cycleDay(d, startD, safeCycleLength);
      const phase = (r.phase ?? safePhaseForDay(cd, safeCycleLength)) as PhaseKey;
      return { ...r, cycleDay: cd, phase };
    });
  }, [rows, startD, safeCycleLength]);

  const maxDay = allPoints.length ? Math.max(...allPoints.map((r) => r.cycleDay)) : 1;
  const cyclesCount = Math.max(1, Math.ceil(maxDay / safeCycleLength));
  const filteredPoints =
    scope === 'current'
      ? allPoints.filter((r) => r.cycleDay > (cyclesCount - 1) * safeCycleLength)
      : allPoints;

  const bands = phaseBands(safeCycleLength);

  const makeLineChart = (
    data: any[],
    lines: { key: string; color: string }[],
    yDomain: [number, number]
  ) => (
    <LineChart data={data.length ? data : [{ cycleDay: 0 }]}>
      <CartesianGrid vertical={false} stroke="rgba(125,85,80,0.08)" />
      <XAxis dataKey="cycleDay" domain={[1, safeCycleLength]} />
      <YAxis domain={yDomain} />
      <Tooltip />
      {bands.map((b) => (
        <ReferenceArea
          key={`${b.phase}-${b.start}`}
          x1={b.start}
          x2={b.end}
          y1={0}
          y2={yDomain[1]}
          fill={(phasePalette as Record<string, string>)[b.phase] || '#eee'}
          fillOpacity={0.08}
        />
      ))}
      {lines.map((l) => (
        <Line key={l.key} dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} />
      ))}
    </LineChart>
  );

  /* ---------- Chart selection ---------- */
  let chartContent = <div />;
  switch (view) {
    case 'energy_mood':
      chartContent = makeLineChart(
        filteredPoints.map((r) => ({
          cycleDay: r.cycleDay,
          energy: r.energy_level,
          mood: r.mood_stability,
        })),
        [
          { key: 'energy', color: COLORS.energy },
          { key: 'mood', color: COLORS.mood },
        ],
        [0, 5]
      );
      break;

    case 'temperature':
      chartContent = makeLineChart(
        filteredPoints.map((r) => ({
          cycleDay: r.cycleDay,
          morning: r.temp_morning_c,
          evening: r.temp_evening_c,
          warmth: r.hands_feet_warmth,
        })),
        [
          { key: 'morning', color: COLORS.morning },
          { key: 'evening', color: COLORS.evening },
          { key: 'warmth', color: COLORS.warmth },
        ],
        [0, 40]
      );
      break;

    case 'sleep':
      chartContent = makeLineChart(
        filteredPoints.map((r) => ({
          cycleDay: r.cycleDay,
          asleepEasy: r.fell_asleep_easily ? 1 : 0,
          nightWakings: r.night_wakings ?? 0,
          energized: r.felt_energized ? 1 : 0,
        })),
        [
          { key: 'asleepEasy', color: COLORS.asleepEasy },
          { key: 'nightWakings', color: COLORS.nightWakings },
          { key: 'energized', color: COLORS.energized },
        ],
        [0, 3]
      );
      break;

    case 'digestion':
      chartContent = (
        <BarChart
          data={
            filteredPoints.length
              ? filteredPoints.map((r) => ({
                  cycleDay: r.cycleDay,
                  appetiteScore: appetiteScore(r.appetite),
                  bloatingScore: bloatingScore(r.bloating2),
                  postMealScore: postMealScore(r.post_meal),
                }))
              : [{ cycleDay: 0 }]
          }
        >
          <CartesianGrid vertical={false} stroke="rgba(125,85,80,0.08)" />
          <XAxis dataKey="cycleDay" />
          <YAxis domain={[0, 3]} />
          <Tooltip />
          <Bar dataKey="appetiteScore" fill={COLORS.appetite} />
          <Bar dataKey="bloatingScore" fill={COLORS.bloating} />
          <Bar dataKey="postMealScore" fill={COLORS.postMeal} />
        </BarChart>
      );
      break;

    case 'phase_trends':
      chartContent = (
        <LineChart data={bands.map((b) => ({ phase: b.phase, energy: 3, mood: 3, warmth: 3 }))}>
          <CartesianGrid vertical={false} stroke="rgba(125,85,80,0.08)" />
          <XAxis dataKey="phase" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Line type="monotone" dataKey="energy" stroke={COLORS.energy} strokeWidth={2.5} dot />
          <Line type="monotone" dataKey="mood" stroke={COLORS.mood} strokeWidth={2.5} dot />
          <Line type="monotone" dataKey="warmth" stroke={COLORS.warmth} strokeWidth={2.5} dot />
        </LineChart>
      );
      break;
  }

  /* ---------- Render ---------- */
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="flex flex-wrap gap-2">
          {(['energy_mood', 'temperature', 'sleep', 'digestion', 'phase_trends'] as ViewKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setView(k)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                view === k
                  ? 'bg-[#FFD7C8] text-rose-900 shadow'
                  : 'bg-[#FFF3EB] text-rose-800 hover:brightness-105'
              }`}
            >
              {k.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div
          onClick={() => setScope(scope === 'current' ? 'all' : 'current')}
          className="relative flex items-center w-[140px] h-7 rounded-full bg-[#FFEAE3] cursor-pointer shadow-sm select-none"
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`absolute top-1 left-1 h-5 w-[65px] rounded-full shadow-sm ${
              scope === 'current' ? 'bg-[#FFD7C8]' : 'translate-x-[70px] bg-[#FFD7C8]'
            }`}
          />
          <div className="flex justify-between w-full text-[12px] font-medium text-rose-900 z-10 px-3">
            <span className={`${scope === 'current' ? 'opacity-100' : 'opacity-60'}`}>Current</span>
            <span className={`${scope === 'all' ? 'opacity-100' : 'opacity-60'}`}>All</span>
          </div>
        </div>
      </div>

      <motion.div
        key={`${view}-${scope}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative h-[260px] w-full overflow-hidden"
      >
        <ResponsiveContainer width="100%" height="100%">
          {chartContent}
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
