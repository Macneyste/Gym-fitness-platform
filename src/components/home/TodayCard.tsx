import { Play } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { BackgroundRings } from '@/components/brand';
import { PressableScale } from '@/components/ui';
import { useI18n } from '@/i18n';
import { impact } from '@/lib/haptics';
import { colors, fonts, radius, space, type } from '@/theme';
import type { Workout } from '@/types/models';

type Props = {
  workout: Workout;
  eyebrow: string;
  onOpen: () => void;
  onStart: () => void;
};

/** Violet hero card for today's workout with a dark "start" pill and lime play circle. */
export function TodayCard({ workout, eyebrow, onOpen, onStart }: Props) {
  const { t } = useI18n();
  const title = t(workout.titleKey);
  const meta = `${workout.durationMin} ${t('common.min')} · ${workout.exercises.length} ${t('common.exercises')} · ${t(`levels.${workout.level}`)}`;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${eyebrow}. ${title}. ${meta}`}
      onPress={onOpen}
      style={styles.card}
      testID="today-card"
    >
      <BackgroundRings size={260} count={3} color="rgba(255,255,255,0.08)" style={{ right: -90, top: -70 }} />
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>{meta}</Text>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={t('home.startWorkout')}
        onPress={() => {
          impact();
          onStart();
        }}
        style={styles.pill}
        testID="today-start"
      >
        <Text style={styles.pillText}>{t('home.startWorkout')}</Text>
        <View style={styles.play}>
          <Play size={16} color={colors.onAccent} fill={colors.onAccent} strokeWidth={2} />
        </View>
      </PressableScale>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.cardLg,
    padding: space.xxl,
    gap: space.sm,
    overflow: 'hidden',
  },
  eyebrow: { ...type.eyebrow, color: colors.onPrimary },
  title: { ...type.h1, color: colors.onPrimary },
  meta: { ...type.small, color: colors.onPrimary },
  pill: {
    marginTop: space.lg,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingStart: space.xl,
    paddingEnd: 6,
    minHeight: 52,
  },
  pillText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  play: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
