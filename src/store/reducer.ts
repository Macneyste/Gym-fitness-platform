import { dayKey } from '@/lib/date';
import { generatePlan } from '@/lib/plan';
import type { AuthUser } from '@/services/auth';
import type { BodyMetric, PersonalRecord, Plan, Profile, Settings, WorkoutSession } from '@/types/models';
import { applyRecords } from './records';

export type InboxItem = { id: string; titleKey: string; bodyKey: string; date: string; read: boolean };

export type AppState = {
  hydrated: boolean;
  user: AuthUser | null;
  onboarded: boolean;
  profile: Profile;
  plan?: Plan;
  sessions: WorkoutSession[];
  bodyMetrics: BodyMetric[];
  records: PersonalRecord[];
  /** Exercise ids that set a PR in the most recent session (drives the lime pulse). */
  lastPRs: string[];
  settings: Settings;
  inbox: InboxItem[];
};

export const defaultProfile: Profile = {
  name: '',
  age: 25,
  weightKg: 70,
  heightCm: 175,
  goals: [],
  level: 'beginner',
};

export const defaultSettings: Settings = {
  units: 'kg',
  remindersEnabled: false,
  reminderHour: 18,
  reminderMinute: 0,
  darkMode: true,
};

export const initialState: AppState = {
  hydrated: false,
  user: null,
  onboarded: false,
  profile: defaultProfile,
  sessions: [],
  bodyMetrics: [],
  records: [],
  lastPRs: [],
  settings: defaultSettings,
  inbox: [],
};

export type Action =
  | { type: 'hydrate'; state: Partial<AppState> }
  | { type: 'setUser'; user: AuthUser | null }
  | { type: 'updateProfile'; patch: Partial<Profile> }
  | { type: 'completeOnboarding'; now?: Date }
  | { type: 'logSession'; session: WorkoutSession }
  | { type: 'markSynced'; ids: string[] }
  | { type: 'addBodyMetric'; metric: BodyMetric }
  | { type: 'updateSettings'; patch: Partial<Settings> }
  | { type: 'pushInbox'; item: InboxItem }
  | { type: 'readInbox' }
  | { type: 'clearPRs' }
  | { type: 'logout' };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        ...action.state,
        profile: { ...defaultProfile, ...action.state.profile },
        settings: { ...defaultSettings, ...action.state.settings },
        hydrated: true,
      };
    case 'setUser':
      return {
        ...state,
        user: action.user,
        profile: action.user?.name && !state.profile.name ? { ...state.profile, name: action.user.name, email: action.user.email } : state.profile,
      };
    case 'updateProfile':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'completeOnboarding': {
      const now = action.now ?? new Date();
      const metric = { date: dayKey(now), weightKg: state.profile.weightKg };
      return {
        ...state,
        onboarded: true,
        plan: generatePlan(state.profile, now),
        bodyMetrics: upsertMetric(state.bodyMetrics, metric),
      };
    }
    case 'logSession': {
      const { records, newPRs } = applyRecords(state.records, action.session.sets);
      return {
        ...state,
        sessions: [...state.sessions.filter((s) => s.id !== action.session.id), action.session],
        records,
        lastPRs: newPRs,
      };
    }
    case 'markSynced': {
      const ids = new Set(action.ids);
      return { ...state, sessions: state.sessions.map((s) => (ids.has(s.id) ? { ...s, synced: true } : s)) };
    }
    case 'addBodyMetric':
      return {
        ...state,
        bodyMetrics: upsertMetric(state.bodyMetrics, action.metric),
        profile: { ...state.profile, weightKg: action.metric.weightKg },
      };
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'pushInbox':
      return { ...state, inbox: [action.item, ...state.inbox].slice(0, 50) };
    case 'readInbox':
      return { ...state, inbox: state.inbox.map((i) => ({ ...i, read: true })) };
    case 'clearPRs':
      return { ...state, lastPRs: [] };
    case 'logout':
      return { ...initialState, hydrated: true, settings: state.settings };
  }
}

function upsertMetric(list: BodyMetric[], metric: BodyMetric) {
  return [...list.filter((m) => m.date !== metric.date), metric].sort((a, b) => a.date.localeCompare(b.date));
}

/** Fields persisted to disk (everything except transient flags). */
export function persistable(state: AppState): Partial<AppState> {
  const { hydrated: _h, lastPRs: _p, ...rest } = state;
  return rest;
}
