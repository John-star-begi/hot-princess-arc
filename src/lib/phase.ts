export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface Prediction {
  nextPeriodStart: Date;
  periodEnd: Date;
  ovulation: Date;
  fertileStart: Date;
  fertileEnd: Date;
}

/* Difference in full days */
export function dayDiff(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/* Compute current cycle day safely */
export function cycleDay(today: Date, startDate: Date, cycleLength: number) {
  const delta = dayDiff(today, startDate);
  const mod = ((delta % cycleLength) + cycleLength) % cycleLength;
  return mod + 1;
}

/* Determine current phase for a given cycle day */
export function phaseForDay(day: number, periodDuration = 5): Phase {
  if (day >= 1 && day <= periodDuration) return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 17) return 'ovulation';
  return 'luteal';
}

/* Predict next key dates based on average inputs */
export function predictDates(
  lastPeriodStart: Date,
  averageCycleLength: number,
  periodDuration = 5
): Prediction {
  const nextPeriodStart = new Date(lastPeriodStart);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + averageCycleLength);

  const periodEnd = new Date(lastPeriodStart);
  periodEnd.setDate(periodEnd.getDate() + periodDuration);

  const ovulation = new Date(nextPeriodStart);
  ovulation.setDate(ovulation.getDate() - 14);

  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 2);

  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(fertileEnd.getDate() + 2);

  return { nextPeriodStart, periodEnd, ovulation, fertileStart, fertileEnd };
}

/* Colors and text for UI */
export const phasePalette: Record<Phase, string> = {
  menstrual: '#F7A7A7',
  follicular: '#BDE6C3',
  ovulation: '#FFE083',
  luteal: '#D1B3FF'
};

export const phaseCopy: Record<Phase, { icon: string; line: string }> = {
  menstrual: { icon: '🩸', line: 'Rest & warmth. Eat: milk/honey/OJ. Move: walks.' },
  follicular: { icon: '🌱', line: 'Build energy. Fruit & dairy. Light strength.' },
  ovulation: { icon: '🌕', line: 'Glow & strength. Fruit + dairy. Lower-body.' },
  luteal: { icon: '🌙', line: 'Soothe & support. Warm milk + honey. Yoga/walk.' }
};
