'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { bookmarkApi } from '@/lib/api';
import { useLocale } from '@/context/Locale';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsBookmarkFill, BsTrash } from 'react-icons/bs';
import { SkeletonList } from '@/components/skeleton/Skeleton';

const BookmarksPage = () => {
    const { t } = useLocale();
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = () => {
        bookmarkApi
            .list()
            .then((r) => r.json())
            .then((data) => setBookmarks(data?.items ?? []))
            .catch(() => setBookmarks([]))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        load();
    }, [isAuthenticated, authLoading]);

    const handleDelete = async (id) => {
        const prev = bookmarks;
        setBookmarks((b) => b.filter((item) => item.id !== id));
        try {
            await bookmarkApi.remove(id);
        } catch {
            setBookmarks(prev);
        }
    };

    const ayahBookmarks = bookmarks.filter((b) => b.ref_type === 'ayah');
    const hadithBookmarks = bookmarks.filter((b) => b.ref_type === 'hadith');

    if (authLoading || isLoading) return <SkeletonList />;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-3xl'>
                    <div className='flex items-center gap-3 mb-6'>
                        <BsBookmarkFill className='text-emerald-600 dark:text-emerald-400 text-xl' />
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white'>
                            {t('bookmarks.my_title')}
                        </h1>
                    </div>

                    {bookmarks.length === 0 && (
                        <div className='text-center py-16'>
                            <BsBookmarkFill className='text-5xl text-gray-200 dark:text-slate-600 mx-auto mb-4' />
                            <p className='text-gray-500 dark:text-gray-400 mb-2'>
                                {t('bookmarks.empty')}
                            </p>
                            <p className='text-sm text-gray-400 dark:text-gray-500'>
                                {t('bookmarks.empty_hint')}
                            </p>
                        </div>
                    )}

                    {ayahBookmarks.length > 0 && (
                        <div className='mb-8'>
                            <h2 className='text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-3'>
                                {t('search.type.ayah')} ({ayahBookmarks.length})
                            </h2>
                            <div className='space-y-2'>
                                {ayahBookmarks.map((b) => (
                                    <div
                                        key={b.id}
                                        className='flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700'
                                    >
                                        <Link
                                            href={b.url ?? '#'}
                                            className='flex-1 min-w-0'
                                        >
                                            <p className='text-sm font-medium text-emerald-800 dark:text-emerald-300 truncate'>
                                                {b.label ?? `Ayah #${b.ref_id}`}
                                            </p>
                                            {b.text && (
                                                <p
                                                    className='text-base text-gray-700 dark:text-gray-300 mt-1 font-kitab text-right truncate'
                                                    style={{ direction: 'rtl' }}
                                                >
                                                    {b.text}
                                                </p>
                                            )}
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className='ml-3 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                                        >
                                            <BsTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {hadithBookmarks.length > 0 && (
                        <div>
                            <h2 className='text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-3'>
                                {t('search.type.hadith')} ({hadithBookmarks.length})
                            </h2>
                            <div className='space-y-2'>
                                {hadithBookmarks.map((b) => (
                                    <div
                                        key={b.id}
                                        className='flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700'
                                    >
                                        <Link
                                            href={b.url ?? '#'}
                                            className='flex-1 min-w-0'
                                        >
                                            <p className='text-sm font-medium text-emerald-800 dark:text-emerald-300 truncate'>
                                                {b.label ?? `Hadith #${b.ref_id}`}
                                            </p>
                                            {b.text && (
                                                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1 truncate'>
                                                    {b.text}
                                                </p>
                                            )}
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className='ml-3 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                                        >
                                            <BsTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default BookmarksPage;
