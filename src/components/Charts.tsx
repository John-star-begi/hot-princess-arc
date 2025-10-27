'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { cycleDay, phaseForDay, phasePalette } from '@/lib/phase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceArea,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import MonthCalendar from '@/components/MonthCalendar';

type Settings = {
  start_date: string;
  cycle_length: number;
};

type JournalRow = {
  date: string;            // 'YYYY-MM-DD'
  phase: string | null;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  warmth: number | null;
  bloating: string | null; // may be text; we’ll normalize for chart
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
  bloating: number;
};

function daysBetween(a: Date, b: Date) {
  const ms = 1000 * 60 * 60 * 24;
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.floor((da - db) / ms);
}

function normalizeBloating(x: string | null): number {
  if (!x) return 0;
  const n = Number(x);
  if (!Number.isNaN(n)) return Math.max(0, Math.min(10, n));
  const t = x.toLowerCase();
  if (/none|no/i.test(t)) return 0;
  if (/mild|light/i.test(t)) return 3;
  if (/mod(erate)?/i.test(t)) return 6;
  if (/severe|strong/i.test(t)) return 9;
  return 5; // unknown text -> mid
}

function phaseBands(cycleLength: number) {
  // Build contiguous bands of the same phase across 1..cycleLength
  // We infer by calling phaseForDay on each cycleDay
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

export function Charts() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [viewMode, setViewMode] = useState<'cycle' | 'calendar'>('cycle');
  const [selectedCycleIndex, setSelectedCycleIndex] = useState(0); // 0 = current, 1 = previous, etc.

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Load settings
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
      start.setDate(start.getDate() - 180); // last ~6 months to allow multiple cycles
      const sinceStr = start.toISOString().slice(0, 10);

      // Load journals (include all fields used)
      const { data: j } = await supabase
        .from('journals')
        .select('date, phase, mood, energy, stress, warmth, bloating, notes')
        .gte('date', sinceStr)
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      setSettings({ start_date: s.start_date, cycle_length: s.cycle_length });
      setRows(j ?? []);
      setLoading(false);
    })();
  }, []);

  // Prepare chart data with user-specific cycle length
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
        bloating: normalizeBloating(r.bloating ?? null),
      };
    });
  }, [rows, settings]);

  // Split data into cycles using user cycle length
  const cycles = useMemo(() => {
    if (!settings) return [];
    const startD = new Date(settings.start_date);
    // cycle index = floor(daysSinceStart / cycle_length)
    const grouped: Record<number, ChartPoint[]> = {};
    chartDataAll.forEach((pt) => {
      const d = new Date(pt.date);
      const delta = daysBetween(d, startD);
      const idx = Math.floor(delta / settings.cycle_length);
      (grouped[idx] ||= []).push(pt);
    });
    // Sort cycles by index (highest = latest)
    const indices = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b);
    const list = indices.map((i) =>
      grouped[i].sort((a, b) => a.cycleDay - b.cycleDay)
    );
    return list;
  }, [chartDataAll, settings]);

  // Select a specific cycle to view
  const activeCycleData = useMemo(() => {
    if (!cycles.length) return [];
    const lastIndex = cycles.length - 1;
    const indexFromEnd = Math.max(0, Math.min(selectedCycleIndex, lastIndex));
    // 0 = current cycle (last), 1 = previous (second last)...
    return cycles[lastIndex - indexFromEnd];
  }, [cycles, selectedCycleIndex]);

  // Phase averages (over the visible data set: either active cycle or all)
  const phaseAverages = useMemo(() => {
    const source = viewMode === 'cycle' ? activeCycleData : chartDataAll;
    const g: Record<
      string,
      { mood: number; energy: number; stress: number; warmth: number; bloating: number; count: number }
    > = {};
    source.forEach((p) => {
      if (!g[p.phase]) g[p.phase] = { mood: 0, energy: 0, stress: 0, warmth: 0, bloating: 0, count: 0 };
      g[p.phase].mood += p.mood;
      g[p.phase].energy += p.energy;
      g[p.phase].stress += p.stress;
      g[p.phase].warmth += p.warmth;
      g[p.phase].bloating += p.bloating;
      g[p.phase].count++;
    });
    const result = Object.entries(g).map(([phase, v]) => {
      const c = Math.max(1, v.count);
      return {
        phase,
        mood: +(v.mood / c).toFixed(1),
        energy: +(v.energy / c).toFixed(1),
        stress: +(v.stress / c).toFixed(1),
        warmth: +(v.warmth / c).toFixed(1),
        bloating: +(v.bloating / c).toFixed(1),
      };
    });
    // Sort in a pleasant, hormonal order
    const order = ['menstrual', 'follicular', 'ovulation', 'luteal'];
    result.sort((a, b) => order.indexOf(a.phase) - order.indexOf(b.phase));
    return result;
  }, [activeCycleData, chartDataAll, viewMode]);

  // Completion donut (last 30 days)
  const completion = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const lastThirty = rows.filter((r) => new Date(r.date) >= cutoff);
    const totalDays = Math.max(lastThirty.length, 1);
    const filledDays = lastThirty.filter(
      (r) =>
        (r.mood ?? 0) > 0 ||
        (r.energy ?? 0) > 0 ||
        (r.stress ?? 0) > 0 ||
        (r.warmth ?? 0) > 0 ||
        (r.bloating ?? '').toString().trim().length > 0 ||
        (r.notes ?? '').toString().trim().length > 0
    ).length;
    const done = Math.round((filledDays / totalDays) * 100);
    return [
      { name: 'Logged', value: done },
      { name: 'Not logged', value: 100 - done },
    ];
  }, [rows]);

  if (loading) return <p>Loading charts…</p>;

  if (!settings) {
    return (
      <div className="p-4 rounded border">
        <p>Please add your cycle settings first on the Settings page.</p>
        <a href="/settings" className="underline">Open Settings</a>
      </div>
    );
  }

  const bands = phaseBands(settings.cycle_length);

  // For LineChart data source:
  const lineData = viewMode === 'cycle' ? activeCycleData : chartDataAll;

  return (
    <div className="grid gap-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded ${viewMode === 'cycle' ? 'bg-pink-200 text-pink-800' : 'bg-white border'}`}
            onClick={() => setViewMode('cycle')}
          >
            Cycle view
          </button>
          <button
            className={`px-3 py-1 rounded ${viewMode === 'calendar' ? 'bg-pink-200 text-pink-800' : 'bg-white border'}`}
            onClick={() => setViewMode('calendar')}
          >
            Calendar view
          </button>
        </div>

        {viewMode === 'cycle' && cycles.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Cycle</label>
            <select
              className="border rounded p-1 text-sm"
              value={selectedCycleIndex}
              onChange={(e) => setSelectedCycleIndex(Number(e.target.value))}
            >
              {Array.from({ length: cycles.length }).map((_, offset) => {
                const label = offset === 0 ? 'Current' : `${offset} ago`;
                return (
                  <option key={offset} value={offset}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm mx-auto"
          >
            <MonthCalendar
              startDate={settings.start_date}
              cycleLength={settings.cycle_length}
            />
          </motion.div>
        ) : (
          <motion.div
            key="cycle"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="grid gap-6"
          >
            {/* Cycle lines with phase shading */}
            <div className="p-4 rounded border">
              <h3 className="font-semibold mb-2">
                Mood, Energy, Stress, Warmth, Bloating by cycle day
              </h3>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="cycleDay"
                      type="number"
                      domain={[1, settings.cycle_length]}
                      tickFormatter={(v) => `Day ${v}`}
                    />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      formatter={(value: any, name: any) => {
                        const labelMap: Record<string, string> = {
                          mood: 'Mood',
                          energy: 'Energy',
                          stress: 'Stress',
                          warmth: 'Warmth',
                          bloating: 'Bloating',
                        };
                        return [value, labelMap[name] || name];
                      }}
                      labelFormatter={(label) => `Cycle day ${label}`}
                    />
                    <Legend />

                    {/* Phase background bands */}
                    {bands.map((b) => (
                      <ReferenceArea
                        key={`${b.phase}-${b.start}-${b.end}`}
                        x1={b.start}
                        x2={b.end}
                        y1={0}
                        y2={10}
                        fill={(phasePalette as Record<string, string>)[b.phase] || '#eee'}
                        fillOpacity={0.12}
                        ifOverflow="extendDomain"
                      />
                    ))}

                    <Line type="monotone" dataKey="mood" dot={false} stroke="#c26aa3" />
                    <Line type="monotone" dataKey="energy" dot={false} stroke="#8bbd7c" />
                    <Line type="monotone" dataKey="stress" dot={false} stroke="#f28b82" />
                    <Line type="monotone" dataKey="warmth" dot={false} stroke="#f8a5c2" />
                    <Line type="monotone" dataKey="bloating" dot={false} stroke="#f5b97a" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Shaded background shows your hormonal phases. Trends are unique to you.
              </p>
            </div>

            {/* Phase summary cards */}
            <div className="p-4 rounded border">
              <h3 className="font-semibold mb-3">Phase summaries (averages)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {phaseAverages.map((p) => (
                  <div
                    key={p.phase}
                    className="rounded-lg p-3 border"
                   style={{
  background: `${(phasePalette as Record<string, string>)[p.phase] || '#eee'}20`,
  borderColor: `${(phasePalette as Record<string, string>)[p.phase] || '#eee'}55`,
}}
                  >
                    <div className="font-medium capitalize mb-1">{p.phase}</div>
                    <div className="text-sm grid grid-cols-2 gap-y-1">
                      <span className="text-gray-600">Mood</span><span>{p.mood}</span>
                      <span className="text-gray-600">Energy</span><span>{p.energy}</span>
                      <span className="text-gray-600">Stress</span><span>{p.stress}</span>
                      <span className="text-gray-600">Warmth</span><span>{p.warmth}</span>
                      <span className="text-gray-600">Bloating</span><span>{p.bloating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logging completion */}
            <div className="p-4 rounded border">
              <h3 className="font-semibold mb-2">Logging completion, last 30 days</h3>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={completion}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {completion.map((entry, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={i === 0 ? '#8bbd7c' : '#e8e8e8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Phase color legend */}
            <div className="p-4 rounded border">
              <h3 className="font-semibold mb-2">Phase colors</h3>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(phasePalette).map(([phase, color]) => (
                  <div key={phase} className="flex items-center gap-2">
                    <span
                      className="inline-block w-4 h-4 rounded"
                      style={{ background: color }}
                    />
                    <span className="capitalize">{phase}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


