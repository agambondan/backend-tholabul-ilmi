'use client';

import SourceBadges from '@/components/SourceBadges';
import { dzikirApi } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale } from '@/context/Locale';

const CATEGORIES = ['pagi', 'petang', 'sesudah-sholat', 'sebelum-tidur', 'umum'];

const FALLBACK_DZIKIR = [
    {
        id: 'f1',
        title: 'Tasbih',
        arabic: 'سُبْحَانَ اللهِ',
        transliteration: 'Subhanallah',
        translation: 'Maha Suci Allah',
        count: 33,
        category: 'umum',
    },
    {
        id: 'f2',
        title: 'Tahmid',
        arabic: 'الْحَمْدُ لِلَّهِ',
        transliteration: 'Alhamdulillah',
        translation: 'Segala Puji Bagi Allah',
        count: 33,
        category: 'umum',
    },
    {
        id: 'f3',
        title: 'Takbir',
        arabic: 'اللهُ أَكْبَرُ',
        transliteration: 'Allahu Akbar',
        translation: 'Allah Maha Besar',
        count: 33,
        category: 'umum',
    },
    {
        id: 'f4',
        title: 'Hauqalah',
        arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
        transliteration: "La hawla wa la quwwata illa billah",
        translation: 'Tidak ada daya dan kekuatan kecuali milik Allah',
        count: 1,
        category: 'umum',
    },
    {
        id: 'f5',
        title: 'Istighfar',
        arabic: 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ',
        transliteration: 'Astaghfirullahal adzim',
        translation: 'Aku memohon ampun kepada Allah Yang Maha Agung',
        count: 100,
        category: 'umum',
    },
];

const CAT_COLORS = {
    pagi: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    petang: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    'sesudah-sholat': 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    'sebelum-tidur': 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
    umum: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300',
};

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

const DashboardDzikirPage = () => {
    const { t } = useLocale();
    const [items, setItems] = useState(FALLBACK_DZIKIR);
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const fetch = () => {
            setLoading(true);
            const call = category
                ? dzikirApi.byCategory(category, 0, 100)
                : dzikirApi.list(0, 100);
            call
                .then((r) => r.json())
                .then((data) => {
                    const arr = data?.items ?? data ?? [];
                    if (arr.length > 0) setItems(arr);
                    else if (!category) setItems(FALLBACK_DZIKIR);
                })
                .catch(() => {
                    if (!category) setItems(FALLBACK_DZIKIR);
                })
                .finally(() => setLoading(false));
        };
        fetch();
    }, [category]);

    const getTranslation = (v) =>
        typeof v === 'string' ? v : (v?.idn ?? v?.en ?? '');

    return (
        <div className='p-6'>
            <div className='mb-5 flex items-start justify-between'>
                <div>
                    <h1 className='text-xl font-bold text-gray-900 dark:text-white'>{t('dzikir.title')}</h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('dzikir.subtitle')}
                    </p>
                </div>
            </div>

            {/* Category filter */}
            <div className='flex flex-wrap gap-2 mb-5'>
                <button
                    onClick={() => setCategory('')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        category === ''
                            ? 'bg-emerald-700 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                >
                    {t('common.all')}
                </button>
                {CATEGORIES.map((c) => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                            category === c
                                ? 'bg-emerald-700 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {loading && <p className='text-xs text-gray-400 mb-3'>{t('dzikir.loading')}</p>}

            {/* Dzikir list */}
            <div className='space-y-3'>
                {items.map((item) => {
                    const id = item.id ?? item._id;
                    const isOpen = expanded === id;
                    return (
                        <div
                            key={id}
                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'
                        >
                            <button
                                onClick={() => setExpanded(isOpen ? null : id)}
                                className='w-full text-left p-4 flex items-center justify-between gap-3'
                            >
                                <div className='flex items-center gap-3'>
                                    {item.count && (
                                        <span className='w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0'>
                                            {item.count}×
                                        </span>
                                    )}
                                    <div>
                                        <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                                            {item.title}
                                        </p>
                                        {item.category && (
                                            <span
                                                className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${CAT_COLORS[toStr(item.category)] ?? CAT_COLORS.umum}`}
                                            >
                                                {toStr(item.category)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className='text-base arabic-text text-gray-500 dark:text-gray-400 shrink-0'>
                                    {item.arabic?.slice(0, 20)}
                                    {(item.arabic?.length ?? 0) > 20 ? '...' : ''}
                                </span>
                            </button>

                            {isOpen && (
                                <div className='px-4 pb-4 border-t border-gray-50 dark:border-slate-700 pt-3 space-y-2'>
                                    {item.arabic && (
                                        <p
                                            dir='rtl'
                                            className='text-xl text-gray-800 dark:text-gray-200 leading-loose arabic-text text-right'
                                        >
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
                                    <SourceBadges source={item.source} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {items.length === 0 && !loading && (
                <div className='text-center py-12'>
                    <p className='text-gray-400 text-sm'>{t('dzikir.empty')}</p>
                </div>
            )}
        </div>
    );
};

export default DashboardDzikirPage;
