/**
 * AgriLink — i18n Config
 * Path: lib/i18n/config.ts
 */

export type Locale = "en" | "bn";

export const LOCALES: Locale[] = ["en", "bn"];

export const DEFAULT_LOCALE: Locale = "en";

// Name of the cookie used to persist the user's language choice
export const LOCALE_COOKIE_NAME = "agrilink_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
};

export function isValidLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}
