import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { impact } from '@/lib/haptics';
import { colors, fonts, radius, sizes, space } from '@/theme';
import { PressableScale } from './PressableScale';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'dark' | 'ghost';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary },
  accent: { bg: colors.accent, fg: colors.onAccent },
  secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
  dark: { bg: colors.bg, fg: colors.text },
  ghost: { bg: 'transparent', fg: colors.text },
};

/** Pill button. `primary` = violet, `accent` = lime (reserved for start/do-now moments). */
export function Button({
  label,
  onPress,
  variant = 'primary',
  iconLeft,
  iconRight,
  disabled,
  loading,
  compact,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: Props) {
  const p = palette[variant];
  const inactive = disabled || loading;
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        impact();
        onPress?.();
      }}
      style={[
        styles.base,
        compact && styles.compact,
        { backgroundColor: p.bg, borderColor: p.border ?? 'transparent', opacity: disabled ? 0.45 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {iconLeft}
          <Text style={[styles.label, { color: p.fg }]} numberOfLines={1} maxFontSizeMultiplier={1.4}>
            {label}
          </Text>
          {iconRight}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.buttonHeight,
    borderRadius: radius.pill,
    paddingHorizontal: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  compact: { minHeight: sizes.touch + 4, paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { fontFamily: fonts.bodySemibold, fontSize: 17 },
});
