'use client';

import { useEffect, useState } from 'react';
import { cycleDay, phaseForDay, predictDates } from '@/lib/phase';

type Settings = {
  start_date: string;
  cycle_length: number;
};

export function TodayBanner({ settings }: { settings: Settings | null }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!settings) return;

    const startDate = new Date(`${settings.start_date}T00:00:00`);
    const today = new Date();
    const day = cycleDay(today, startDate, settings.cycle_length);
    const phase = phaseForDay(day);

    const { nextPeriodStart, ovulation } = predictDates(startDate, settings.cycle_length);

    const phaseTitles: Record<string, string> = {
      menstrual: 'Menstrual',
      follicular: 'Follicular',
      ovulation: 'Ovulatory',
      luteal: 'Luteal'
    };

    const phrases: Record<string, string> = {
      menstrual: 'Rest, reflect, and go easy on yourself 💖',
      follicular: 'You’re recharging and ready to plan 💪',
      ovulation: 'Energy peak — perfect for social or creative time 🌸',
      luteal: 'Slow down and listen to your body 🌙'
    };

    setMessage(
      `Day ${day} — ${phaseTitles[phase]} phase. ${phrases[phase]}
Next period starts on ${nextPeriodStart.toLocaleDateString()}. 
Ovulation predicted around ${ovulation.toLocaleDateString()}.`
    );
  }, [settings]);

  if (!settings)
    return <p className="text-gray-500">Add your settings to start tracking.</p>;

  return (
    <div className="p-4 rounded bg-princess-peach/20 border border-princess-peach text-left">
      <h2 className="text-lg font-semibold mb-1">Today</h2>
      <p className="whitespace-pre-line">{message}</p>
    </div>
  );
}
