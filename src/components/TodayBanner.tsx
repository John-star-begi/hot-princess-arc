'use client';
import { cycleDay, phaseForDay, phaseCopy } from '@/lib/phase';

export function TodayBanner({ settings }: { settings: { start_date: string; cycle_length: number } | null }) {
  if (!settings) return <div className="p-3 rounded bg-princess-lavender">Add your cycle in Settings.</div>;
  const today = new Date();
  const cd = cycleDay(today, new Date(settings.start_date), settings.cycle_length);
  const ph = phaseForDay(cd, settings.cycle_length);
  const copy = phaseCopy[ph];
  return (
    <div className="p-3 rounded" style={{ background: 'var(--card)' }}>
      Today: {copy.icon} <b>{ph}</b> (Day {cd}/{settings.cycle_length}) — {copy.line}
    </div>
  );
}
