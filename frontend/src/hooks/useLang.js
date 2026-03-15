// frontend/src/hooks/useLang.js
// Wrapper de compatibilité — utilise react-i18next en interne
import { useTranslation } from 'react-i18next'

export const LANGUAGES = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
]

export function useLang() {
  const { t, i18n } = useTranslation()

  function changeLang(code) {
    i18n.changeLanguage(code)
    localStorage.setItem('visitbenin_lang', code)
  }

  return { lang: i18n.language, changeLang, t, LANGUAGES }
}

// Exports de compatibilité pour les anciens imports directs
export function getLang() {
  return localStorage.getItem('visitbenin_lang') || 'fr'
}

export function setLang(code) {
  localStorage.setItem('visitbenin_lang', code)
}

export function onLangChange(cb) {
  // no-op — react-i18next gère les re-renders automatiquement
  return () => {}
}

export function t(key) {
  // Fallback statique minimal (utilisé hors composant React)
  return key
}
