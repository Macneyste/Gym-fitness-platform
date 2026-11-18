import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type Dispatch, type ReactNode } from 'react';
import { AppState as RNAppState } from 'react-native';

import { computeStreak, dayKey, isSameDay, startOfWeek } from '@/lib/date';
import { initialState, persistable, reducer, type Action, type AppState } from './reducer';
import { pushPendingSessions } from './sync';

export * from './reducer';

const STORAGE_KEY = 'xoog.state.v1';

type StoreValue = { state: AppState; dispatch: Dispatch<Action> };
const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children, initial }: { children: ReactNode; initial?: Partial<AppState> }) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, ...initial });
  const skipLoad = useRef(!!initial);

  // Hydrate once from disk.
  useEffect(() => {
    if (skipLoad.current) {
      dispatch({ type: 'hydrate', state: {} });
      return;
    }
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => dispatch({ type: 'hydrate', state: raw ? (JSON.parse(raw) as Partial<AppState>) : {} }))
      .catch(() => dispatch({ type: 'hydrate', state: {} }));
  }, []);

  // Persist after every change (debounced).
  useEffect(() => {
    if (!state.hydrated) return;
    const id = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistable(state))).catch(() => undefined);
    }, 300);
    return () => clearTimeout(id);
  }, [state]);

  // Push pending sessions when they change and whenever the app returns to the foreground.
  const latest = useRef(state);
  latest.current = state;
  useEffect(() => {
    const sync = () => {
      const s = latest.current;
      if (!s.hydrated) return;
      pushPendingSessions(s.sessions, s.user?.id)
        .then((ids) => ids.length && dispatch({ type: 'markSynced', ids }))
        .catch(() => undefined);
    };
    sync();
    const sub = RNAppState.addEventListener('change', (st) => st === 'active' && sync());
    return () => sub.remove();
  }, [state.sessions.length, state.user?.id, state.hydrated]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/** Derived numbers for Home & Progress. */
export function useStats(today = new Date()) {
  const { state } = useStore();
  return useMemo(() => {
    const doneDays = new Set(state.sessions.map((s) => dayKey(new Date(s.startedAt))));
    const todays = state.sessions.filter((s) => isSameDay(new Date(s.startedAt), today));
    const weekStart = startOfWeek(today).getTime();
    const thisWeek = state.sessions.filter((s) => new Date(s.startedAt).getTime() >= weekStart);
    return {
      doneDays,
      streak: computeStreak(doneDays, today),
      todayCalories: todays.reduce((n, s) => n + s.calories, 0),
      todayMinutes: Math.round(todays.reduce((n, s) => n + s.durationSec, 0) / 60),
      weekWorkouts: thisWeek.length,
      totalWorkouts: state.sessions.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sessions, dayKey(today)]);
}
