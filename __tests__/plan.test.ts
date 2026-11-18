import { exerciseById } from '@/data/exercises';
import { addDays } from '@/lib/date';
import { currentWeek, estimateCalories, estimateWeight, generatePlan, repScheme, roundTo, workoutForDate } from '@/lib/plan';
import type { Profile } from '@/types/models';

const base: Profile = {
  name: 'Test',
  gender: 'male',
  age: 28,
  weightKg: 80,
  heightCm: 180,
  goals: ['build_muscle'],
  level: 'intermediate',
};

describe('generatePlan', () => {
  it.each([
    ['beginner', 3, [0, 2, 4]],
    ['intermediate', 4, [0, 1, 3, 4]],
    ['advanced', 5, [0, 1, 2, 4, 5]],
  ] as const)('%s trains %i days a week', (level, days, weekdays) => {
    const plan = generatePlan({ ...base, level });
    expect(plan.daysPerWeek).toBe(days);
    expect(plan.workouts).toHaveLength(days);
    expect(plan.workouts.map((w) => w.weekday)).toEqual(weekdays);
    plan.workouts.forEach((w, i) => {
      expect(w.day).toBe(i + 1);
      expect(w.level).toBe(level);
      expect(w.durationMin).toBeGreaterThanOrEqual(10);
      w.exercises.forEach((e) => expect(exerciseById[e.exerciseId]).toBeDefined());
    });
  });

  it('adds a conditioning day for fat-loss goals', () => {
    const plan = generatePlan({ ...base, level: 'beginner', goals: ['lose_weight'] });
    expect(plan.workouts.some((w) => w.category === 'hiit')).toBe(true);
  });

  it('uses low reps / long rest for strength and high reps for endurance', () => {
    expect(repScheme(['gain_strength'], 'beginner')).toMatchObject({ reps: 5, restSec: 150 });
    expect(repScheme(['build_muscle'], 'beginner')).toMatchObject({ reps: 10 });
    expect(repScheme(['endurance'], 'beginner')).toMatchObject({ reps: 15, restSec: 45 });
    expect(repScheme(['general_fitness'], 'advanced').reps).toBe(12);
    // Strength wins when combined with other goals.
    expect(repScheme(['lose_weight', 'gain_strength'], 'beginner').reps).toBe(5);
  });

  it('falls back to general fitness when no goal is chosen', () => {
    const plan = generatePlan({ ...base, goals: [] });
    const squat = plan.workouts.flatMap((w) => w.exercises).find((e) => e.exerciseId === 'back_squat');
    expect(squat?.reps).toBe(12);
  });

  it('leaves timed and bodyweight moves without a load', () => {
    const plan = generatePlan(base);
    const items = plan.workouts.flatMap((w) => w.exercises);
    expect(items.find((e) => e.exerciseId === 'plank')?.weightKg).toBeUndefined();
    expect(items.find((e) => e.exerciseId === 'pull_up')?.weightKg).toBeUndefined();
    expect(items.find((e) => e.exerciseId === 'bench_press')?.weightKg).toBeGreaterThan(0);
  });
});

describe('load estimates', () => {
  it('rounds to 2.5 kg plates and never below one step', () => {
    expect(roundTo(41.2, 2.5)).toBe(40);
    expect(roundTo(41.3, 2.5)).toBe(42.5);
    expect(roundTo(0.4, 2.5)).toBe(2.5);
  });

  it('scales with level and sex', () => {
    const male = estimateWeight('back_squat', { weightKg: 80, level: 'intermediate', gender: 'male' }, 1)!;
    const female = estimateWeight('back_squat', { weightKg: 80, level: 'intermediate', gender: 'female' }, 1)!;
    const beginner = estimateWeight('back_squat', { weightKg: 80, level: 'beginner', gender: 'male' }, 1)!;
    expect(male).toBe(55); // 80 × 0.8 × 0.85 = 54.4 → 55
    expect(female).toBeLessThan(male);
    expect(beginner).toBeLessThan(male);
    expect(estimateWeight('plank', { weightKg: 80, level: 'advanced' }, 1)).toBeUndefined();
  });

  it('estimates calories from MET × kg × hours', () => {
    expect(estimateCalories('strength', 80, 3600)).toBe(400);
    expect(estimateCalories('hiit', 70, 1800)).toBe(280);
  });
});

describe('schedule lookup', () => {
  const start = new Date(2026, 10, 21); // Saturday
  const plan = generatePlan({ ...base, level: 'beginner' }, start);

  it('finds the workout for a training day and nothing on rest days', () => {
    expect(workoutForDate(plan, start)?.id).toBe('w1');
    expect(workoutForDate(plan, addDays(start, 1))).toBeUndefined();
    expect(workoutForDate(plan, addDays(start, 2))?.id).toBe('w2');
    expect(workoutForDate(undefined, start)).toBeUndefined();
  });

  it('counts training weeks from generation', () => {
    expect(currentWeek(plan, start)).toBe(1);
    expect(currentWeek(plan, addDays(start, 6))).toBe(1);
    expect(currentWeek(plan, addDays(start, 15))).toBe(3);
  });
});
