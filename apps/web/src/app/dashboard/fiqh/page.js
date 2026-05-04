'use client';

import { useLocale } from '@/context/Locale';
import { getLocalizedField } from '@/lib/translation';
import { useEffect, useState } from 'react';
import { BsChevronDown, BsChevronUp, BsSearch } from 'react-icons/bs';

const CATEGORIES = ['thaharah', 'sholat', 'zakat', 'puasa', 'haji', 'muamalah', 'umum'];

const FALLBACK = [
    {
        id: 'f1',
        category: 'sholat',
        title: 'Syarat Sah Sholat',
        title_en: 'Valid Prayer Conditions',
        content:
            'Syarat sah sholat adalah: suci dari hadats besar dan kecil, menutup aurat, menghadap kiblat, masuk waktu sholat, dan niat.',
        content_en:
            'The valid conditions of prayer are purification from major and minor ritual impurity, covering the awrah, facing the qiblah, entering the prayer time, and intention.',
        dalil: 'أَقِيمُوا الصَّلَاةَ',
        source: 'QS. Al-Baqarah: 43',
    },
    {
        id: 'f2',
        category: 'thaharah',
        title: 'Tata Cara Wudhu',
        title_en: 'How to Perform Wudu',
        content:
            'Wudhu dimulai dengan niat, membasuh muka, kedua tangan hingga siku, mengusap sebagian kepala, membasuh kedua kaki hingga mata kaki, dengan tertib.',
        content_en:
            'Wudu begins with intention, washing the face, washing both arms to the elbows, wiping part of the head, washing both feet to the ankles, and doing it in order.',
        dalil: '',
        source: 'HR. Bukhari',
    },
    {
        id: 'f3',
        category: 'puasa',
        title: 'Hal yang Membatalkan Puasa',
        title_en: 'Things That Break the Fast',
        content:
            "Yang membatalkan puasa: makan dan minum dengan sengaja, jima', muntah dengan sengaja, haid/nifas, hilang akal/murtad.",
        content_en:
            'Things that break the fast include intentional eating or drinking, intercourse, intentional vomiting, menstruation or postpartum bleeding, loss of sanity, and apostasy.',
        dalil: '',
        source: 'Fiqhus Sunnah',
    },
];

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

export default function DashboardFiqhPage() {
    const { t, lang } = useLocale();
    const [items, setItems] = useState(FALLBACK);
    const [cat, setCat] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/fiqh?page=0&size=100`)
            .then((r) => r.json())
            .then((d) => {
                const arr = d?.items ?? d ?? [];
                if (Array.isArray(arr) && arr.length > 0) setItems(arr);
            })
            .catch(() => {});
    }, []);

    const filtered = items.filter(
        (i) =>
            (!cat || toStr(i.category) === cat) &&
            (!search ||
                [
                    getLocalizedField(i, 'title', lang),
                    getLocalizedField(i, 'content', lang),
                    toStr(i.category),
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(search.toLowerCase())),
    );

    return (
        <div className='p-6'>
            <div className='mb-6'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>{t('fiqh.title')}</h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>
                    {items.length} {t('fiqh.material_unit')}
                </p>
            </div>

            {/* Filters */}
            <div className='flex flex-wrap gap-2 mb-4'>
                <div className='relative mr-2'>
                    <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs' />
                    <input
                        type='text'
                        placeholder={t('fiqh.search_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='pl-8 pr-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white w-44'
                    />
                </div>
                {['', ...CATEGORIES].map((c) => (
                    <button
                        key={c}
                        onClick={() => setCat(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                            cat === c
                                ? 'bg-emerald-700 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}>
                        {c || t('common.all')}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className='space-y-2'>
                {filtered.map((item) => {
                    const id = item.id ?? item._id;
                    const open = expanded === id;
                    return (
                        <div
                            key={id}
                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
                            <button
                                onClick={() => setExpanded(open ? null : id)}
                                className='w-full text-left px-4 py-3 flex items-center justify-between gap-3'>
                                <div className='flex items-center gap-2'>
                                    <span className='px-2 py-0.5 bg-lime-100 dark:bg-lime-900/20 text-lime-700 dark:text-lime-400 rounded text-xs capitalize shrink-0'>
                                        {toStr(item.category)}
                                    </span>
                                    <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                                        {getLocalizedField(item, 'title', lang)}
                                    </span>
                                </div>
                                {open ? (
                                    <BsChevronUp className='text-gray-400 shrink-0' />
                                ) : (
                                    <BsChevronDown className='text-gray-400 shrink-0' />
                                )}
                            </button>
                            {open && (
                                <div className='px-4 pb-4 border-t border-gray-50 dark:border-slate-700 pt-3 space-y-2'>
                                    <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
                                        {getLocalizedField(item, 'content', lang)}
                                    </p>
                                    {item.dalil && (
                                        <p
                                            dir='rtl'
                                            className='text-base text-gray-600 dark:text-gray-400 font-arabic leading-loose text-right'>
                                            {toStr(item.dalil)}
                                        </p>
                                    )}
                                    {item.source && (
                                        <p className='text-xs text-gray-400 dark:text-gray-500'>
                                            {item.source}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <p className='text-center py-10 text-gray-400 text-sm'>{t('common.no_results')}</p>
                )}
            </div>
        </div>
    );
}
