import { router } from 'expo-router';
import { Mars, Venus } from 'lucide-react-native';
import { View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { useI18n } from '@/i18n';
import { useStore } from '@/store';
import { space } from '@/theme';
import type { Gender } from '@/types/models';

const OPTIONS: { value: Gender; icon: typeof Mars }[] = [
  { value: 'male', icon: Mars },
  { value: 'female', icon: Venus },
];

export default function GenderStep() {
  const { t } = useI18n();
  const { state, dispatch } = useStore();
  const gender = state.profile.gender;

  return (
    <OnboardingShell
      step={1}
      title={t('onboarding.gender.title')}
      subtitle={t('onboarding.gender.subtitle')}
      canContinue={!!gender}
      onContinue={() => router.push('/onboarding/age')}
    >
      <View style={{ gap: space.md }} accessibilityRole="radiogroup">
        {OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            icon={o.icon}
            title={t(`onboarding.gender.${o.value}`)}
            selected={gender === o.value}
            onPress={() => dispatch({ type: 'updateProfile', patch: { gender: o.value } })}
            testID={`gender-${o.value}`}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}
