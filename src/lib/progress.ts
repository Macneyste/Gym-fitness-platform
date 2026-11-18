import type { WorkoutSession } from '@/types/models';
import { addDays, dayKey, startOfWeek } from './date';

export type Range = 'week' | 'month';
export type Bar = { key: string; label: string; minutes: number };

function minutesPerDay(sessions: WorkoutSession[]) {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const k = dayKey(new Date(s.startedAt));
    map.set(k, (map.get(k) ?? 0) + s.durationSec / 60);
  }
  return map;
}

/**
 * Week: 7 daily bars (Sat→Fri) for the current week.
 * Month: 4 weekly bars for the last four weeks (oldest first).
 * Also returns the previous period total for the % change badge.
 */
export function buildBars(sessions: WorkoutSession[], range: Range, dayLabels: string[], today = new Date()) {
  const perDay = minutesPerDay(sessions);
  const sum = (from: Date, days: number) =>
    Array.from({ length: days }, (_, i) => perDay.get(dayKey(addDays(from, i))) ?? 0).reduce((a, b) => a + b, 0);

  const weekStart = startOfWeek(today);
  if (range === 'week') {
    const bars: Bar[] = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      return { key: dayKey(d), label: dayLabels[i] ?? '', minutes: Math.round(perDay.get(dayKey(d)) ?? 0) };
    });
    return { bars, total: sum(weekStart, 7), previous: sum(addDays(weekStart, -7), 7) };
  }

  const firstWeek = addDays(weekStart, -21);
  const bars: Bar[] = Array.from({ length: 4 }, (_, i) => {
    const from = addDays(firstWeek, i * 7);
    return { key: dayKey(from), label: `${from.getDate()}/${from.getMonth() + 1}`, minutes: Math.round(sum(from, 7)) };
  });
  return { bars, total: sum(firstWeek, 28), previous: sum(addDays(firstWeek, -28), 28) };
}

/** Percentage change, or null when there is no previous data to compare. */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
