import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { selection } from '@/lib/haptics';
import { colors, radius, sizes } from '@/theme';
import { PressableScale } from './PressableScale';

type Props = {
  icon: LucideIcon;
  /** Required: icon-only buttons must be labelled for screen readers. */
  accessibilityLabel: string;
  onPress?: () => void;
  tone?: 'surface' | 'dark' | 'accent' | 'primary';
  size?: number;
  badge?: boolean;
  /** Mirror horizontally in RTL (for directional arrows). */
  flipRTL?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const tones = {
  surface: { bg: colors.surface, fg: colors.text, border: colors.border },
  dark: { bg: colors.bg, fg: colors.text, border: colors.border },
  accent: { bg: colors.accent, fg: colors.onAccent, border: colors.accent },
  primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
} as const;

export function IconButton({ icon: Icon, accessibilityLabel, onPress, tone = 'surface', size = sizes.touch + 4, badge, style, testID }: Props) {
  const t = tones[tone];
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        selection();
        onPress?.();
      }}
      style={[styles.btn, { width: size, height: size, backgroundColor: t.bg, borderColor: t.border }, style]}
    >
      <Icon size={size * 0.42} color={t.fg} strokeWidth={2} />
      {badge ? <View style={styles.badge} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  badge: {
    position: 'absolute',
    top: 11,
    end: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
