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

function phaseBands(cycleLength: number) {
  const bands: { phase: PhaseKey; start: number; end: number }[] = [];
  let cur = phaseForDay(1, cycleLength) as PhaseKey;
  let start = 1;
  for (let d = 2; d <= cycleLength; d++) {
    const p = phaseForDay(d, cycleLength) as PhaseKey;
    if (p !== cur) {
      bands.push({ phase: cur, start, end: d - 1 });
      cur = p;
      start = d;
    }
  }
  bands.push({ phase: cur, start, end: cycleLength });
  return bands;
}

const appetiteScore = (a: JournalRow['appetite']) => (a === 'low' ? 1 : a === 'normal' ? 2 : a === 'strong' ? 3 : 0);
const bloatingScore = (b: JournalRow['bloating2']) => (b === 'none' ? 0 : b === 'mild' ? 1 : b === 'severe' ? 2 : 0);
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

      setSettings(s ? { start_date: s.start_date, cycle_length: Number(s.cycle_length) } : null);
      setRows(Array.isArray(j) ? j : []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p>Loading charts…</p>;
  if (!settings) return <p className="text-gray-600">Add your cycle settings to begin.</p>;
  if (rows.length === 0) return <p className="text-gray-600">No journal data yet.</p>;

  /* ---------- Data Prep ---------- */
  const startD = new Date(settings.start_date);
  const allPoints = rows.map((r) => {
    const d = new Date(r.date);
    const cd = cycleDay(d, startD, settings.cycle_length);
    const phase = (r.phase ?? (phaseForDay(cd, settings.cycle_length) as PhaseKey)) as PhaseKey;
    return { ...r, cycleDay: cd, phase };
  });

  const maxDay = Math.max(...allPoints.map((r) => r.cycleDay));
  const cyclesCount = Math.ceil(maxDay / settings.cycle_length);

  // Filter to only current cycle if needed
  const filteredPoints =
    scope === 'current'
      ? allPoints.filter((r) => r.cycleDay > (cyclesCount - 1) * settings.cycle_length)
      : allPoints;

  const bands = phaseBands(settings.cycle_length);

  const makeLineChart = (data: any[], lines: { key: string; color: string; max: number }[], yDomain: [number, number]) => (
    <LineChart data={data} margin={{ top: 16, right: 10, bottom: 8, left: 0 }}>
      <CartesianGrid vertical={false} stroke="rgba(125,85,80,0.08)" />
      <XAxis
        dataKey="cycleDay"
        type="number"
        domain={[1, settings.cycle_length]}
        tickFormatter={(v: number) => `Day ${v}`}
        tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }}
      />
      <YAxis domain={yDomain} tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }} />
      <Tooltip />
      {bands.map((b) => (
        <ReferenceArea
          key={`${b.phase}-${b.start}-${b.end}`}
          x1={b.start}
          x2={b.end}
          y1={0}
          y2={yDomain[1]}
          fill={(phasePalette as Record<string, string>)[b.phase] || '#eee'}
          fillOpacity={0.08}
          ifOverflow="extendDomain"
        />
      ))}
      {lines.map((l) => (
        <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.4} dot={false} />
      ))}
    </LineChart>
  );

  /* ---------- Chart selection ---------- */
  let chartContent;
  switch (view) {
    case 'energy_mood':
      chartContent = makeLineChart(
        filteredPoints.map((r) => ({ cycleDay: r.cycleDay, energy: r.energy_level, mood: r.mood_stability })),
        [
          { key: 'energy', color: COLORS.energy, max: 5 },
          { key: 'mood', color: COLORS.mood, max: 5 },
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
          { key: 'morning', color: COLORS.morning, max: 40 },
          { key: 'evening', color: COLORS.evening, max: 40 },
          { key: 'warmth', color: COLORS.warmth, max: 5 },
        ],
        [0, 40]
      );
      break;
    case 'sleep':
      chartContent = makeLineChart(
        filteredPoints.map((r) => ({
          cycleDay: r.cycleDay,
          asleepEasy: r.fell_asleep_easily ? 1 : 0,
          nightWakings: r.night_wakings,
          energized: r.felt_energized ? 1 : 0,
        })),
        [
          { key: 'asleepEasy', color: COLORS.asleepEasy, max: 1 },
          { key: 'nightWakings', color: COLORS.nightWakings, max: 3 },
          { key: 'energized', color: COLORS.energized, max: 1 },
        ],
        [0, 3]
      );
      break;
    case 'digestion':
      chartContent = (
        <BarChart data={filteredPoints.map((r) => ({
          cycleDay: r.cycleDay,
          appetiteScore: appetiteScore(r.appetite),
          bloatingScore: bloatingScore(r.bloating2),
          postMealScore: postMealScore(r.post_meal),
        }))}>
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
      break;
    default:
      chartContent = <div />;
  }

  /* ---------- Render ---------- */
  return (
    <div className="w-full">
      {/* Top toggles */}
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
        {/* Cycle scope toggle */}
        <button
          onClick={() => setScope(scope === 'current' ? 'all' : 'current')}
          className="ml-auto px-3 py-1.5 rounded-full text-sm bg-[#FFEAE3] text-rose-900 shadow-sm hover:brightness-105"
        >
          {scope === 'current' ? 'Showing: Current cycle' : 'Showing: All cycles'}
        </button>
      </div>

      {/* Chart */}
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
