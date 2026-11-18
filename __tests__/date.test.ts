import { addDays, computeStreak, dayKey, formatClock, startOfWeek, weekDates, weekIndex } from '@/lib/date';

describe('date helpers', () => {
  // 2026-11-21 is a Saturday.
  const saturday = new Date(2026, 10, 21, 9, 30);

  it('treats Saturday as the first day of the week', () => {
    expect(weekIndex(saturday)).toBe(0);
    expect(weekIndex(addDays(saturday, 6))).toBe(6); // Friday
    expect(dayKey(startOfWeek(addDays(saturday, 3)))).toBe('2026-11-21');
  });

  it('returns 7 consecutive days starting Saturday', () => {
    const days = weekDates(addDays(saturday, 4)).map(dayKey);
    expect(days).toEqual(['2026-11-21', '2026-11-22', '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27']);
  });

  it('formats clocks', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(75)).toBe('01:15');
    expect(formatClock(3725)).toBe('1:02:05');
    expect(formatClock(-4)).toBe('00:00');
  });

  describe('computeStreak', () => {
    const today = new Date(2026, 10, 18);
    const k = (n: number) => dayKey(addDays(today, -n));

    it('counts consecutive days ending today', () => {
      expect(computeStreak([k(0), k(1), k(2), k(4)], today)).toBe(3);
    });

    it('keeps the streak alive if today is not trained yet', () => {
      expect(computeStreak([k(1), k(2)], today)).toBe(2);
    });

    it('is zero after a missed day', () => {
      expect(computeStreak([k(2), k(3)], today)).toBe(0);
      expect(computeStreak([], today)).toBe(0);
    });
  });
});
