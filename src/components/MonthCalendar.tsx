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
  const today = new Date();

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

  function dayOfWeekIndex(date: Date) {
    const jsDay = date.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  function changeMonth(delta: number) {
    const newDate = new Date(year, month + delta, 1);
    setViewDate(newDate);
  }

  return (
    <div className="max-w-sm mx-auto w-full p-3 bg-pink-50 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => changeMonth(-1)}
          className="px-3 text-lg text-pink-400 font-bold"
        >
          ←
        </button>
        <h3 className="font-semibold text-lg text-gray-800">
          {viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className="px-3 text-lg text-pink-400 font-bold"
        >
          →
        </button>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 w-full text-center text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
        {weekdays.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 w-full gap-1 text-center text-sm">
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
              className={`relative flex items-center justify-center aspect-square text-sm rounded-md transition-all duration-150 bg-white ${
                isToday ? 'ring-2 ring-pink-300' : 'ring-1 ring-gray-200'
              }`}
              style={marginStyle}
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
