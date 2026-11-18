import { Check, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { colors, radius, space, type } from '@/theme';

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
  testID?: string;
};

/** Selectable card: icon tile, title + subtitle, lime check circle when selected. */
export function OptionCard({ icon: Icon, title, subtitle, selected, onPress, multi, testID }: Props) {
  return (
    <Card
      onPress={onPress}
      selected={selected}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={styles.card}
      testID={testID}
    >
      <View style={[styles.iconTile, selected && { backgroundColor: colors.primary }]}>
        <Icon size={22} color={selected ? colors.onPrimary : colors.textLabel} strokeWidth={2} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.check, selected && styles.checkOn]}>
        {selected ? <Check size={16} color={colors.onAccent} strokeWidth={3} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md + 2, paddingVertical: space.lg },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.tile,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  title: { ...type.bodyStrong, color: colors.text },
  subtitle: { ...type.label, color: colors.textMuted },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});
