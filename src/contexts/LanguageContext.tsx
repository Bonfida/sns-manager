import { useState, useContext, createContext, useEffect } from "react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { allTranslations } from "../locales";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the type of i18n for better type safety
type i18nType = typeof i18n;

// Define the type for the language context
type LanguageContextType = {
  currentLanguage: string;
  setLanguage: (language: string) => void;
};

// Create a context for the language
const LanguageContext = createContext<LanguageContextType | null>(null);
const LanguageProvider = ({
  i18n,
  children,
}: {
  i18n: i18nType;
  children: React.ReactNode;
}) => {
  // Define a state for the current language
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    i18n.locale || "en",
  );

  const setLanguage = async (language: string) => {
    try {
      await AsyncStorage.setItem("appLanguage", language); // Save language in AsyncStorage
      i18n.activate(language);
      setCurrentLanguage(language);
    } catch (error) {
      // Error saving data
      console.log(error);
    }
  };

  // On component mount, load all translations and set the default language
  useEffect(() => {
    const getLanguage = async () => {
      try {
        const value = await AsyncStorage.getItem("appLanguage"); // Get saved language
        if (value !== null) {
          setLanguage(value); // If found, set the saved language
        } else {
          setLanguage("en"); // If not found, default to English
        }
      } catch (error) {
        // Error retrieving data
        console.log(error);
      }
    };

    i18n.load(allTranslations);
    getLanguage();
  }, []);

  // Return the context provider with the current language and the setter function
  return (
    <I18nProvider i18n={i18n}>
      <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
        {children}
      </LanguageContext.Provider>
    </I18nProvider>
  );
};

// Define a custom hook to access the language context
const useLanguageContext = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
};

// EXPORTS
export type { i18nType, LanguageContextType };
export { LanguageContext, LanguageProvider, useLanguageContext };
