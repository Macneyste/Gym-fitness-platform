import { router } from 'expo-router';
import { Activity, Rocket, Sprout, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { useI18n } from '@/i18n';
import { useStore } from '@/store';
import { space } from '@/theme';
import type { Level } from '@/types/models';

const LEVELS: { id: Level; icon: LucideIcon }[] = [
  { id: 'beginner', icon: Sprout },
  { id: 'intermediate', icon: Activity },
  { id: 'advanced', icon: Rocket },
];

export default function LevelStep() {
  const { t } = useI18n();
  const { state, dispatch } = useStore();

  const finish = () => {
    dispatch({ type: 'completeOnboarding' });
    if (state.user) router.replace('/(tabs)');
    else router.push('/auth/signup');
  };

  return (
    <OnboardingShell
      step={5}
      title={t('onboarding.level.title')}
      subtitle={t('onboarding.level.subtitle')}
      ctaLabel={t('onboarding.finish')}
      onContinue={finish}
    >
      <View style={{ gap: space.md }} accessibilityRole="radiogroup">
        {LEVELS.map((l) => (
          <OptionCard
            key={l.id}
            icon={l.icon}
            title={t(`onboarding.level.${l.id}`)}
            subtitle={t(`onboarding.level.${l.id}_sub`)}
            selected={state.profile.level === l.id}
            onPress={() => dispatch({ type: 'updateProfile', patch: { level: l.id } })}
            testID={`level-${l.id}`}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}
