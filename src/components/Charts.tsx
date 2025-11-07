'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { phasePalette } from '@/lib/phase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type Entry = {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  warmth: number;
};

export default function Charts() {
  const [data, setData] = useState<Entry[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('journal')
        .select('date, mood, energy, stress, warmth')
        .order('date', { ascending: true });
      setData(
        (data || []).map((d: any) => ({
          date: d.date,
          mood: d.mood ?? 0,
          energy: d.energy ?? 0,
          stress: d.stress ?? 0,
          warmth: d.warmth ?? 0,
        }))
      );
    })();
  }, []);

  // Define soft pastel colors that match the palette theme
  const colors = [
    phasePalette.menstrual || '#F7A7A7',
    phasePalette.follicular || '#BDE6C3',
    phasePalette.ovulation || '#FFE083',
    phasePalette.luteal || '#D1B3FF',
  ];

  return (
    <div className="space-y-6">
      {/* Line chart */}
      <div className="w-full" style={{ height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[0, 10]} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #f3cbd3',
                background: 'rgba(255,255,255,0.95)',
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke={colors[0]}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="energy"
              stroke={colors[1]}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="stress"
              stroke={colors[2]}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="warmth"
              stroke={colors[3]}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Completion donut */}
      <div className="w-full" style={{ height: 180 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={[
                { name: 'Logged', value: data.length },
                { name: 'Missing', value: Math.max(0, 30 - data.length) },
              ]}
              dataKey="value"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={4}
            >
              <Cell fill={phasePalette.follicular || '#CDEDC7'} />
              <Cell fill="#F3E1F5" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
