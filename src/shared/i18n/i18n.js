import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { es } from './locales/es.js';
import { en } from './locales/en.js';

const resources = {
  es,
  en
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('naari_language') || 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;