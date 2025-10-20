export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export function dayDiff(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}
export function cycleDay(today: Date, startDate: Date, cycleLength: number) {
  const delta = dayDiff(today, startDate);
  const mod = ((delta % cycleLength) + cycleLength) % cycleLength;
  return mod + 1;
}
export function phaseForDay(day: number, cycleLength: number): Phase {
  if (day >= 1 && day <= 5) return 'menstrual';
  if (day >= 6 && day <= 13) return 'follicular';
  if (day >= 14 && day <= 17) return 'ovulation';
  return 'luteal';
}
export const phasePalette: Record<Phase, string> = {
  menstrual: '#F7A7A7', follicular: '#BDE6C3', ovulation: '#FFE083', luteal: '#D1B3FF'
};
export const phaseCopy: Record<Phase, { icon: string; line: string }> = {
  menstrual: { icon: '🩸', line: 'Rest & warmth. Eat: milk/honey/OJ. Move: walks.' },
  follicular: { icon: '🌱', line: 'Build energy. Fruit & dairy. Light strength.' },
  ovulation: { icon: '🌕', line: 'Glow & strength. Fruit + dairy. Lower‑body.' },
  luteal: { icon: '🌙', line: 'Soothe & support. Warm milk + honey. Yoga/walk.' }
};
