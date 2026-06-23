import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '../locales/en.json';
import tr from '../locales/tr.json';

const resources = {
  en: { translation: en },
  tr: { translation: tr },
};

const getLocales = () => Localization.getLocales();
const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
// Use Turkish if the device language is Turkish, otherwise fallback to English.
const defaultLanguage = deviceLanguage === 'tr' ? 'tr' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
