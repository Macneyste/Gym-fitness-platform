import { ChevronRight } from 'lucide-react-native';
import { I18nManager, StyleSheet, Text, View } from 'react-native';

import { selection } from '@/lib/haptics';
import { colors, fonts, radius, sizes, space, type } from '@/theme';
import { PressableScale } from './PressableScale';

type Props = {
  index: number;
  name: string;
  /** e.g. "4 × 10 · 60 kg" */
  detail: string;
  onPress?: () => void;
  done?: boolean;
  testID?: string;
};

/** Numbered exercise row: index tile, name, sets × reps · weight, chevron. */
export function ExerciseRow({ index, name, detail, onPress, done, testID }: Props) {
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${index}. ${name}, ${detail}`}
      onPress={() => {
        selection();
        onPress?.();
      }}
      style={styles.row}
    >
      <View style={[styles.index, done && styles.indexDone]}>
        <Text style={[styles.indexText, done && { color: colors.onAccent }]}>{String(index).padStart(2, '0')}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <ChevronRight
        size={20}
        color={colors.textMuted}
        strokeWidth={2}
        style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md + 2,
    minHeight: 72,
    paddingVertical: space.md,
    paddingHorizontal: space.md + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.cardSm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  index: {
    width: sizes.touch + 4,
    height: sizes.touch + 4,
    borderRadius: radius.tile,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexDone: { backgroundColor: colors.accent },
  indexText: { fontFamily: fonts.heading, fontSize: 16, color: colors.text },
  body: { flex: 1, gap: 2 },
  name: { ...type.bodyStrong, color: colors.text },
  detail: { ...type.label, color: colors.textMuted },
});
