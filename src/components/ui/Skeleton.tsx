import { useEffect } from 'react';
import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { colors, radius, space } from '@/theme';

type Props = { width?: DimensionValue; height?: number; rounded?: number; style?: StyleProp<ViewStyle> };

/** Graphite block with a soft shimmer pulse. */
export function Skeleton({ width = '100%', height = 16, rounded = radius.tile, style }: Props) {
  const reduce = useReducedMotion();
  const o = useSharedValue(0.45);
  useEffect(() => {
    if (reduce) return;
    o.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [o, reduce]);
  const animated = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: rounded, backgroundColor: colors.surface2 }, animated, style]}
    />
  );
}

/** Placeholder list: n rows the shape of an ExerciseRow. */
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <View style={{ gap: space.md }} accessibilityRole="progressbar" accessibilityLabel="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.md,
            padding: space.md,
            borderRadius: radius.cardSm,
            backgroundColor: colors.surface,
          }}
        >
          <Skeleton width={48} height={48} />
          <View style={{ flex: 1, gap: space.sm }}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="35%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}
