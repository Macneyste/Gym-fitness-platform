import { View } from 'react-native';

import { colors } from '@/theme';
import { Barbell } from './Barbell';

/** App icon: violet rounded square (radius 28/120) with the lime barbell mark. */
export function AppMark({ size = 120 }: { size?: number }) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="XOOG"
      style={{
        width: size,
        height: size,
        borderRadius: (size * 28) / 120,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Barbell width={size * 0.7} color={colors.accent} />
    </View>
  );
}
