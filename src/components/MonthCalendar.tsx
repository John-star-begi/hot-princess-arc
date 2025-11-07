"use client";
import { useState } from "react";
import { cycleDay, phaseForDay, phasePalette } from "@/lib/phase";

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

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const days: Date[] = [];
  for (let d = 1; d <= lastOfMonth.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  function weekdayIndex(date: Date) {
    const jsDay = date.getDay();
    return jsDay === 0 ? 6 : jsDay - 1; // Monday first
  }

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
  }

  return (
    <div className="w-full">
      {/* Month header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => changeMonth(-1)}
          className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-sm active:scale-[.98]"
        >
          ←
        </button>
        <div className="text-sm font-medium">
          {viewDate.toLocaleString(undefined, { month: "long" })} {year}
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="px-3 py-2 rounded-xl bg-white border border-pink-200 text-sm active:scale-[.98]"
        >
          →
        </button>
      </div>

      {/* Week labels */}
      <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-600 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* blank pads before first day */}
        {Array.from({ length: weekdayIndex(firstOfMonth) }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((date) => {
          const cd = cycleDay(date, startD, cycleLength);
          const phase = phaseForDay(cd);
          const pal = phasePalette(phase);
          const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

          return (
            <div
              key={date.toISOString()}
              className={[
                "aspect-square rounded-2xl flex items-center justify-center text-[13px] select-none",
                "bg-white border border-pink-200 relative",
                isToday ? "ring-2 ring-pink-300" : "",
              ].join(" ")}
              title={`${phase} • Day ${cd}`}
            >
              <span className="font-medium">{date.getDate()}</span>
              {/* phase dot */}
              <span
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full"
                style={{ background: pal[0] }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
