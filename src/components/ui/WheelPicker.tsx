import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';

import { selection } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const ITEM = 64;
const VISIBLE = 5;

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  accessibilityLabel: string;
  testID?: string;
};

/** Vertical snapping wheel. The selected value is large and violet. */
export function WheelPicker({ min, max, value, onChange, unit, accessibilityLabel, testID }: Props) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const ref = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(Math.max(0, values.indexOf(value)));
  const last = useRef(index);

  const commit = (i: number) => {
    const clamped = Math.min(values.length - 1, Math.max(0, i));
    if (clamped !== last.current) {
      last.current = clamped;
      setIndex(clamped);
      selection();
      onChange(values[clamped]);
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => commit(Math.round(e.nativeEvent.contentOffset.y / ITEM));

  const step = (delta: number) => {
    const next = Math.min(values.length - 1, Math.max(0, index + delta));
    ref.current?.scrollTo({ y: next * ITEM, animated: true });
    commit(next);
  };

  return (
    <View
      style={styles.wrap}
      testID={testID}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: values[index], text: `${values[index]} ${unit ?? ''}` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
    >
      <View pointerEvents="none" style={styles.band} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onLayout={() => ref.current?.scrollTo({ y: index * ITEM, animated: false })}
        contentContainerStyle={{ paddingVertical: ITEM * ((VISIBLE - 1) / 2) }}
      >
        {values.map((v, i) => {
          const d = Math.abs(i - index);
          return (
            <View key={v} style={styles.item}>
              <Text
                style={[
                  styles.text,
                  d === 0 && styles.selected,
                  d === 1 && { fontSize: 28, opacity: 0.75 },
                  d >= 2 && { fontSize: 22, opacity: 0.35 },
                ]}
                maxFontSizeMultiplier={1}
              >
                {v}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      {unit ? (
        <Text pointerEvents="none" style={styles.unit}>
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: ITEM * VISIBLE, alignSelf: 'stretch', justifyContent: 'center' },
  band: {
    position: 'absolute',
    left: 40,
    right: 40,
    top: ITEM * 2,
    height: ITEM,
    borderRadius: radius.cardSm,
    backgroundColor: colors.selectedFill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  item: { height: ITEM, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.heading, fontSize: 24, color: colors.textMuted, letterSpacing: -0.5 },
  selected: { fontSize: 44, color: colors.primary, letterSpacing: -1.2, opacity: 1 },
  unit: {
    position: 'absolute',
    right: 56,
    top: ITEM * 2 + 22,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textLabel,
  },
});
