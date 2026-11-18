import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { isSupabaseConfigured, supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export type AuthUser = { id: string; email?: string; name?: string };
export type AuthResult = { ok: true; user: AuthUser } | { ok: false; error: string };

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateCredentials(input: { email: string; password: string; name?: string; requireName?: boolean }) {
  const errors: { email?: string; password?: string; name?: string } = {};
  if (input.requireName && !input.name?.trim()) errors.name = 'auth.nameRequired';
  if (!EMAIL_RE.test(input.email.trim())) errors.email = 'auth.invalidEmail';
  if (input.password.length < 8) errors.password = 'auth.shortPassword';
  return errors;
}

/** Offline/demo mode: when Supabase isn't configured, accept credentials locally. */
function localUser(email?: string, name?: string): AuthResult {
  return { ok: true, user: { id: `local-${email ?? 'guest'}`, email, name } };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return localUser(email);
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) return { ok: false, error: error?.message ?? 'auth' };
  return { ok: true, user: { id: data.user.id, email: data.user.email ?? email, name: data.user.user_metadata?.name } };
}

export async function signUpWithEmail(name: string, email: string, password: string): Promise<AuthResult> {
  if (!supabase) return localUser(email, name);
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name } } });
  if (error || !data.user) return { ok: false, error: error?.message ?? 'auth' };
  return { ok: true, user: { id: data.user.id, email: data.user.email ?? email, name } };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!supabase) return localUser(undefined, 'Google');
  const redirectTo = makeRedirectUri({ scheme: 'xoog', path: 'auth/callback' });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) return { ok: false, error: error?.message ?? 'oauth' };

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (res.type !== 'success') return { ok: false, error: 'cancelled' };

  const fragment = res.url.split('#')[1] ?? res.url.split('?')[1] ?? '';
  const params = new URLSearchParams(fragment);
  const code = params.get('code');
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  const session = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : access_token && refresh_token
      ? await supabase.auth.setSession({ access_token, refresh_token })
      : null;
  const user = session?.data.user;
  if (!user) return { ok: false, error: session?.error?.message ?? 'oauth' };
  return { ok: true, user: { id: user.id, email: user.email, name: user.user_metadata?.full_name } };
}

export async function signInWithApple(): Promise<AuthResult> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });
    const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ') || undefined;
    if (!supabase) return localUser(credential.email ?? undefined, name ?? 'Apple');
    if (!credential.identityToken) return { ok: false, error: 'apple' };
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken });
    if (error || !data.user) return { ok: false, error: error?.message ?? 'apple' };
    return { ok: true, user: { id: data.user.id, email: data.user.email, name } };
  } catch {
    return { ok: false, error: 'cancelled' };
  }
}

export async function signOut() {
  await supabase?.auth.signOut();
}

export { isSupabaseConfigured };
