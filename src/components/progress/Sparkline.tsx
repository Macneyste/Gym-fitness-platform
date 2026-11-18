import { View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

import { colors } from '@/theme';

type Props = { values: number[]; width: number; height: number; color?: string };

/** Minimal line with an end dot. Needs ≥ 2 points to draw a line. */
export function Sparkline({ values, width, height, color = colors.accent }: Props) {
  if (values.length === 0) return null;
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => [pad + i * step, pad + (1 - (v - min) / span) * (height - pad * 2)] as const);
  const last = pts[pts.length - 1];

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width, height }}>
      <Svg width={width} height={height}>
        {pts.length > 1 ? (
          <Polyline
            points={pts.map(([x, y]) => `${x},${y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        <Circle cx={last[0]} cy={last[1]} r={5} fill={color} />
      </Svg>
    </View>
  );
}
