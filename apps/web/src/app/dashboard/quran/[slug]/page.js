'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BsArrowLeft, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { useLocale } from '@/context/Locale';
import { getLocalizedTranslation } from '@/lib/translation';

const PAGE_SIZE = 20;

const getArabic = (ayah) => ayah.translation?.ar ?? ayah.arabic ?? ayah.text ?? '';
const getLatinIdn = (ayah) => ayah.translation?.latin_idn ?? ayah.transliteration ?? '';

const DashboardQuranReaderPage = ({ params }) => {
    const { t, lang } = useLocale();
    const slug = decodeURIComponent(params.slug);

    const [surah, setSurah] = useState(null);
    const [ayahs, setAyahs] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const loaderRef = useRef(null);

    const fetchPage = useCallback(
        async (pageIndex) => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/surah/name/${slug}?page=${pageIndex}&size=${PAGE_SIZE}`,
            );
            if (!res.ok) throw new Error('failed');
            return res.json();
        },
        [slug],
    );

    useEffect(() => {
        setLoading(true);
        setError(false);
        setAyahs([]);
        setPage(0);
        setHasMore(true);
        setSurah(null);

        fetchPage(0)
            .then((data) => {
                const nextAyahs = data?.ayahs ?? data?.items ?? [];
                setSurah(data);
                setAyahs(nextAyahs);
                setHasMore(nextAyahs.length === PAGE_SIZE);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [fetchPage]);

    useEffect(() => {
        if (page === 0 || !surah || !hasMore) return;
        setLoadingMore(true);
        fetchPage(page)
            .then((data) => {
                const next = data?.ayahs ?? data?.items ?? [];
                setAyahs((prev) => {
                    const merged = [...prev, ...next];
                    setHasMore(next.length === PAGE_SIZE);
                    return merged;
                });
            })
            .catch(() => setHasMore(false))
            .finally(() => setLoadingMore(false));
    }, [page, surah, hasMore, fetchPage]);

    useEffect(() => {
        if (!loaderRef.current) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
                    setPage((p) => p + 1);
                }
            },
            { threshold: 0.1 },
        );
        obs.observe(loaderRef.current);
        return () => obs.disconnect();
    }, [hasMore, loadingMore, loading]);

    const surahNumber = surah?.number ?? null;
    const prevSlug = surahNumber > 1 ? surah?.prev_surah?.translation?.latin_idn ?? null : null;
    const nextSlug = surahNumber < 114 ? surah?.next_surah?.translation?.latin_idn ?? null : null;

    if (loading) {
        return (
            <div className='p-6'>
                <div className='animate-pulse space-y-6'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className='bg-gray-100 dark:bg-slate-800 rounded-xl h-28' />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='p-6 text-center py-20'>
                <p className='text-4xl mb-3'>⚠️</p>
                <p className='text-gray-700 dark:text-white font-semibold mb-1'>
                    {t('quran.error_title')}
                </p>
                <p className='text-sm text-gray-400 dark:text-gray-500 mb-5'>
                    {t('quran.error_desc')}
                </p>
                <Link
                    href='/dashboard/quran'
                    className='text-sm text-emerald-600 dark:text-emerald-400 hover:underline'
                >
                    ← {t('quran.back_to_surah_list')}
                </Link>
            </div>
        );
    }

    return (
        <div className='pb-16'>
            {/* Sticky header */}
            <div className='sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3'>
                <Link
                    href='/dashboard/quran'
                    className='p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors'
                >
                    <BsArrowLeft />
                </Link>
                <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold text-gray-900 dark:text-white leading-none'>
                        {surah?.translation?.latin_en ?? surah?.latin ?? slug}
                    </p>
                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                        {getLocalizedTranslation(surah?.translation, lang)} ·{' '}
                        {surah?.total_ayah ?? surah?.number_of_ayahs ?? '?'} {t('common.verse')}
                    </p>
                </div>
                <span className='text-lg arabic-text text-gray-500 dark:text-gray-400 shrink-0'>
                    {surah?.name}
                </span>
            </div>

            {/* Bismillah (skip for At-Taubah #9) */}
            {surahNumber !== 9 && (
                <div className='text-center py-6 px-4'>
                    <p
                        dir='rtl'
                        className='text-2xl arabic-text text-gray-700 dark:text-gray-300 leading-loose'
                    >
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                </div>
            )}

            {/* Ayah list */}
            <div className='px-4 space-y-0'>
                {ayahs.map((ayah, idx) => (
                    <div
                        key={ayah.id ?? ayah.number ?? idx}
                        className={`py-5 border-b border-gray-50 dark:border-slate-800 -mx-4 px-4 ${
                            idx % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-slate-800/30'
                        }`}
                    >
                        <div className='flex justify-between items-center mb-3'>
                            <span className='w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0'>
                                {ayah.number}
                            </span>
                        </div>

                        <p
                            dir='rtl'
                            className='text-2xl arabic-text text-gray-800 dark:text-gray-100 leading-loose text-right mb-4'
                        >
                            {getArabic(ayah)}
                        </p>

                        {getLatinIdn(ayah) && (
                            <p className='text-sm italic text-gray-400 dark:text-gray-500 mb-2 leading-relaxed'>
                                {getLatinIdn(ayah)}
                            </p>
                        )}

                        {getLocalizedTranslation(ayah.translation, lang) && (
                            <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>
                                {getLocalizedTranslation(ayah.translation, lang)}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div ref={loaderRef} className='py-4 text-center'>
                {loadingMore && (
                    <p className='text-xs text-gray-400 dark:text-gray-500'>{t('quran.loading_ayat')}</p>
                )}
            </div>

            {/* Prev / Next */}
            {!hasMore && !loadingMore && (
                <div className='flex justify-between items-center px-4 py-6 border-t border-gray-100 dark:border-slate-800 mt-4'>
                    {prevSlug ? (
                        <Link
                            href={`/dashboard/quran/${prevSlug}`}
                            className='flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 hover:underline'
                        >
                            <BsChevronLeft className='text-xs' />
                            {t('quran.prev_surah')}
                        </Link>
                    ) : (
                        <span />
                    )}
                    {nextSlug ? (
                        <Link
                            href={`/dashboard/quran/${nextSlug}`}
                            className='flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 hover:underline'
                        >
                            {t('quran.next_surah')}
                            <BsChevronRight className='text-xs' />
                        </Link>
                    ) : (
                        <span />
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardQuranReaderPage;
