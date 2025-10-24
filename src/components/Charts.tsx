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
} from 'recharts';

type Settings = {
  start_date: string;
  cycle_length: number;
};

type JournalRow = {
  date: string;
  mood: number | null;
  energy: number | null;
  stress: number | null;
  notes: string | null;
};

export function Charts() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // load user settings
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

      setSettings({ start_date: s.start_date, cycle_length: s.cycle_length });

      // load recent journals. last ninety days
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const sinceStr = since.toISOString().slice(0, 10);

      const { data: j } = await supabase
        .from('journals')
        .select('date, mood, energy, stress, notes')
        .gte('date', sinceStr)
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      setRows(j ?? []);
      setLoading(false);
    };

    load();
  }, []);

  const chartData = useMemo(() => {
    if (!settings) return [];

    const startD = new Date(settings.start_date);
    return rows
      .filter((r) => r.mood != null)
      .map((r) => {
        const d = new Date(r.date);
        const cd = cycleDay(d, startD, settings.cycle_length);
        const phase = phaseForDay(cd, settings.cycle_length);
        return {
          date: r.date,
          cycleDay: cd,
          mood: r.mood ?? 0,
          energy: r.energy ?? 0,
          stress: r.stress ?? 0,
          phase,
        };
      });
  }, [rows, settings]);

  const completion = useMemo(() => {
    // completion percent from presence of entries in the last thirty days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const lastThirty = rows.filter((r) => new Date(r.date) >= cutoff);
    const totalDays = Math.max(lastThirty.length, 1);
    const filledDays = lastThirty.filter(
      (r) =>
        (r.mood ?? 0) > 0 ||
        (r.energy ?? 0) > 0 ||
        (r.stress ?? 0) > 0 ||
        (r.notes ?? '').trim().length > 0
    ).length;

    const done = Math.round((filledDays / totalDays) * 100);
    const todo = 100 - done;

    return [
      { name: 'Logged', value: done },
      { name: 'Not logged', value: todo },
    ];
  }, [rows]);

  if (loading) {
    return <p>Loading charts…</p>;
  }

  if (!settings) {
    return (
      <div className="p-4 rounded border">
        <p>Please add your cycle settings first on the Settings page.</p>
        <a href="/settings" className="underline">Open Settings</a>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Mood by cycle day */}
      <div className="p-4 rounded border">
        <h3 className="font-semibold mb-2">Mood by cycle day</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="cycleDay"
                tickFormatter={(v) => `Day ${v}`}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip
                formatter={(value: any, name: any, entry: any) => {
                  if (name === 'mood') return [value, 'Mood'];
                  if (name === 'energy') return [value, 'Energy'];
                  if (name === 'stress') return [value, 'Stress'];
                  return [value, name];
                }}
                labelFormatter={(label) => `Cycle day ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="mood" dot={false} />
              <Line type="monotone" dataKey="energy" dot={false} />
              <Line type="monotone" dataKey="stress" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Tip. Menstrual days often trend lower. Ovulatory days often trend higher. Your data will show your own pattern.
        </p>
      </div>

      {/* Completion donut for last thirty days */}
      <div className="p-4 rounded border">
        <h3 className="font-semibold mb-2">Logging completion, last thirty days</h3>
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
                {completion.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick legend for phase colors from your phasePalette */}
      <div className="p-4 rounded border">
        <h3 className="font-semibold mb-2">Phase colors</h3>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(phasePalette).map(([phase, color]) => (
            <div key={phase} className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded"
                style={{ background: color }}
              />
              <span>{phase}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
