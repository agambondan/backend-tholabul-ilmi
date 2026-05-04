'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sirohApi } from '@/lib/api';
import { useLocale } from '@/context/Locale';

const FALLBACK = [
    {
        id: 'f1',
        slug: 'kelahiran-nabi',
        title: 'Kelahiran Nabi Muhammad \u{FE0F}',
        category: 'Masa Mekah',
        excerpt: 'Nabi Muhammad lahir pada 12 Rabiul Awwal tahun Gajah...',
    },
    {
        id: 'f2',
        slug: 'hijrah-madinah',
        title: 'Hijrah ke Madinah',
        category: 'Hijrah',
        excerpt: 'Peristiwa hijrah menandai babak baru Islam...',
    },
    {
        id: 'f3',
        slug: 'fathu-makkah',
        title: 'Fathu Makkah',
        category: 'Kemenangan',
        excerpt: 'Penaklukan Mekah tanpa pertumpahan darah...',
    },
];

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

export default function SirohDashboardPage() {
    const { t } = useLocale();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        sirohApi
            .list(0, 50)
            .then((res) => res.json())
            .then((data) => {
                const list = data?.items ?? data ?? [];
                setItems(Array.isArray(list) && list.length > 0 ? list : FALLBACK);
            })
            .catch(() => setItems(FALLBACK))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('siroh.title')}</h1>
            <p className='text-gray-500 mb-6'>{t('siroh.subtitle')}</p>

            {loading && (
                <p className='text-center text-gray-400 py-10'>{t('siroh.loading')}</p>
            )}

            {!loading && items.length === 0 && (
                <p className='text-center text-gray-400 py-10'>{t('siroh.not_found')}</p>
            )}

            <div className='space-y-3'>
                {items.map((item) => {
                    const id = item.id ?? item._id;
                    return (
                        <Link
                            key={id}
                            href={`/dashboard/siroh/${item.slug ?? id}`}
                            className='block border border-gray-200 rounded-xl bg-white shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all'>
                            <div className='flex items-start gap-3'>
                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-2 mb-1 flex-wrap'>
                                        {item.category && (
                                            <span className='px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-medium'>
                                                {toStr(item.category)}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className='font-bold text-gray-800 text-sm mb-1'>
                                        {item.title}
                                    </h3>
                                    {item.excerpt && (
                                        <p className='text-xs text-gray-500 line-clamp-2'>
                                            {item.excerpt}
                                        </p>
                                    )}
                                </div>
                                <span className='text-blue-400 text-xs flex-shrink-0 mt-1'>
                                    →
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
