import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

import { selection } from '@/lib/haptics';
import { colors, fonts, radius, sizes, space } from '@/theme';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  testID?: string;
};

/** Fully-rounded filter/category chip. Selected = violet fill. */
export function Chip({ label, selected, onPress, icon, testID }: Props) {
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        selection();
        onPress?.();
      }}
      style={[styles.chip, selected ? styles.selected : styles.idle]}
    >
      {icon}
      <Text style={[styles.label, { color: selected ? colors.onPrimary : colors.textLabel }]} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: sizes.touch,
    paddingHorizontal: space.lg + 2,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
  },
  idle: { backgroundColor: colors.surface, borderColor: colors.border },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontFamily: fonts.bodySemibold, fontSize: 14 },
});
