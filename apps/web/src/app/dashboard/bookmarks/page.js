'use client';

import { useAuth } from '@/context/Auth';
import { useLocale } from '@/context/Locale';
import { bookmarkApi } from '@/lib/api';
import { colorById, getBookmarkMeta } from '@/lib/bookmarkLabels';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsBookmark, BsBookmarkFill, BsTrash } from 'react-icons/bs';

const REF_LABEL_KEY = {
    quran: 'bookmarks.type_quran',
    hadith: 'bookmarks.type_hadith',
    doa: 'bookmarks.type_doa',
    dzikir: 'bookmarks.type_dzikir',
    asmaul_husna: 'bookmarks.type_asmaul',
    article: 'bookmarks.type_article',
};

const REF_ICON = {
    quran: '📖',
    hadith: '📚',
    doa: '🤲',
    dzikir: '💎',
    asmaul_husna: '⭐',
    article: '📰',
};

const refHref = (refType, refId, refSlug) => {
    if (refType === 'quran') return `/dashboard/quran?surah=${refId}`;
    if (refType === 'hadith') return `/dashboard/hadith`;
    if (refType === 'doa') return `/dashboard/doa`;
    if (refType === 'dzikir') return `/dashboard/dzikir`;
    if (refType === 'asmaul_husna') return `/dashboard/asmaul-husna`;
    if (refType === 'article' && refSlug) return `/blog/${refSlug}`;
    return '/dashboard';
};

const BookmarksPage = () => {
    const { t } = useLocale();
    const { isAuthenticated } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        bookmarkApi
            .list()
            .then((r) => r.json())
            .then((data) => setBookmarks(data?.items ?? data ?? []))
            .catch(() => setBookmarks([]))
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    const remove = async (id) => {
        if (!confirm(t('bookmarks.delete_confirm'))) return;
        try {
            await bookmarkApi.remove(id);
            setBookmarks((prev) => prev.filter((b) => (b.id ?? b._id) !== id));
        } catch {
            // best effort
        }
    };

    const grouped = bookmarks.reduce((acc, b) => {
        const type = b.ref_type ?? 'other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(b);
        return acc;
    }, {});

    const typeLabel = (type) =>
        t(REF_LABEL_KEY[type]) || type.replace(/_/g, ' ');

    const typeIcon = (type) => REF_ICON[type] ?? '🔖';

    return (
        <div className='px-4 py-6'>
            <div className='flex items-center justify-between mb-6'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                    {t('bookmarks.title')}
                </h1>
                <span className='text-xs text-gray-400 dark:text-gray-500'>
                    {bookmarks.length} item
                </span>
            </div>

            {loading && (
                <div className='flex justify-center py-16'>
                    <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
                </div>
            )}

            {!loading && bookmarks.length === 0 && (
                <div className='text-center py-16'>
                    <BsBookmark className='mx-auto text-4xl text-gray-300 dark:text-slate-600 mb-3' />
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>
                        {t('bookmarks.empty')}
                    </p>
                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                        {t('bookmarks.hint')}
                    </p>
                </div>
            )}

            {!loading && bookmarks.length > 0 && (
                <div className='space-y-6'>
                    {Object.entries(grouped).map(([type, items]) => (
                        <div key={type}>
                            <div className='flex items-center gap-2 mb-3'>
                                <span className='text-lg'>{typeIcon(type)}</span>
                                <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                                    {typeLabel(type)}
                                </h2>
                                <span className='text-xs text-gray-400 dark:text-gray-500'>
                                    ({items.length})
                                </span>
                            </div>
                            <ul className='space-y-2'>
                                {items.map((b) => {
                                    const id = b.id ?? b._id;
                                    const href = refHref(b.ref_type, b.ref_id, b.ref_slug);
                                    const localMeta = getBookmarkMeta(b.ref_type, b.ref_id);
                                    const meta = {
                                        color: b.color || localMeta?.color,
                                        label: b.label || localMeta?.label,
                                    };
                                    const colorTw = meta?.color ? colorById(meta.color).tw : 'bg-emerald-500';
                                    return (
                                        <li
                                            key={id}
                                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors'
                                        >
                                            <div className='flex items-start justify-between gap-3'>
                                                <div className='flex items-start gap-3 min-w-0'>
                                                    <span className={`w-1 self-stretch rounded-full ${colorTw}`} />
                                                    <BsBookmarkFill className='text-emerald-500 text-base mt-0.5 shrink-0' />
                                                    <div className='min-w-0'>
                                                        <Link
                                                            href={href}
                                                            className='text-sm font-semibold text-gray-800 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors truncate block'
                                                        >
                                                            {b.title ||
                                                                `${typeLabel(b.ref_type)} #${b.ref_id}`}
                                                        </Link>
                                                        {meta?.label && (
                                                            <span className='inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'>
                                                                {meta.label}
                                                            </span>
                                                        )}
                                                        {b.ref_slug ? (
                                                            <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                                                {b.ref_slug}
                                                            </p>
                                                        ) : b.ref_id ? (
                                                            <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                                                ID: {b.ref_id}
                                                            </p>
                                                        ) : null}
                                                        {b.note && (
                                                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 italic'>
                                                                {b.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => remove(id)}
                                                    className='text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 mt-0.5'
                                                >
                                                    <BsTrash />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookmarksPage;
