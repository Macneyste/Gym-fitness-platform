import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, Wrench } from 'lucide-react-native';
import { I18nManager, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseThumb } from '@/components/library/ExerciseThumb';
import { EmptyState, IconButton, PressableScale, SkeletonList } from '@/components/ui';
import { muscleNames } from '@/data/exercises';
import { useExercises } from '@/hooks/useExercises';
import { useI18n } from '@/i18n';
import { colors, fonts, radius, space, type } from '@/theme';
import type { Muscle } from '@/types/models';

function MuscleTag({ muscle, primary, lang }: { muscle: Muscle; primary?: boolean; lang: 'so' | 'en' }) {
  return (
    <View style={[styles.tag, primary ? styles.tagPrimary : null]}>
      <Text style={[styles.tagText, primary && { color: colors.onPrimary }]}>{muscleNames[muscle][lang]}</Text>
    </View>
  );
}

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useI18n();
  const insets = useSafeAreaInsets();
  const { data, loading } = useExercises();
  const ex = data.find((e) => e.id === id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/workouts'));

  if (!ex) {
    return (
      <SafeAreaView style={[styles.root, { padding: space.xl, gap: space.xl }]}>
        <IconButton icon={ArrowLeft} accessibilityLabel={t('common.back')} onPress={back} />
        {loading ? <SkeletonList rows={3} /> : <EmptyState title={t('library.empty')} />}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={[styles.media, { paddingTop: insets.top + space.sm }]}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t('exercise.playVideo')}
            disabled={!ex.videoUrl}
            onPress={() => ex.videoUrl && WebBrowser.openBrowserAsync(ex.videoUrl)}
            testID="exercise-video"
          >
            <ExerciseThumb category={ex.category} seconds={ex.videoSeconds} height={240} large />
          </PressableScale>
          <IconButton
            icon={ArrowLeft}
            tone="dark"
            accessibilityLabel={t('common.back')}
            onPress={back}
            style={[styles.back, { top: insets.top + space.lg }, I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : null]}
            testID="exercise-back"
          />
        </View>

        <View style={styles.body}>
          <View style={{ gap: space.sm }}>
            <Text style={styles.eyebrow}>{t(`categories.${ex.category}`).toUpperCase()}</Text>
            <Text style={styles.title} accessibilityRole="header">
              {ex.name[lang]}
            </Text>
            <View style={styles.equipment}>
              <Wrench size={16} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.muted}>
                {t('exercise.equipment')}: {ex.equipment[lang]}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>{t('exercise.steps')}</Text>
            {ex.steps.map((s, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{s[lang]}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>{t('exercise.muscles')}</Text>
            <Text style={styles.muted}>{t('exercise.primary')}</Text>
            <View style={styles.tags}>
              {ex.primary.map((m) => (
                <MuscleTag key={m} muscle={m} primary lang={lang} />
              ))}
            </View>
            {ex.secondary.length ? (
              <>
                <Text style={styles.muted}>{t('exercise.secondary')}</Text>
                <View style={styles.tags}>
                  {ex.secondary.map((m) => (
                    <MuscleTag key={m} muscle={m} lang={lang} />
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  media: { paddingHorizontal: space.xl },
  back: { position: 'absolute', start: space.xl + space.md },
  body: { padding: space.xl, gap: space.xl },
  eyebrow: { ...type.eyebrow, color: colors.accent },
  title: { ...type.h1, color: colors.text },
  equipment: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  muted: { ...type.label, color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: space.xl, gap: space.md },
  section: { ...type.h3, color: colors.text },
  step: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.selectedFill, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.heading, fontSize: 13, color: colors.text },
  stepText: { ...type.body, color: colors.textLabel, flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tag: { paddingHorizontal: space.md, minHeight: 32, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.surface2 },
  tagPrimary: { backgroundColor: colors.primary },
  tagText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textLabel },
});
