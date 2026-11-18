import { StyleSheet, Text, View } from 'react-native';

import { selection } from '@/lib/haptics';
import { colors, fonts, radius, sizes } from '@/theme';
import { PressableScale } from './PressableScale';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
};

/** Pill segmented toggle (Week/Month, kg/lb, so/en). */
export function Segmented<T extends string>({ options, value, onChange, testID }: Props<T>) {
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" testID={testID}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <PressableScale
            key={o.value}
            testID={testID ? `${testID}-${o.value}` : undefined}
            accessibilityRole="radio"
            accessibilityLabel={o.label}
            accessibilityState={{ checked: active }}
            onPress={() => {
              if (!active) selection();
              onChange(o.value);
            }}
            style={[styles.seg, active && styles.active]}
          >
            <Text style={[styles.label, active && styles.labelActive]} maxFontSizeMultiplier={1.3}>
              {o.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seg: { flex: 1, minHeight: sizes.touch, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  active: { backgroundColor: colors.primary },
  label: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted },
  labelActive: { color: colors.onPrimary },
});
