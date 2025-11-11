"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cycleDay, phaseForDay, phasePalette } from "@/lib/phase";

// Local date helpers to avoid UTC shifting
function parseDateOnly(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function MonthCalendar({
  startDate,
  cycleLength,
}: {
  startDate: string;
  cycleLength: number;
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const startD = parseDateOnly(startDate);
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  function dayOfWeekIndex(date: Date) {
    const jsDay = date.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  function changeMonth(delta: number) {
    const newDate = new Date(year, month + delta, 1);
    setViewDate(newDate);
  }

  // Build month days
  const days: Date[] = [];
  let d = new Date(firstDay);
  while (d <= lastDay) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  return (
    <div
      className="rounded-[28px] p-6 bg-gradient-to-br from-[#FFF6E5] to-[#FFECEF]
                 backdrop-blur-xl shadow-[0_8px_30px_rgba(255,180,170,0.25)] border border-white/40"
      style={{
        boxShadow:
          "inset 0 0 40px rgba(255,255,255,0.2), 0 8px 30px rgba(255,180,170,0.25)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="text-2xl text-rose-500 hover:text-rose-700 transition bg-transparent border-none shadow-none focus:outline-none"
          aria-label="Previous month"
        >
          ←
        </button>

        <div className="relative">
          <h3 className="font-serif italic text-[18px] sm:text-[20px] tracking-wide text-[#6E4E46] select-none">
            {viewDate.toLocaleString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-[1.9rem] h-[2px] w-8 rounded-full bg-gradient-to-r from-rose-200 via-rose-100 to-pink-200 opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 9 }}
          />
        </div>

        <button
          onClick={() => changeMonth(1)}
          className="text-2xl text-rose-500 hover:text-rose-700 transition bg-transparent border-none shadow-none focus:outline-none"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 w-full text-center text-[12px] font-light uppercase tracking-wide text-[#7A5450]/40 mb-3">
        {weekdays.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="grid grid-cols-7 w-full gap-y-4 text-center text-sm"
          >
            {days.map((d, i) => {
              const cd = cycleDay(d, startD, cycleLength);
              const phase = phaseForDay(cd);
              const color = phasePalette[phase];
              const isToday = d.toDateString() === today.toDateString();
              const index = dayOfWeekIndex(d);
              const marginStyle = i === 0 ? { gridColumnStart: index + 1 } : {};

              return (
                <motion.a
                  key={i}
                  href={`/journal/${formatDateOnly(d)}`}
                  whileTap={{ scale: 0.96 }}
                  className={`group relative flex items-center justify-center aspect-square rounded-full select-none transition-all duration-300 ${
                    isToday
                      ? "bg-[#FFF7F3] ring-2 ring-rose-300/70"
                      : "border border-[rgba(255,180,170,0.2)] hover:bg-white/40"
                  }`}
                  style={{
                    ...marginStyle,
                    boxShadow: isToday
                      ? "0 0 12px rgba(255,180,170,0.4)"
                      : undefined,
                  }}
                >
                  {isToday && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{
                        duration: 3.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  <span className="relative z-10 text-[14px] font-medium text-[#6E4E46] drop-shadow-[0_0_1px_rgba(255,255,255,0.8)]">
                    {d.getDate()}
                  </span>

                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color, opacity: 1 }}
                  />
                </motion.a>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
