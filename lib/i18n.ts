import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import tr from '../locales/tr.json';

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

const LANGUAGE_KEY = 'app_language';

const languageDetector: any = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (storedLanguage) {
        return callback(storedLanguage);
      }
      
      // Right now it should open directly in English
      return callback('en');
    } catch (e) {
      return callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    } catch (e) {}
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export const changeLanguage = async (lng: string) => {
  await i18n.changeLanguage(lng);
  await AsyncStorage.setItem(LANGUAGE_KEY, lng);
};

export default i18n;
