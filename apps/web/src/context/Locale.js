'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translations } from '@/lib/i18n';

const LocaleContext = createContext({
    lang: 'ID',
    setLang: () => {},
    t: (k) => k,
});

export function LocaleProvider({ children }) {
    const [lang, setLangState] = useState('ID');

    useEffect(() => {
        const saved = localStorage.getItem('lang')?.toUpperCase();
        if (saved === 'ID' || saved === 'EN') setLangState(saved);
    }, []);

    const setLang = useCallback((l) => {
        const upper = String(l).toUpperCase();
        setLangState(upper);
        localStorage.setItem('lang', upper);
    }, []);

    const t = useCallback(
        (key) => translations[lang]?.[key] ?? translations['ID'][key] ?? key,
        [lang],
    );

    return (
        <LocaleContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export const useLocale = () => useContext(LocaleContext);
