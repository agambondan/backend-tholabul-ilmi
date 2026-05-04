'use client';

import CardHorizontal from '@/components/card/CardHorizontal';
import { useLocale } from '@/context/Locale';
import Link from 'next/link';

export default function QuranPageClient({ items, isError }) {
    const { t } = useLocale();

    return (
        <div className='container mx-auto px-4'>
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
            <div className='text-center mb-8'>
                <p
                    className='text-3xl text-emerald-700 dark:text-emerald-400 mb-2'
                    style={{ fontFamily: 'Amiri, serif' }}
                >
                    الْقُرْآنُ الْكَرِيمُ
                </p>
                <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                    {t('quran.title')}
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {items.length} Surah &middot; {t('quran.page_subtitle')}
                </p>
            </div>
            <div className='grid 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1'>
                {items.map((surat) => (
                    <Link
                        key={surat.number}
                        prefetch={false}
                        href={`/quran/surah/${surat.translation?.latin_en ?? surat.translation?.latin_idn ?? ''}`}
                    >
                        <CardHorizontal surat={surat} />
                    </Link>
                ))}
            </div>
        </div>
    );
}
