import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

/** Light tick for selections (chips, cards, pickers). */
export function selection() {
  if (enabled) Haptics.selectionAsync().catch(() => undefined);
}

/** Medium tap for primary actions. */
export function impact() {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
}

/** Success buzz — set complete, new PR. */
export function success() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}
