import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import gu from './gu.json';
import hi from './hi.json';

const resources = {
  en: { translation: en },
  gu: { translation: gu },
  hi: { translation: hi },
};

const initI18n = async () => {
  let language = 'en';
  try {
    const savedLanguage = await AsyncStorage.getItem('appLanguage');
    if (savedLanguage) {
      language = savedLanguage;
    }
  } catch (error) {
    console.error('Error loading language', error);
  }

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
