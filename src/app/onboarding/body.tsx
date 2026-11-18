import { router } from 'expo-router';

import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { RulerPicker } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useStore } from '@/store';

export default function BodyStep() {
  const { t } = useI18n();
  const { state, dispatch } = useStore();

  return (
    <OnboardingShell
      step={3}
      title={t('onboarding.body.title')}
      subtitle={t('onboarding.body.subtitle')}
      onContinue={() => router.push('/onboarding/goal')}
    >
      <RulerPicker
        label={t('onboarding.body.weight')}
        min={30}
        max={200}
        unit="kg"
        value={Math.round(state.profile.weightKg)}
        onChange={(weightKg) => dispatch({ type: 'updateProfile', patch: { weightKg } })}
        testID="weight-ruler"
      />
      <RulerPicker
        label={t('onboarding.body.height')}
        min={120}
        max={220}
        unit="cm"
        value={Math.round(state.profile.heightCm)}
        onChange={(heightCm) => dispatch({ type: 'updateProfile', patch: { heightCm } })}
        testID="height-ruler"
      />
    </OnboardingShell>
  );
}
