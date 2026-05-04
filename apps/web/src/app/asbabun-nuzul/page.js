'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonInline } from '@/components/skeleton/Skeleton';
import { asbabunNuzulApi } from '@/lib/api';
import { useLocale } from '@/context/Locale';
import Link from 'next/link';
import { useState } from 'react';
import { BsSearch } from 'react-icons/bs';

const SURAH_COUNT = 114;
const QUICK_SURAH = [1, 2, 4, 18, 36, 67, 112];

const AsbabunNuzulPage = () => {
    const { t } = useLocale();
    const [surahNumber, setSurahNumber] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const num = parseInt(surahNumber, 10);
        if (!num || num < 1 || num > SURAH_COUNT) {
            setError(t('asbabun.validate_error'));
            return;
        }
        setIsLoading(true);
        setError('');
        setSearched(true);
        try {
            const res = await asbabunNuzulApi.bySurah(num);
            if (!res.ok) throw new Error('fetch failed');
            const d = await res.json();
            setResults(Array.isArray(d) ? d : d.data ?? []);
        } catch {
            setError(t('asbabun.load_error'));
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-3xl'>
                    <div className='text-center mb-8'>
                        <p
                            className='text-3xl text-emerald-700 dark:text-emerald-400 mb-2'
                            style={{ fontFamily: 'Amiri, serif' }}
                        >
                            أَسْبَابُ النُّزُول
                        </p>
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            {t('asbabun.title')}
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {t('asbabun.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className='flex items-center gap-3 mb-8'>
                        <div className='flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                            <BsSearch className='text-gray-400 shrink-0' />
                            <input
                                type='number'
                                min='1'
                                max='114'
                                value={surahNumber}
                                onChange={(e) => setSurahNumber(e.target.value)}
                                placeholder={t('asbabun.placeholder')}
                                className='flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none'
                            />
                        </div>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 disabled:opacity-50 transition-colors'
                        >
                            {isLoading ? '...' : t('asbabun.search_btn')}
                        </button>
                    </form>

                    <div className='mb-5'>
                        <p className='text-xs text-gray-400 dark:text-gray-500 mb-2'>
                            {t('asbabun.quick_example')}
                        </p>
                        <div className='flex gap-2 flex-wrap'>
                            {QUICK_SURAH.map((num) => (
                                <button
                                    key={num}
                                    type='button'
                                    onClick={() => setSurahNumber(String(num))}
                                    className='px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-slate-600 transition-colors'
                                >
                                    {t('asbabun.surah_prefix')} {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className='mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm'>
                            {error}
                        </div>
                    )}

                    {isLoading && <SkeletonInline rows={4} />}

                    {!isLoading && searched && results.length === 0 && !error && (
                        <div className='text-center py-16 text-gray-400 dark:text-gray-600 text-sm bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
                            <p className='mb-2'>{t('asbabun.no_data_title')}</p>
                            <p className='text-xs'>
                                {t('asbabun.no_data_hint')}
                            </p>
                        </div>
                    )}

                    {!isLoading && !searched && (
                        <div className='text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
                            <p className='text-gray-400 dark:text-gray-600 text-sm mb-6'>
                                {t('asbabun.enter_surah')}
                            </p>
                            <p className='text-xs text-gray-400 dark:text-gray-600'>
                                {t('asbabun.source')}
                            </p>
                        </div>
                    )}

                    <div className='space-y-4'>
                        {results.map((item) => (
                            <div
                                key={item.id}
                                className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5'
                            >
                                <div className='flex items-center gap-2 mb-3'>
                                    <Link
                                        href={`/quran/${surahNumber}/${item.ayah_number ?? ''}`}
                                        className='text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-100 transition-colors'
                                    >
                                        {t('asbabun.ayah_prefix')} {item.ayah_number ?? item.ayah_id}
                                    </Link>
                                    {item.source && (
                                        <span className='text-xs text-gray-400 dark:text-gray-500'>
                                            {item.source}
                                        </span>
                                    )}
                                </div>
                                <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
                                    {item.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default AsbabunNuzulPage;
