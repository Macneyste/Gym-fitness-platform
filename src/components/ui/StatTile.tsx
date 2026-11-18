import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts, radius, space, type } from '@/theme';

type Props = {
  icon: LucideIcon;
  value: string | number;
  unit?: string;
  label: string;
  /** Icon accent colour: ember for calories, lime for streaks, violet otherwise. */
  accent?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function StatTile({ icon: Icon, value, unit, label, accent = colors.primary, style, testID }: Props) {
  return (
    <View
      testID={testID}
      style={[styles.tile, style]}
      accessible
      accessibilityLabel={`${label}: ${value}${unit ? ` ${unit}` : ''}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
        <Icon size={18} color={accent} strokeWidth={2} />
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.3}>
          {value}
        </Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.cardSm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md + 2,
    gap: space.sm,
  },
  iconWrap: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  value: { ...type.number, color: colors.text },
  unit: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted },
  label: { ...type.label, color: colors.textMuted },
});
