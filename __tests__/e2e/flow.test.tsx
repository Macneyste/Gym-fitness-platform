import { Stack } from 'expo-router';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TabsLayout from '@/app/(tabs)/_layout';
import Account from '@/app/(tabs)/account';
import Home from '@/app/(tabs)/index';
import Progress from '@/app/(tabs)/progress';
import Library from '@/app/(tabs)/workouts';
import Login from '@/app/auth/login';
import SignUp from '@/app/auth/signup';
import ExerciseDetail from '@/app/exercise/[id]';
import Index from '@/app/index';
import LiveWorkout from '@/app/live/[id]';
import Notifications from '@/app/notifications';
import OnboardingLayout from '@/app/onboarding/_layout';
import AgeStep from '@/app/onboarding/age';
import BodyStep from '@/app/onboarding/body';
import GenderStep from '@/app/onboarding/gender';
import GoalStep from '@/app/onboarding/goal';
import LevelStep from '@/app/onboarding/level';
import Welcome from '@/app/welcome';
import WorkoutDetail from '@/app/workout/[id]';
import { I18nProvider } from '@/i18n';
import { StoreProvider } from '@/store';

jest.setTimeout(120_000);

/** Same providers as the real root layout, minus font loading / splash. */
function TestRootLayout() {
  return (
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }}>
      <I18nProvider>
        <StoreProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </StoreProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const routes = {
  _layout: TestRootLayout,
  index: Index,
  welcome: Welcome,
  'onboarding/_layout': OnboardingLayout,
  'onboarding/gender': GenderStep,
  'onboarding/age': AgeStep,
  'onboarding/body': BodyStep,
  'onboarding/goal': GoalStep,
  'onboarding/level': LevelStep,
  'auth/login': Login,
  'auth/signup': SignUp,
  '(tabs)/_layout': TabsLayout,
  '(tabs)/index': Home,
  '(tabs)/workouts': Library,
  '(tabs)/progress': Progress,
  '(tabs)/account': Account,
  'workout/[id]': WorkoutDetail,
  'live/[id]': LiveWorkout,
  'exercise/[id]': ExerciseDetail,
  notifications: Notifications,
};

const press = async (testID: string) => {
  await fireEvent.press(await screen.findByTestId(testID));
};

describe('XOOG end-to-end navigation', () => {
  it('welcome → onboarding → sign up → home → workout → live → finish', async () => {
    await renderRouter(routes, { initialUrl: '/' });

    // 1. Welcome (gate redirects signed-out users here).
    await waitFor(() => expect(screen).toHavePathname('/welcome'));
    expect(screen.getByText('Bilow hadda')).toBeTruthy();

    // 2. Onboarding — 5 steps.
    await press('welcome-start');
    await waitFor(() => expect(screen).toHavePathname('/onboarding/gender'));
    expect(screen.getByTestId('onboarding-continue')).toBeDisabled();
    await press('gender-female');
    await press('onboarding-continue');

    await waitFor(() => expect(screen).toHavePathname('/onboarding/age'));
    expect(screen.getByTestId('age-wheel')).toBeTruthy();
    await press('onboarding-continue');

    await waitFor(() => expect(screen).toHavePathname('/onboarding/body'));
    expect(screen.getByTestId('weight-ruler')).toBeTruthy();
    await press('onboarding-continue');

    await waitFor(() => expect(screen).toHavePathname('/onboarding/goal'));
    expect(screen.getByTestId('onboarding-continue')).toBeDisabled();
    await press('goal-build_muscle');
    await press('goal-endurance');
    expect(screen.getByTestId('goal-build_muscle')).toBeChecked();
    await press('onboarding-continue');

    await waitFor(() => expect(screen).toHavePathname('/onboarding/level'));
    await press('level-intermediate');
    expect(screen.getByText('Samee qorshahayga')).toBeTruthy();
    await press('onboarding-continue');

    // 3. Sign up (offline/local auth because Supabase env vars are unset in tests).
    await waitFor(() => expect(screen).toHavePathname('/auth/signup'));
    await press('auth-submit');
    expect(await screen.findByText('Geli magacaaga.')).toBeTruthy();
    expect(screen.getByText('Geli iimayl sax ah.')).toBeTruthy();

    await fireEvent.changeText(screen.getByTestId('auth-name'), 'Hodan Cali');
    await fireEvent.changeText(screen.getByTestId('auth-email'), 'hodan@example.com');
    await fireEvent.changeText(screen.getByTestId('auth-password'), 'xoog12345');
    await press('auth-submit');

    // 4. Home.
    await waitFor(() => expect(screen).toHavePathname('/'));
    expect(await screen.findByText('Hodan Cali')).toBeTruthy();
    expect(screen.getByTestId('today-card')).toBeTruthy();
    expect(screen.getAllByRole('tab', { name: 'Guri' }).length).toBeGreaterThan(0);

    // 5. Workout detail.
    await press('today-card');
    await waitFor(() => expect(screen.getByTestId('detail-start')).toBeTruthy());
    expect(screen.getByText('Liiska jimicsiyada')).toBeTruthy();
    expect(screen.getByTestId('detail-row-0')).toBeTruthy();

    // 6. Live workout: complete every set (next = complete set, then skip rest).
    await press('detail-start');
    await waitFor(() => expect(screen.getByTestId('live-counter')).toBeTruthy());
    expect(screen.getByTestId('live-counter')).toHaveTextContent(/^Jimicsiga 1\/\d+$/);

    for (let i = 0; i < 200 && !screen.queryByTestId('live-finish'); i++) {
      await fireEvent.press(screen.getByTestId('live-next'));
    }
    expect(screen.getByText('Shaqo fiican!')).toBeTruthy();
    expect(screen.getByTestId('live-prs')).toBeTruthy(); // first session → every loaded lift is a PR

    await press('live-finish');
    await waitFor(() => expect(screen).toHavePathname('/'));
    // Streak tile now reflects the logged session.
    await waitFor(() => expect(screen.getByLabelText(/^Streak: 1/)).toBeTruthy());
  });

  it('language switch on Welcome flips copy to English', async () => {
    await renderRouter(routes, { initialUrl: '/welcome' });
    expect(await screen.findByText('Bilow hadda')).toBeTruthy();
    await press('welcome-lang');
    expect(await screen.findByText('Get started')).toBeTruthy();
    await press('welcome-lang');
    expect(await screen.findByText('Bilow hadda')).toBeTruthy();
  });

  it('library filters and searches exercises, with an empty state', async () => {
    await renderRouter(routes, { initialUrl: '/workouts' });
    expect(await screen.findByTestId('library-bench_press')).toBeTruthy();

    await press('filter-yoga');
    await waitFor(() => expect(screen.queryByTestId('library-bench_press')).toBeNull());
    expect(screen.getByTestId('library-downward_dog')).toBeTruthy();

    await press('filter-all');
    await fireEvent.changeText(screen.getByTestId('library-search'), 'squat');
    await waitFor(() => expect(screen.getByTestId('library-back_squat')).toBeTruthy());
    expect(screen.queryByTestId('library-deadlift')).toBeNull();

    await fireEvent.changeText(screen.getByTestId('library-search'), 'zzz');
    expect(await screen.findByText('Jimicsi lama helin.')).toBeTruthy();
  });
});
