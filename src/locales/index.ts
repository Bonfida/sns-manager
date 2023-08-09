// Importing translation messages for each language
import { messages as enMessages } from "./en/messages";
import { messages as krMessages } from "./kr/messages";
import { messages as zh_HansMessages } from "./zh-Hans/messages";
import { messages as frMessages } from "./fr/messages";
import { messages as trMessages } from "./tr/messages";
import { messages as esMessages } from "./es/messages";

// Define a type for language with label, locale and messages
export type Language = {
  label: string;
  locale: string;
  messages: Record<string, string>;
};

// Define a list of supported languages. Update this list to support more languages.
// Used primarily in the modal to select languages.
export const LANGUAGES: Language[] = [
  // English
  { locale: "en", label: "English", messages: enMessages },
  // Korean
  { locale: "kr", label: "한국어", messages: krMessages },
  // Simplified Chinese
  {
    locale: "zh-Hans",
    label: "中文(简体)",
    messages: zh_HansMessages,
  },
  { locale: "fr", label: "Français", messages: frMessages },
  { locale: "tr", label: "Türkçe", messages: trMessages },
  { locale: "es", label: "Español", messages: esMessages },
];

// format so we can import directly into lingui's i18n.load()
export const allTranslations = Object.fromEntries(
  LANGUAGES.map(({ locale, messages }) => [locale, messages])
);

// export all available locales for lingui.config.js
export const allLocales = LANGUAGES.map(({ locale }) => locale);
