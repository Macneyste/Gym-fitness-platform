-- XOOG initial schema
-- Tables: users, profiles, goals, workouts, exercises, workout_sessions, sets,
--         body_metrics, personal_records. Row-level security on every user table.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- users
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  insert into public.profiles (user_id, name) values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));
  return new;
end;
$$;

-- ---------------------------------------------------------------- profiles
create type public.gender as enum ('male', 'female');
create type public.level as enum ('beginner', 'intermediate', 'advanced');
create type public.units as enum ('kg', 'lb');
create type public.category as enum ('strength', 'cardio', 'hiit', 'mobility', 'yoga');

create table public.profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  name text not null default '',
  gender public.gender,
  age smallint check (age between 13 and 100),
  weight_kg numeric(5, 1),
  height_cm numeric(5, 1),
  level public.level not null default 'beginner',
  units public.units not null default 'kg',
  language text not null default 'so' check (language in ('so', 'en')),
  reminders_enabled boolean not null default false,
  reminder_time time not null default '18:00',
  updated_at timestamptz not null default now()
);

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- goals
create table public.goals (
  user_id uuid not null references public.users (id) on delete cascade,
  goal text not null check (goal in ('lose_weight', 'build_muscle', 'gain_strength', 'general_fitness', 'endurance')),
  primary key (user_id, goal)
);

-- ---------------------------------------------------------------- exercises (shared catalogue)
create table public.exercises (
  id text primary key,
  name_so text not null,
  name_en text not null,
  category public.category not null,
  primary_muscles text[] not null default '{}',
  secondary_muscles text[] not null default '{}',
  equipment_so text,
  equipment_en text,
  steps_so text[] not null default '{}',
  steps_en text[] not null default '{}',
  video_url text,
  timed boolean not null default false
);

-- ---------------------------------------------------------------- workouts (generated plan)
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  local_id text not null,
  title_key text not null,
  category public.category not null,
  level public.level not null,
  weekday smallint not null check (weekday between 0 and 6),
  duration_min smallint not null,
  exercises jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique (user_id, local_id)
);

-- ---------------------------------------------------------------- sessions & sets
create table public.workout_sessions (
  id uuid primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  workout_local_id text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_sec integer not null default 0,
  calories integer not null default 0
);
create index workout_sessions_user_started on public.workout_sessions (user_id, started_at desc);

create table public.sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  exercise_id text not null references public.exercises (id),
  set_index smallint not null,
  reps smallint not null,
  weight_kg numeric(6, 2),
  completed_at timestamptz not null,
  unique (session_id, exercise_id, set_index)
);

-- ---------------------------------------------------------------- body metrics & PRs
create table public.body_metrics (
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null,
  weight_kg numeric(5, 1) not null,
  primary key (user_id, date)
);

create table public.personal_records (
  user_id uuid not null references public.users (id) on delete cascade,
  exercise_id text not null references public.exercises (id),
  weight_kg numeric(6, 2) not null,
  reps smallint not null,
  achieved_on date not null,
  primary key (user_id, exercise_id)
);

-- ---------------------------------------------------------------- RLS
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.sets enable row level security;
alter table public.body_metrics enable row level security;
alter table public.personal_records enable row level security;

create policy "own user row" on public.users for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own profile" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own goals" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercises readable" on public.exercises for select to authenticated using (true);
create policy "own workouts" on public.workouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sessions" on public.workout_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own sets" on public.sets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own body metrics" on public.body_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own records" on public.personal_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
