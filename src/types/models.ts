/** Domain models — mirror the Supabase tables in supabase/migrations. */

export type Gender = 'male' | 'female';
export type GoalId = 'lose_weight' | 'build_muscle' | 'gain_strength' | 'general_fitness' | 'endurance';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Category = 'strength' | 'cardio' | 'hiit' | 'mobility' | 'yoga';
export type Units = 'kg' | 'lb';
export type Localized = { so: string; en: string };

export type Muscle =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'full_body';

export type Exercise = {
  id: string;
  name: Localized;
  category: Category;
  primary: Muscle[];
  secondary: Muscle[];
  equipment: Localized;
  steps: Localized[];
  /** Typical demo duration in seconds (shown on thumbnails). */
  videoSeconds: number;
  videoUrl?: string;
  /** True when sets are timed (plank, intervals) rather than counted. */
  timed?: boolean;
};

export type WorkoutExercise = {
  exerciseId: string;
  sets: number;
  /** Reps per set, or seconds when the exercise is timed. */
  reps: number;
  weightKg?: number;
  restSec: number;
};

export type Workout = {
  id: string;
  /** i18n key under `plan.*` */
  titleKey: string;
  category: Category;
  level: Level;
  week: number;
  day: number;
  /** 0 = Saturday … 6 = Friday */
  weekday: number;
  durationMin: number;
  exercises: WorkoutExercise[];
};

export type Plan = {
  generatedAt: string;
  daysPerWeek: number;
  workouts: Workout[];
};

export type Profile = {
  name: string;
  email?: string;
  gender?: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  goals: GoalId[];
  level: Level;
};

export type SetLog = {
  exerciseId: string;
  setIndex: number;
  reps: number;
  weightKg?: number;
  completedAt: string;
};

export type WorkoutSession = {
  id: string;
  workoutId: string;
  startedAt: string;
  endedAt?: string;
  durationSec: number;
  calories: number;
  sets: SetLog[];
  /** Offline-first: false until pushed to Supabase. */
  synced: boolean;
};

export type BodyMetric = { date: string; weightKg: number };

export type PersonalRecord = {
  exerciseId: string;
  weightKg: number;
  reps: number;
  date: string;
};

export type Settings = {
  units: Units;
  remindersEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  darkMode: boolean;
};
