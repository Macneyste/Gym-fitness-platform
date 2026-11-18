import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';
import { Barbell } from './Barbell';

type Props = { size?: number; color?: string };

/** Wordmark: X [OO barbell] G in Space Grotesk Bold. */
export function Logo({ size = 28, color = colors.text }: Props) {
  const letter = { fontFamily: fonts.heading, fontSize: size, lineHeight: size * 1.1, color, letterSpacing: -0.5 };
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel="XOOG">
      <Text style={letter}>X</Text>
      <View style={{ marginHorizontal: size * 0.02 }}>
        <Barbell width={size * 1.7} color={color} />
      </View>
      <Text style={letter}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
