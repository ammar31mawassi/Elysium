import React, { createContext, useContext, useState, useEffect } from 'react';
import { t as translations, languages } from './i18n';

const LanguageContext = createContext(null);

// Convert raw key to readable fallback: "tools_gpa_calc" → "Tools Gpa Calc"
function keyToReadable(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('elysium_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('elysium_lang', locale);
    const dir = languages[locale]?.dir || 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const tFn = (key) =>
    translations[locale]?.[key] ??
    translations['en']?.[key] ??
    keyToReadable(key);

  const isRTL = languages[locale]?.dir === 'rtl';

  return (
    <LanguageContext.Provider value={{
      locale, setLocale,
      // legacy aliases
      lang: locale, setLang: setLocale,
      t: tFn, tr: tFn,
      isRTL, languages,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}