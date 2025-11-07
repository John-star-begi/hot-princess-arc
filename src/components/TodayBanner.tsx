"use client";

import { useEffect, useMemo, useState } from "react";
import { cycleDay, phaseForDay, predictDates, phasePalette } from "@/lib/phase";

type Settings = {
  start_date: string;
  cycle_length: number;
};

export function TodayBanner({ settings }: { settings: Settings | null }) {
  const [content, setContent] = useState<{ title: string; subtitle: string; phase: string } | null>(null);

  useEffect(() => {
    if (!settings) return;
    const startDate = new Date(`${settings.start_date}T00:00:00`);
    const today = new Date();
    const day = cycleDay(today, startDate, settings.cycle_length);
    const phase = phaseForDay(day);
    const { nextPeriodStart, ovulation } = predictDates(startDate, settings.cycle_length);

    const titles: Record<string, string> = {
      menstrual: "Menstrual",
      follicular: "Follicular",
      ovulation: "Ovulation",
      luteal: "Luteal",
    };

    const messages: Record<string, string> = {
      menstrual: "Rest is powerful. Go warm and slow.",
      follicular: "Bloom gently. Plan and play.",
      ovulation: "Shine without trying. Feel magnetic.",
      luteal: "Cocoon and soften. Trust your glow.",
    };

    setContent({
      title: `${titles[phase]} • Day ${day}`,
      subtitle:
        phase === "ovulation"
          ? `Next period around ${nextPeriodStart.toLocaleDateString()}`
          : phase === "follicular"
          ? `Ovulation around ${ovulation.toLocaleDateString()}`
          : messages[phase],
      phase,
    });
  }, [settings]);

  const bg = useMemo(() => {
    if (!content) return "from-princess-rose to-princess-cream";
    const palette = phasePalette(content.phase as any);
    return `from-[${palette[0]}] to-[${palette[1]}]`; // gradient using palette hues
  }, [content]);

  if (!settings || !content) {
    return (
      <div className="rounded-3xl p-4 bg-gradient-to-br from-princess-rose to-princess-cream text-gray-800 shadow-sm">
        Loading your rhythm…
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-4 bg-gradient-to-br from-princess-rose to-princess-cream text-gray-800 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-inner">
          <span className="text-xl">✨</span>
        </div>
        <div>
          <div className="text-base font-semibold">{content.title}</div>
          <div className="text-sm text-gray-700">{content.subtitle}</div>
        </div>
      </div>
    </div>
  );
}
