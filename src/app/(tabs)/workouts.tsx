import { router, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, I18nManager, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseThumb } from '@/components/library/ExerciseThumb';
import { Chip, EmptyState, ErrorState, PressableScale, SkeletonList } from '@/components/ui';
import { filterExercises, useExercises } from '@/hooks/useExercises';
import { muscleNames } from '@/data/exercises';
import { useI18n } from '@/i18n';
import { selection } from '@/lib/haptics';
import { colors, fonts, radius, sizes, space, type } from '@/theme';
import type { Category } from '@/types/models';

const FILTERS: (Category | 'all')[] = ['all', 'strength', 'cardio', 'hiit', 'mobility', 'yoga'];

function asFilter(value?: string): Category | 'all' | undefined {
  return FILTERS.find((f) => f === value);
}

export default function Library() {
  const { t, lang } = useI18n();
  const params = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'all'>(() => asFilter(params.category) ?? 'all');
  const [seenParam, setSeenParam] = useState(params.category);
  const { data, loading, error, retry } = useExercises();

  // Category chips on Home deep-link here: adopt a new param during render.
  if (params.category !== seenParam) {
    setSeenParam(params.category);
    const next = asFilter(params.category);
    if (next) setCategory(next);
  }

  const list = useMemo(() => filterExercises(data, query, category), [data, query, category]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          {t('library.title')}
        </Text>
        <View style={styles.search}>
          <Search size={20} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('library.search')}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            accessibilityLabel={t('library.search')}
            style={styles.input}
            returnKeyType="search"
            testID="library-search"
          />
          {query ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={() => setQuery('')} hitSlop={10} style={styles.clear}>
              <X size={18} color={colors.textMuted} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} style={{ marginHorizontal: -space.xl }}>
          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={f === 'all' ? t('library.all') : t(`categories.${f}`)}
              selected={category === f}
              onPress={() => setCategory(f)}
              testID={`filter-${f}`}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.pad}>
          <SkeletonList rows={6} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(e) => e.id}
          contentContainerStyle={[styles.pad, { paddingBottom: sizes.navHeight + 56 }]}
          ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={error ? <View style={{ marginBottom: space.md }}><ErrorState onRetry={retry} /></View> : undefined}
          ListEmptyComponent={<EmptyState icon={Search} title={t('library.empty')} body={t('library.emptyBody')} />}
          renderItem={({ item }) => (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={item.name[lang]}
              onPress={() => {
                selection();
                router.push(`/exercise/${item.id}`);
              }}
              style={styles.row}
              testID={`library-${item.id}`}
            >
              <ExerciseThumb category={item.category} seconds={item.videoSeconds} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name[lang]}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {t(`categories.${item.category}`)} · {item.primary.map((m) => muscleNames[m][lang]).join(', ')}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined} />
            </PressableScale>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.lg, paddingBottom: space.lg },
  title: { ...type.h1, color: colors.text },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 52,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.lg,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.text, paddingVertical: space.sm },
  clear: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  filters: { gap: space.sm, paddingHorizontal: space.xl },
  pad: { paddingHorizontal: space.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md + 2,
    padding: space.sm + 2,
    paddingEnd: space.md,
    borderRadius: radius.cardSm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { ...type.bodyStrong, color: colors.text },
  meta: { ...type.label, color: colors.textMuted },
});
