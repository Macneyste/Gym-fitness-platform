import { router } from 'expo-router';
import { ArrowLeft, Bell, BellRing, Clock, Minus, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { I18nManager, StyleSheet, Text, View } from 'react-native';

import { EmptyState, IconButton, Screen } from '@/components/ui';
import { SettingRow } from '@/components/ui/SettingRow';
import { useI18n } from '@/i18n';
import { cancelReminders, scheduleDailyReminder } from '@/lib/reminders';
import { useStore } from '@/store';
import { colors, fonts, radius, space, type } from '@/theme';

const STEP_MIN = 30;

export default function Notifications() {
  const { t, lang } = useI18n();
  const { state, dispatch } = useStore();
  const { settings } = state;
  const [denied, setDenied] = useState(false);

  // Opening the inbox marks everything as read.
  useEffect(() => {
    if (state.inbox.some((i) => !i.read)) dispatch({ type: 'readInbox' });
  }, [dispatch, state.inbox]);

  const apply = async (enabled: boolean, hour = settings.reminderHour, minute = settings.reminderMinute) => {
    dispatch({ type: 'updateSettings', patch: { remindersEnabled: enabled, reminderHour: hour, reminderMinute: minute } });
    if (!enabled) {
      await cancelReminders().catch(() => undefined);
      return;
    }
    const ok = await scheduleDailyReminder(hour, minute, t('notifications.reminderTitle'), t('notifications.reminderBody')).catch(() => false);
    setDenied(!ok);
    if (!ok) {
      dispatch({ type: 'updateSettings', patch: { remindersEnabled: false } });
      return;
    }
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    dispatch({
      type: 'pushInbox',
      item: { id: `rem-${Date.now()}`, titleKey: 'notifications.dailyReminder', bodyKey: time, date: new Date().toISOString(), read: true },
    });
  };

  const shift = (delta: number) => {
    const total = (settings.reminderHour * 60 + settings.reminderMinute + delta + 24 * 60) % (24 * 60);
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    if (settings.remindersEnabled) apply(true, hour, minute);
    else dispatch({ type: 'updateSettings', patch: { reminderHour: hour, reminderMinute: minute } });
  };

  const time = `${String(settings.reminderHour).padStart(2, '0')}:${String(settings.reminderMinute).padStart(2, '0')}`;

  return (
    <Screen scroll>
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel={t('common.back')}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
          style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
          testID="notifications-back"
        />
        <Text style={styles.title} accessibilityRole="header">
          {t('notifications.title')}
        </Text>
      </View>

      <View style={styles.group}>
        <SettingRow
          icon={BellRing}
          label={t('notifications.dailyReminder')}
          toggle={{ value: settings.remindersEnabled, onChange: (v) => apply(v) }}
          testID="reminder"
        />
        <View style={styles.divider} />
        <SettingRow
          icon={Clock}
          label={t('notifications.reminderTime')}
          right={
            <View style={styles.stepper}>
              <IconButton icon={Minus} size={40} accessibilityLabel={`−${STEP_MIN} ${t('common.min')}`} onPress={() => shift(-STEP_MIN)} testID="time-minus" />
              <Text style={styles.time} testID="reminder-time">
                {time}
              </Text>
              <IconButton icon={Plus} size={40} accessibilityLabel={`+${STEP_MIN} ${t('common.min')}`} onPress={() => shift(STEP_MIN)} testID="time-plus" />
            </View>
          }
        />
      </View>
      {denied ? (
        <Text style={styles.warning} accessibilityLiveRegion="polite">
          {t('notifications.permissionDenied')}
        </Text>
      ) : null}

      {state.inbox.length === 0 ? (
        <EmptyState icon={Bell} title={t('notifications.empty')} testID="inbox-empty" />
      ) : (
        <View style={{ gap: space.md }}>
          {state.inbox.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.dot}>
                <Bell size={18} color={colors.onPrimary} strokeWidth={2} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.itemTitle}>{t(item.titleKey)}</Text>
                <Text style={styles.muted}>{item.bodyKey.includes('.') ? t(item.bodyKey) : item.bodyKey}</Text>
              </View>
              <Text style={styles.muted}>{new Date(item.date).toLocaleDateString(lang === 'so' ? 'so-SO' : 'en-GB')}</Text>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingTop: space.sm },
  title: { ...type.h1, color: colors.text },
  group: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.border, marginStart: space.lg + 36 + space.md },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  time: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, minWidth: 54, textAlign: 'center' },
  warning: { ...type.label, color: colors.ember },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.cardSm, backgroundColor: colors.surface },
  dot: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { ...type.bodyStrong, color: colors.text },
  muted: { ...type.label, color: colors.textMuted },
});
