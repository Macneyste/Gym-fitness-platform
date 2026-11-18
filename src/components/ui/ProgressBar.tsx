import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, motion, radius } from '@/theme';

type Props = {
  /** 0–1 */
  value: number;
  height?: number;
  color?: string;
  track?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Rounded progress fill — lime by default. */
export function ProgressBar({ value, height = 8, color = colors.accent, track = colors.surface2, style, accessibilityLabel }: Props) {
  const clamped = Math.min(1, Math.max(0, value));
  const w = useSharedValue(clamped);
  useEffect(() => {
    w.value = withTiming(clamped, { duration: motion.slow });
  }, [clamped, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[{ height, borderRadius: radius.pill, backgroundColor: track, overflow: 'hidden' }, style]}
    >
      <Animated.View style={[{ height: '100%', borderRadius: radius.pill, backgroundColor: color }, fill]} />
    </View>
  );
}
