/** Date helpers. The Somali week starts on Saturday (Sabti). */

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

/** Index 0 = Saturday … 6 = Friday. */
export function weekIndex(d: Date): number {
  return (d.getDay() + 1) % 7;
}

export function startOfWeek(d: Date): Date {
  return startOfDay(addDays(d, -weekIndex(d)));
}

export function weekDates(d: Date): Date[] {
  const start = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isSameDay(a: Date, b: Date) {
  return dayKey(a) === dayKey(b);
}

/** mm:ss, or h:mm:ss past an hour. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${String(m).padStart(2, '0')}:${sec}`;
}

/**
 * Consecutive days (ending today or yesterday) that contain at least one workout.
 */
export function computeStreak(doneKeys: Iterable<string>, today = new Date()): number {
  const set = new Set(doneKeys);
  let cursor = startOfDay(today);
  if (!set.has(dayKey(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  while (set.has(dayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
