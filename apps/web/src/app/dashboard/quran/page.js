'use client';

import { useLocale } from '@/context/Locale';
import { getLocalizedTranslation } from '@/lib/translation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsBookHalf, BsSearch } from 'react-icons/bs';

const getLatinName = (s) => s.translation?.latin_en ?? s.translation?.latin_idn ?? s.latin ?? '';
const getTotalAyah = (s) => s.number_of_ayahs ?? s.total_ayah ?? '?';
const getArabicName = (s) => s.translation?.ar ?? s.name ?? '';
const DashboardQuranPage = () => {
    const { t, lang } = useLocale();
    const [surahs, setSurahs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/surah?size=114&sort=number`)
            .then((r) => r.json())
            .then((data) => {
                const items = data?.items ?? data ?? [];
                if (items.length > 0) setSurahs(items);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = surahs.filter((s) => {
        const q = search.toLowerCase();
        return (
            getLatinName(s).toLowerCase().includes(q) ||
            getLocalizedTranslation(s.translation, lang).toLowerCase().includes(q) ||
            String(s.number).includes(search)
        );
    });

    return (
        <div className='p-6'>
            <div className='mb-6'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>{t('quran.title')}</h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>
                    {surahs.length} Surah · 30 Juz
                </p>
            </div>

            {/* Mushaf navigator shortcut */}
            <Link
                href='/dashboard/quran/page-mushaf'
                className='flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-5 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors group'
            >
                <BsBookHalf className='text-2xl text-emerald-600 dark:text-emerald-400 shrink-0' />
                <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-emerald-800 dark:text-emerald-300 group-hover:underline'>
                        {t('mushaf.title')}
                    </p>
                    <p className='text-xs text-emerald-600 dark:text-emerald-500 truncate'>
                        {t('mushaf.subtitle')}
                    </p>
                </div>
                <span className='text-emerald-400 dark:text-emerald-600 text-sm'>›</span>
            </Link>

            {/* Search */}
            <div className='relative mb-5 max-w-xs'>
                <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm' />
                <input
                    type='text'
                    placeholder={t('quran.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                />
            </div>

            {loading && (
                <p className='text-xs text-gray-400 mb-3'>{t('quran.loading')}</p>
            )}

            {/* Surah grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {filtered.map((s) => (
                    <Link
                        key={s.number}
                        href={`/dashboard/quran/${getLatinName(s)}`}
                        className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-sm transition-all p-4 flex items-center gap-3 group'
                    >
                        {/* Number badge */}
                        <div className='w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0'>
                            <span className='text-xs font-bold text-emerald-700 dark:text-emerald-400'>
                                {s.number}
                            </span>
                        </div>

                        {/* Info */}
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate'>
                                {getLatinName(s)}
                            </p>
                            <p className='text-xs text-gray-400 dark:text-gray-500 truncate'>
                                {getLocalizedTranslation(s.translation, lang)} · {getTotalAyah(s)} {t('common.verse')}
                            </p>
                        </div>

                        {/* Arabic name */}
                        <span className='text-base text-gray-500 dark:text-gray-400 shrink-0 arabic-text'>
                            {getArabicName(s)}
                        </span>
                    </Link>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className='text-center py-12'>
                    <p className='text-gray-400 text-sm'>{t('quran.not_found')}</p>
                </div>
            )}
        </div>
    );
};

export default DashboardQuranPage;
