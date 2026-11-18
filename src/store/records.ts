import type { PersonalRecord, SetLog } from '@/types/models';

/** Is `a` a better lift than `b`? Heavier wins; same weight → more reps wins. */
export function beats(a: { weightKg: number; reps: number }, b?: { weightKg: number; reps: number }) {
  if (!b) return true;
  return a.weightKg > b.weightKg || (a.weightKg === b.weightKg && a.reps > b.reps);
}

/**
 * Merges a session's sets into the record book.
 * Returns the updated list plus the exercise ids that set a new PR.
 */
export function applyRecords(existing: PersonalRecord[], sets: SetLog[]) {
  const book = new Map(existing.map((r) => [r.exerciseId, r]));
  const improved = new Set<string>();
  for (const s of sets) {
    if (s.weightKg === undefined || s.weightKg <= 0) continue;
    const candidate: PersonalRecord = { exerciseId: s.exerciseId, weightKg: s.weightKg, reps: s.reps, date: s.completedAt };
    if (beats(candidate, book.get(s.exerciseId))) {
      book.set(s.exerciseId, candidate);
      improved.add(s.exerciseId);
    }
  }
  return { records: [...book.values()], newPRs: [...improved] };
}
