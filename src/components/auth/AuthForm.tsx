import { router } from 'expo-router';
import { Apple, ArrowLeft, Check } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, I18nManager, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundRings } from '@/components/brand';
import { Button, IconButton, TextField } from '@/components/ui';
import { useI18n } from '@/i18n';
import {
  sendPasswordReset,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  validateCredentials,
  type AuthResult,
} from '@/lib/auth';
import { selection } from '@/lib/haptics';
import { useStore } from '@/store';
import { colors, fonts, space, type } from '@/theme';

type Mode = 'login' | 'signup';

export function AuthForm({ mode }: { mode: Mode }) {
  const { t } = useI18n();
  const { state, dispatch } = useStore();
  const isSignup = mode === 'signup';

  const [name, setName] = useState(state.profile.name);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [busy, setBusy] = useState<null | 'email' | 'google' | 'apple'>(null);

  const finish = (res: AuthResult) => {
    if (!res.ok) {
      if (res.error !== 'cancelled') Alert.alert(t('common.errorTitle'), res.error);
      return;
    }
    dispatch({ type: 'setUser', user: { ...res.user, name: res.user.name ?? (name || undefined) } });
    if (isSignup && name) dispatch({ type: 'updateProfile', patch: { name, email: res.user.email } });
    router.replace('/');
  };

  const submit = async () => {
    const found = validateCredentials({ email, password, name, requireName: isSignup });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy('email');
    try {
      finish(isSignup ? await signUpWithEmail(name.trim(), email, password) : await signInWithEmail(email, password));
    } finally {
      setBusy(null);
    }
  };

  const social = async (provider: 'google' | 'apple') => {
    setBusy(provider);
    try {
      finish(provider === 'google' ? await signInWithGoogle() : await signInWithApple());
    } finally {
      setBusy(null);
    }
  };

  const forgot = async () => {
    const sent = await sendPasswordReset(email);
    Alert.alert(t('auth.forgot'), sent ? email : t('auth.invalidEmail'));
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <BackgroundRings size={340} style={{ top: -120, right: -140 }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <IconButton
            icon={ArrowLeft}
            accessibilityLabel={t('common.back')}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
            style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
            testID="auth-back"
          />

          <View style={styles.heading}>
            <Text style={styles.title} accessibilityRole="header">
              {t(isSignup ? 'auth.signupTitle' : 'auth.loginTitle')}
            </Text>
            <Text style={styles.subtitle}>{t(isSignup ? 'auth.signupSubtitle' : 'auth.loginSubtitle')}</Text>
          </View>

          <View style={styles.fields}>
            {isSignup ? (
              <TextField
                label={t('auth.name')}
                placeholder={t('auth.namePlaceholder')}
                value={name}
                onChangeText={setName}
                autoComplete="name"
                textContentType="name"
                error={errors.name && t(errors.name)}
                testID="auth-name"
              />
            ) : null}
            <TextField
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              error={errors.email && t(errors.email)}
              testID="auth-email"
            />
            <TextField
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              secure
              showLabel={t('auth.showPassword')}
              hideLabel={t('auth.hidePassword')}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              textContentType={isSignup ? 'newPassword' : 'password'}
              error={errors.password && t(errors.password)}
              onSubmitEditing={submit}
              testID="auth-password"
            />

            {!isSignup ? (
              <View style={styles.row}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: remember }}
                  accessibilityLabel={t('auth.remember')}
                  onPress={() => {
                    selection();
                    setRemember((r) => !r);
                  }}
                  style={styles.remember}
                >
                  <View style={[styles.box, remember && styles.boxOn]}>
                    {remember ? <Check size={14} color={colors.onPrimary} strokeWidth={3} /> : null}
                  </View>
                  <Text style={styles.small}>{t('auth.remember')}</Text>
                </Pressable>
                <Pressable accessibilityRole="link" onPress={forgot} hitSlop={8} style={styles.linkHit}>
                  <Text style={styles.link}>{t('auth.forgot')}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          <Button
            label={t(isSignup ? 'auth.signupCta' : 'auth.loginCta')}
            onPress={submit}
            loading={busy === 'email'}
            disabled={!!busy && busy !== 'email'}
            testID="auth-submit"
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.small}>{t('auth.or')}</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialRow}>
            <Button
              variant="secondary"
              label={t('auth.google')}
              style={{ flex: 1 }}
              loading={busy === 'google'}
              onPress={() => social('google')}
              iconLeft={<Text style={styles.g}>G</Text>}
              testID="auth-google"
            />
            {Platform.OS !== 'android' ? (
              <Button
                variant="secondary"
                label={t('auth.apple')}
                style={{ flex: 1 }}
                loading={busy === 'apple'}
                onPress={() => social('apple')}
                iconLeft={<Apple size={20} color={colors.text} strokeWidth={2} />}
                testID="auth-apple"
              />
            ) : null}
          </View>

          <Pressable
            accessibilityRole="link"
            onPress={() => router.replace(isSignup ? '/auth/login' : '/auth/signup')}
            style={styles.footer}
            testID="auth-switch"
          >
            <Text style={styles.small}>
              {t(isSignup ? 'auth.haveAccount' : 'auth.noAccount')}{' '}
              <Text style={styles.footerStrong}>{t(isSignup ? 'auth.loginLink' : 'auth.signupLink')}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  content: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.xxl, gap: space.xxl },
  heading: { gap: space.sm },
  title: { ...type.display, fontSize: 38, lineHeight: 44, color: colors.text },
  subtitle: { ...type.body, color: colors.textMuted },
  fields: { gap: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  remember: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  small: { ...type.small, color: colors.textMuted },
  linkHit: { minHeight: 44, justifyContent: 'center' },
  link: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  socialRow: { flexDirection: 'row', gap: space.md },
  g: { fontFamily: fonts.heading, fontSize: 18, color: colors.text },
  footer: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
  footerStrong: { fontFamily: fonts.bodySemibold, color: colors.text },
});
