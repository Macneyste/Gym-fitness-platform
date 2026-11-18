import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { I18nManager, StyleSheet, Switch, Text, View } from 'react-native';

import { selection } from '@/lib/haptics';
import { colors, radius, space, type } from '@/theme';
import { PressableScale } from './PressableScale';

type Props = {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean };
  right?: ReactNode;
  testID?: string;
};

/** Settings list row: icon tile, label, and a value / chevron / switch on the trailing edge. */
export function SettingRow({ icon: Icon, label, value, onPress, toggle, right, testID }: Props) {
  const content = (
    <>
      <View style={styles.icon}>
        <Icon size={18} color={colors.textLabel} strokeWidth={2} />
      </View>
      <Text style={styles.label}>{label}</Text>
      {right}
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {toggle ? (
        <Switch
          value={toggle.value}
          disabled={toggle.disabled}
          onValueChange={(v) => {
            selection();
            toggle.onChange(v);
          }}
          trackColor={{ false: colors.surface2, true: colors.primary }}
          thumbColor={colors.text}
          ios_backgroundColor={colors.surface2}
          accessibilityLabel={label}
          testID={testID ? `${testID}-switch` : undefined}
        />
      ) : null}
      {onPress ? <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined} /> : null}
    </>
  );

  if (!onPress) return <View style={styles.row} testID={testID}>{content}</View>;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={() => {
        selection();
        onPress();
      }}
      style={styles.row}
      testID={testID}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingHorizontal: space.lg, paddingVertical: space.sm },
  icon: { width: 36, height: 36, borderRadius: radius.tile - 4, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  label: { ...type.bodyStrong, color: colors.text, flex: 1 },
  value: { ...type.label, color: colors.textMuted },
});
