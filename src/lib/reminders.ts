import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL = 'xoog-reminders';
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export function configureNotifications() {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensurePermission(): Promise<boolean> {
  if (!supported) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'XOOG',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#6B4EFF',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Replaces any existing reminder with a daily one at hour:minute. */
export async function scheduleDailyReminder(hour: number, minute: number, title: string, body: string): Promise<boolean> {
  if (!supported) return false;
  const ok = await ensurePermission();
  if (!ok) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL },
  });
  return true;
}

export async function cancelReminders() {
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
