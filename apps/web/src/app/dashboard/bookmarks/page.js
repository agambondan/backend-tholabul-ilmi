'use client';

import { useLocale } from '@/context/Locale';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsBookmark, BsBookmarkFill, BsTrash } from 'react-icons/bs';

const BookmarksPage = () => {
    const { t } = useLocale();
    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        try {
            setBookmarks(JSON.parse(localStorage.getItem('tholabul_bookmarks') ?? '[]'));
        } catch {}
    }, []);

    const remove = (id) => {
        if (!confirm('Hapus bookmark ini?')) return;
        const updated = bookmarks.filter((b) => b.id !== id);
        setBookmarks(updated);
        try {
            localStorage.setItem('tholabul_bookmarks', JSON.stringify(updated));
        } catch {}
    };

    const grouped = bookmarks.reduce(
        (acc, b) => {
            const type = b.type ?? 'lainnya';
            if (!acc[type]) acc[type] = [];
            acc[type].push(b);
            return acc;
        },
        {},
    );

    const typeLabel = (t) => {
        if (t === 'quran') return 'Al-Quran';
        if (t === 'hadith') return 'Hadith';
        return 'Lainnya';
    };

    const typeIcon = (t) => {
        if (t === 'quran') return '📖';
        if (t === 'hadith') return '📚';
        return '🔖';
    };

    return (
        <div className='px-4 py-6 max-w-2xl mx-auto'>
            <div className='flex items-center justify-between mb-6'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                    {t('bookmarks.title')}
                </h1>
                <span className='text-xs text-gray-400 dark:text-gray-500'>
                    {bookmarks.length} item
                </span>
            </div>

            {bookmarks.length === 0 ? (
                <div className='text-center py-16'>
                    <BsBookmark className='mx-auto text-4xl text-gray-300 dark:text-slate-600 mb-3' />
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>
                        {t('bookmarks.empty')}
                    </p>
                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                        {t('bookmarks.hint')}
                    </p>
                </div>
            ) : (
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
                                {items.map((b) => (
                                    <li
                                        key={b.id}
                                        className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors'
                                    >
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='flex items-start gap-3 min-w-0'>
                                                <BsBookmarkFill className='text-emerald-500 text-base mt-0.5 shrink-0' />
                                                <div className='min-w-0'>
                                                    {b.url ? (
                                                        <Link
                                                            href={b.url}
                                                            className='text-sm font-semibold text-gray-800 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors truncate block'
                                                        >
                                                            {b.title}
                                                        </Link>
                                                    ) : (
                                                        <p className='text-sm font-semibold text-gray-800 dark:text-white truncate'>
                                                            {b.title}
                                                        </p>
                                                    )}
                                                    {b.reference && (
                                                        <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                                            {b.reference}
                                                        </p>
                                                    )}
                                                    {b.note && (
                                                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 italic'>
                                                            {b.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => remove(b.id)}
                                                className='text-gray-300 dark:text-slate-600 hover:text-red-500 transition-colors shrink-0 mt-0.5'
                                            >
                                                <BsTrash />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookmarksPage;
