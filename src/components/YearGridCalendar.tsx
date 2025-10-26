'use client';
import { cycleDay, phaseForDay, phasePalette } from '@/lib/phase';
import { useEffect, useState } from 'react';

export function YearGridCalendar({
  startDate,
  cycleLength,
  onClose
}: {
  startDate: string;
  cycleLength: number;
  onClose: () => void;
}) {
  const startD = new Date(startDate);
  const today = new Date();
  const year = today.getFullYear();
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    const temp: Date[] = [];
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);
    let d = new Date(firstDay);
    while (d <= lastDay) {
      temp.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    setDates(temp);
  }, [year]);

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function dayOfWeekIndex(date: Date) {
    // convert Sunday (0) → 6, so Monday is first
    const jsDay = date.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Year Overview ({year})</h2>
          <button
            onClick={onClose}
            className="text-sm text-princess-peach underline"
          >
            Close ✕
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm mb-1">
          {weekdays.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {dates.map((d, i) => {
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
      </div>
    </div>
  );
}
