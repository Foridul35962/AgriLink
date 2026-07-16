import en from "./translations/en";
import bn from "./translations/bn";
import type { Locale } from "./config";
import type { AppTranslations } from "./types";

export const translations: Record<Locale, AppTranslations> = { en, bn };

export * from "./config";
export type { AppTranslations } from "./types";
