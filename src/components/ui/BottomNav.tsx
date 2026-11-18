import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { selection } from '@/lib/haptics';
import { colors, fonts, radius, sizes, space } from '@/theme';
import { PressableScale } from './PressableScale';

export type NavItem = { key: string; label: string; icon: LucideIcon };

type Props = {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
};

/** Floating pill bottom navigation. The active item expands to show its label on violet. */
export function BottomNav({ items, activeKey, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {items.map(({ key, label, icon: Icon }) => {
          const active = key === activeKey;
          return (
            <Animated.View key={key} layout={LinearTransition.duration(220)} style={active ? styles.activeFlex : undefined}>
              <PressableScale
                testID={`nav-${key}`}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected: active }}
                onPress={() => {
                  if (!active) selection();
                  onSelect(key);
                }}
                style={[styles.item, active && styles.itemActive]}
              >
                <Icon size={22} color={active ? colors.onPrimary : colors.textMuted} strokeWidth={2} />
                {active ? (
                  <Text style={styles.label} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                    {label}
                  </Text>
                ) : null}
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.xl },
  bar: {
    height: sizes.navHeight + 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.sm,
  },
  activeFlex: { flexShrink: 1 },
  item: {
    minWidth: 56,
    height: sizes.navHeight - 8,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  itemActive: { backgroundColor: colors.primary, paddingHorizontal: space.lg + 2 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.onPrimary },
});
