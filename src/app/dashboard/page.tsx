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
    <div className="flex flex-col items-center w-full min-h-screen bg-pink-50 pb-16 px-4 gap-6">
      {/* Today's Phase Banner */}
      <div className="w-full max-w-md">
        <TodayBanner settings={settings} />
      </div>

      {/* Journal Button */}
      <a
        href={`/journal/${todayStr}`}
        className="bg-princess-peach text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-pink-400 transition"
      >
        ✍️ Log today’s journal
      </a>

      {/* Charts */}
      <div className="w-full max-w-lg">
        <Charts />
      </div>

      {/* Cycle Settings Check */}
      {!settings ? (
        <a
          href="/settings"
          className="underline text-pink-500 text-sm"
        >
          Add your cycle settings →
        </a>
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* Month or Year Calendar */}
          <div className={view === 'month' ? 'w-full max-w-sm' : 'w-full max-w-5xl'}>
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
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setView(view === 'month' ? 'year' : 'month')}
            className="mt-4 text-pink-500 underline text-sm hover:text-pink-600"
          >
            {view === 'month' ? '📅 View full year' : '← Back to month'}
          </button>
        </div>
      )}
    </div>
  );
}
