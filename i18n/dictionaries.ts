import en from "@/translations/en.json";
import fr from "@/translations/fr.json";

export const dictionaries = { en, fr };

export type Locale = keyof typeof dictionaries;

export const defaultLocale: Locale = "fr";

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale];
}
