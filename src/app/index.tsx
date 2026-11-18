import { Redirect } from 'expo-router';

import { useStore } from '@/store';

/** Routing gate: signed-in & onboarded → Home, otherwise → Welcome. */
export default function Index() {
  const { state } = useStore();
  if (state.user && state.onboarded) return <Redirect href="/(tabs)" />;
  if (state.user && !state.onboarded) return <Redirect href="/onboarding/gender" />;
  return <Redirect href="/welcome" />;
}
