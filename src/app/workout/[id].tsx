import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Dumbbell, Gauge, Play, type LucideIcon } from 'lucide-react-native';
import { I18nManager, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundRings } from '@/components/brand';
import { Button, EmptyState, ExerciseRow, IconButton } from '@/components/ui';
import { useI18n } from '@/i18n';
import { exerciseDetail, exerciseName } from '@/lib/format';
import { currentWeek } from '@/lib/plan';
import { useStore } from '@/store';
import { colors, radius, space, type } from '@/theme';

function MetaTile({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <View style={styles.meta} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon size={18} color={colors.accent} strokeWidth={2} />
      <Text style={styles.metaValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useI18n();
  const { state } = useStore();
  const insets = useSafeAreaInsets();
  const workout = state.plan?.workouts.find((w) => w.id === id);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  if (!workout || !state.plan) {
    return (
      <SafeAreaView style={[styles.root, { padding: space.xl, gap: space.xl }]}>
        <IconButton icon={ArrowLeft} accessibilityLabel={t('common.back')} onPress={back} />
        <EmptyState title={t('workout.empty')} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
          <BackgroundRings size={300} count={3} style={{ right: -110, top: -40 }} />
          <IconButton
            icon={ArrowLeft}
            tone="dark"
            accessibilityLabel={t('common.back')}
            onPress={back}
            style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
            testID="detail-back"
          />
          <Text style={styles.eyebrow}>{t('workout.eyebrow', { week: currentWeek(state.plan), day: workout.day })}</Text>
          <Text style={styles.title} accessibilityRole="header">
            {t(workout.titleKey)}
          </Text>
          <View style={styles.metaRow}>
            <MetaTile icon={Clock} value={`${workout.durationMin} ${t('common.min')}`} label={t('workout.duration')} />
            <MetaTile icon={Dumbbell} value={String(workout.exercises.length)} label={t('workout.exercises')} />
            <MetaTile icon={Gauge} value={t(`levels.${workout.level}`)} label={t('workout.level')} />
          </View>
        </View>

        <View style={styles.list}>
          <Text style={styles.section}>{t('workout.list')}</Text>
          {workout.exercises.length === 0 ? (
            <EmptyState title={t('workout.empty')} />
          ) : (
            workout.exercises.map((item, i) => (
              <ExerciseRow
                key={`${item.exerciseId}-${i}`}
                index={i + 1}
                name={exerciseName(item.exerciseId, lang)}
                detail={exerciseDetail(item, state.settings.units, t)}
                onPress={() => router.push(`/exercise/${item.exerciseId}`)}
                testID={`detail-row-${i}`}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View style={[styles.sticky, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <Button
          variant="accent"
          label={t('workout.start')}
          iconLeft={<Play size={18} color={colors.onAccent} fill={colors.onAccent} strokeWidth={2} />}
          onPress={() => router.push(`/live/${workout.id}`)}
          disabled={workout.exercises.length === 0}
          testID="detail-start"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.cardLg + 4,
    borderBottomRightRadius: radius.cardLg + 4,
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl,
    gap: space.md,
    overflow: 'hidden',
  },
  eyebrow: { ...type.eyebrow, color: colors.accent, marginTop: space.md },
  title: { ...type.display, fontSize: 38, lineHeight: 42, color: colors.text },
  metaRow: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  meta: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderRadius: radius.cardSm,
    padding: space.md,
    gap: space.xs,
  },
  metaValue: { ...type.number, fontSize: 18, color: colors.text },
  metaLabel: { ...type.label, color: colors.textMuted },
  list: { padding: space.xl, gap: space.md },
  section: { ...type.h3, color: colors.text, marginBottom: space.xs },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    backgroundColor: colors.overlay,
  },
});
