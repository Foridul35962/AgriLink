"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { translations, type AppTranslations } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, type Locale } from "@/lib/i18n/config";

type LanguageContextValue = {
  locale: Locale;
  t: AppTranslations;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale ?? DEFAULT_LOCALE
  );

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  }, []);

  return (
    <LanguageContext.Provider
      value={{ locale, t: translations[locale], setLocale }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
