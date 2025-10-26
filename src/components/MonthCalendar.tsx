'use client';
import { useState } from 'react';
import { cycleDay, phaseForDay, phasePalette } from '@/lib/phase';

export default function MonthCalendar({
  startDate,
  cycleLength,
}: {
  startDate: string;
  cycleLength: number;
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const startD = new Date(startDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days: Date[] = [];
  let d = new Date(firstDay);
  while (d <= lastDay) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();

  function dayOfWeekIndex(date: Date) {
    const jsDay = date.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  function changeMonth(delta: number) {
    const newDate = new Date(year, month + delta, 1);
    setViewDate(newDate);
  }

  return (
    <div className="grid gap-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => changeMonth(-1)}
          className="px-3 text-lg text-princess-peach"
        >
          ←
        </button>
        <h3 className="font-semibold text-lg">
          {viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className="px-3 text-lg text-princess-peach"
        >
          →
        </button>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold">
        {weekdays.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {days.map((d, i) => {
          const cd = cycleDay(d, startD, cycleLength);
          const phase = phaseForDay(cd);
          const color = phasePalette[phase];
          const isToday = d.toDateString() === today.toDateString();
          const index = dayOfWeekIndex(d);
          const marginStyle = i === 0 ? { gridColumnStart: index + 1 } : {};

          return (
            <a
              key={i}
              href={`/journal/${d.toISOString().slice(0, 10)}`}
              className="relative rounded aspect-square flex items-center justify-center text-sm bg-white"
              style={{
                outline: isToday ? '2px solid #ffb6c1' : '1px solid #eee',
                ...marginStyle,
              }}
            >
              {d.getDate()}
              <span
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full opacity-80"
                style={{ backgroundColor: color }}
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}
