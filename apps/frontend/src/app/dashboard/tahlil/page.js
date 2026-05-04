'use client';

import { useLocale } from '@/context/Locale';
import { useEffect, useState } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

const FALLBACK = [
    {
        step: 1,
        title: 'Pembukaan - Al-Fatihah',
        arabic: 'بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismillaahir rahmaanir rahiim',
        translation: 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang',
    },
    {
        step: 2,
        title: 'Al-Ikhlas (3x)',
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        transliteration: 'Qul huwallahu ahad',
        translation: 'Katakanlah: Dialah Allah yang Maha Esa',
    },
    {
        step: 3,
        title: 'Tahlil',
        arabic: 'لَا إِلَٰهَ إِلَّا اللَّٰهُ',
        transliteration: 'Laa ilaaha illallah',
        translation: 'Tiada Tuhan selain Allah',
    },
];

const getTranslation = (v) =>
    typeof v === 'string' ? v : (v?.idn ?? v?.en ?? '');

export default function DashboardTahlilPage() {
    const { t } = useLocale();
    const [items, setItems] = useState(FALLBACK);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tahlil?page=0&size=100`)
            .then((r) => r.json())
            .then((d) => {
                const arr = d?.items ?? d ?? [];
                if (Array.isArray(arr) && arr.length > 0) {
                    setItems([...arr].sort((a, b) => (a.step ?? 0) - (b.step ?? 0)));
                }
            })
            .catch(() => {});
    }, []);

    return (
        <div className='p-6'>
            <div className='mb-6'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                    {t('tahlil.title')}
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>
                    {items.length} {t('tahlil.reading_suffix')}
                </p>
            </div>

            <div className='space-y-2'>
                {items.map((item) => {
                    const id = item.id ?? item._id ?? item.step;
                    const open = expanded === id;
                    return (
                        <div
                            key={id}
                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
                            <button
                                onClick={() => setExpanded(open ? null : id)}
                                className='w-full text-left px-4 py-3 flex items-center justify-between gap-3'>
                                <div className='flex items-center gap-3'>
                                    <span className='w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-bold flex items-center justify-center shrink-0'>
                                        {item.step}
                                    </span>
                                    <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                                        {item.title}
                                    </span>
                                </div>
                                {open ? (
                                    <BsChevronUp className='text-gray-400 shrink-0' />
                                ) : (
                                    <BsChevronDown className='text-gray-400 shrink-0' />
                                )}
                            </button>
                            {open && (
                                <div className='px-4 pb-4 border-t border-gray-50 dark:border-slate-700 pt-3 space-y-2'>
                                    {item.arabic && (
                                        <p
                                            dir='rtl'
                                            className='text-xl font-arabic leading-loose text-gray-800 dark:text-gray-200 text-right'>
                                            {item.arabic}
                                        </p>
                                    )}
                                    {item.transliteration && (
                                        <p className='text-sm italic text-gray-500 dark:text-gray-400'>
                                            {item.transliteration}
                                        </p>
                                    )}
                                    {getTranslation(item.translation) && (
                                        <p className='text-sm text-gray-700 dark:text-gray-300'>
                                            {getTranslation(item.translation)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
