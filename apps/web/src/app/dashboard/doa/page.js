'use client';

import SourceBadges from '@/components/SourceBadges';
import { useLocale } from '@/context/Locale';
import { useState, useEffect } from 'react';
import { BsSearch, BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { doaApi } from '@/lib/api';
import { getLocalizedField, getLocalizedTranslation } from '@/lib/translation';

const FALLBACK = [
    {
        id: 'f1',
        title: 'Doa Sebelum Makan',
        title_en: 'Prayer Before Eating',
        arabic: 'بِسْمِ اللهِ',
        transliteration: 'Bismillah',
        translation: { idn: 'Dengan nama Allah', en: 'In the name of Allah' },
        category: 'makan',
        source: 'HR. Bukhari',
    },
    {
        id: 'f2',
        title: 'Doa Pagi',
        title_en: 'Morning Supplication',
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا',
        transliteration: 'Allahumma bika ashbahnaa',
        translation: {
            idn: 'Ya Allah, dengan-Mu kami memasuki waktu pagi',
            en: 'O Allah, by You we enter the morning',
        },
        category: 'pagi',
        source: 'HR. Abu Daud',
    },
    {
        id: 'f3',
        title: 'Doa Sebelum Tidur',
        title_en: 'Prayer Before Sleeping',
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        transliteration: 'Bismikallaahumma amuutu wa ahyaa',
        translation: {
            idn: 'Dengan nama-Mu ya Allah, aku mati dan aku hidup',
            en: 'In Your name, O Allah, I die and I live',
        },
        category: 'tidur',
        source: 'HR. Bukhari',
    },
];

const CATEGORIES = ['pagi', 'petang', 'makan', 'tidur', 'safar', 'ibadah', 'umum'];

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

export default function DoaDashboardPage() {
    const { t, lang } = useLocale();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('');

    useEffect(() => {
        doaApi
            .list(0, 100)
            .then((res) => res.json())
            .then((data) => {
                const list = data?.items ?? data ?? [];
                setItems(Array.isArray(list) && list.length > 0 ? list : FALLBACK);
            })
            .catch(() => setItems(FALLBACK))
            .finally(() => setLoading(false));
    }, []);

    const filtered = items.filter((item) => {
        const matchSearch = getLocalizedField(item, 'title', lang)
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchCategory = activeCategory ? toStr(item.category) === activeCategory : true;
        return matchSearch && matchCategory;
    });

    const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('doa.title')}</h1>
            <p className='text-gray-500 mb-6'>{t('doa.subtitle')}</p>

            {/* Search */}
            <div className='relative mb-4'>
                <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                    type='text'
                    placeholder={t('doa.search_placeholder')}
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
                <p className='text-center text-gray-400 py-10'>{t('doa.loading')}</p>
            )}

            {!loading && filtered.length === 0 && (
                <p className='text-center text-gray-400 py-10'>{t('doa.not_found')}</p>
            )}

            <div className='space-y-3'>
                {filtered.map((item) => {
                    const id = item.id ?? item._id;
                    const isOpen = expanded === id;
                    return (
                        <div
                            key={id}
                            className='border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm'>
                            <button
                                onClick={() => toggle(id)}
                                className='w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors'>
                                <div className='flex items-center gap-3'>
                                    <span className='font-semibold text-gray-800 text-sm'>
                                        {getLocalizedField(item, 'title', lang)}
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
                                <div className='px-4 pb-4 border-t border-gray-100 space-y-3 pt-3'>
                                    <p
                                        dir='rtl'
                                        className='text-xl font-arabic leading-loose text-gray-800'>
                                        {item.arabic}
                                    </p>
                                    <p className='text-sm italic text-gray-500'>
                                        {item.transliteration}
                                    </p>
                                    <p className='text-sm text-gray-700'>
                                        {getLocalizedTranslation(item.translation, lang)}
                                    </p>
                                    <SourceBadges source={item.source} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
