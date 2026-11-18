import { router } from 'expo-router';

import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { WheelPicker } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useStore } from '@/store';

export default function AgeStep() {
  const { t } = useI18n();
  const { state, dispatch } = useStore();

  return (
    <OnboardingShell
      step={2}
      title={t('onboarding.age.title')}
      subtitle={t('onboarding.age.subtitle')}
      onContinue={() => router.push('/onboarding/body')}
      scroll={false}
    >
      <WheelPicker
        min={13}
        max={90}
        value={state.profile.age}
        unit={t('onboarding.age.unit')}
        accessibilityLabel={t('onboarding.age.title')}
        onChange={(age) => dispatch({ type: 'updateProfile', patch: { age } })}
        testID="age-wheel"
      />
    </OnboardingShell>
  );
}
