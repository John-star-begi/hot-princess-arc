"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cycleDay, phaseForDay, predictDates } from "@/lib/phase";

type Settings = {
  start_date: string;
  cycle_length: number;
};

export function TodayBanner({ settings }: { settings: Settings | null }) {
  const [day, setDay] = useState<number | null>(null);
  const [phase, setPhase] = useState<string>("");
  const [message, setMessage] = useState("");
  const [nextPeriodStart, setNextPeriodStart] = useState<Date | null>(null);
  const [ovulation, setOvulation] = useState<Date | null>(null);

  useEffect(() => {
    if (!settings) return;

    const startDate = new Date(`${settings.start_date}T00:00:00`);
    const today = new Date();
    const dayNum = cycleDay(today, startDate, settings.cycle_length);
    const currentPhase = phaseForDay(dayNum);
    const { nextPeriodStart, ovulation } = predictDates(startDate, settings.cycle_length);

    const phrases: Record<string, string> = {
      menstrual: "💖 Rest, reflect, and go easy on yourself.",
      follicular: "🌸 You’re recharging and ready to plan softly.",
      ovulation: "✨ You’re magnetic today. Let yourself shine.",
      luteal: "🌙 Slow down and listen to your body’s rhythm.",
    };

    setDay(dayNum);
    setPhase(currentPhase);
    setMessage(phrases[currentPhase]);
    setNextPeriodStart(nextPeriodStart);
    setOvulation(ovulation);
  }, [settings]);

  if (!settings) {
    return <p className="text-rose-500 text-center italic">Add your settings to start tracking 🌷</p>;
  }

  // Format date to dd-mm-yyyy
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Phase-based color palettes
  const phaseGradients: Record<string, string> = {
    menstrual: "from-[#FFE6E6] via-[#FFD6D9] to-[#FFC8C8]",
    follicular: "from-[#FFF6F1] via-[#FFE4E1] to-[#FFD7C8]",
    ovulation: "from-[#FFF3E5] via-[#FFE9C6] to-[#FFD8A8]",
    luteal: "from-[#F6E8FF] via-[#EEDCFF] to-[#E8CFFF]",
  };

  const phaseLabelColors: Record<string, string> = {
    menstrual: "bg-gradient-to-r from-[#FFC0C0] to-[#FFE0E0]",
    follicular: "bg-gradient-to-r from-[#FFDDBB] to-[#FFE6D0]",
    ovulation: "bg-gradient-to-r from-[#FFE3B3] to-[#FFEBC7]",
    luteal: "bg-gradient-to-r from-[#E1C4FF] to-[#E9D4FF]",
  };

  const gradient = phaseGradients[phase] || phaseGradients.follicular;
  const capsule = phaseLabelColors[phase] || phaseLabelColors.follicular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      whileHover={{ scale: 1.01, boxShadow: "0 0 60px rgba(255, 200, 180, 0.35)" }}
      className={`relative mx-auto w-[92%] max-w-md rounded-[32px] p-8 bg-gradient-to-br ${gradient} shadow-[0_8px_48px_rgba(255,180,170,0.35)] border border-white/30 overflow-hidden`}
    >
      {/* Inner Glow Overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-xl rounded-[32px] pointer-events-none" />

      {/* Gentle Breathing Motion */}
      <motion.div
        animate={{ scale: [1, 1.01, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        {/* Phase Capsule */}
        <div
          className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-serif uppercase tracking-wide text-rose-800 ${capsule} shadow-sm`}
        >
          🌕 {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase
        </div>

        {/* Main Message */}
        <h2
          className="mt-5 text-[1.25rem] font-serif italic text-center leading-snug"
          style={{
            background: "linear-gradient(to right, #F5B8A9, #E1A3C1)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {message}
        </h2>

        {/* Divider */}
        <div className="mx-auto mt-6 mb-4 h-[1px] w-2/5 bg-gradient-to-r from-rose-200 via-rose-100 to-pink-200 opacity-60" />

        {/* Metadata */}
        {day && nextPeriodStart && ovulation && (
          <p className="text-center text-sm text-rose-700/80 tracking-wide">
            Day {day} of {settings.cycle_length} • Next period:{" "}
            {formatDate(nextPeriodStart)} • Ovulation: {formatDate(ovulation)}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
