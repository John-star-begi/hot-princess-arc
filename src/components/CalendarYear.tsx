'use client';
import { cycleDay, phaseForDay, phasePalette } from '@/lib/phase';

export function CalendarYear({ startDate, cycleLength }: { startDate: string; cycleLength: number }) {
  const start = new Date();
  const months = [...Array(12)].map((_, i) => new Date(start.getFullYear(), start.getMonth() + i, 1));

  return (
    <div className="grid gap-6">
      {months.map((m, idx) => (
        <Month key={idx} startDate={startDate} cycleLength={cycleLength} monthDate={m} />
      ))}
    </div>
  );
}

function Month({ monthDate, startDate, cycleLength }: { monthDate: Date; startDate: string; cycleLength: number }) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const startD = new Date(startDate);

  return (
    <div>
      <h3 className="font-semibold mb-2">{monthDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</h3>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {grid.map((d) => {
          const date = new Date(year, month, d);
          const cd = cycleDay(date, startD, cycleLength);
          const phase = phaseForDay(cd, cycleLength);
          const color = phasePalette[phase];
          const isToday = new Date().toDateString() === date.toDateString();
          return (
            <a key={d} href={`/journal/${date.toISOString().slice(0,10)}`} className="rounded p-1 text-center" style={{ background: color, outline: isToday ? '2px solid #000' : undefined }}>
              {d}
            </a>
          );
        })}
      </div>
    </div>
  );
}
