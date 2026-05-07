'use client';

import Footer from '@/components/Footer';
import GradeBadge from '@/components/GradeBadge';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonInline } from '@/components/skeleton/Skeleton';
import { useLocale } from '@/context/Locale';
import { useLayoutMode } from '@/lib/useLayoutMode';
import { searchApi } from '@/lib/api';
import { getLocalizedTranslation } from '@/lib/translation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BsSearch } from 'react-icons/bs';

const normalizeItems = (data, key) => data?.[key] ?? data?.[`${key}s`] ?? [];

const getAyahMeta = (item, lang) => ({
    surahSlug: item?.surah?.translation?.latin_en ?? item?.surah_latin ?? '',
    surahName:
        getLocalizedTranslation(item?.surah?.translation, lang) ||
        item?.surah?.translation?.latin_en ||
        '',
    number: item?.number ?? '',
    arabic: item?.translation?.ar ?? item?.ar ?? '',
    latin: item?.translation?.latin_idn ?? item?.translation?.latin_en ?? '',
    meaning: getLocalizedTranslation(item?.translation, lang) || item?.idn || '',
});

const getHadithMeta = (item, lang) => ({
    bookSlug: item?.book?.slug ?? item?.book_slug ?? '',
    bookName:
        getLocalizedTranslation(item?.book?.translation, lang) ||
        item?.book?.translation?.latin_en ||
        item?.book_slug ||
        '',
    number: item?.number ?? '',
    arabic: item?.translation?.ar ?? item?.ar ?? '',
    latin: item?.translation?.latin_idn ?? item?.translation?.latin_en ?? '',
    meaning: getLocalizedTranslation(item?.translation, lang) || item?.idn || '',
});

export default function SearchClient({ initialQuery = '' }) {
    const { t, lang } = useLocale();
    const { isWide } = useLayoutMode();
    const TYPES = [
        { value: 'all', label: t('search.type.all') },
        { value: 'ayah', label: t('search.type.ayah') },
        { value: 'hadith', label: t('search.type.hadith') },
    ];
    const [query, setQuery] = useState(initialQuery);
    const [type, setType] = useState('all');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const doSearch = async (q, tp) => {
        if (!q.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            const res = await searchApi.search(q, tp);
            const data = await res.json();
            setResults(data);
        } catch {
            setError(t('search.error'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialQuery) {
            doSearch(initialQuery, type);
        }
        inputRef.current?.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        doSearch(query, type);
    };

    const ayahResults = normalizeItems(results, 'ayah');
    const hadithResults = normalizeItems(results, 'hadith');
    const totalResults = ayahResults.length + hadithResults.length;

    return (
                <div className={isWide ? 'w-full px-4' : 'container mx-auto px-4 max-w-3xl'}>
                    <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-6'>
                        {t('search.title')}
                    </h1>

                    <form onSubmit={handleSubmit} className='flex gap-2 mb-4'>
                        <input
                            ref={inputRef}
                            type='text'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('search.placeholder')}
                            className='flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        />
                        <button
                            type='submit'
                            className='px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2'
                        >
                            <BsSearch />
                            {t('common.search')}
                        </button>
                    </form>

                    <div className='flex gap-2 mb-6'>
                        {TYPES.map((typeItem) => (
                            <button
                                key={typeItem.value}
                                onClick={() => setType(typeItem.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    type === typeItem.value
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-slate-600'
                                }`}
                            >
                                {typeItem.label}
                            </button>
                        ))}
                    </div>

                    {isLoading && <SkeletonInline rows={4} />}

                    {error && (
                        <p className='text-sm text-red-500 dark:text-red-400'>{error}</p>
                    )}

                    {results && !isLoading && (
                        <div className='space-y-6'>
                            {(type === 'all' || type === 'ayah') && ayahResults.length > 0 && (
                                <div>
                                    <h2 className='text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-3'>
                                        {t('search.type.ayah')} ({ayahResults.length})
                                    </h2>
                                    <div className='space-y-2'>
                                        {ayahResults.map((item) => {
                                            const meta = getAyahMeta(item, lang);
                                            return (
                                                <Link
                                                    key={item.id}
                                                    href={`/quran/surah/${meta.surahSlug}#${meta.number}`}
                                                    className='block p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                                                >
                                                    <div className='flex justify-between items-start mb-2'>
                                                        <span className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                                                            {meta.surahName} : {meta.number}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className='text-right text-xl mb-1 font-kitab'
                                                        style={{ direction: 'rtl' }}
                                                    >
                                                        {meta.arabic}
                                                    </p>
                                                    {meta.latin && (
                                                        <p className='text-xs text-gray-400 dark:text-gray-500 italic mb-1'>
                                                            {meta.latin}
                                                        </p>
                                                    )}
                                                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                                                        {meta.meaning}
                                                    </p>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {(type === 'all' || type === 'hadith') && hadithResults.length > 0 && (
                                <div>
                                    <h2 className='text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-3'>
                                        {t('search.type.hadith')} ({hadithResults.length})
                                    </h2>
                                    <div className='space-y-2'>
                                        {hadithResults.map((item) => {
                                            const meta = getHadithMeta(item, lang);
                                            return (
                                                <Link
                                                    key={item.id}
                                                    href={`/hadith/${meta.bookSlug}#${meta.number}`}
                                                    className='block p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                                                >
                                                    <div className='flex justify-between items-start mb-2'>
                                                        <span className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                                                            {meta.bookName} : {meta.number}
                                                        </span>
                                                        <GradeBadge grade={item.grade} />
                                                    </div>
                                                    <p
                                                        className='text-right text-xl mb-1 font-kitab'
                                                        style={{ direction: 'rtl' }}
                                                    >
                                                        {meta.arabic}
                                                    </p>
                                                    {meta.latin && (
                                                        <p className='text-xs text-gray-400 dark:text-gray-500 italic mb-1'>
                                                            {meta.latin}
                                                        </p>
                                                    )}
                                                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                                                        {meta.meaning}
                                                    </p>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {totalResults === 0 && (
                                <div className='text-center py-12'>
                                    <p className='text-gray-500 dark:text-gray-400 text-sm'>
                                        {t('common.no_results')} &quot;{query}&quot;
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
    );
}
