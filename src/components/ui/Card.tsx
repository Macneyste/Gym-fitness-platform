import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { selection } from '@/lib/haptics';
import { colors, radius, space } from '@/theme';
import { PressableScale } from './PressableScale';

export type CardTone = 'surface' | 'surface2' | 'primary' | 'selected';

type Props = {
  children: ReactNode;
  tone?: CardTone;
  onPress?: () => void;
  selected?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'checkbox' | 'radio';
  testID?: string;
};

const toneBg: Record<CardTone, string> = {
  surface: colors.surface,
  surface2: colors.surface2,
  primary: colors.primary,
  selected: colors.selectedFill,
};

/** Flat layered surface. Becomes a pressable (with selection state) when `onPress` is set. */
export function Card({ children, tone = 'surface', onPress, selected, padded = true, style, accessibilityLabel, accessibilityRole = 'button', testID }: Props) {
  const resolvedTone = selected ? 'selected' : tone;
  const cardStyle = [
    styles.card,
    padded && styles.padded,
    { backgroundColor: toneBg[resolvedTone] },
    selected ? styles.selected : tone === 'surface' && styles.outline,
    style,
  ];

  if (!onPress) {
    return (
      <View style={cardStyle} testID={testID}>
        {children}
      </View>
    );
  }

  return (
    <PressableScale
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityRole === 'button' ? undefined : { checked: !!selected, selected: !!selected }}
      onPress={() => {
        selection();
        onPress();
      }}
      style={cardStyle}
    >
      {children}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: 1.5, borderColor: 'transparent' },
  padded: { padding: space.xl },
  outline: { borderColor: colors.border, borderWidth: 1 },
  selected: { borderColor: colors.selectedBorder },
});
