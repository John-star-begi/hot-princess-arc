// src/lib/date.ts
export function parseDateOnly(s: string): Date {
  // s is "YYYY-MM-DD" with NO timezone — build a LOCAL date
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateOnly(d: Date): string {
  // Return "YYYY-MM-DD" in LOCAL time (no UTC conversion)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
