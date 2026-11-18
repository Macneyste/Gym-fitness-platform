# XOOG

**Xoog · Dadaal · Natiijo**: a dark-mode-first gym and fitness app for Somali speakers. The UI is in Somali, with English as a switchable second language.

Built with Expo SDK 58, Expo Router, TypeScript, Reanimated 4 and Supabase.

## Features

- **Personalized plan** generated from the onboarding answers. Activity level sets the number of training days (3, 4 or 5) and the split. Goals set the rep scheme and add conditioning days. Starting weights scale with bodyweight, level and sex.
- **Live workout logging**: animated rest ring timer, +15 s, timed sets that complete on their own, pause, undo of the previous set, and a lime pulse for new PRs.
- **Streaks, progress charts, body weight and personal records**.
- **Offline-first**: every session is saved on the device first. Pending sessions are pushed to Supabase when the user is signed in, both when they change and whenever the app comes back to the foreground.
- **Daily push reminders** with `expo-notifications`.
- **i18n**: all strings live in [`src/i18n/so.json`](src/i18n/so.json) and [`src/i18n/en.json`](src/i18n/en.json). A test checks that both files have the same keys.
- **Accessibility**: real roles and labels, a label on every icon-only button, adjustable pickers, touch targets of at least 44 px, text that meets WCAG AA contrast, RTL-safe icons, and reduced-motion support.

## Screens

| # | Screen | Route |
|---|--------|-------|
| 1 | Welcome | `src/app/welcome.tsx` |
| 2 | Onboarding: gender, age, body, goal, level | `src/app/onboarding/*` |
| 3 | Login / Sign up | `src/app/auth/*` |
| 4 | Home | `src/app/(tabs)/index.tsx` |
| 5 | Workout detail | `src/app/workout/[id].tsx` |
| 6 | Live workout | `src/app/live/[id].tsx` |
| 7 | Progress | `src/app/(tabs)/progress.tsx` |
| 8 | Exercise library / detail | `src/app/(tabs)/workouts.tsx`, `src/app/exercise/[id].tsx` |
| 8 | Profile & settings | `src/app/(tabs)/account.tsx` |
| 8 | Notifications & reminders | `src/app/notifications.tsx` |

## Project layout

```
src/
  app/            Expo Router routes (screens and layouts only)
  components/
    brand/        Logo, AppMark, Barbell, BackgroundRings
    ui/           Button, Card, Chip, StatTile, WeekStrip, ExerciseRow,
                  RingTimer, BottomNav, TextField, pickers, states…
  data/           Exercise catalogue (seed + Supabase hook)
  i18n/           so.json, en.json, provider
  lib/            plan generator, live-session state machine, dates,
                  units, auth, Supabase client, reminders
  store/          Offline-first app store, PR logic, sync
  theme/          Design tokens
supabase/migrations/   Database schema with row-level security
__tests__/             Unit, component and end-to-end navigation tests
```

## Getting started

```bash
npm install
npx expo start
```

Without Supabase credentials the app runs fully offline: auth is local and all data stays on the device. To connect a backend:

1. Copy `.env.example` to `.env` and fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
2. Apply `supabase/migrations/20261118000000_init.sql`. It creates users, profiles, goals, workouts, exercises, workout_sessions, sets, body_metrics and personal_records, with row-level security on each table.
3. Enable the Email, Google and Apple providers in Supabase Auth and add `xoog://auth/callback` as a redirect URL.

Push notifications and Apple sign-in need a development build: `npx expo run:ios|android` or `npx eas-cli@latest build --profile development`.

## Quality checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest: 55 tests
npx expo-doctor     # 20/20
```
