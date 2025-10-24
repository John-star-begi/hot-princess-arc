'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CalendarYear } from '@/components/CalendarYear';
import { TodayBanner } from '@/components/TodayBanner';
import { Charts } from '@/components/Charts';

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ start_date: string; cycle_length: number } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        window.location.href = '/login';
        return;
      }
      const { data: s } = await supabase.from('settings').select('*').eq('user_id', uid).maybeSingle();
      if (s) setSettings({ start_date: s.start_date, cycle_length: s.cycle_length });
    });
  }, []);

  if (!userId) return null;

  return (
    <div className="grid gap-6">
      <TodayBanner settings={settings} />

      {/* Charts section */}
      <Charts />

      {/* Calendar or link to settings */}
      {!settings ? (
        <a className="underline" href="/settings">Add your cycle settings →</a>
      ) : (
        <CalendarYear startDate={settings.start_date} cycleLength={settings.cycle_length} />
      )}
    </div>
  );
}
