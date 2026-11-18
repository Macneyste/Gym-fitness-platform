import { Activity, Dumbbell, Flame, Play, StretchHorizontal, Wind, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { BackgroundRings } from '@/components/brand';
import { formatClock } from '@/lib/date';
import { colors, fonts, radius } from '@/theme';
import type { Category } from '@/types/models';

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  strength: Dumbbell,
  cardio: Activity,
  hiit: Flame,
  mobility: StretchHorizontal,
  yoga: Wind,
};

type Props = { category: Category; seconds: number; size?: number; height?: number; large?: boolean };

/** Video thumbnail/poster: graphite surface, faint rings, category glyph, play badge and duration. */
export function ExerciseThumb({ category, seconds, size = 88, height, large }: Props) {
  const Icon = CATEGORY_ICON[category];
  const h = height ?? size;
  return (
    <View style={[styles.thumb, { width: large ? '100%' : size, height: h, borderRadius: large ? radius.cardLg : radius.tile + 2 }]}>
      <BackgroundRings size={h * 1.6} count={3} color="rgba(107,78,255,0.18)" style={{ left: -h * 0.2, top: -h * 0.3 }} />
      <Icon size={large ? 56 : 30} color={colors.textMuted} strokeWidth={1.75} />
      <View style={[styles.play, large && styles.playLarge]}>
        <Play size={large ? 22 : 12} color={colors.onAccent} fill={colors.onAccent} strokeWidth={2} />
      </View>
      <View style={styles.duration}>
        <Text style={[styles.durationText, large && { fontSize: 13 }]}>{formatClock(seconds)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: { backgroundColor: colors.surface2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  play: {
    position: 'absolute',
    top: 8,
    start: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playLarge: { top: undefined, start: undefined, width: 64, height: 64, borderRadius: 32, position: 'absolute' },
  duration: { position: 'absolute', bottom: 6, end: 6, backgroundColor: colors.overlay, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  durationText: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.text },
});
