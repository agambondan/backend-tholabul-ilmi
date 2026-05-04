'use client';

import { sirohApi } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

export default function SirohDetailPage({ params }) {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        sirohApi
            .detail(params.slug)
            .then((r) => r.json())
            .then((data) => setContent(data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [params.slug]);

    if (loading) {
        return (
            <div className='p-6 max-w-3xl mx-auto'>
                <div className='animate-pulse space-y-4'>
                    <div className='h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/2' />
                    <div className='h-4 bg-gray-200 dark:bg-slate-700 rounded w-full' />
                    <div className='h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6' />
                    <div className='h-4 bg-gray-200 dark:bg-slate-700 rounded w-full' />
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className='p-6 max-w-3xl mx-auto text-center'>
                <p className='text-4xl mb-3'>⚠️</p>
                <p className='text-gray-500 dark:text-gray-400 text-sm'>
                    Konten tidak ditemukan.
                </p>
                <Link
                    href='/dashboard/siroh'
                    className='mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline'
                >
                    ← Kembali
                </Link>
            </div>
        );
    }

    return (
        <div className='p-6 max-w-3xl mx-auto'>
            <Link
                href='/dashboard/siroh'
                className='inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6'
            >
                ← Kembali ke Siroh
            </Link>

            {content.category && (
                <span className='inline-block px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium mb-3'>
                    {toStr(content.category)}
                </span>
            )}

            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                {content.title}
            </h1>

            {content.subtitle && (
                <p className='text-gray-500 dark:text-gray-400 mb-6'>{content.subtitle}</p>
            )}

            <div className='text-gray-700 dark:text-gray-300 leading-relaxed space-y-4'>
                {String(content.content ?? '')
                    .split('\n')
                    .filter(Boolean)
                    .map((para, i) => (
                        <p key={i}>{para}</p>
                    ))}
            </div>

            {content.source && (
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-8 border-t border-gray-100 dark:border-slate-700 pt-4'>
                    Sumber: {content.source}
                </p>
            )}
        </div>
    );
}
