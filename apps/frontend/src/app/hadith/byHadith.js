'use client';
/* eslint-disable react-hooks/exhaustive-deps */

import { SkeletonInline } from '@/components/skeleton/Skeleton';
import { listKitabHadith } from '@/lib/const';
import classNames from 'classnames';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 20;

const normalizeItems = (data) => data?.items ?? data ?? [];

const ByHadith = () => {
    const [selectedBookSlug, setSelectedBookSlug] = useState(
        listKitabHadith[0]?.slug ?? ''
    );
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(0);
    const [hadiths, setHadiths] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isError, setIsError] = useState(false);

    const currentBook = useMemo(
        () => listKitabHadith.find((book) => book.slug === selectedBookSlug),
        [selectedBookSlug]
    );

    const fetchHadiths = async (bookSlug, pageNum, append) => {
        if (append) setIsLoadingMore(true);
        else setIsLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/hadiths/book/${bookSlug}?page=${pageNum}&size=${PAGE_SIZE}`
            );
            const data = await res.json();
            const items = normalizeItems(data);

            setTotal(data?.total ?? items.length);
            setHadiths((prev) => (append ? [...prev, ...items] : items));
            setIsError(false);
        } catch {
            setIsError(true);
        } finally {
            if (append) setIsLoadingMore(false);
            else setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedBookSlug) return;
        setQuery('');
        setPage(0);
        setHadiths([]);
        setTotal(0);
        fetchHadiths(selectedBookSlug, 0, false);
    }, [selectedBookSlug]);

    const filteredHadiths = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return hadiths;

        return hadiths.filter((hadith) => {
            const numberMatch = String(hadith?.number ?? '').includes(normalizedQuery);
            const arabicMatch = String(hadith?.translation?.ar ?? '').toLowerCase().includes(normalizedQuery);
            const idnMatch = String(hadith?.translation?.idn ?? '').toLowerCase().includes(normalizedQuery);
            return numberMatch || arabicMatch || idnMatch;
        });
    }, [hadiths, query]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHadiths(selectedBookSlug, nextPage, true);
    };

    const jumpToHadith = () => {
        const number = query.trim();
        if (!number || !currentBook) return;
        window.location.href = `/hadith/${currentBook.slug}#${encodeURIComponent(number)}`;
    };

    return (
        <div className='space-y-5 px-4'>
            <div className='rounded-2xl border border-emerald-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm'>
                <div className='grid gap-3 md:grid-cols-[1fr_auto] md:items-end'>
                    <div className='grid gap-3 sm:grid-cols-2'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Pilih Kitab
                            </label>
                            <select
                                value={selectedBookSlug}
                                onChange={(e) => setSelectedBookSlug(e.target.value)}
                                className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                            >
                                {listKitabHadith.map((book) => (
                                    <option key={book.slug} value={book.slug}>
                                        {book.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Cari Nomor / Kata Kunci
                            </label>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder='Contoh: 1, rahmat, iman...'
                                className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                            />
                        </div>
                    </div>

                    <div className='flex gap-2'>
                        {currentBook && (
                            <Link
                                href={currentBook.href}
                                className='inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-600 transition-colors'
                            >
                                Buka Reader
                            </Link>
                        )}
                        <button
                            type='button'
                            onClick={jumpToHadith}
                            className='inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors'
                        >
                            Lompat
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <SkeletonInline rows={4} />
            ) : isError ? (
                <div className='flex flex-col items-center justify-center min-h-[40vh] text-center px-4'>
                    <p className='text-4xl mb-3'>⚠️</p>
                    <h2 className='text-lg font-bold text-emerald-900 dark:text-white mb-2'>
                        Gagal Memuat Hadith
                    </h2>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Server API tidak dapat dijangkau. Pastikan server backend berjalan.
                    </p>
                </div>
            ) : (
                <>
                    <div className='flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 px-1'>
                        <p>
                            Menampilkan {filteredHadiths.length} dari {total} hadith
                        </p>
                        <p>Pilih kitab lalu cari nomor atau kata kunci</p>
                    </div>

                    {filteredHadiths.length === 0 ? (
                        <div className='flex flex-col items-center justify-center min-h-[36vh] text-center px-4'>
                            <h2 className='text-xl font-bold text-emerald-900 dark:text-white mb-2'>
                                Hadith tidak ditemukan
                            </h2>
                            <p className='text-gray-500 dark:text-gray-400 max-w-sm text-sm leading-relaxed'>
                                Coba ganti kata kunci, pilih kitab lain, atau buka reader langsung lalu lompat ke nomor hadith.
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {filteredHadiths.map((hadith) => (
                                <Link
                                    href={`/hadith/${selectedBookSlug}#${hadith.number}`}
                                    key={hadith.id}
                                    className={classNames(
                                        'block rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all'
                                    )}
                                >
                                    <div className='flex items-start justify-between gap-3 mb-3'>
                                        <div>
                                            <p className='text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                                                {currentBook?.label ?? 'Hadith'} · No. {hadith.number}
                                            </p>
                                        </div>
                                        <span className='rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1'>
                                            Buka
                                        </span>
                                    </div>

                                    <p
                                        className='text-right text-2xl leading-[2.2] text-emerald-900 dark:text-white font-kitab'
                                        style={{ direction: 'rtl' }}
                                    >
                                        {hadith?.translation?.ar ?? '—'}
                                    </p>

                                    <p className='mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2'>
                                        {hadith?.translation?.idn ?? 'Terjemahan belum tersedia.'}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}

                    {isLoadingMore && <SkeletonInline rows={2} />}

                    {hadiths.length < total && (
                        <div className='flex justify-center pt-2'>
                            <button
                                type='button'
                                onClick={handleLoadMore}
                                className='px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors'
                            >
                                Muat Hadith Lainnya
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ByHadith;
