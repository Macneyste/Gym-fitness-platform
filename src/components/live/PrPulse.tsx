import { Trophy } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { colors } from '@/theme';

/** Confetti-free celebration: a lime ring that pulses out from a trophy. */
export function PrPulse({ size = 56 }: { size?: number }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    p.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) }), -1, false);
  }, [p, reduce]);

  const ring = useAnimatedStyle(() => ({
    opacity: 0.7 * (1 - p.value),
    transform: [{ scale: 1 + p.value * 0.9 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden>
      <Animated.View style={[StyleSheet.absoluteFill, styles.ring, { borderRadius: size / 2 }, ring]} />
      <View style={[styles.core, { width: size, height: size, borderRadius: size / 2 }]}>
        <Trophy size={size * 0.45} color={colors.onAccent} strokeWidth={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderWidth: 3, borderColor: colors.accent },
  core: { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
