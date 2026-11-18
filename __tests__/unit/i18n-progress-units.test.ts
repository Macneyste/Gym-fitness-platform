import { dictionaries, translate, translateList } from '@/i18n';
import { buildBars, percentChange } from '@/lib/progress';
import { displayWeight, formatWeight, kgToLb, lbToKg } from '@/lib/units';
import type { WorkoutSession } from '@/types/models';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('i18n', () => {
  it('Somali and English dictionaries have the same keys', () => {
    expect(keys(dictionaries.en).sort()).toEqual(keys(dictionaries.so).sort());
  });

  it('translates with interpolation', () => {
    expect(translate('so', 'live.exerciseOf', { current: 1, total: 6 })).toBe('Jimicsiga 1/6');
    expect(translate('en', 'workout.eyebrow', { week: 3, day: 4 })).toBe('WEEK 3 · DAY 4');
    expect(translate('so', 'workout.eyebrow', { week: 3, day: 4 })).toBe('TODOBAADKA 3 · MAALINTA 4');
  });

  it('returns the key for unknown entries and lists for arrays', () => {
    expect(translate('en', 'nope.missing')).toBe('nope.missing');
    expect(translateList('so', 'days.short')).toEqual(['Sab', 'Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim']);
  });
});

describe('units', () => {
  it('converts kg ↔ lb', () => {
    expect(kgToLb(100)).toBeCloseTo(220.46, 2);
    expect(lbToKg(kgToLb(72.5))).toBeCloseTo(72.5, 6);
    expect(displayWeight(60, 'lb')).toBe(132.3);
    expect(formatWeight(60, 'kg')).toBe('60 kg');
    expect(formatWeight(undefined, 'kg', 'jirka')).toBe('jirka');
  });
});

describe('progress bars', () => {
  const today = new Date(2026, 10, 25, 10); // Wednesday
  const at = (y: number, m: number, d: number, minutes: number): WorkoutSession => ({
    id: `${y}${m}${d}`,
    workoutId: 'w1',
    startedAt: new Date(y, m, d, 8).toISOString(),
    durationSec: minutes * 60,
    calories: 0,
    sets: [],
    synced: true,
  });
  const labels = ['Sab', 'Axd', 'Isn', 'Tal', 'Arb', 'Kha', 'Jim'];

  it('builds Saturday-first daily bars and compares with last week', () => {
    const sessions = [at(2026, 10, 21, 40), at(2026, 10, 23, 50), at(2026, 10, 23, 10), at(2026, 10, 16, 45)];
    const { bars, total, previous } = buildBars(sessions, 'week', labels, today);
    expect(bars.map((b) => b.minutes)).toEqual([40, 0, 60, 0, 0, 0, 0]);
    expect(bars[0].label).toBe('Sab');
    expect(total).toBe(100);
    expect(previous).toBe(45);
    expect(percentChange(total, previous)).toBe(122);
  });

  it('builds four weekly bars for the month view', () => {
    const { bars, total } = buildBars([at(2026, 10, 1, 30), at(2026, 10, 24, 20)], 'month', labels, today);
    expect(bars).toHaveLength(4);
    expect(bars[3].minutes).toBe(20);
    expect(total).toBe(50);
  });

  it('has no % change without previous data', () => {
    expect(percentChange(10, 0)).toBeNull();
    expect(percentChange(50, 100)).toBe(-50);
  });
});
