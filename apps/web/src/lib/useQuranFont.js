'use client';

import { useEffect, useState } from 'react';

const FONT_KEY = 'quranFont';

export const QURAN_FONTS = [
    { id: 'kitab', label: 'Uthmani', cls: 'font-kitab' },
    { id: 'indopak', label: 'Indopak', cls: 'font-nh' },
    { id: 'naskh', label: 'Naskh', cls: 'font-scheherazade' },
];

const DEFAULT_FONT = QURAN_FONTS[0];

export const useQuranFont = () => {
    const [fontId, setFontId] = useState(DEFAULT_FONT.id);

    useEffect(() => {
        const stored = localStorage.getItem(FONT_KEY);
        if (stored && QURAN_FONTS.find((f) => f.id === stored)) {
            setFontId(stored);
        }
        const handler = (e) => {
            if (e.key === FONT_KEY && QURAN_FONTS.find((f) => f.id === e.newValue)) {
                setFontId(e.newValue);
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    const setFont = (id) => {
        localStorage.setItem(FONT_KEY, id);
        window.dispatchEvent(new StorageEvent('storage', { key: FONT_KEY, newValue: id }));
        setFontId(id);
    };

    const current = QURAN_FONTS.find((f) => f.id === fontId) ?? DEFAULT_FONT;
    return { fontId, fontCls: current.cls, setFont };
};
