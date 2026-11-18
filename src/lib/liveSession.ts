import { exerciseById } from '@/data/exercises';
import type { SetLog, Workout } from '@/types/models';

export type LivePhase = 'work' | 'rest' | 'done';

export type LiveState = {
  exIndex: number;
  setIndex: number;
  phase: LivePhase;
  /** Countdown for rest, or for the work phase of timed exercises. */
  remaining: number;
  total: number;
  paused: boolean;
  elapsedSec: number;
  logs: SetLog[];
};

export type LiveAction =
  | { type: 'tick'; now?: string }
  | { type: 'completeSet'; now?: string }
  | { type: 'skipRest' }
  | { type: 'addRest'; seconds: number }
  | { type: 'previous' }
  | { type: 'togglePause' };

function workCountdown(workout: Workout, exIndex: number) {
  const item = workout.exercises[exIndex];
  return item && exerciseById[item.exerciseId]?.timed ? item.reps : 0;
}

export function initLive(workout: Workout): LiveState {
  const work = workCountdown(workout, 0);
  return {
    exIndex: 0,
    setIndex: 0,
    phase: workout.exercises.length ? 'work' : 'done',
    remaining: work,
    total: work,
    paused: false,
    elapsedSec: 0,
    logs: [],
  };
}

export function isTimed(workout: Workout, exIndex: number) {
  return workCountdown(workout, exIndex) > 0;
}

function completeSet(workout: Workout, s: LiveState, now: string): LiveState {
  const item = workout.exercises[s.exIndex];
  if (!item || s.phase === 'done') return s;
  const log: SetLog = { exerciseId: item.exerciseId, setIndex: s.setIndex, reps: item.reps, weightKg: item.weightKg, completedAt: now };
  const logs = [...s.logs, log];

  const lastSet = s.setIndex + 1 >= item.sets;
  const lastExercise = s.exIndex + 1 >= workout.exercises.length;
  if (lastSet && lastExercise) return { ...s, logs, phase: 'done', remaining: 0, total: 0 };

  const exIndex = lastSet ? s.exIndex + 1 : s.exIndex;
  const setIndex = lastSet ? 0 : s.setIndex + 1;
  return { ...s, logs, exIndex, setIndex, phase: 'rest', remaining: item.restSec, total: item.restSec };
}

function startWork(workout: Workout, s: LiveState): LiveState {
  const work = workCountdown(workout, s.exIndex);
  return { ...s, phase: 'work', remaining: work, total: work };
}

/** Pure live-workout state machine (rest timer, set progression, undo). */
export function liveReducer(workout: Workout) {
  return (s: LiveState, a: LiveAction): LiveState => {
    const now = ('now' in a && a.now) || new Date().toISOString();
    switch (a.type) {
      case 'tick': {
        if (s.paused || s.phase === 'done') return s;
        const next = { ...s, elapsedSec: s.elapsedSec + 1 };
        if (s.total === 0) return next; // untimed work: nothing counts down
        const remaining = s.remaining - 1;
        if (remaining > 0) return { ...next, remaining };
        return s.phase === 'rest' ? startWork(workout, next) : completeSet(workout, next, now);
      }
      case 'completeSet':
        return s.phase === 'rest' ? startWork(workout, s) : completeSet(workout, s, now);
      case 'skipRest':
        return s.phase === 'rest' ? startWork(workout, s) : s;
      case 'addRest':
        return s.phase === 'rest' ? { ...s, remaining: s.remaining + a.seconds, total: s.total + a.seconds } : s;
      case 'previous': {
        const last = s.logs[s.logs.length - 1];
        if (!last) return s;
        // The undone set belongs to the current exercise or the one before it.
        let exIndex = Math.min(s.exIndex, workout.exercises.length - 1);
        while (exIndex > 0 && workout.exercises[exIndex].exerciseId !== last.exerciseId) exIndex -= 1;
        return startWork(workout, { ...s, logs: s.logs.slice(0, -1), exIndex, setIndex: last.setIndex });
      }
      case 'togglePause':
        return s.phase === 'done' ? s : { ...s, paused: !s.paused };
    }
  };
}
