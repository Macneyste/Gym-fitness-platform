import { exerciseById } from '@/data/exercises';
import type { Language } from '@/i18n';
import type { Units, WorkoutExercise } from '@/types/models';
import { formatWeight } from './units';

type T = (key: string, params?: Record<string, string | number>) => string;

/** "4 × 10 · 60 kg" or "3 × 40 il." for timed moves. */
export function exerciseDetail(item: WorkoutExercise, units: Units, t: T): string {
  const ex = exerciseById[item.exerciseId];
  if (ex?.timed) return `${item.sets} × ${item.reps} ${t('common.sec')}`;
  const base = t('workout.setsReps', { sets: item.sets, reps: item.reps });
  return `${base} · ${formatWeight(item.weightKg, units, t('workout.bodyweight'))}`;
}

export function exerciseName(id: string, lang: Language): string {
  return exerciseById[id]?.name[lang] ?? id;
}
