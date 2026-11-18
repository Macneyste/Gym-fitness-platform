import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

const CHANNEL = 'xoog-reminders';
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

let cached: NotificationsModule | null | undefined;

/**
 * expo-notifications is loaded lazily: importing it at module scope throws on
 * Android when a native notifications module is missing (e.g. Expo Go), which
 * would crash the whole app at startup. Reminders simply become unavailable.
 */
function notifications(): NotificationsModule | null {
  if (!supported) return null;
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-notifications') as NotificationsModule;
  } catch (e) {
    console.warn('[xoog] Notifications are unavailable in this build:', e);
    cached = null;
  }
  return cached;
}

let configured = false;

/** Installs the foreground handler once. Never throws. */
export function configureNotifications() {
  if (configured) return;
  configured = true;
  const N = notifications();
  if (!N) return;
  try {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.warn('[xoog] Could not configure notifications:', e);
  }
}

export async function ensurePermission(): Promise<boolean> {
  const N = notifications();
  if (!N) return false;
  try {
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync(CHANNEL, {
        name: 'XOOG',
        importance: N.AndroidImportance.DEFAULT,
        lightColor: '#6B4EFF',
      });
    }
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await N.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

/** Replaces any existing reminder with a daily one at hour:minute. Returns false when unavailable/denied. */
export async function scheduleDailyReminder(hour: number, minute: number, title: string, body: string): Promise<boolean> {
  const N = notifications();
  if (!N) return false;
  const ok = await ensurePermission();
  if (!ok) return false;
  try {
    await N.cancelAllScheduledNotificationsAsync();
    await N.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: N.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelReminders() {
  const N = notifications();
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
  } catch {
    // nothing scheduled / module unavailable
  }
}
