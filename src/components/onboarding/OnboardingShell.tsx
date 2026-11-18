import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { I18nManager, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, IconButton, ProgressBar } from '@/components/ui';
import { useI18n } from '@/i18n';
import { colors, space, type } from '@/theme';

export const ONBOARDING_STEPS = 5;

type Props = {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  ctaLabel?: string;
  canContinue?: boolean;
  onContinue: () => void;
  scroll?: boolean;
};

/** Shared frame: back button + top progress bar, title, content and a single primary CTA. */
export function OnboardingShell({ step, title, subtitle, children, ctaLabel, canContinue = true, onContinue, scroll = true }: Props) {
  const { t } = useI18n();
  const Body = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <IconButton
          icon={ArrowLeft}
          accessibilityLabel={t('common.back')}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
          style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
          testID="onboarding-back"
        />
        <View style={styles.progress}>
          <ProgressBar
            value={step / ONBOARDING_STEPS}
            color={colors.primary}
            accessibilityLabel={t('common.step', { current: step, total: ONBOARDING_STEPS })}
          />
        </View>
        <Text style={styles.count}>
          {step}/{ONBOARDING_STEPS}
        </Text>
      </View>

      <Body style={styles.body} contentContainerStyle={scroll ? styles.bodyContent : undefined} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </Body>

      <View style={styles.footer}>
        <Button label={ctaLabel ?? t('common.continue')} disabled={!canContinue} onPress={onContinue} testID="onboarding-continue" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingHorizontal: space.xl, paddingTop: space.sm },
  progress: { flex: 1 },
  count: { ...type.label, color: colors.textMuted, minWidth: 28, textAlign: 'right' },
  body: { flex: 1, paddingHorizontal: space.xl },
  bodyContent: { gap: space.xxl, paddingTop: space.xxl, paddingBottom: space.xxl },
  heading: { gap: space.sm, paddingTop: space.xs },
  title: { ...type.h1, color: colors.text },
  subtitle: { ...type.body, color: colors.textMuted },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.md, paddingTop: space.sm },
});
