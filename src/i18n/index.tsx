import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import en from './en.json';
import so from './so.json';

export type Language = 'so' | 'en';
export const dictionaries = { so, en } as const;

type Params = Record<string, string | number>;
const STORAGE_KEY = 'xoog.language';

function lookup(dict: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
}

function interpolate(text: string, params?: Params) {
  if (!params) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{{${name}}}`,
  );
}

/** Pure translator — falls back to Somali, then to the key itself. */
export function translate(lang: Language, key: string, params?: Params): string {
  const value = lookup(dictionaries[lang], key) ?? lookup(dictionaries.so, key);
  return typeof value === 'string' ? interpolate(value, params) : key;
}

/** Returns a raw array/object entry (e.g. day-name lists). */
export function translateList(lang: Language, key: string): string[] {
  const value = lookup(dictionaries[lang], key) ?? lookup(dictionaries.so, key);
  return Array.isArray(value) ? (value as string[]) : [];
}

type I18nValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Params) => string;
  tl: (key: string) => string[];
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children, initialLang = 'so' }: { children: ReactNode; initialLang?: Language }) {
  const [lang, setLangState] = useState<Language>(initialLang);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'so' || stored === 'en') setLangState(stored);
      })
      .catch(() => undefined);
  }, []);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, params) => translate(lang, key, params),
      tl: (key) => translateList(lang, key),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Allows components to render in isolation (tests, storybook) with Somali copy.
    return {
      lang: 'so' as Language,
      setLang: () => undefined,
      t: (key: string, params?: Params) => translate('so', key, params),
      tl: (key: string) => translateList('so', key),
    };
  }
  return ctx;
}
