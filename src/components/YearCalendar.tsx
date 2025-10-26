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
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
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
          <div
            key={m}
            className="bg-white rounded-2xl p-2 shadow-sm border border-pink-100"
          >
            <h4 className="font-semibold text-center mb-1 text-pink-400">
              {firstDay.toLocaleString(undefined, { month: 'short' })}
            </h4>

            <div className="grid grid-cols-7 text-center text-[10px] text-gray-500 mb-0.5">
              {weekdays.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 w-full gap-0.5 text-center">
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
                    className={`relative flex items-center justify-center aspect-square rounded-md text-[10px] bg-white ${
                      isToday ? 'ring-1 ring-pink-400' : 'ring-1 ring-gray-100'
                    }`}
                    style={marginStyle}
                  >
                    {d.getDate()}
                    <span
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full opacity-80"
                      style={{ backgroundColor: color }}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
