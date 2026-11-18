import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { colors } from '@/theme';

type Props = {
  /** Rendered width in px. Height follows the 100:44 aspect ratio. */
  width: number;
  color?: string;
};

/**
 * The XOOG barbell: two thick rings (the "OO") joined by a bar that
 * extends past both rings.
 */
export function Barbell({ width, color = colors.text }: Props) {
  const height = (width * 44) / 100;
  return (
    // A11y-hiding props live on the View: on web, <Svg> forwards unknown props to the DOM <svg>.
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width, height }}>
      <Svg width={width} height={height} viewBox="0 0 100 44">
        <Line x1={3} y1={22} x2={15} y2={22} stroke={color} strokeWidth={7} strokeLinecap="round" />
        <Line x1={45} y1={22} x2={55} y2={22} stroke={color} strokeWidth={7} strokeLinecap="round" />
        <Line x1={85} y1={22} x2={97} y2={22} stroke={color} strokeWidth={7} strokeLinecap="round" />
        <Circle cx={30} cy={22} r={15} stroke={color} strokeWidth={8} fill="none" />
        <Circle cx={70} cy={22} r={15} stroke={color} strokeWidth={8} fill="none" />
      </Svg>
    </View>
  );
}
