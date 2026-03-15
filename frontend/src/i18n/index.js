// frontend/src/i18n/index.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import frCommon from './locales/fr/common.json'
import enCommon from './locales/en/common.json'
import esCommon from './locales/es/common.json'
import ptCommon from './locales/pt/common.json'

const resources = {
  fr: { common: frCommon },
  en: { common: enCommon },
  es: { common: esCommon },
  pt: { common: ptCommon },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'visitbenin_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    supportedLngs: ['fr', 'en', 'es', 'pt'],
    load: 'languageOnly',
    react: {
      useSuspense: false,
    },
  })

export default i18n
