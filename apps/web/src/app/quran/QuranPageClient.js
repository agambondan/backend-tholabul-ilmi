'use client';

import CardHorizontal from '@/components/card/CardHorizontal';
import { useLocale } from '@/context/Locale';
import Link from 'next/link';
import { useState } from 'react';
import { BsSearch } from 'react-icons/bs';

const getLatinName = (surah) =>
    surah.translation?.latin_en ?? surah.translation?.latin_idn ?? '';

const getTranslation = (surah) =>
    surah.translation?.idn ?? surah.translation?.en ?? '';

export default function QuranPageClient({ items, isError }) {
    const { t } = useLocale();
    const [search, setSearch] = useState('');

    const filtered = items.filter((surah) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
            getLatinName(surah).toLowerCase().includes(query) ||
            getTranslation(surah).toLowerCase().includes(query) ||
            String(surah.number).includes(query)
        );
    });

    return (
        <div className='container mx-auto px-4 max-w-6xl'>
            {isError && (
                <div className='flex flex-col items-center justify-center min-h-[50vh] text-center px-4'>
                    <p className='text-4xl mb-3'>⚠️</p>
                    <h2 className='text-lg font-bold text-emerald-900 dark:text-white mb-2'>
                        {t('quran.error_title')}
                    </h2>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
                        {t('quran.error_desc')}
                    </p>
                </div>
            )}
            <div className='mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
                <div>
                    <p
                        className='text-3xl text-emerald-700 dark:text-emerald-400 mb-2'
                        style={{ fontFamily: 'Amiri, serif' }}
                    >
                        الْقُرْآنُ الْكَرِيمُ
                    </p>
                    <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-1'>
                        {t('quran.title')}
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {items.length} Surah &middot; {t('quran.page_subtitle')}
                    </p>
                </div>

                <div className='relative w-full md:w-80'>
                    <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm' />
                    <input
                        type='text'
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('quran.search_placeholder')}
                        className='w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    />
                </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {filtered.map((surat) => (
                    <Link
                        key={surat.number}
                        prefetch={false}
                        href={`/quran/surah/${getLatinName(surat)}`}
                    >
                        <CardHorizontal surat={surat} />
                    </Link>
                ))}
            </div>

            {filtered.length === 0 && !isError && (
                <div className='text-center py-12'>
                    <p className='text-gray-400 text-sm'>{t('quran.not_found')}</p>
                </div>
            )}
        </div>
    );
}
