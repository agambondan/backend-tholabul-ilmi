'use client';

import { useLocale } from '@/context/Locale';
import { useState, useEffect } from 'react';
import { BsSearch, BsBoxArrowUpRight } from 'react-icons/bs';

const FALLBACK = [
    {
        id: 'f1',
        title: 'Tafsir Al-Fatihah',
        ustadz: 'Ust. Firanda Andirja',
        category: 'tafsir',
        platform: 'youtube',
        url: '',
        duration: '01:23:45',
        description: 'Tafsir surah pembuka',
    },
    {
        id: 'f2',
        title: 'Fiqh Sholat',
        ustadz: 'Ust. Khalid Basalamah',
        category: 'fiqh',
        platform: 'youtube',
        url: '',
        duration: '00:45:00',
        description: 'Tata cara sholat yang benar',
    },
];

const CATEGORIES = ['aqidah', 'fiqh', 'akhlak', 'tafsir', 'hadits', 'sirah', 'umum'];

const platformStyle = {
    youtube: 'bg-red-100 text-red-700',
    spotify: 'bg-green-100 text-green-700',
};

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

export default function KajianDashboardPage() {
    const { t } = useLocale();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('');

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/kajian?page=0&size=50`)
            .then((res) => res.json())
            .then((data) => {
                const list = data?.items ?? data ?? [];
                setItems(Array.isArray(list) && list.length > 0 ? list : FALLBACK);
            })
            .catch(() => setItems(FALLBACK))
            .finally(() => setLoading(false));
    }, []);

    const filtered = items.filter((item) => {
        const q = search.toLowerCase();
        const matchSearch =
            item.title?.toLowerCase().includes(q) ||
            item.ustadz?.toLowerCase().includes(q);
        const matchCategory = activeCategory ? toStr(item.category) === activeCategory : true;
        return matchSearch && matchCategory;
    });

    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('kajian.title')}</h1>
            <p className='text-gray-500 mb-6'>
                Rekaman kajian dari ustadz-ustadz ahlus sunnah
            </p>

            {/* Search */}
            <div className='relative mb-4'>
                <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                    type='text'
                    placeholder={t('kajian.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300'
                />
            </div>

            {/* Category pills */}
            <div className='flex flex-wrap gap-2 mb-6'>
                <button
                    onClick={() => setActiveCategory('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        activeCategory === ''
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {t('common.all')}
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat === activeCategory ? '' : cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                            activeCategory === cat
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        {cat}
                    </button>
                ))}
            </div>

            {loading && (
                <p className='text-center text-gray-400 py-10'>{t('kajian.loading')}</p>
            )}

            {!loading && filtered.length === 0 && (
                <p className='text-center text-gray-400 py-10'>{t('kajian.not_found')}</p>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filtered.map((item) => {
                    const id = item.id ?? item._id;
                    const platformClass =
                        platformStyle[toStr(item.platform).toLowerCase()] ??
                        'bg-gray-100 text-gray-600';

                    const CardContent = (
                        <div className='border border-gray-200 rounded-xl bg-white shadow-sm p-4 h-full hover:shadow-md transition-shadow'>
                            <div className='flex items-start justify-between mb-2'>
                                <div className='flex gap-2 flex-wrap'>
                                    {item.platform && (
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${platformClass}`}>
                                            {toStr(item.platform)}
                                        </span>
                                    )}
                                    {item.category && (
                                        <span className='px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 capitalize'>
                                            {toStr(item.category)}
                                        </span>
                                    )}
                                </div>
                                {item.url && (
                                    <BsBoxArrowUpRight className='text-gray-400 flex-shrink-0 text-sm mt-0.5' />
                                )}
                            </div>
                            <h3 className='font-semibold text-gray-800 text-sm mb-1 line-clamp-2'>
                                {item.title}
                            </h3>
                            <p className='text-xs text-emerald-700 font-medium mb-1'>
                                {toStr(item.ustadz)}
                            </p>
                            {item.duration && (
                                <p className='text-xs text-gray-400 mb-2'>{toStr(item.duration)}</p>
                            )}
                            {item.description && (
                                <p className='text-xs text-gray-500 line-clamp-2'>
                                    {toStr(item.description)}
                                </p>
                            )}
                        </div>
                    );

                    return item.url ? (
                        <a
                            key={id}
                            href={item.url}
                            target='_blank'
                            rel='noreferrer'
                            className='block'>
                            {CardContent}
                        </a>
                    ) : (
                        <div key={id}>{CardContent}</div>
                    );
                })}
            </div>
        </div>
    );
}
