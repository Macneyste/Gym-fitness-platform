import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { formatClock } from '@/lib/date';
import { selection } from '@/lib/haptics';
import { colors, fonts, radius, space, type } from '@/theme';
import { PressableScale } from './PressableScale';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** Seconds remaining. */
  remaining: number;
  /** Total seconds for this countdown (progress denominator). */
  total: number;
  /** Eyebrow above the number, e.g. "NASASHO". */
  caption?: string;
  addLabel?: string;
  onAdd?: () => void;
  size?: number;
};

/** Big circular countdown: violet progress ring, lime dotted inner ring, huge number. */
export function RingTimer({ remaining, total, caption, addLabel, onAdd, size = 280 }: Props) {
  const reduceMotion = useReducedMotion();
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const innerR = r - stroke - 10;

  const fraction = total > 0 ? Math.min(1, Math.max(0, remaining / total)) : 0;
  const progress = useSharedValue(fraction);

  useEffect(() => {
    progress.value = reduceMotion
      ? fraction
      : withTiming(fraction, { duration: 950, easing: Easing.linear });
  }, [fraction, progress, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="timer" accessibilityLabel={`${caption ?? ''} ${formatClock(remaining)}`}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surface2} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          stroke={colors.accent}
          strokeOpacity={0.55}
          strokeWidth={3}
          strokeDasharray="1 9"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <View style={styles.center}>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        <Text style={styles.number} maxFontSizeMultiplier={1} testID="ring-timer-value">
          {formatClock(remaining)}
        </Text>
        {onAdd ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={addLabel}
            onPress={() => {
              selection();
              onAdd();
            }}
            style={styles.add}
            testID="ring-timer-add"
          >
            <Text style={styles.addText}>{addLabel}</Text>
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: space.xs },
  caption: { ...type.eyebrow, color: colors.textMuted },
  number: { fontFamily: fonts.heading, fontSize: 68, lineHeight: 74, letterSpacing: -2, color: colors.text },
  add: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
  },
  addText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.accent },
});
