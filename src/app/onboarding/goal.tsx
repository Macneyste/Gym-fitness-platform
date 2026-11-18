import { router } from 'expo-router';
import { Dumbbell, Flame, HeartPulse, Timer, Weight, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding/OnboardingShell';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { useI18n } from '@/i18n';
import { useStore } from '@/store';
import { space } from '@/theme';
import type { GoalId } from '@/types/models';

const GOALS: { id: GoalId; icon: LucideIcon }[] = [
  { id: 'lose_weight', icon: Flame },
  { id: 'build_muscle', icon: Dumbbell },
  { id: 'gain_strength', icon: Weight },
  { id: 'general_fitness', icon: HeartPulse },
  { id: 'endurance', icon: Timer },
];

export default function GoalStep() {
  const { t } = useI18n();
  const { state, dispatch } = useStore();
  const goals = state.profile.goals;

  const toggle = (id: GoalId) =>
    dispatch({
      type: 'updateProfile',
      patch: { goals: goals.includes(id) ? goals.filter((g) => g !== id) : [...goals, id] },
    });

  return (
    <OnboardingShell
      step={4}
      title={t('onboarding.goal.title')}
      subtitle={t('onboarding.goal.subtitle')}
      canContinue={goals.length > 0}
      onContinue={() => router.push('/onboarding/level')}
    >
      <View style={{ gap: space.md }}>
        {GOALS.map((g) => (
          <OptionCard
            key={g.id}
            multi
            icon={g.icon}
            title={t(`onboarding.goal.${g.id}`)}
            subtitle={t(`onboarding.goal.${g.id}_sub`)}
            selected={goals.includes(g.id)}
            onPress={() => toggle(g.id)}
            testID={`goal-${g.id}`}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}
