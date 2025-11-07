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
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((db.getTime() - da.getTime()) / ms);
}

export function Charts() {
  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from("settings")
        .select("start_date, cycle_length")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!settings) return;

      const start = new Date(`${settings.start_date}T00:00:00`);
      const { data: journals } = await supabase
        .from("journals")
        .select("date, mood, energy, stress, warmth")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      const points: ChartPoint[] =
        journals?.map((j: any) => {
          const d = new Date(j.date);
          return {
            date: j.date,
            cycleDay: cycleDay(d, start, Number(settings.cycle_length)),
            phase: phaseForDay(cycleDay(d, start, Number(settings.cycle_length))),
            mood: Number(j.mood ?? 0),
            energy: Number(j.energy ?? 0),
            stress: Number(j.stress ?? 0),
            warmth: Number(j.warmth ?? 0),
          };
        }) ?? [];
      setData(points);
    })();
  }, []);

  const paletteFor = (p: string) => phasePalette(p as any)[0];

  return (
    <div className="space-y-6">
      {/* Line chart */}
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f2cfd4" />
            <XAxis
              dataKey="cycleDay"
              stroke="#7a5d5d"
              tick={{ fontSize: 11 }}
              label={{ value: "Cycle day", position: "insideBottomRight", offset: -3 }}
            />
            <YAxis domain={[0, 10]} stroke="#7a5d5d" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="mood" stroke="#ef7997" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="energy" stroke="#7bc47f" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="stress" stroke="#a28ad6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="warmth" stroke="#f0b35b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Completion donut example */}
      <div className="h-44 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={[
                { name: "Logged", value: data.length },
                { name: "Not logged", value: Math.max(30 - data.length, 0) },
              ]}
              innerRadius={38}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              <Cell fill="#7bc47f" />
              <Cell fill="#f2cfd4" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
