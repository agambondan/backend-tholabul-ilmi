'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { ImBook } from 'react-icons/im';
import { useLocale } from '@/context/Locale';

const FALLBACK = [
    {
        slug: 'bukhari',
        name: 'Shahih Bukhari',
        description: 'Kitab hadith paling shahih',
        total: 7563,
    },
    {
        slug: 'muslim',
        name: 'Shahih Muslim',
        description: 'Salah satu dari dua kitab paling shahih',
        total: 5362,
    },
    {
        slug: 'abu-daud',
        name: 'Sunan Abu Daud',
        description: 'Memuat hadith hukum',
        total: 5274,
    },
    {
        slug: 'tirmidzi',
        name: 'Jami At-Tirmidzi',
        description: 'Memuat hadith dengan kualitas beragam',
        total: 3956,
    },
    {
        slug: 'nasai',
        name: "Sunan An-Nasa'i",
        description: 'Terkenal dengan seleksi ketat',
        total: 5761,
    },
    {
        slug: 'ibnu-majah',
        name: 'Sunan Ibnu Majah',
        description: 'Kitab sunan keenam',
        total: 4341,
    },
];

export default function DashboardHadithPage() {
    const { t } = useLocale();
    const [books, setBooks] = useState(FALLBACK);
    const [search, setSearch] = useState('');
    const formRef = useRef(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/hadith/books`)
            .then((r) => r.json())
            .then((d) => {
                const arr = d?.items ?? d ?? [];
                if (Array.isArray(arr) && arr.length > 0) setBooks(arr);
            })
            .catch(() => {});
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const q = search.trim();
        if (!q) return;
        window.location.href = `/search?q=${encodeURIComponent(q)}&type=hadith`;
    };

    return (
        <div className='p-6'>
            <div className='mb-6'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>{t('hadith.title')}</h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>
                    {books.length} {t('hadith.books_unit')}
                </p>
            </div>

            {/* Search */}
            <form ref={formRef} onSubmit={handleSearch} className='relative mb-6 max-w-lg'>
                <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                    type='text'
                    placeholder={t('hadith.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full pl-9 pr-20 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700'
                />
                <button
                    type='submit'
                    className='absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'>
                    {t('common.search')}
                </button>
            </form>

            {/* Books grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {books.map((book) => (
                    <Link
                        key={book.slug}
                        href={`/dashboard/hadith/${book.slug}`}
                        className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all p-4 group flex gap-3'>
                        <div className='w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors'>
                            <ImBook />
                        </div>
                        <div className='min-w-0 flex-1'>
                            <p className='text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors truncate'>
                                {book.name}
                            </p>
                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2'>
                                {book.description}
                            </p>
                            {book.total != null && (
                                <span className='inline-block mt-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-medium'>
                                    {book.total.toLocaleString('id-ID')} {t('hadith.unit')}
                                </span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
