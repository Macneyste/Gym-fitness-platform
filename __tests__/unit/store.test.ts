import { applyRecords, beats } from '@/store/records';
import { initialState, persistable, reducer, type AppState } from '@/store/reducer';
import type { WorkoutSession } from '@/types/models';

const session = (id: string, sets: WorkoutSession['sets']): WorkoutSession => ({
  id,
  workoutId: 'w1',
  startedAt: '2026-11-18T08:00:00.000Z',
  durationSec: 1800,
  calories: 200,
  sets,
  synced: false,
});

const set = (exerciseId: string, weightKg: number | undefined, reps = 8) => ({
  exerciseId,
  setIndex: 0,
  reps,
  weightKg,
  completedAt: '2026-11-18T08:10:00.000Z',
});

describe('personal records', () => {
  it('prefers heavier, then more reps', () => {
    expect(beats({ weightKg: 60, reps: 5 }, { weightKg: 55, reps: 10 })).toBe(true);
    expect(beats({ weightKg: 60, reps: 6 }, { weightKg: 60, reps: 5 })).toBe(true);
    expect(beats({ weightKg: 60, reps: 5 }, { weightKg: 60, reps: 5 })).toBe(false);
    expect(beats({ weightKg: 1, reps: 1 })).toBe(true);
  });

  it('reports only exercises that improved and skips bodyweight sets', () => {
    const existing = [{ exerciseId: 'bench_press', weightKg: 60, reps: 5, date: '2026-11-01' }];
    const { records, newPRs } = applyRecords(existing, [set('bench_press', 57.5), set('back_squat', 80), set('plank', undefined)]);
    expect(newPRs).toEqual(['back_squat']);
    expect(records).toHaveLength(2);
    expect(records.find((r) => r.exerciseId === 'bench_press')?.weightKg).toBe(60);
  });
});

describe('app reducer', () => {
  const ready: AppState = { ...initialState, hydrated: true };

  it('hydrates with defaults merged in', () => {
    const s = reducer(initialState, { type: 'hydrate', state: { profile: { name: 'Cali' } as AppState['profile'] } });
    expect(s.hydrated).toBe(true);
    expect(s.profile.name).toBe('Cali');
    expect(s.profile.level).toBe('beginner');
    expect(s.settings.units).toBe('kg');
  });

  it('completing onboarding builds a plan and records starting weight', () => {
    let s = reducer(ready, { type: 'updateProfile', patch: { goals: ['gain_strength'], level: 'advanced', weightKg: 90 } });
    s = reducer(s, { type: 'completeOnboarding', now: new Date(2026, 10, 18) });
    expect(s.onboarded).toBe(true);
    expect(s.plan?.workouts).toHaveLength(5);
    expect(s.bodyMetrics).toEqual([{ date: '2026-11-18', weightKg: 90 }]);
  });

  it('logs sessions idempotently, tracks PRs and marks sync', () => {
    let s = reducer(ready, { type: 'logSession', session: session('a', [set('deadlift', 100)]) });
    expect(s.lastPRs).toEqual(['deadlift']);
    // Re-saving the same session replaces it and is not a new PR.
    s = reducer(s, { type: 'logSession', session: session('a', [set('deadlift', 100)]) });
    expect(s.sessions).toHaveLength(1);
    expect(s.lastPRs).toEqual([]);
    s = reducer(s, { type: 'markSynced', ids: ['a'] });
    expect(s.sessions[0].synced).toBe(true);
    s = reducer(s, { type: 'clearPRs' });
    expect(s.lastPRs).toEqual([]);
  });

  it('upserts body metrics by day and updates profile weight', () => {
    let s = reducer(ready, { type: 'addBodyMetric', metric: { date: '2026-11-18', weightKg: 80 } });
    s = reducer(s, { type: 'addBodyMetric', metric: { date: '2026-11-17', weightKg: 81 } });
    s = reducer(s, { type: 'addBodyMetric', metric: { date: '2026-11-18', weightKg: 79.5 } });
    expect(s.bodyMetrics).toEqual([
      { date: '2026-11-17', weightKg: 81 },
      { date: '2026-11-18', weightKg: 79.5 },
    ]);
    expect(s.profile.weightKg).toBe(79.5);
  });

  it('logout clears user data but keeps device settings', () => {
    let s = reducer(ready, { type: 'setUser', user: { id: 'u1', name: 'Hodan' } });
    s = reducer(s, { type: 'updateSettings', patch: { units: 'lb' } });
    expect(s.profile.name).toBe('Hodan');
    s = reducer(s, { type: 'logout' });
    expect(s.user).toBeNull();
    expect(s.profile.name).toBe('');
    expect(s.settings.units).toBe('lb');
  });

  it('caps the inbox and marks items read', () => {
    let s = ready;
    for (let i = 0; i < 55; i++) {
      s = reducer(s, { type: 'pushInbox', item: { id: String(i), titleKey: 't', bodyKey: 'b', date: '', read: false } });
    }
    expect(s.inbox).toHaveLength(50);
    expect(s.inbox[0].id).toBe('54');
    expect(reducer(s, { type: 'readInbox' }).inbox.every((i) => i.read)).toBe(true);
  });

  it('does not persist transient flags', () => {
    const p = persistable({ ...ready, lastPRs: ['x'] });
    expect(p).not.toHaveProperty('hydrated');
    expect(p).not.toHaveProperty('lastPRs');
  });
});
