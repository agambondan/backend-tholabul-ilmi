'use client';

import { useLocale } from '@/context/Locale';
import { useState, useEffect } from 'react';
import { BsSearch, BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { asmaulHusnaApi } from '@/lib/api';

const FALLBACK = [
    {
        number: 1,
        arabic: 'ٱللَّٰه',
        transliteration: 'Allah',
        indonesian: 'Allah',
        english: 'Allah',
        description: 'Nama Allah yang paling agung',
    },
    {
        number: 2,
        arabic: 'ٱلرَّحْمَٰن',
        transliteration: 'Ar-Rahman',
        indonesian: 'Yang Maha Pengasih',
        english: 'The Most Gracious',
        description: 'Pengasih di dunia dan akhirat',
    },
    {
        number: 3,
        arabic: 'ٱلرَّحِيم',
        transliteration: 'Ar-Rahim',
        indonesian: 'Yang Maha Penyayang',
        english: 'The Most Merciful',
        description: 'Penyayang khusus di akhirat',
    },
    {
        number: 4,
        arabic: 'ٱلْمَلِك',
        transliteration: 'Al-Malik',
        indonesian: 'Yang Maha Raja',
        english: 'The King',
        description: 'Raja seluruh alam semesta',
    },
    {
        number: 55,
        arabic: 'ٱللَّطِيف',
        transliteration: 'Al-Latif',
        indonesian: 'Yang Maha Lembut',
        english: 'The Subtle',
        description: '',
    },
];

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

const toTranslation = (t) => {
    if (!t) return '';
    if (typeof t === 'string') return t;
    return t.idn ?? t.id ?? t.latin_en ?? t.en ?? '';
};

export default function AsmaulHusnaDashboardPage() {
    const { t } = useLocale();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        asmaulHusnaApi
            .list()
            .then((res) => res.json())
            .then((data) => {
                const list = data?.items ?? (Array.isArray(data) ? data : []);
                setItems(list.length > 0 ? list : FALLBACK);
            })
            .catch(() => setItems(FALLBACK))
            .finally(() => setLoading(false));
    }, []);

    const sorted = [...items].sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

    const filtered = sorted.filter((item) => {
        const q = search.toLowerCase();
        return (
            item.transliteration?.toLowerCase().includes(q) ||
            toStr(item.indonesian).toLowerCase().includes(q)
        );
    });

    const toggle = (number) => setExpanded((prev) => (prev === number ? null : number));

    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('asmaul.title')}</h1>
            <p className='text-gray-500 mb-6'>{t('asmaul.subtitle')}</p>

            {/* Search */}
            <div className='relative mb-6'>
                <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                    type='text'
                    placeholder={t('asmaul.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300'
                />
            </div>

            {loading && (
                <p className='text-center text-gray-400 py-10'>{t('asmaul.loading')}</p>
            )}

            {!loading && filtered.length === 0 && (
                <p className='text-center text-gray-400 py-10'>{t('asmaul.not_found')}</p>
            )}

            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                {filtered.map((item) => {
                    const isOpen = expanded === item.number;
                    return (
                        <div
                            key={item.number}
                            className='border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden'>
                            <button
                                onClick={() => toggle(item.number)}
                                className='w-full p-4 text-left hover:bg-gray-50 transition-colors'>
                                <div className='flex items-start justify-between mb-2'>
                                    <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex-shrink-0'>
                                        {item.number}
                                    </span>
                                    {isOpen ? (
                                        <BsChevronUp className='text-gray-400 text-xs mt-1' />
                                    ) : (
                                        <BsChevronDown className='text-gray-400 text-xs mt-1' />
                                    )}
                                </div>
                                <p
                                    dir='rtl'
                                    className='text-xl font-arabic leading-loose text-gray-800 mb-1'>
                                    {item.arabic}
                                </p>
                                <p className='text-xs italic text-gray-500 mb-0.5'>
                                    {item.transliteration}
                                </p>
                                <p className='text-xs font-medium text-gray-700'>
                                    {toStr(item.indonesian)}
                                </p>
                            </button>

                            {isOpen && (
                                <div className='px-4 pb-4 border-t border-gray-100 pt-3 space-y-1'>
                                    <p className='text-xs text-gray-500'>
                                        <span className='font-medium'>English:</span>{' '}
                                        {toStr(item.english)}
                                    </p>
                                    {item.description && (
                                        <p className='text-xs text-gray-600'>{toStr(item.description)}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
