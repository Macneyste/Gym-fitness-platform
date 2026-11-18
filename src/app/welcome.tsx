import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppMark, BackgroundRings, Logo } from '@/components/brand';
import { Button, PressableScale } from '@/components/ui';
import { useI18n } from '@/i18n';
import { colors, fonts, radius, space, type } from '@/theme';

export default function Welcome() {
  const { t, lang, setLang } = useI18n();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Logo size={24} />
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={lang === 'so' ? 'Switch to English' : 'U beddel Soomaali'}
          onPress={() => setLang(lang === 'so' ? 'en' : 'so')}
          style={styles.lang}
          testID="welcome-lang"
        >
          <Text style={styles.langText}>{lang === 'so' ? 'EN' : 'SO'}</Text>
        </PressableScale>
      </View>

      <View style={styles.hero}>
        <BackgroundRings size={360} count={4} />
        <AppMark size={132} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.headline} accessibilityRole="header">
          {t('welcome.line1')}
          {'\n'}
          <Text style={{ color: colors.accent }}>{t('welcome.line2')}</Text>
        </Text>
        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

        <View style={styles.dots} importantForAccessibility="no-hide-descendants">
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Button label={t('welcome.cta')} onPress={() => router.push('/onboarding/gender')} testID="welcome-start" />

        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/auth/login')}
          style={styles.loginLink}
          hitSlop={8}
          testID="welcome-login"
        >
          <Text style={styles.loginText}>
            {t('welcome.haveAccount')} <Text style={styles.loginStrong}>{t('welcome.login')}</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.xl },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: space.sm },
  lang: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  langText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textLabel },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 240 },
  copy: { gap: space.lg, paddingBottom: space.lg },
  headline: { ...type.display, color: colors.text },
  subtitle: { ...type.body, color: colors.textMuted },
  dots: { flexDirection: 'row', gap: space.sm, marginVertical: space.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surface2 },
  dotActive: { width: 24, backgroundColor: colors.primary },
  loginLink: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
  loginText: { ...type.small, color: colors.textMuted },
  loginStrong: { fontFamily: fonts.bodySemibold, color: colors.text },
});
