'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TodayBanner } from '@/components/TodayBanner';
import { Charts } from '@/components/Charts';
import MonthCalendar from '@/components/MonthCalendar';
import YearCalendar from '@/components/YearCalendar';

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ start_date: string; cycle_length: number } | null>(null);
  const [view, setView] = useState<'month' | 'year'>('month');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        window.location.href = '/login';
        return;
      }

      const { data: s } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (s) setSettings({ start_date: s.start_date, cycle_length: s.cycle_length });
    })();
  }, []);

  if (!userId) return null;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-6">
      <TodayBanner settings={settings} />

      <a
        href={`/journal/${todayStr}`}
        className="inline-block text-center bg-princess-peach text-white px-4 py-2 rounded font-medium"
      >
        ✍️ Log today’s journal
      </a>

      <Charts />

      {!settings ? (
        <a className="underline" href="/settings">
          Add your cycle settings →
        </a>
      ) : (
        <div>
          {view === 'month' ? (
            <MonthCalendar
              startDate={settings.start_date}
              cycleLength={settings.cycle_length}
            />
          ) : (
            <YearCalendar
              startDate={settings.start_date}
              cycleLength={settings.cycle_length}
            />
          )}

          <button
            onClick={() => setView(view === 'month' ? 'year' : 'month')}
            className="mt-3 underline text-princess-peach text-sm"
          >
            {view === 'month' ? '📅 View full year' : '← Back to month'}
          </button>
        </div>
      )}
    </div>
  );
}
