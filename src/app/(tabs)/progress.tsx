import { Minus, Plus, TrendingDown, TrendingUp, Trophy } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BarChart } from '@/components/progress/BarChart';
import { Sparkline } from '@/components/progress/Sparkline';
import { Card, EmptyState, IconButton, ProgressBar, Screen, Segmented } from '@/components/ui';
import { useI18n } from '@/i18n';
import { dayKey } from '@/lib/date';
import { exerciseName } from '@/lib/format';
import { buildBars, percentChange, type Range } from '@/lib/progress';
import { displayWeight, formatWeight } from '@/lib/units';
import { useStats, useStore } from '@/store';
import { colors, fonts, radius, sizes, space, type } from '@/theme';

export default function Progress() {
  const { t, tl, lang } = useI18n();
  const { state, dispatch } = useStore();
  const stats = useStats();
  const [range, setRange] = useState<Range>('week');
  const [chartWidth, setChartWidth] = useState(0);
  const units = state.settings.units;

  const { bars, total, previous } = useMemo(() => buildBars(state.sessions, range, tl('days.short')), [state.sessions, range, tl]);
  const change = percentChange(total, previous);
  const hasData = bars.some((b) => b.minutes > 0);

  const weights = state.bodyMetrics.map((m) => m.weightKg);
  const currentWeight = weights[weights.length - 1] ?? state.profile.weightKg;
  const weightDelta = weights.length > 1 ? currentWeight - weights[0] : 0;
  const logWeight = (delta: number) =>
    dispatch({ type: 'addBodyMetric', metric: { date: dayKey(new Date()), weightKg: Math.round((currentWeight + delta) * 10) / 10 } });

  const goal = state.plan?.daysPerWeek ?? 3;
  const records = [...state.records].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Screen scroll bottomInset={sizes.navHeight + 56}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {t('progress.title')}
        </Text>
        <View style={{ width: 190 }}>
          <Segmented
            options={[
              { value: 'week', label: t('progress.week') },
              { value: 'month', label: t('progress.month') },
            ]}
            value={range}
            onChange={setRange}
            testID="progress-range"
          />
        </View>
      </View>

      <Card style={{ gap: space.lg }}>
        <View style={styles.rowBetween}>
          <View style={{ gap: 2 }}>
            <Text style={styles.cardLabel}>{t('progress.minutes')}</Text>
            <Text style={styles.big}>
              {Math.round(total)} <Text style={styles.unit}>{t('common.min')}</Text>
            </Text>
          </View>
          {change !== null ? (
            <View style={[styles.badge, change >= 0 ? styles.badgeUp : styles.badgeDown]} accessible accessibilityLabel={`${change}% ${t('progress.vsLast')}`}>
              {change >= 0 ? <TrendingUp size={14} color={colors.onAccent} strokeWidth={2.5} /> : <TrendingDown size={14} color={colors.textLabel} strokeWidth={2.5} />}
              <Text style={[styles.badgeText, { color: change >= 0 ? colors.onAccent : colors.textLabel }]}>
                {change > 0 ? '+' : ''}
                {change}%
              </Text>
            </View>
          ) : null}
        </View>
        {hasData ? (
          <BarChart bars={bars} unit={t('common.min')} highlightKey={range === 'week' ? dayKey(new Date()) : undefined} />
        ) : (
          <Text style={styles.muted} testID="progress-nodata">
            {t('progress.noData')}
          </Text>
        )}
      </Card>

      <Card tone="primary" style={{ gap: space.md }}>
        <View style={styles.rowBetween}>
          <View style={{ gap: 2 }}>
            <Text style={styles.onPrimaryLabel}>{t('progress.weight')}</Text>
            <Text style={[styles.big, { color: colors.onPrimary }]} testID="progress-weight">
              {displayWeight(currentWeight, units)} <Text style={[styles.unit, { color: colors.onPrimary }]}>{units}</Text>
            </Text>
            {weightDelta !== 0 ? (
              <Text style={styles.onPrimaryLabel}>
                {weightDelta > 0 ? '+' : '−'}
                {formatWeight(Math.abs(weightDelta), units)}
              </Text>
            ) : null}
          </View>
          <View style={styles.weightBtns}>
            <IconButton icon={Minus} tone="dark" size={44} accessibilityLabel={`−0.5 kg`} onPress={() => logWeight(-0.5)} testID="weight-minus" />
            <IconButton icon={Plus} tone="dark" size={44} accessibilityLabel={`+0.5 kg`} onPress={() => logWeight(0.5)} testID="weight-plus" />
          </View>
        </View>
        <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
          {chartWidth > 0 ? <Sparkline values={weights.length ? weights.slice(-12) : [currentWeight]} width={chartWidth} height={64} /> : null}
        </View>
      </Card>

      <Card style={{ gap: space.md }}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{t('progress.weeklyGoal')}</Text>
          <Text style={styles.muted}>{t('progress.workoutsDone', { done: Math.min(stats.weekWorkouts, goal), goal })}</Text>
        </View>
        <ProgressBar value={stats.weekWorkouts / goal} height={12} accessibilityLabel={t('progress.weeklyGoal')} />
      </Card>

      <View style={{ gap: space.md }}>
        <Text style={styles.cardTitle}>{t('progress.records')}</Text>
        {records.length === 0 ? (
          <EmptyState icon={Trophy} title={t('progress.noRecords')} testID="records-empty" />
        ) : (
          records.map((r) => {
            const fresh = state.lastPRs.includes(r.exerciseId);
            return (
              <View key={r.exerciseId} style={[styles.record, fresh && { borderColor: colors.accent }]} accessible accessibilityLabel={`${exerciseName(r.exerciseId, lang)} ${formatWeight(r.weightKg, units)} × ${r.reps}`}>
                <View style={styles.trophy}>
                  <Trophy size={20} color={colors.onAccent} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recordName}>{exerciseName(r.exerciseId, lang)}</Text>
                  <Text style={styles.muted}>{new Date(r.date).toLocaleDateString(lang === 'so' ? 'so-SO' : 'en-GB')}</Text>
                </View>
                <Text style={styles.recordValue}>
                  {formatWeight(r.weightKg, units)} × {r.reps}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: space.sm, gap: space.md },
  title: { ...type.h1, color: colors.text },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  cardLabel: { ...type.label, color: colors.textMuted },
  cardTitle: { ...type.h3, color: colors.text },
  big: { fontFamily: fonts.heading, fontSize: 32, letterSpacing: -1, color: colors.text },
  unit: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textMuted },
  muted: { ...type.label, color: colors.textMuted },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  badgeUp: { backgroundColor: colors.accent },
  badgeDown: { backgroundColor: colors.surface2 },
  badgeText: { fontFamily: fonts.bodySemibold, fontSize: 13 },
  onPrimaryLabel: { ...type.label, color: colors.onPrimary },
  weightBtns: { flexDirection: 'row', gap: space.sm },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md + 2,
    borderRadius: radius.cardSm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  trophy: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  recordName: { ...type.bodyStrong, color: colors.text },
  recordValue: { fontFamily: fonts.heading, fontSize: 16, color: colors.text },
});
