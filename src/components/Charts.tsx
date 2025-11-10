'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { cycleDay, phaseForDay, phasePalette } from '@/lib/phase';
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

type Settings = {
  start_date: string;
  cycle_length: number;
};

type JournalRow = {
  date: string;
  phase: string | null;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  warmth: number | null;
  notes?: string | null;
};

type ChartPoint = {
  date: string;
  cycleDay: number;
  phase: string;
  mood: number;
  energy: number;
  stress: number;
  warmth: number;
};

function daysBetween(a: Date, b: Date) {
  const ms = 1000 * 60 * 60 * 24;
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.floor((da - db) / ms);
}

function phaseBands(cycleLength: number) {
  const bands: { phase: string; start: number; end: number }[] = [];
  let currentPhase = phaseForDay(1, cycleLength);
  let start = 1;
  for (let d = 2; d <= cycleLength; d++) {
    const p = phaseForDay(d, cycleLength);
    if (p !== currentPhase) {
      bands.push({ phase: currentPhase, start, end: d - 1 });
      currentPhase = p;
      start = d;
    }
  }
  bands.push({ phase: currentPhase, start, end: cycleLength });
  return bands;
}

const COLORS = {
  mood: '#F7A7A7',
  energy: '#CDEDC7',
  stress: '#FFE083',
  warmth: '#D1B3FF',
};

export function Charts() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rows, setRows] = useState<JournalRow[]>([]);
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

      if (!s) {
        setSettings(null);
        setRows([]);
        setLoading(false);
        return;
      }

      const start = new Date();
      start.setDate(start.getDate() - 180);
      const sinceStr = start.toISOString().slice(0, 10);

      const { data: j } = await supabase
        .from('journals')
        .select('date, phase, mood, energy, stress, warmth, notes')
        .gte('date', sinceStr)
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      setSettings({ start_date: s.start_date, cycle_length: s.cycle_length });
      setRows(j ?? []);
      setLoading(false);
    })();
  }, []);

  const chartDataAll = useMemo<ChartPoint[]>(() => {
    if (!settings) return [];
    const startD = new Date(settings.start_date);
    return rows.map((r) => {
      const d = new Date(r.date);
      const cd = cycleDay(d, startD, settings.cycle_length);
      const phase = r.phase || phaseForDay(cd, settings.cycle_length);
      return {
        date: r.date,
        cycleDay: cd,
        phase,
        mood: r.mood ?? 0,
        energy: r.energy ?? 0,
        stress: r.stress ?? 0,
        warmth: r.warmth ?? 0,
      };
    });
  }, [rows, settings]);

  const activeCycleData = useMemo(() => chartDataAll, [chartDataAll]);

  const phaseAverages = useMemo(() => {
    const grouped: Record<
      string,
      { mood: number; energy: number; stress: number; warmth: number; count: number }
    > = {};
    activeCycleData.forEach((p) => {
      if (!grouped[p.phase]) grouped[p.phase] = { mood: 0, energy: 0, stress: 0, warmth: 0, count: 0 };
      grouped[p.phase].mood += p.mood;
      grouped[p.phase].energy += p.energy;
      grouped[p.phase].stress += p.stress;
      grouped[p.phase].warmth += p.warmth;
      grouped[p.phase].count++;
    });

    const averages = Object.entries(grouped).map(([phase, data]) => {
      const c = Math.max(1, data.count);
      return {
        phase,
        mood: +(data.mood / c).toFixed(1),
        energy: +(data.energy / c).toFixed(1),
        stress: +(data.stress / c).toFixed(1),
        warmth: +(data.warmth / c).toFixed(1),
      };
    });

    const order = ['menstrual', 'follicular', 'ovulation', 'luteal'];
    averages.sort((a, b) => order.indexOf(a.phase) - order.indexOf(b.phase));
    return averages;
  }, [activeCycleData]);

  if (loading) return <p>Loading charts…</p>;
  if (!settings) return <p className="text-gray-600">Add your cycle settings to begin.</p>;

  const bands = phaseBands(settings.cycle_length);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="cycle"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="rounded-3xl bg-gradient-to-b from-[#FFF9F3] to-[#FFEAE3]
                   backdrop-blur-xl shadow-[0_8px_30px_rgba(255,180,170,0.25)]
                   p-4 sm:p-6 space-y-5"
      >
        {/* 🌙 Chart */}
        <div className="relative h-[260px] w-full overflow-hidden">
          <ResponsiveContainer>
            <LineChart
              data={activeCycleData}
              margin={{ top: 16, right: 10, bottom: 8, left: 0 }}
            >
              <CartesianGrid vertical={false} stroke="rgba(125, 85, 80, 0.08)" />
              <XAxis
                dataKey="cycleDay"
                type="number"
                domain={[1, settings.cycle_length]}
                tickFormatter={(v) => `Day ${v}`}
                tick={{ fill: 'rgba(110,78,70,0.6)', fontSize: 12 }}
              />
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
                  y2={10}
                  fill={(phasePalette as Record<string, string>)[b.phase] || '#eee'}
                  fillOpacity={0.08}
                  ifOverflow="extendDomain"
                />
              ))}
              {Object.entries(COLORS).map(([key, color]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2.6}
                  dot={false}
                  opacity={0.9}
                  isAnimationActive
                  animationDuration={1600}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🌷 Phase summaries — now flush aligned */}
        <div>
          <h3 className="font-serif italic text-rose-900 mb-3 px-1">
            Phase summaries (averages)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {phaseAverages.map((p) => (
              <div
                key={p.phase}
                className="rounded-2xl p-3 shadow-sm"
                style={{
                  background: `${(phasePalette as Record<string, string>)[p.phase] || '#eee'}20`,
                  border: `1px solid ${(phasePalette as Record<string, string>)[p.phase] || '#eee'}55`,
                }}
              >
                <div className="font-medium capitalize mb-1 flex items-center gap-1">
                  <span>🌷</span>
                  <span>{p.phase}</span>
                </div>
                <div className="text-sm grid grid-cols-2 gap-y-1 text-rose-900/90">
                  <span>Mood</span><span>{p.mood}</span>
                  <span>Energy</span><span>{p.energy}</span>
                  <span>Stress</span><span>{p.stress}</span>
                  <span>Warmth</span><span>{p.warmth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
