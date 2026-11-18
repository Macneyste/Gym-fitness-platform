import { router } from 'expo-router';
import { Bell, Globe, LogOut, Moon, Ruler, Target } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { BackgroundRings } from '@/components/brand';
import { Button, Card, Screen, Segmented, SettingRow } from '@/components/ui';
import { useI18n, type Language } from '@/i18n';
import { signOut } from '@/services/auth';
import { cancelReminders } from '@/services/reminders';
import { displayWeight } from '@/lib/units';
import { useStats, useStore } from '@/store';
import { colors, fonts, radius, sizes, space, type } from '@/theme';
import type { Units } from '@/types/models';

export default function Account() {
  const { t, lang, setLang } = useI18n();
  const { state, dispatch } = useStore();
  const stats = useStats();
  const { profile, settings } = state;
  const name = profile.name || state.user?.name || 'XOOG';
  const initials = name.trim().split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const reminderTime = `${String(settings.reminderHour).padStart(2, '0')}:${String(settings.reminderMinute).padStart(2, '0')}`;

  const logout = async () => {
    await signOut();
    await cancelReminders().catch(() => undefined);
    dispatch({ type: 'logout' });
    router.replace('/welcome');
  };

  return (
    <Screen scroll bottomInset={sizes.navHeight + 56}>
      <Text style={styles.title} accessibilityRole="header">
        {t('profile.title')}
      </Text>

      <Card style={styles.profile}>
        <BackgroundRings size={220} count={3} style={{ right: -80, top: -60 }} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {state.user?.email ? <Text style={styles.muted}>{state.user.email}</Text> : null}
          <Text style={styles.statsLine}>{t('profile.stats', { workouts: stats.totalWorkouts, streak: stats.streak })}</Text>
        </View>
      </Card>

      <View style={styles.planRow}>
        <PlanTile label={t('onboarding.body.weight')} value={`${displayWeight(profile.weightKg, settings.units)} ${settings.units}`} />
        <PlanTile label={t('onboarding.body.height')} value={`${profile.heightCm} cm`} />
        <PlanTile label={t('workout.level')} value={t(`levels.${profile.level}`)} />
      </View>

      <View style={{ gap: space.md }}>
        <Text style={styles.section}>{t('profile.preferences')}</Text>
        <View style={styles.group}>
          <SettingRow
            icon={Ruler}
            label={t('profile.units')}
            right={
              <View style={styles.segment}>
                <Segmented<Units>
                  options={[
                    { value: 'kg', label: 'kg' },
                    { value: 'lb', label: 'lb' },
                  ]}
                  value={settings.units}
                  onChange={(units) => dispatch({ type: 'updateSettings', patch: { units } })}
                  testID="units"
                />
              </View>
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon={Globe}
            label={t('profile.language')}
            right={
              <View style={styles.segment}>
                <Segmented<Language>
                  options={[
                    { value: 'so', label: 'SO' },
                    { value: 'en', label: 'EN' },
                  ]}
                  value={lang}
                  onChange={setLang}
                  testID="language"
                />
              </View>
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon={Bell}
            label={t('profile.reminders')}
            value={settings.remindersEnabled ? reminderTime : undefined}
            onPress={() => router.push('/notifications')}
            testID="row-reminders"
          />
          <View style={styles.divider} />
          {/* XOOG is dark-first; the light theme is not shipped yet, so this stays on. */}
          <SettingRow icon={Moon} label={t('profile.darkMode')} toggle={{ value: true, onChange: () => undefined, disabled: true }} />
          <View style={styles.divider} />
          <SettingRow
            icon={Target}
            label={t('profile.plan')}
            value={`${state.plan?.daysPerWeek ?? 0} × / ${t('progress.week').toLowerCase()}`}
            onPress={() => router.push('/onboarding/goal')}
            testID="row-plan"
          />
        </View>
      </View>

      <Button
        variant="secondary"
        label={t('profile.logout')}
        iconLeft={<LogOut size={18} color={colors.text} strokeWidth={2} />}
        onPress={logout}
        testID="logout"
      />
    </Screen>
  );
}

function PlanTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.planTile}>
      <Text style={styles.planValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...type.h1, color: colors.text, paddingTop: space.sm },
  profile: { flexDirection: 'row', alignItems: 'center', gap: space.lg, overflow: 'hidden' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.heading, fontSize: 22, color: colors.onPrimary },
  name: { ...type.h2, color: colors.text },
  muted: { ...type.label, color: colors.textMuted },
  statsLine: { ...type.label, color: colors.accent },
  planRow: { flexDirection: 'row', gap: space.md },
  planTile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.cardSm, padding: space.md + 2, gap: 2, borderWidth: 1, borderColor: colors.border },
  planValue: { ...type.number, fontSize: 18, color: colors.text },
  section: { ...type.h3, color: colors.text },
  group: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginStart: space.lg + 36 + space.md },
  segment: { width: 128 },
});
