import { randomUUID } from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronRight, Pause, Play, SkipBack, X } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Alert, I18nManager, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrPulse } from '@/components/live/PrPulse';
import { Button, EmptyState, IconButton, RingTimer } from '@/components/ui';
import { useI18n } from '@/i18n';
import { formatClock } from '@/lib/date';
import { exerciseName } from '@/lib/format';
import { impact, success } from '@/lib/haptics';
import { initLive, isTimed, liveReducer } from '@/lib/liveSession';
import { estimateCalories } from '@/lib/plan';
import { formatWeight } from '@/lib/units';
import { useStore } from '@/store';
import { colors, fonts, radius, space, type } from '@/theme';
import type { Workout, WorkoutSession } from '@/types/models';

export default function LiveWorkoutRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useStore();
  const { t } = useI18n();
  const workout = state.plan?.workouts.find((w) => w.id === id);

  if (!workout || workout.exercises.length === 0) {
    return (
      <SafeAreaView style={[styles.root, { padding: space.xl, gap: space.xl }]}>
        <IconButton icon={X} accessibilityLabel={t('common.close')} onPress={() => router.back()} />
        <EmptyState title={t('workout.empty')} />
      </SafeAreaView>
    );
  }
  return <LiveWorkout workout={workout} />;
}

function LiveWorkout({ workout }: { workout: Workout }) {
  const { t, lang } = useI18n();
  const { state: app, dispatch } = useStore();
  const reducer = useMemo(() => liveReducer(workout), [workout]);
  const [s, send] = useReducer(reducer, workout, initLive);
  const startedAt = useRef(new Date().toISOString());
  const saved = useRef(false);

  // 1-second clock.
  useEffect(() => {
    const timer = setInterval(() => send({ type: 'tick' }), 1000);
    return () => clearInterval(timer);
  }, []);

  // Haptic when a rest period ends.
  const prevPhase = useRef(s.phase);
  useEffect(() => {
    if (prevPhase.current === 'rest' && s.phase === 'work') impact();
    prevPhase.current = s.phase;
  }, [s.phase]);

  const save = useCallback(() => {
    if (saved.current || s.logs.length === 0) return;
    saved.current = true;
    const session: WorkoutSession = {
      id: randomUUID(),
      workoutId: workout.id,
      startedAt: startedAt.current,
      endedAt: new Date().toISOString(),
      durationSec: s.elapsedSec,
      calories: estimateCalories(workout.category, app.profile.weightKg, s.elapsedSec),
      sets: s.logs,
      synced: false,
    };
    dispatch({ type: 'logSession', session });
  }, [app.profile.weightKg, dispatch, s.elapsedSec, s.logs, workout]);

  useEffect(() => {
    if (s.phase === 'done') {
      save();
      success();
    }
  }, [s.phase, save]);

  const quit = () => {
    if (s.phase === 'done' || s.logs.length === 0) return router.back();
    Alert.alert(t('live.quitTitle'), t('live.quitBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('live.quit'),
        style: 'destructive',
        onPress: () => {
          save();
          router.back();
        },
      },
    ]);
  };

  if (s.phase === 'done') return <Finished elapsed={s.elapsedSec} sets={s.logs.length} calories={estimateCalories(workout.category, app.profile.weightKg, s.elapsedSec)} />;

  const item = workout.exercises[s.exIndex];
  const timed = isTimed(workout, s.exIndex);
  const resting = s.phase === 'rest';
  const total = workout.exercises.length;

  // During rest the indices already point at the *upcoming* set.
  const setInfo = t('live.setOf', { current: s.setIndex + 1, total: item.sets, reps: timed ? `${item.reps} ${t('common.sec')}` : item.reps });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <IconButton icon={X} accessibilityLabel={t('common.close')} onPress={quit} testID="live-close" />
          <Text style={styles.counter} testID="live-counter">
            {t('live.exerciseOf', { current: s.exIndex + 1, total })}
          </Text>
          <View style={styles.elapsed} accessible accessibilityLabel={`${t('live.elapsed')} ${formatClock(s.elapsedSec)}`}>
            <Text style={styles.elapsedText}>{formatClock(s.elapsedSec)}</Text>
          </View>
        </View>

        <View style={styles.segments} accessibilityElementsHidden>
          {workout.exercises.map((_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                { backgroundColor: i < s.exIndex ? colors.accent : i === s.exIndex ? colors.primary : colors.surface2 },
              ]}
            />
          ))}
        </View>

        <View style={styles.heading}>
          <Text style={styles.name} accessibilityRole="header" testID="live-exercise">
            {exerciseName(item.exerciseId, lang)}
          </Text>
          <Text style={styles.setInfo}>
            {setInfo}
            {item.weightKg ? ` · ${formatWeight(item.weightKg, app.settings.units)}` : ''}
          </Text>
        </View>

        <View style={styles.ringWrap}>
          <RingTimer
            remaining={resting || timed ? s.remaining : 1}
            total={resting || timed ? s.total : 1}
            caption={resting ? t('live.rest') : t('live.work')}
            valueText={!resting && !timed ? `×${item.reps}` : undefined}
            addLabel={t('live.add15')}
            onAdd={resting ? () => send({ type: 'addRest', seconds: 15 }) : undefined}
          />
        </View>

        <View style={styles.chips} accessibilityRole="list">
          {Array.from({ length: item.sets }, (_, i) => {
            const done = i < s.setIndex;
            const current = i === s.setIndex;
            return (
              <View
                key={i}
                accessibilityLabel={`Set ${i + 1}${done ? ` ${t('live.done')}` : ''}`}
                style={[styles.chip, done && styles.chipDone, current && styles.chipCurrent]}
              >
                {done ? <Check size={14} color={colors.primary} strokeWidth={3} /> : null}
                <Text style={[styles.chipText, current && { color: colors.onAccent }]}>{i + 1}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.controls}>
        <IconButton
          icon={SkipBack}
          size={56}
          accessibilityLabel={t('live.previous')}
          onPress={() => send({ type: 'previous' })}
          style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
          testID="live-prev"
        />
        <Button
          variant="secondary"
          label={s.paused ? t('live.resume') : t('live.pause')}
          iconLeft={s.paused ? <Play size={18} color={colors.text} strokeWidth={2} /> : <Pause size={18} color={colors.text} strokeWidth={2} />}
          onPress={() => send({ type: 'togglePause' })}
          style={{ flex: 1 }}
          testID="live-pause"
        />
        <IconButton
          icon={resting ? ChevronRight : Check}
          tone="accent"
          size={64}
          accessibilityLabel={t('live.nextSet')}
          onPress={() => send({ type: 'completeSet' })}
          style={I18nManager.isRTL && resting ? { transform: [{ scaleX: -1 }] } : undefined}
          testID="live-next"
        />
      </View>
    </SafeAreaView>
  );
}

function Finished({ elapsed, sets, calories }: { elapsed: number; sets: number; calories: number }) {
  const { t, lang } = useI18n();
  const { state, dispatch } = useStore();
  const prs = state.lastPRs;

  return (
    <SafeAreaView style={[styles.root, styles.finished]} edges={['top', 'bottom']}>
      <View style={{ alignItems: 'center', gap: space.lg }}>
        <PrPulse size={prs.length ? 72 : 56} />
        <Text style={styles.doneTitle} accessibilityRole="header">
          {t('live.doneTitle')}
        </Text>
        <Text style={styles.doneBody}>{t('live.doneBody')}</Text>
      </View>

      <View style={styles.summary}>
        <Summary value={formatClock(elapsed)} label={t('home.time')} />
        <Summary value={String(calories)} label={t('common.kcal')} />
        <Summary value={String(sets)} label={t('live.sets')} />
      </View>

      {prs.length ? (
        <View style={styles.prBox} testID="live-prs" accessibilityLiveRegion="polite">
          <Text style={styles.prTitle}>{t('live.newPr')}</Text>
          {prs.map((id) => {
            const r = state.records.find((x) => x.exerciseId === id);
            return (
              <Text key={id} style={styles.prRow}>
                {exerciseName(id, lang)} · {r ? formatWeight(r.weightKg, state.settings.units) : ''}
              </Text>
            );
          })}
        </View>
      ) : null}

      <Button
        label={t('live.finish')}
        onPress={() => {
          dispatch({ type: 'clearPRs' });
          router.dismissTo('/(tabs)');
        }}
        testID="live-finish"
      />
    </SafeAreaView>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.xl, paddingBottom: space.xl },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counter: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textLabel },
  elapsed: { minWidth: 72, paddingHorizontal: space.md, minHeight: 36, borderRadius: radius.pill, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  elapsedText: { fontFamily: fonts.heading, fontSize: 15, color: colors.text },
  segments: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 6, borderRadius: 3 },
  heading: { gap: space.xs },
  name: { ...type.h1, color: colors.text },
  setInfo: { ...type.body, color: colors.textMuted },
  ringWrap: { alignItems: 'center', paddingVertical: space.sm },
  chips: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, flexWrap: 'wrap' },
  chip: {
    minWidth: 52,
    height: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDone: { borderColor: colors.primary, backgroundColor: colors.bg },
  chipCurrent: { backgroundColor: colors.accent },
  chipText: { fontFamily: fonts.heading, fontSize: 16, color: colors.text },
  controls: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.xl, paddingBottom: space.md, paddingTop: space.sm },
  finished: { paddingHorizontal: space.xl, justifyContent: 'center', gap: space.xxxl },
  doneTitle: { ...type.display, color: colors.text, textAlign: 'center' },
  doneBody: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  summary: { flexDirection: 'row', gap: space.md },
  summaryTile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.cardSm, padding: space.lg, alignItems: 'center', gap: space.xs },
  summaryValue: { ...type.number, color: colors.text },
  summaryLabel: { ...type.label, color: colors.textMuted },
  prBox: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space.xl, gap: space.sm, borderWidth: 1.5, borderColor: colors.accent },
  prTitle: { ...type.eyebrow, color: colors.accent },
  prRow: { ...type.bodyStrong, color: colors.text },
});
