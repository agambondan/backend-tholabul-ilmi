'use client';

import { useState, useEffect } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { useLocale } from '@/context/Locale';

const FALLBACK = [
    {
        id: 'f1',
        year: '1 H',
        title: 'Hijrah Nabi ke Madinah',
        description: 'Peristiwa hijrah sebagai titik awal kalender Islam',
        category: 'nabi',
    },
    {
        id: 'f2',
        year: '2 H',
        title: 'Perang Badar',
        description: 'Kemenangan pertama kaum muslimin',
        category: 'perang',
    },
    {
        id: 'f3',
        year: '8 H',
        title: 'Fathu Makkah',
        description: 'Penaklukan Mekah',
        category: 'nabi',
    },
    {
        id: 'f4',
        year: '11 H',
        title: 'Wafatnya Nabi Muhammad \u{FDFB}',
        description: 'Nabi wafat pada usia 63 tahun',
        category: 'nabi',
    },
];

const CATEGORIES = [
    'khulafaur-rasyidin',
    'dinasti-umayyah',
    'perang',
    'nabi',
    'modern',
    'umum',
];

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

export default function SejarahDashboardPage() {
    const { t } = useLocale();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [activeCategory, setActiveCategory] = useState('');

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/sejarah?page=0&size=100`)
            .then((res) => res.json())
            .then((data) => {
                const list = data?.items ?? data ?? [];
                setItems(Array.isArray(list) && list.length > 0 ? list : FALLBACK);
            })
            .catch(() => setItems(FALLBACK))
            .finally(() => setLoading(false));
    }, []);

    const filtered = items.filter((item) =>
        activeCategory ? toStr(item.category) === activeCategory : true,
    );

    const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('sejarah.title')}</h1>
            <p className='text-gray-500 mb-6'>{t('sejarah.subtitle')}</p>

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
                        {cat.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {loading && (
                <p className='text-center text-gray-400 py-10'>{t('sejarah.loading')}</p>
            )}

            {!loading && filtered.length === 0 && (
                <p className='text-center text-gray-400 py-10'>{t('sejarah.not_found')}</p>
            )}

            {/* Timeline */}
            <div className='relative'>
                <div className='absolute left-[2.25rem] top-0 bottom-0 w-0.5 bg-emerald-200' />

                <div className='space-y-4'>
                    {filtered.map((item) => {
                        const id = item.id ?? item._id;
                        const isOpen = expanded === id;
                        return (
                            <div key={id} className='relative flex gap-4 items-start'>
                                {/* Timeline dot */}
                                <div className='relative z-10 flex-shrink-0 w-[4.5rem] flex flex-col items-center pt-3'>
                                    <div className='w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow' />
                                    <span className='text-xs text-emerald-700 font-semibold mt-1 text-center leading-tight'>
                                        {item.year}
                                    </span>
                                </div>

                                {/* Card */}
                                <div className='flex-1 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden'>
                                    <button
                                        onClick={() => toggle(id)}
                                        className='w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors'>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <span className='font-semibold text-gray-800 text-sm'>
                                                {item.title}
                                            </span>
                                            {item.category && (
                                                <span className='px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 capitalize'>
                                                    {toStr(item.category)}
                                                </span>
                                            )}
                                        </div>
                                        {isOpen ? (
                                            <BsChevronUp className='text-gray-400 flex-shrink-0' />
                                        ) : (
                                            <BsChevronDown className='text-gray-400 flex-shrink-0' />
                                        )}
                                    </button>

                                    {isOpen && (
                                        <div className='px-4 pb-4 border-t border-gray-100 pt-3'>
                                            <p className='text-sm text-gray-700'>
                                                {toStr(item.description)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
