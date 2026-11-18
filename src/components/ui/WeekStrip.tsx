import { StyleSheet, Text, View } from 'react-native';

import { useI18n } from '@/i18n';
import { dayKey, isSameDay, weekDates } from '@/lib/date';
import { selection } from '@/lib/haptics';
import { colors, fonts, radius, space } from '@/theme';
import { PressableScale } from './PressableScale';

type Props = {
  today?: Date;
  /** Day keys (YYYY-MM-DD) with a completed workout. */
  doneDays: ReadonlySet<string>;
  selected?: Date;
  onSelect?: (d: Date) => void;
};

/** 7-day strip, Sab…Jim. Today = lime, completed = violet outline. */
export function WeekStrip({ today = new Date(), doneDays, selected, onSelect }: Props) {
  const { tl } = useI18n();
  const labels = tl('days.short');
  const dates = weekDates(today);

  return (
    <View style={styles.row} accessibilityRole="tablist">
      {dates.map((d, i) => {
        const isToday = isSameDay(d, today);
        const done = doneDays.has(dayKey(d));
        const isSelected = selected ? isSameDay(selected, d) : false;
        return (
          <PressableScale
            key={dayKey(d)}
            testID={`week-day-${i}`}
            accessibilityRole="tab"
            accessibilityLabel={`${labels[i]} ${d.getDate()}`}
            accessibilityState={{ selected: isSelected || isToday, checked: done }}
            onPress={() => {
              selection();
              onSelect?.(d);
            }}
            style={[
              styles.day,
              done && styles.done,
              isToday && styles.today,
              isSelected && !isToday && styles.selected,
            ]}
          >
            <Text style={[styles.label, isToday && styles.onAccent]} maxFontSizeMultiplier={1.2}>
              {labels[i]}
            </Text>
            <Text style={[styles.num, isToday && styles.onAccent]} maxFontSizeMultiplier={1.2}>
              {d.getDate()}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.xs + 2 },
  day: {
    flex: 1,
    minHeight: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  done: { borderColor: colors.primary },
  today: { backgroundColor: colors.accent, borderColor: colors.accent },
  selected: { backgroundColor: colors.selectedFill, borderColor: colors.primary },
  label: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textMuted },
  num: { fontFamily: fonts.heading, fontSize: 17, color: colors.text },
  onAccent: { color: colors.onAccent },
});
