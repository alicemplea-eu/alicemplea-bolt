import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { translations } from './translations';
import type { Dict, Lang } from './translations';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  isRtl: boolean;
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
  isRtl: false,
});

const STORAGE_KEY = 'alicemplea.lang';

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in translations) return saved as Lang;
  } catch {
    // storage unavailable
  }
  const candidates = navigator.languages ?? [navigator.language];
  for (const tag of candidates) {
    const base = (tag || '').toLowerCase().split('-')[0];
    if (base in translations) return base as Lang;
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectLang());
  const isRtl = lang === 'ar';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // storage unavailable
    }
  }, [lang, isRtl]);

  return (
    <LangContext.Provider value={{ lang, setLang: setLangState, t: translations[lang], isRtl }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
