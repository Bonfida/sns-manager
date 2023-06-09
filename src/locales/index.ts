// Importing translation messages for each language
import { messages as enMessages } from "./en/messages";
import { messages as krMessages } from "./kr/messages";
import { messages as zh_HansMessages } from "./zh-Hans/messages";

// Define a type for language with label, value and messages
export type Language = {
  label: string;
  value: string;
  messages: Record<string, string>;
};

// languages object maps language codes to language data
// For each language, we provide its label (human-readable name), value (code), and translation file (messages)
export const languages: Record<string, Language> = {
  en: {
    label: "English",
    value: "en",
    messages: enMessages,
  },
  kr: {
    label: "한글",
    value: "kr",
    messages: krMessages,
  },
  "zh-Hans": {
    label: "中文简体",
    value: "zh-Hans",
    messages: zh_HansMessages,
  },
};

// format so we can import directly into lingui's i18n.load()
export const allTranslations = Object.fromEntries(
  Object.values(languages).map(({ value, messages }) => [value, messages])
);

// supportedLanguages is an array of all languages
export const supportedLanguages: Language[] = Object.values(languages);
