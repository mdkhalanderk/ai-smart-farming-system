// Centralized Multi-lingual i18n system using i18next and react-i18next
// Supports English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी)
import React, { useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation as useI18nTranslation } from 'react-i18next';

import en from '../locales/en.js';
import kn from '../locales/kn.js';
import hi from '../locales/hi.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'English', id: 'en', label: 'English', native: 'English' },
  { code: 'Kannada', id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'Hindi', id: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export const normalizeLang = (lang) => {
  if (!lang) return getSavedLanguage();
  const lower = String(lang).trim().toLowerCase();
  if (lower === 'kannada' || lower === 'kn' || lower === 'ka') return 'Kannada';
  if (lower === 'hindi' || lower === 'hi') return 'Hindi';
  return 'English';
};

export const mapToI18nCode = (lang) => {
  const normalized = normalizeLang(lang);
  if (normalized === 'Kannada') return 'kn';
  if (normalized === 'Hindi') return 'hi';
  return 'en';
};

const LANG_STORAGE_KEY = 'smart_crop_lang';

export const getSavedLanguage = () => {
  try {
    const val = localStorage.getItem(LANG_STORAGE_KEY);
    return val ? normalizeLang(val) : 'English';
  } catch {
    return 'English';
  }
};

const savedLanguage = getSavedLanguage();
const initialI18nCode = mapToI18nCode(savedLanguage);

// Initialize i18next singleton
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        kn: { translation: kn },
        hi: { translation: hi }
      },
      lng: initialI18nCode,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    });
}

export const setSavedLanguage = (lang) => {
  try {
    const normalized = normalizeLang(lang);
    const code = mapToI18nCode(normalized);
    localStorage.setItem(LANG_STORAGE_KEY, normalized);
    i18n.changeLanguage(code);
    window.dispatchEvent(new CustomEvent('app-language-changed', { detail: normalized }));
  } catch (e) {
    console.warn('Failed to save language in localStorage:', e);
  }
};

export const translations = {
  English: en,
  Kannada: kn,
  Hindi: hi
};

// Global backward-compatible t helper
export const t = (key, lang = null, params = {}) => {
  if (!key) return '';
  const activeLang = normalizeLang(lang);
  const dict = translations[activeLang] || translations.English;
  const lowerKey = String(key).trim().toLowerCase();

  let text = dict[key] || dict[lowerKey] || translations.English[key] || translations.English[lowerKey] || i18n.t(key);
  if (!text || text === key) {
    text = translations.English[key] || translations.English[lowerKey] || key;
  }

  // Parameter replacement e.g. {name}, {district}, {count}
  if (params && typeof params === 'object') {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal ?? '');
    }
  }
  return text;
};

// React Hook for immediate reactive re-rendering when language toggles
export const useLanguage = () => {
  const [lang, setLang] = useState(() => getSavedLanguage());
  const { t: i18nT } = useI18nTranslation();

  useEffect(() => {
    const handleLangChange = (e) => {
      if (e?.detail) {
        const norm = normalizeLang(e.detail);
        setLang(norm);
        i18n.changeLanguage(mapToI18nCode(norm));
      }
    };

    window.addEventListener('app-language-changed', handleLangChange);
    return () => {
      window.removeEventListener('app-language-changed', handleLangChange);
    };
  }, []);

  const changeLanguage = (newLang) => {
    const norm = normalizeLang(newLang);
    setLang(norm);
    setSavedLanguage(norm);
  };

  const translate = (key, params = {}) => t(key, lang, params);

  return { language: lang, setLanguage: changeLanguage, t: translate, i18nT };
};

export { i18n, useI18nTranslation as useTranslation };
export default i18n;
