import { initLive, liveReducer, type LiveAction, type LiveState } from '@/lib/liveSession';
import type { Workout } from '@/types/models';

const workout: Workout = {
  id: 'w1',
  titleKey: 'plan.fullBody',
  category: 'strength',
  level: 'beginner',
  week: 1,
  day: 1,
  weekday: 0,
  durationMin: 20,
  exercises: [
    { exerciseId: 'bench_press', sets: 2, reps: 10, weightKg: 40, restSec: 60 },
    { exerciseId: 'plank', sets: 1, reps: 3, restSec: 20 }, // timed: 3 seconds
  ],
};

const reduce = liveReducer(workout);
const run = (s: LiveState, ...actions: LiveAction[]) => actions.reduce(reduce, s);
const tick = { type: 'tick' } as const;
const complete = { type: 'completeSet' } as const;

describe('live workout state machine', () => {
  it('starts on the first set of the first exercise', () => {
    expect(initLive(workout)).toMatchObject({ exIndex: 0, setIndex: 0, phase: 'work', remaining: 0, logs: [] });
  });

  it('logs a set and starts the rest timer', () => {
    const s = run(initLive(workout), complete);
    expect(s.logs).toHaveLength(1);
    expect(s.logs[0]).toMatchObject({ exerciseId: 'bench_press', setIndex: 0, reps: 10, weightKg: 40 });
    expect(s).toMatchObject({ phase: 'rest', setIndex: 1, remaining: 60, total: 60 });
  });

  it('counts rest down, supports +15s and returns to work at zero', () => {
    let s = run(initLive(workout), complete, tick, tick);
    expect(s.remaining).toBe(58);
    expect(s.elapsedSec).toBe(2);
    s = run(s, { type: 'addRest', seconds: 15 });
    expect(s).toMatchObject({ remaining: 73, total: 75 });
    for (let i = 0; i < 73; i++) s = reduce(s, tick);
    expect(s.phase).toBe('work');
  });

  it('can skip rest with the next button', () => {
    const s = run(initLive(workout), complete, complete);
    expect(s).toMatchObject({ phase: 'work', setIndex: 1, logs: expect.any(Array) });
    expect(s.logs).toHaveLength(1);
  });

  it('moves to the next exercise and auto-completes timed sets', () => {
    let s = run(initLive(workout), complete, { type: 'skipRest' }, complete, { type: 'skipRest' });
    expect(s).toMatchObject({ exIndex: 1, setIndex: 0, phase: 'work', remaining: 3, total: 3 });
    s = run(s, tick, tick, tick);
    expect(s.phase).toBe('done');
    expect(s.logs.map((l) => l.exerciseId)).toEqual(['bench_press', 'bench_press', 'plank']);
  });

  it('freezes while paused', () => {
    const paused = run(initLive(workout), complete, { type: 'togglePause' });
    const after = run(paused, tick, tick);
    expect(after.remaining).toBe(paused.remaining);
    expect(after.elapsedSec).toBe(paused.elapsedSec);
    expect(run(after, { type: 'togglePause' }, tick).remaining).toBe(paused.remaining - 1);
  });

  it('undoes the last set with previous, across exercises', () => {
    let s = run(initLive(workout), complete, complete, complete); // both bench sets done → plank
    expect(s.exIndex).toBe(1);
    s = run(s, { type: 'previous' });
    expect(s).toMatchObject({ exIndex: 0, setIndex: 1, phase: 'work' });
    expect(s.logs).toHaveLength(1);
    // Nothing to undo leaves the state untouched.
    const fresh = initLive(workout);
    expect(reduce(fresh, { type: 'previous' })).toBe(fresh);
  });

  it('ignores ticks once done', () => {
    let s = run(initLive(workout), complete, complete, complete, complete);
    for (let i = 0; i < 3; i++) s = reduce(s, tick);
    expect(s.phase).toBe('done');
    expect(reduce(s, tick)).toBe(s);
  });
});
