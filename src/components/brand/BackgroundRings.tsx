import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme';

type Props = {
  size?: number;
  count?: number;
  color?: string;
  style?: ViewStyle;
};

/** Large faint concentric barbell-plate rings used for background depth. */
export function BackgroundRings({ size = 420, count = 4, color = colors.ring, style }: Props) {
  const c = size / 2;
  const step = c / (count + 0.5);
  return (
    <View pointerEvents="none" style={[styles.wrap, style]} importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size}>
        {Array.from({ length: count }, (_, i) => (
          <Circle key={i} cx={c} cy={c} r={step * (i + 1)} stroke={color} strokeWidth={i === count - 1 ? 18 : 10} fill="none" />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
});
