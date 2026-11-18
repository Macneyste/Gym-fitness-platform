import { router } from 'expo-router';
import { Bell, CalendarCheck, Clock, Flame, Zap } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { TodayCard } from '@/components/home/TodayCard';
import { Card, Chip, EmptyState, IconButton, Screen, StatTile, WeekStrip } from '@/components/ui';
import { useI18n } from '@/i18n';
import { addDays, weekIndex } from '@/lib/date';
import { workoutForDate } from '@/lib/plan';
import { useStats, useStore } from '@/store';
import { colors, fonts, radius, sizes, space, type } from '@/theme';
import type { Category, Plan } from '@/types/models';

const CATEGORIES: Category[] = ['strength', 'cardio', 'hiit', 'mobility', 'yoga'];

/** Today's workout, or on rest days the next scheduled one (offset = days ahead). */
function nextWorkout(plan: Plan | undefined, today: Date) {
  for (let offset = 0; offset <= 7; offset++) {
    const workout = workoutForDate(plan, addDays(today, offset));
    if (workout) return { workout, offset };
  }
  return undefined;
}

function greetingKey(hour: number) {
  if (hour < 12) return 'home.greeting';
  if (hour < 17) return 'home.greetingAfternoon';
  return 'home.greetingEvening';
}

export default function Home() {
  const { t, tl } = useI18n();
  const { state } = useStore();
  const stats = useStats();
  const today = new Date();
  const next = nextWorkout(state.plan, today);

  const name = state.profile.name || state.user?.name || '';
  const initials = name.trim().split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'X';
  const unread = state.inbox.some((i) => !i.read);
  const dayNames = tl('days.short');

  return (
    <Screen scroll bottomInset={sizes.navHeight + 56}>
      <View style={styles.header}>
        <View style={styles.avatar} accessibilityElementsHidden>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greet}>{t(greetingKey(today.getHours()))}</Text>
          <Text style={styles.name} numberOfLines={1} accessibilityRole="header">
            {name || 'XOOG'}
          </Text>
        </View>
        <IconButton icon={Bell} accessibilityLabel={t('home.notifications')} badge={unread} onPress={() => router.push('/notifications')} testID="home-bell" />
      </View>

      <WeekStrip today={today} doneDays={stats.doneDays} />

      {next ? (
        <View style={{ gap: space.md }}>
          {next.offset > 0 ? (
            <Card style={styles.rest}>
              <CalendarCheck size={22} color={colors.accent} strokeWidth={2} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.restTitle}>{t('home.restDay')}</Text>
                <Text style={styles.restBody}>{t('home.restDayBody')}</Text>
              </View>
            </Card>
          ) : null}
          <TodayCard
            workout={next.workout}
            eyebrow={next.offset === 0 ? t('home.today') : dayNames[weekIndex(addDays(today, next.offset))].toUpperCase()}
            onOpen={() => router.push(`/workout/${next.workout.id}`)}
            onStart={() => router.push(`/live/${next.workout.id}`)}
          />
        </View>
      ) : (
        <EmptyState title={t('workout.empty')} />
      )}

      <View style={styles.stats}>
        <StatTile icon={Flame} accent={colors.ember} value={stats.todayCalories} unit={t('common.kcal')} label={t('home.calories')} testID="stat-calories" />
        <StatTile icon={Clock} accent={colors.primary} value={stats.todayMinutes} unit={t('common.min')} label={t('home.time')} testID="stat-time" />
        <StatTile icon={Zap} accent={colors.accent} value={stats.streak} unit={t('common.days')} label={t('home.streak')} testID="stat-streak" />
      </View>

      <View style={{ gap: space.md }}>
        <Text style={styles.section}>{t('home.categories')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipsScroll}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={t(`categories.${c}`)}
              onPress={() => router.push({ pathname: '/workouts', params: { category: c } })}
              testID={`home-cat-${c}`}
            />
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingTop: space.sm },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.selectedFill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.heading, fontSize: 17, color: colors.text },
  greet: { ...type.label, color: colors.textMuted },
  name: { ...type.h2, color: colors.text },
  stats: { flexDirection: 'row', gap: space.md },
  section: { ...type.h3, color: colors.text },
  chipsScroll: { marginHorizontal: -space.xl },
  chips: { gap: space.sm, paddingHorizontal: space.xl },
  rest: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  restTitle: { ...type.bodyStrong, color: colors.text },
  restBody: { ...type.label, color: colors.textMuted },
});
