import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import fr from '../locales/fr.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
} as const;

type AvailableLanguages = keyof typeof resources;

let isInitialized = false;

export const initI18n = async () => {
  if (isInitialized) return;

  let savedLanguage: string | null = null;
  
  try {
    savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (error) {
    console.error('Error loading saved language:', error);
  }
  
  let initialLanguage: AvailableLanguages = 'en';
  
  if (savedLanguage && savedLanguage in resources) {
    initialLanguage = savedLanguage as AvailableLanguages;
  } else {
    try {
      const deviceLocale = Localization.locale || Localization.getLocales()[0]?.languageCode || 'en';
      const deviceLanguage = deviceLocale.split('-')[0];
      if (deviceLanguage in resources) {
        initialLanguage = deviceLanguage as AvailableLanguages;
      }
    } catch (error) {
      console.error('Error getting device locale:', error);
    }
  }

  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  isInitialized = true;
};

export const changeLanguage = async (language: string) => {
  if (!isInitialized) {
    await initI18n();
  }
  
  if (!(language in resources)) {
    throw new Error(`Language ${language} is not supported`);
  }
  
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
};

export const isLanguageSupported = (language: string): language is AvailableLanguages => {
  return language in resources;
};

export default i18n;