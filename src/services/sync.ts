import { supabase } from '@/services/supabase';
import type { WorkoutSession } from '@/types/models';

/**
 * Offline-first session sync. Sessions are always written locally first
 * (synced: false); this pushes any pending ones once a real Supabase user
 * is signed in. Returns the ids that reached the server.
 */
export async function pushPendingSessions(sessions: WorkoutSession[], userId: string | undefined): Promise<string[]> {
  if (!supabase || !userId || userId.startsWith('local-')) return [];
  const pending = sessions.filter((s) => !s.synced);
  const done: string[] = [];

  for (const s of pending) {
    const { error } = await supabase.from('workout_sessions').upsert({
      id: s.id,
      user_id: userId,
      workout_local_id: s.workoutId,
      started_at: s.startedAt,
      ended_at: s.endedAt ?? null,
      duration_sec: s.durationSec,
      calories: s.calories,
    });
    if (error) break; // still offline or server error — retry on next foreground

    if (s.sets.length) {
      const { error: setsError } = await supabase.from('sets').upsert(
        s.sets.map((set) => ({
          session_id: s.id,
          user_id: userId,
          exercise_id: set.exerciseId,
          set_index: set.setIndex,
          reps: set.reps,
          weight_kg: set.weightKg ?? null,
          completed_at: set.completedAt,
        })),
        { onConflict: 'session_id,exercise_id,set_index' },
      );
      if (setsError) break;
    }
    done.push(s.id);
  }
  return done;
}
