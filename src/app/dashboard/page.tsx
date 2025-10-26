'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TodayBanner } from '@/components/TodayBanner';
import { Charts } from '@/components/Charts';
import { YearGridCalendar } from '@/components/YearGridCalendar';
import { cycleDay, phaseForDay, phasePalette } from '@/lib/phase';

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ start_date: string; cycle_length: number } | null>(null);
  const [showYear, setShowYear] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  // Current month data
  const startD = settings ? new Date(settings.start_date) : new Date();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysInMonth = lastDay.getDate();

  function dayOfWeekIndex(date: Date) {
    const jsDay = date.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  const monthDays: Date[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    monthDays.push(new Date(currentYear, currentMonth, i));
  }

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
        <div className="grid gap-2">
          <h3 className="font-semibold mb-1">
            {today.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </h3>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm mb-1">
            {weekdays.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          {/* Current month grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {monthDays.map((d, i) => {
              const cd = cycleDay(d, startD, settings.cycle_length);
              const phase = phaseForDay(cd);
              const color = phasePalette[phase];
              const isToday = d.toDateString() === today.toDateString();
              const index = dayOfWeekIndex(d);
              const marginStyle = i === 0 ? { gridColumnStart: index + 1 } : {};

              return (
                <a
                  key={i}
                  href={`/journal/${d.toISOString().slice(0, 10)}`}
                  className="rounded p-1 aspect-square flex items-center justify-center"
                  style={{
                    background: color,
                    outline: isToday ? '2px solid #000' : undefined,
                    ...marginStyle
                  }}
                  title={d.toDateString()}
                >
                  {d.getDate()}
                </a>
              );
            })}
          </div>

          {/* Open modal button */}
          <button
            onClick={() => setShowYear(true)}
            className="mt-2 text-sm underline text-princess-peach"
          >
            📅 View full year
          </button>

          {/* Year modal */}
          {showYear && (
            <YearGridCalendar
              startDate={settings.start_date}
              cycleLength={settings.cycle_length}
              onClose={() => setShowYear(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
