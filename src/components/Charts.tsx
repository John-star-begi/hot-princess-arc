"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { cycleDay, phaseForDay, phasePalette } from "@/lib/phase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Area,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

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

export function Charts() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycleIndex, setSelectedCycleIndex] = useState(0); // 0 = current

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      // Load settings
      const { data: s } = await supabase
        .from("settings")
        .select("start_date, cycle_length")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!s) {
        setSettings(null);
        setRows([]);
        setLoading(false);
        return;
      }

      // Load journals (last 180 days)
      const start = new Date();
      start.setDate(start.getDate() - 180);
      const sinceStr = start.toISOString().slice(0, 10);

      const { data: j } = await supabase
        .from("journals")
        .select("date, phase, mood, energy, stress, warmth, notes")
        .gte("date", sinceStr)
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      setSettings({ start_date: s.start_date, cycle_length: s.cycle_length });
      setRows(j ?? []);
      setLoading(false);
    })();
  }, []);

  // Build chart data
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

  // Group by cycles
  const cycles = useMemo(() => {
    if (!settings) return [];
    const startD = new Date(settings.start_date);
    const grouped: Record<number, ChartPoint[]> = {};
    chartDataAll.forEach((pt) => {
      const d = new Date(pt.date);
      const delta = daysBetween(d, startD);
      const idx = Math.floor(delta / settings.cycle_length);
      (grouped[idx] ||= []).push(pt);
    });
    const indices = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b);
    return indices.map((i) => grouped[i].sort((a, b) => a.cycleDay - b.cycleDay));
  }, [chartDataAll, settings]);

  const activeCycleData = useMemo(() => {
    if (!cycles.length) return [];
    const lastIndex = cycles.length - 1;
    const indexFromEnd = Math.max(0, Math.min(selectedCycleIndex, lastIndex));
    return cycles[lastIndex - indexFromEnd];
  }, [cycles, selectedCycleIndex]);

  // Phase averages (true averages)
  const phaseAverages = useMemo(() => {
    const source = activeCycleData;
    const grouped: Record<
      string,
      { mood: number; energy: number; stress: number; warmth: number; count: number }
    > = {};
    source.forEach((p) => {
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

    const order = ["menstrual", "follicular", "ovulation", "luteal"];
    averages.sort((a, b) => order.indexOf(a.phase) - order.indexOf(b.phase));
    return averages;
  }, [activeCycleData]);

  if (loading) return <p>Loading charts…</p>;

  if (!settings) {
    return (
      <div className="p-4 rounded border">
        <p>Please add your cycle settings first on the Settings page.</p>
        <a href="/settings" className="underline">
          Open Settings
        </a>
      </div>
    );
  }

  const bands = phaseBands(settings.cycle_length);

  // Soft colors for lines (matching your palette)
  const COLORS = {
    mood: "#F7A7A7", // rose
    energy: "#CDEDC7", // mint
    stress: "#FFE083", // honey
    warmth: "#D1B3FF", // lavender
  };

  return (
    <div className="grid gap-8">
      {/* Cycle selector */}
      {cycles.length > 1 && (
        <div className="flex items-center gap-2 justify-end">
          <label className="text-sm text-rose-800/70">Cycle</label>
          <select
            className="border border-white/50 bg-white/70 rounded px-2 py-1 text-sm shadow-sm"
            value={selectedCycleIndex}
            onChange={(e) => setSelectedCycleIndex(Number(e.target.value))}
          >
            {Array.from({ length: cycles.length }).map((_, offset) => {
              const label = offset === 0 ? "Current" : `${offset} ago`;
              return (
                <option key={offset} value={offset}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key="energy-flow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="
            rounded-3xl bg-gradient-to-b from-[#FFF9F3] to-[#FFEAE3]
            backdrop-blur-xl shadow-[0_8px_30px_rgba(255,180,170,0.25)]
            p-6 space-y-4 border border-white/40
          "
        >
          {/* Titles */}
          <h3 className="text-center font-serif italic text-[20px] text-[#6E4E46]">
            Your Energy Flow
          </h3>
          <p className="text-center text-sm text-rose-900/70">
            Your moods, energy, and warmth — gently shifting with time.
          </p>

          {/* Chart area */}
          <div className="relative h-[260px] w-full rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,180,170,0.18)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#FFF9F3_0%,#FFEAE3_100%)]" />
            <ResponsiveContainer>
              <LineChart
                data={activeCycleData}
                margin={{ top: 16, right: 20, bottom: 8, left: 8 }}
              >
                {/* Soft horizontal guides only */}
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(125, 85, 80, 0.10)"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="cycleDay"
                  type="number"
                  domain={[1, settings.cycle_length]}
                  tickFormatter={(v) => `Day ${v}`}
                  tick={{ fill: "rgba(110, 78, 70, 0.6)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(110, 78, 70, 0.15)" }}
                  tickLine={{ stroke: "rgba(110, 78, 70, 0.15)" }}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 3, 6, 10]}
                  tick={{ fill: "rgba(110, 78, 70, 0.6)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(110, 78, 70, 0.15)" }}
                  tickLine={{ stroke: "rgba(110, 78, 70, 0.15)" }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.6)",
                    background: "rgba(255,249,243,0.95)",
                    boxShadow: "0 8px 24px rgba(255,180,170,0.25)",
                  }}
                  formatter={(value: any, name: any) => {
                    const labelMap: Record<string, string> = {
                      mood: "Mood",
                      energy: "Energy",
                      stress: "Stress",
                      warmth: "Warmth",
                    };
                    return [value, labelMap[name] || name];
                  }}
                  labelFormatter={(label) => `Cycle day ${label}`}
                />

                {/* Phase background bands (soft veil) */}
                {phaseBands(settings.cycle_length).map((b) => (
                  <ReferenceArea
                    key={`${b.phase}-${b.start}-${b.end}`}
                    x1={b.start}
                    x2={b.end}
                    y1={0}
                    y2={10}
                    fill={(phasePalette as Record<string, string>)[b.phase] || "#eee"}
                    fillOpacity={0.08}
                    ifOverflow="extendDomain"
                  />
                ))}

                {/* Area fills for watercolor effect */}
                <defs>
                  <linearGradient id="fillMood" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.mood} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={COLORS.mood} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillEnergy" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.energy} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={COLORS.energy} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillStress" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.stress} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={COLORS.stress} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillWarmth" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.warmth} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={COLORS.warmth} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <Area
                  type="monotone"
                  dataKey="mood"
                  stroke="transparent"
                  fill="url(#fillMood)"
                  isAnimationActive
                  animationDuration={1200}
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="transparent"
                  fill="url(#fillEnergy)"
                  isAnimationActive
                  animationDuration={1200}
                />
                <Area
                  type="monotone"
                  dataKey="stress"
                  stroke="transparent"
                  fill="url(#fillStress)"
                  isAnimationActive
                  animationDuration={1200}
                />
                <Area
                  type="monotone"
                  dataKey="warmth"
                  stroke="transparent"
                  fill="url(#fillWarmth)"
                  isAnimationActive
                  animationDuration={1200}
                />

                {/* Curved, soft-glow lines */}
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke={COLORS.mood}
                  strokeWidth={1.5}
                  dot={false}
                  opacity={0.9}
                  isAnimationActive
                  animationDuration={1800}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke={COLORS.energy}
                  strokeWidth={1.5}
                  dot={false}
                  opacity={0.9}
                  isAnimationActive
                  animationDuration={1800}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke={COLORS.stress}
                  strokeWidth={1.5}
                  dot={false}
                  opacity={0.9}
                  isAnimationActive
                  animationDuration={1800}
                />
                <Line
                  type="monotone"
                  dataKey="warmth"
                  stroke={COLORS.warmth}
                  strokeWidth={1.5}
                  dot={false}
                  opacity={0.9}
                  isAnimationActive
                  animationDuration={1800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Custom soft legend */}
          <div className="flex justify-center gap-6 text-sm text-rose-900/80">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.mood }} />
              mood
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.energy }} />
              energy
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.stress }} />
              stress
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.warmth }} />
              warmth
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Phase summaries (averages) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.05 }}
        className="rounded-3xl p-6 bg-white/60 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgba(255,180,170,0.20)]"
      >
        <h3 className="font-serif text-[18px] text-rose-900 mb-4">
          Phase summaries (averages)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {phaseAverages.map((p) => {
            const color = (phasePalette as Record<string, string>)[p.phase] || "#eee";
            return (
              <div
                key={p.phase}
                className="rounded-2xl p-4 border shadow-sm"
                style={{
                  background: `${color}20`,
                  borderColor: `${color}55`,
                }}
              >
                <div className="font-serif text-rose-900 text-lg capitalize mb-1">
                  🌷 {p.phase}
                </div>
                <div className="text-sm grid grid-cols-2 gap-y-1 text-rose-900/80">
                  <span>Mood</span>
                  <span>{p.mood}</span>
                  <span>Energy</span>
                  <span>{p.energy}</span>
                  <span>Stress</span>
                  <span>{p.stress}</span>
                  <span>Warmth</span>
                  <span>{p.warmth}</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
