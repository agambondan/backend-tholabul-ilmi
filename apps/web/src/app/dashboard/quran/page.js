'use client';

import { useLocale } from '@/context/Locale';
import { getLocalizedTranslation } from '@/lib/translation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsSearch } from 'react-icons/bs';

const FALLBACK_SURAHS = [
    { number: 1, name: 'الفاتحة', latin: 'Al-Fatihah', translation: 'Pembukaan', total_ayah: 7, type: 'makkiyyah' },
    { number: 2, name: 'البقرة', latin: 'Al-Baqarah', translation: 'Sapi Betina', total_ayah: 286, type: 'madaniyyah' },
    { number: 3, name: 'آل عمران', latin: 'Ali Imran', translation: 'Keluarga Imran', total_ayah: 200, type: 'madaniyyah' },
    { number: 4, name: 'النساء', latin: 'An-Nisa', translation: 'Wanita', total_ayah: 176, type: 'madaniyyah' },
    { number: 5, name: 'المائدة', latin: 'Al-Maidah', translation: 'Hidangan', total_ayah: 120, type: 'madaniyyah' },
    { number: 36, name: 'يس', latin: 'Ya-Sin', translation: 'Ya Sin', total_ayah: 83, type: 'makkiyyah' },
    { number: 55, name: 'الرحمن', latin: 'Ar-Rahman', translation: 'Yang Maha Pengasih', total_ayah: 78, type: 'madaniyyah' },
    { number: 67, name: 'الملك', latin: 'Al-Mulk', translation: 'Kerajaan', total_ayah: 30, type: 'makkiyyah' },
    { number: 112, name: 'الإخلاص', latin: 'Al-Ikhlas', translation: 'Ikhlas', total_ayah: 4, type: 'makkiyyah' },
    { number: 113, name: 'الفلق', latin: 'Al-Falaq', translation: 'Subuh', total_ayah: 5, type: 'makkiyyah' },
    { number: 114, name: 'الناس', latin: 'An-Nas', translation: 'Manusia', total_ayah: 6, type: 'makkiyyah' },
];

// FALLBACK uses flat fields; API uses translation.* and number_of_ayahs
const getLatinName = (s) => s.translation?.latin_en ?? s.translation?.latin_idn ?? s.latin ?? '';
const getTotalAyah = (s) => s.number_of_ayahs ?? s.total_ayah ?? '?';
const getArabicName = (s) => s.translation?.ar ?? s.name ?? '';
const DashboardQuranPage = () => {
    const { t, lang } = useLocale();
    const [surahs, setSurahs] = useState(FALLBACK_SURAHS);
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

            {loading && surahs.length <= FALLBACK_SURAHS.length && (
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
