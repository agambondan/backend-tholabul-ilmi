'use client';

import { useLocale } from '@/context/Locale';
import { getLocalizedTranslation } from '@/lib/translation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsSearch } from 'react-icons/bs';

const FALLBACK = [
    { number: 1, name: 'الفاتحة', latin: 'Al-Fatihah', translation: 'Pembukaan', total_ayah: 7 },
    { number: 2, name: 'البقرة', latin: 'Al-Baqarah', translation: 'Sapi Betina', total_ayah: 286 },
    { number: 3, name: 'آل عمران', latin: 'Ali Imran', translation: 'Keluarga Imran', total_ayah: 200 },
    { number: 36, name: 'يس', latin: 'Ya-Sin', translation: 'Ya Sin', total_ayah: 83 },
    { number: 67, name: 'الملك', latin: 'Al-Mulk', translation: 'Kerajaan', total_ayah: 30 },
    { number: 112, name: 'الإخلاص', latin: 'Al-Ikhlas', translation: 'Ikhlas', total_ayah: 4 },
];

export default function DashboardTafsirPage() {
    const { t, lang } = useLocale();
    const [surahs, setSurahs] = useState(FALLBACK);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/surah?size=114&sort=number`)
            .then((r) => r.json())
            .then((d) => {
                const arr = d?.items ?? d ?? [];
                if (Array.isArray(arr) && arr.length > 0) setSurahs(arr);
            })
            .catch(() => {});
    }, []);

    const filtered = surahs.filter((s) => {
        const q = search.toLowerCase();
        return (
            !search ||
            s.latin?.toLowerCase().includes(q) ||
            s.name?.includes(search) ||
            String(s.number).includes(search)
        );
    });

    return (
        <div className='p-6'>
            <div className='mb-6'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                    {t('tafsir.title')}
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>
                    {surahs.length} surah
                </p>
            </div>

            {/* Search */}
            <div className='relative mb-6 max-w-sm'>
                <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                    type='text'
                    placeholder={t('tafsir.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-700'
                />
            </div>

            {/* Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
                {filtered.map((s) => (
                    <Link
                        key={s.number}
                        href={`/dashboard/tafsir/${encodeURIComponent(s.translation?.latin_en ?? s.identifier ?? s.latin ?? s.number)}`}
                        className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-sm transition-all p-4 group'>
                        <div className='flex items-start justify-between mb-2'>
                            <span className='w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0'>
                                {s.number}
                            </span>
                            <span className='text-xs text-gray-400 dark:text-gray-500'>
                                {s.total_ayah ?? s.total_verses} {t('common.verse')}
                            </span>
                        </div>
                        <p
                            dir='rtl'
                            className='font-arabic text-lg text-gray-800 dark:text-gray-200 leading-loose text-right mb-1'>
                            {s.name}
                        </p>
                        <p className='text-sm font-semibold text-gray-800 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors'>
                            {s.translation?.latin_en ?? s.identifier ?? s.latin}
                        </p>
                        <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                            {getLocalizedTranslation(s.translation, lang)}
                        </p>
                    </Link>
                ))}
                {filtered.length === 0 && (
                    <p className='col-span-full text-center py-10 text-gray-400 text-sm'>
                        {t('common.no_results')}
                    </p>
                )}
            </div>
        </div>
    );
}
