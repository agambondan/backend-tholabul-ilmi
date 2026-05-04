'use client';

import SourceBadges from '@/components/SourceBadges';
import { useLocale } from '@/context/Locale';
import { useState, useEffect } from 'react';
import { BsSearch, BsChevronDown, BsChevronUp } from 'react-icons/bs';

const FALLBACK = [
    {
        id: 'f1',
        title: 'Tasbih',
        arabic: 'سُبْحَانَ اللهِ',
        transliteration: 'Subhanallah',
        translation: 'Maha Suci Allah',
        count: 33,
        category: 'umum',
    },
    {
        id: 'f2',
        title: 'Tahmid',
        arabic: 'الْحَمْدُ لِلَّهِ',
        transliteration: 'Alhamdulillah',
        translation: 'Segala Puji Bagi Allah',
        count: 33,
        category: 'umum',
    },
    {
        id: 'f3',
        title: 'Takbir',
        arabic: 'اللهُ أَكْبَرُ',
        transliteration: 'Allahu Akbar',
        translation: 'Allah Maha Besar',
        count: 33,
        category: 'umum',
    },
];

const CATEGORIES = ['pagi', 'petang', 'sesudah-sholat', 'malam', 'umum'];

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

const getTranslation = (v) =>
    typeof v === 'string' ? v : (v?.idn ?? v?.en ?? '');

export default function WiridDashboardPage() {
    const { t } = useLocale();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('');

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/wirid?page=0&size=100`)
            .then((res) => res.json())
            .then((data) => {
                const list = data?.items ?? data ?? [];
                setItems(Array.isArray(list) && list.length > 0 ? list : FALLBACK);
            })
            .catch(() => setItems(FALLBACK))
            .finally(() => setLoading(false));
    }, []);

    const filtered = items.filter((item) => {
        const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = activeCategory ? toStr(item.category) === activeCategory : true;
        return matchSearch && matchCategory;
    });

    const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold text-gray-800 dark:text-white mb-1'>
                {t('wirid.title')}
            </h1>
            <p className='text-gray-500 dark:text-gray-400 mb-6'>{t('wirid.subtitle')}</p>

            {/* Search */}
            <div className='relative mb-4'>
                <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                    type='text'
                    placeholder={t('wirid.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:bg-slate-800 dark:text-white'
                />
            </div>

            {/* Category pills */}
            <div className='flex flex-wrap gap-2 mb-6'>
                <button
                    onClick={() => setActiveCategory('')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        activeCategory === ''
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}>
                    {t('wirid.all')}
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat === activeCategory ? '' : cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                            activeCategory === cat
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}>
                        {cat}
                    </button>
                ))}
            </div>

            {loading && (
                <p className='text-center text-gray-400 py-10'>{t('wirid.loading')}</p>
            )}

            {!loading && filtered.length === 0 && (
                <p className='text-center text-gray-400 py-10'>{t('wirid.not_found')}</p>
            )}

            <div className='space-y-3'>
                {filtered.map((item) => {
                    const id = item.id ?? item._id;
                    const isOpen = expanded === id;
                    return (
                        <div
                            key={id}
                            className='border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm'>
                            <button
                                onClick={() => toggle(id)}
                                className='w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors'>
                                <div className='flex items-center gap-3 flex-wrap'>
                                    {item.count && (
                                        <span className='inline-flex items-center justify-center min-w-[2rem] px-2 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold'>
                                            {item.count}×
                                        </span>
                                    )}
                                    <span className='font-semibold text-gray-800 dark:text-white text-sm'>
                                        {item.title}
                                    </span>
                                    {item.category && (
                                        <span className='px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 capitalize'>
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
                                <div className='px-4 pb-4 border-t border-gray-100 dark:border-slate-700 pt-3 space-y-3'>
                                    <p
                                        dir='rtl'
                                        className='text-xl font-arabic leading-loose text-gray-800 dark:text-gray-200'>
                                        {item.arabic}
                                    </p>
                                    <p className='text-sm italic text-gray-500 dark:text-gray-400'>
                                        {item.transliteration}
                                    </p>
                                    <p className='text-sm text-gray-700 dark:text-gray-300'>
                                        {getTranslation(item.translation)}
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
