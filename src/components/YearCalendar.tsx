'use client';
import { cycleDay, phaseForDay, phasePalette } from '@/lib/phase';

export default function YearCalendar({
  startDate,
  cycleLength,
}: {
  startDate: string;
  cycleLength: number;
}) {
  const startD = new Date(startDate);
  const today = new Date();
  const year = today.getFullYear();

  const months = Array.from({ length: 12 }, (_, i) => i);
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  function dayOfWeekIndex(date: Date) {
    const jsDay = date.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  return (
    <div className="grid grid-cols-3 gap-4 text-xs">
      {months.map((m) => {
        const firstDay = new Date(year, m, 1);
        const lastDay = new Date(year, m + 1, 0);
        const days: Date[] = [];
        let d = new Date(firstDay);
        while (d <= lastDay) {
          days.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }

        return (
          <div key={m} className="bg-white rounded p-2 shadow-sm">
            <h4 className="font-semibold text-center mb-1">
              {firstDay.toLocaleString(undefined, { month: 'short' })}
            </h4>
            <div className="grid grid-cols-7 text-center mb-1">
              {weekdays.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
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
                    className="aspect-square rounded"
                    style={{
                      background: color,
                      outline: isToday ? '1px solid black' : 'none',
                      ...marginStyle,
                    }}
                  ></a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
