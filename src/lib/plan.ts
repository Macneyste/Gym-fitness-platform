import { exerciseById } from '@/data/exercises';
import type { Category, GoalId, Level, Plan, Profile, Workout, WorkoutExercise } from '@/types/models';
import { startOfDay, weekIndex } from './date';

type Scheme = { sets: number; reps: number; restSec: number; load: number; timedSec: number };

/** Goal priority: strength > muscle > fat-loss/endurance > general. */
export function repScheme(goals: GoalId[], level: Level): Scheme {
  const extraSet = level === 'advanced' ? 1 : 0;
  if (goals.includes('gain_strength')) return { sets: 4 + extraSet, reps: 5, restSec: 150, load: 1.1, timedSec: 30 };
  if (goals.includes('build_muscle')) return { sets: 3 + extraSet, reps: 10, restSec: 90, load: 0.9, timedSec: 40 };
  if (goals.includes('lose_weight') || goals.includes('endurance'))
    return { sets: 3 + extraSet, reps: 15, restSec: 45, load: 0.7, timedSec: 45 };
  return { sets: 3, reps: 12, restSec: 60, load: 0.8, timedSec: 40 };
}

const DAYS_PER_WEEK: Record<Level, number> = { beginner: 3, intermediate: 4, advanced: 5 };

/** Training weekdays (0 = Saturday). */
const WEEKDAYS: Record<number, number[]> = {
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
};

/** Working-weight ratios relative to bodyweight for an intermediate male lifter. */
const LOAD_RATIO: Record<string, number> = {
  bench_press: 0.6,
  back_squat: 0.8,
  deadlift: 1.0,
  overhead_press: 0.35,
  barbell_row: 0.5,
  lunge: 0.15,
  db_curl: 0.1,
  tricep_pushdown: 0.2,
};

const LEVEL_LOAD: Record<Level, number> = { beginner: 0.6, intermediate: 0.85, advanced: 1.1 };

type Template = { titleKey: string; category: Category; ids: string[] };

const T = {
  fullBodyA: { titleKey: 'plan.fullBody', category: 'strength', ids: ['back_squat', 'bench_press', 'barbell_row', 'plank'] },
  fullBodyB: { titleKey: 'plan.fullBody', category: 'strength', ids: ['deadlift', 'overhead_press', 'pull_up', 'lunge', 'plank'] },
  upper: { titleKey: 'plan.upper', category: 'strength', ids: ['bench_press', 'barbell_row', 'overhead_press', 'pull_up', 'db_curl', 'tricep_pushdown'] },
  lower: { titleKey: 'plan.lower', category: 'strength', ids: ['back_squat', 'deadlift', 'lunge', 'plank'] },
  push: { titleKey: 'plan.push', category: 'strength', ids: ['bench_press', 'overhead_press', 'push_up', 'tricep_pushdown'] },
  pull: { titleKey: 'plan.pull', category: 'strength', ids: ['deadlift', 'barbell_row', 'pull_up', 'db_curl'] },
  legs: { titleKey: 'plan.legs', category: 'strength', ids: ['back_squat', 'lunge', 'plank'] },
  conditioning: { titleKey: 'plan.conditioning', category: 'hiit', ids: ['jump_rope', 'burpee', 'mountain_climber', 'rowing', 'plank'] },
  mobility: { titleKey: 'plan.mobility', category: 'yoga', ids: ['hip_stretch', 'downward_dog', 'child_pose', 'plank'] },
} satisfies Record<string, Template>;

export function templatesFor(level: Level, goals: GoalId[]): Template[] {
  const cardioFocus = goals.includes('lose_weight') || goals.includes('endurance');
  switch (level) {
    case 'beginner':
      return cardioFocus ? [T.fullBodyA, T.conditioning, T.fullBodyB] : [T.fullBodyA, T.fullBodyB, T.fullBodyA];
    case 'intermediate':
      return cardioFocus ? [T.upper, T.lower, T.conditioning, T.fullBodyB] : [T.upper, T.lower, T.upper, T.lower];
    case 'advanced':
      return [T.push, T.pull, T.legs, cardioFocus ? T.conditioning : T.upper, T.mobility];
  }
}

export function roundTo(value: number, step: number) {
  return Math.max(step, Math.round(value / step) * step);
}

export function estimateWeight(exerciseId: string, profile: Pick<Profile, 'weightKg' | 'level' | 'gender'>, schemeLoad: number) {
  const ratio = LOAD_RATIO[exerciseId];
  if (!ratio) return undefined;
  const sex = profile.gender === 'female' ? 0.7 : 1;
  return roundTo(profile.weightKg * ratio * LEVEL_LOAD[profile.level] * sex * schemeLoad, 2.5);
}

export function estimateDuration(items: WorkoutExercise[]): number {
  const seconds = items.reduce((sum, it) => {
    const ex = exerciseById[it.exerciseId];
    const work = ex?.timed ? it.reps : it.reps * 3 + 10;
    return sum + it.sets * (work + it.restSec);
  }, 0);
  return Math.max(10, Math.round(seconds / 60 / 5) * 5);
}

const MET: Record<Category, number> = { strength: 5, hiit: 8, cardio: 7, mobility: 3, yoga: 2.5 };

export function estimateCalories(category: Category, weightKg: number, durationSec: number) {
  return Math.round(MET[category] * weightKg * (durationSec / 3600));
}

/** Build a weekly plan from onboarding answers. Pure & deterministic for a given profile. */
export function generatePlan(profile: Profile, now = new Date()): Plan {
  const level = profile.level;
  const goals = profile.goals.length ? profile.goals : (['general_fitness'] as GoalId[]);
  const scheme = repScheme(goals, level);
  const days = DAYS_PER_WEEK[level];
  const templates = templatesFor(level, goals);

  const workouts: Workout[] = templates.map((tpl, i) => {
    const mobilityDay = tpl.category === 'yoga' || tpl.category === 'mobility';
    const items: WorkoutExercise[] = tpl.ids.map((id) => {
      const ex = exerciseById[id];
      const timed = !!ex?.timed;
      return {
        exerciseId: id,
        sets: timed ? Math.max(2, scheme.sets - 1) : scheme.sets,
        reps: timed ? scheme.timedSec : scheme.reps,
        weightKg: timed ? undefined : estimateWeight(id, profile, scheme.load),
        restSec: mobilityDay || tpl.category === 'hiit' ? 20 : scheme.restSec,
      };
    });
    return {
      id: `w${i + 1}`,
      titleKey: tpl.titleKey,
      category: tpl.category,
      level,
      week: 1,
      day: i + 1,
      weekday: WEEKDAYS[days][i],
      durationMin: estimateDuration(items),
      exercises: items,
    };
  });

  return { generatedAt: startOfDay(now).toISOString(), daysPerWeek: days, workouts };
}

/** 1-based training week since the plan was generated. */
export function currentWeek(plan: Plan, today = new Date()): number {
  const start = startOfDay(new Date(plan.generatedAt)).getTime();
  const diff = startOfDay(today).getTime() - start;
  return Math.max(1, Math.floor(diff / (7 * 24 * 3600 * 1000)) + 1);
}

export function workoutForDate(plan: Plan | undefined, date: Date): Workout | undefined {
  return plan?.workouts.find((w) => w.weekday === weekIndex(date));
}
