'use client';

import { useEffect, useState } from 'react';

type Settings = {
  start_date: string;
  cycle_length: number;
};

export function TodayBanner({ settings }: { settings: Settings | null }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!settings) return;

    const startDate = new Date(settings.start_date);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDay = (diffDays % settings.cycle_length) + 1;

    // Determine phase
    let phase = '';
    if (cycleDay <= 5) phase = 'Menstrual';
    else if (cycleDay <= 14) phase = 'Follicular';
    else if (cycleDay <= 17) phase = 'Ovulatory';
    else phase = 'Luteal';

    const phrases: Record<string, string> = {
      Menstrual: 'Rest, reflect, and go easy on yourself 💖',
      Follicular: 'You’re recharging and ready to plan 💪',
      Ovulatory: 'Energy peak — perfect for social or creative time 🌸',
      Luteal: 'Slow down and listen to your body 🌙',
    };

    setMessage(`Day ${cycleDay} — ${phase} phase. ${phrases[phase]}`);
  }, [settings]);

  if (!settings) {
    return <p className="text-gray-500">Add your settings to start tracking.</p>;
  }

  return (
    <div className="p-4 rounded bg-princess-peach/20 border border-princess-peach">
      <h2 className="text-lg font-semibold">Today</h2>
      <p>{message}</p>
    </div>
  );
}
