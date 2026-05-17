'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import NoteButton from '@/components/NoteButton';
import Section from '@/components/Section';
import { SkeletonList } from '@/components/skeleton/Skeleton';
import { useAuth } from '@/context/Auth';
import { bookmarkApi, libraryApi } from '@/lib/api';
import { useLayoutMode } from '@/lib/useLayoutMode';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { BsBookmark, BsBookmarkFill, BsBoxArrowUpRight } from 'react-icons/bs';

const normalizeBook = (data) => data?.data ?? data;

const metaItems = (book) =>
    [
        book?.author,
        book?.category,
        book?.level,
        book?.language,
        book?.format ? String(book.format).toUpperCase() : '',
        book?.pages ? `${book.pages} halaman` : '',
    ].filter(Boolean);

export const LibraryDetailContent = ({ params, basePath = '/library' }) => {
    const { isWide } = useLayoutMode();
    const { isAuthenticated } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(false);
        libraryApi
            .detail(params.slug)
            .then((res) => {
                if (!res.ok) throw new Error('failed');
                return res.json();
            })
            .then((data) => {
                if (active) setBook(normalizeBook(data));
            })
            .catch(() => {
                if (active) setError(true);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [params.slug]);

    useEffect(() => {
        if (!isAuthenticated || !book?.id) return;
        bookmarkApi
            .list()
            .then((res) => res.json())
            .then((data) => {
                const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
                const existing = items.find(
                    (item) =>
                        item.ref_type === 'library_book' &&
                        String(item.ref_id) === String(book.id),
                );
                if (existing) {
                    setBookmarked(true);
                    setBookmarkId(existing.id);
                }
            })
            .catch(() => {});
    }, [book?.id, isAuthenticated]);

    const toggleBookmark = async () => {
        if (!isAuthenticated || !book?.id) return;
        if (bookmarked && bookmarkId) {
            setBookmarked(false);
            setBookmarkId(null);
            bookmarkApi.remove(bookmarkId).catch(() => setBookmarked(true));
            return;
        }

        try {
            const res = await bookmarkApi.add('library_book', book.id, {
                label: book.title,
            });
            if (!res.ok) throw new Error('failed');
            const data = await res.json();
            setBookmarked(true);
            setBookmarkId(data?.data?.id ?? data?.id ?? null);
        } catch {}
    };

    if (loading) return <SkeletonList title={false} rows={4} />;

    return (
        <div className={isWide ? 'w-full px-4' : 'container mx-auto max-w-4xl px-4'}>
            <Link
                className='mb-6 inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline dark:text-emerald-300'
                href={basePath}
            >
                ← Kembali ke perpustakaan
            </Link>

            {error || !book ? (
                <div className='rounded-xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300'>
                    Buku tidak ditemukan atau belum bisa dimuat.
                </div>
            ) : (
                <article className='rounded-xl border border-emerald-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
                    <div className='p-5 md:p-8'>
                        <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
                            <div>
                                <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300'>
                                    {book.category || 'Perpustakaan'}
                                </p>
                                <h1 className='mt-2 text-2xl font-bold leading-snug text-emerald-950 dark:text-white md:text-3xl'>
                                    {book.title}
                                </h1>
                            </div>
                            <div className='flex items-center gap-2'>
                                {isAuthenticated && (
                                    <button
                                        className={`rounded-lg p-2 transition ${
                                            bookmarked
                                                ? 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-slate-800'
                                                : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-800'
                                        }`}
                                        onClick={toggleBookmark}
                                        title={bookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
                                    >
                                        {bookmarked ? <BsBookmarkFill /> : <BsBookmark />}
                                    </button>
                                )}
                                <NoteButton refType='library_book' refId={book.id} />
                            </div>
                        </div>

                        <div className='mb-6 flex flex-wrap gap-2'>
                            {metaItems(book).map((item) => (
                                <span
                                    className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                                    key={item}
                                >
                                    {item}
                                </span>
                            ))}
                        </div>

                        <p className='text-sm leading-7 text-gray-700 dark:text-gray-300'>
                            {book.description}
                        </p>

                        {book.tags && (
                            <p className='mt-4 text-xs text-gray-500 dark:text-gray-400'>
                                Topik: {book.tags}
                            </p>
                        )}

                        <div className='mt-8 flex flex-wrap gap-3 border-t border-gray-100 pt-5 dark:border-slate-800'>
                            {book.source_url ? (
                                <a
                                    className='inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800'
                                    href={book.source_url}
                                    rel='noreferrer'
                                    target='_blank'
                                >
                                    Buka resource
                                    <BsBoxArrowUpRight />
                                </a>
                            ) : (
                                <span className='rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200'>
                                    File sumber belum dilampirkan.
                                </span>
                            )}
                            {book.license && (
                                <span className='text-xs leading-5 text-gray-500 dark:text-gray-400'>
                                    {book.license}
                                </span>
                            )}
                        </div>
                    </div>
                </article>
            )}
        </div>
    );
};

const LibraryDetailPage = ({ params }) => {
    const resolvedParams = use(params);
    return (
        <main className='flex min-h-screen flex-col'>
            <NavbarTailwindCss />
            <Section>
                <LibraryDetailContent params={resolvedParams} basePath='/library' />
            </Section>
            <Footer />
        </main>
    );
};

export default LibraryDetailPage;
