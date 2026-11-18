import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';

import { selection } from '@/lib/haptics';
import { colors, fonts, radius, space } from '@/theme';

const TICK = 12;

type Props = {
  label: string;
  min: number;
  max: number;
  value: number;
  unit: string;
  onChange: (v: number) => void;
  testID?: string;
};

/** Horizontal snapping ruler with a lime centre indicator and the value shown large above. */
export function RulerPicker({ label, min, max, value, unit, onChange, testID }: Props) {
  const ref = useRef<ScrollViewInstance>(null);
  const [width, setWidth] = useState(0);
  const [current, setCurrent] = useState(value);
  const last = useRef(value);
  const count = max - min + 1;

  const commit = (v: number) => {
    const clamped = Math.min(max, Math.max(min, v));
    if (clamped !== last.current) {
      last.current = clamped;
      setCurrent(clamped);
      selection();
      onChange(clamped);
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => commit(min + Math.round(e.nativeEvent.contentOffset.x / TICK));

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, current + delta));
    ref.current?.scrollTo({ x: (next - min) * TICK, animated: true });
    commit(next);
  };

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value} maxFontSizeMultiplier={1.1}>
            {current}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      <View
        style={styles.rulerWrap}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: current, text: `${current} ${unit}` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      >
        {width > 0 ? (
          <ScrollView
            ref={ref}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={onScroll}
            onLayout={() => ref.current?.scrollTo({ x: (current - min) * TICK, animated: false })}
            contentContainerStyle={{ paddingHorizontal: width / 2 - TICK / 2 }}
          >
            {Array.from({ length: count }, (_, i) => {
              const v = min + i;
              const major = v % 10 === 0;
              const mid = v % 5 === 0;
              return (
                <View key={v} style={styles.tickCell}>
                  <View style={[styles.tick, { height: major ? 36 : mid ? 24 : 14, opacity: major ? 1 : 0.6 }]} />
                  {major ? <Text style={styles.tickLabel}>{v}</Text> : null}
                </View>
              );
            })}
          </ScrollView>
        ) : null}
        <View pointerEvents="none" style={styles.indicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: space.lg,
    paddingBottom: space.md,
    gap: space.md,
    overflow: 'hidden',
  },
  header: { paddingHorizontal: space.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textLabel, paddingBottom: 8 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  value: { fontFamily: fonts.heading, fontSize: 40, letterSpacing: -1.2, color: colors.primary },
  unit: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textLabel },
  rulerWrap: { height: 72, justifyContent: 'flex-start' },
  tickCell: { width: TICK, alignItems: 'center' },
  tick: { width: 2, borderRadius: 1, backgroundColor: colors.textMuted },
  tickLabel: { position: 'absolute', top: 42, width: 40, textAlign: 'center', fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textMuted },
  indicator: {
    position: 'absolute',
    top: -4,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 46,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
