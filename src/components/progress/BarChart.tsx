import { StyleSheet, Text, View } from 'react-native';

import type { Bar } from '@/lib/progress';
import { colors, fonts, radius, space } from '@/theme';

type Props = { bars: Bar[]; height?: number; highlightKey?: string; unit: string };

/** Minutes bar chart: best bar lime, active bars violet, rest days dim stubs. */
export function BarChart({ bars, height = 160, highlightKey, unit }: Props) {
  const max = Math.max(1, ...bars.map((b) => b.minutes));
  const best = bars.reduce<Bar | undefined>((m, b) => (b.minutes > 0 && (!m || b.minutes > m.minutes) ? b : m), undefined);

  return (
    <View style={styles.wrap} accessibilityRole="image" accessibilityLabel={bars.map((b) => `${b.label}: ${b.minutes} ${unit}`).join(', ')}>
      {bars.map((b) => {
        const rest = b.minutes === 0;
        const isBest = best?.key === b.key;
        const h = rest ? 8 : Math.max(12, (b.minutes / max) * height);
        return (
          <View key={b.key} style={styles.col}>
            <Text style={[styles.value, isBest && { color: colors.accent }]}>{rest ? '' : b.minutes}</Text>
            <View style={{ height, justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
              <View
                style={[
                  styles.bar,
                  { height: h, backgroundColor: rest ? colors.surface2 : isBest ? colors.accent : colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.label, highlightKey === b.key && { color: colors.text }]} numberOfLines={1}>
              {b.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  bar: { width: '72%', maxWidth: 34, borderRadius: radius.tile - 4 },
  value: { fontFamily: fonts.heading, fontSize: 12, color: colors.textMuted, height: 16 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textMuted },
});
