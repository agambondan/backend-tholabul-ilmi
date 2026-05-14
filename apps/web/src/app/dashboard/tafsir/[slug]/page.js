'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsArrowLeft, BsChevronDown, BsChevronRight, BsSearch } from 'react-icons/bs';
import { useLocale } from '@/context/Locale';
import { getLocalizedField, getLocalizedTranslation } from '@/lib/translation';
import {
    getTafsirArabic,
    getTafsirPrimary,
    getTafsirSecondary,
    getTafsirTranslation,
    normalizeTafsirEntry,
} from '@/lib/tafsirContent';

const DashboardTafsirReaderPage = ({ params }) => {
    const { t, lang } = useLocale();
    const slug = decodeURIComponent(params.slug);

    const [surah, setSurah] = useState(null);
    const [tafsirList, setTafsirList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [expanded, setExpanded] = useState(new Set());
    const [search, setSearch] = useState('');
    const [showLatin, setShowLatin] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);

    useEffect(() => {
        setLoading(true);
        setError(false);
        setSurah(null);
        setTafsirList([]);
        setExpanded(new Set());

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/surah?size=114&sort=number`)
            .then((r) => r.json())
            .then((data) => {
                const list = data?.items ?? data ?? [];
                const found = list.find(
                    (s) =>
                        s.latin?.toLowerCase() === slug.toLowerCase() ||
                        s.translation?.latin_en?.toLowerCase() === slug.toLowerCase(),
                );
                if (!found) throw new Error('not found');
                setSurah(found);
                return fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tafsir/surah/${found.number}`,
                );
            })
            .then((r) => r.json())
            .then((data) => {
                const list = data?.items ?? data ?? [];
                setTafsirList(list.map(normalizeTafsirEntry));
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [slug]);

    const toggle = (id) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const expandAll = () =>
        setExpanded(new Set(tafsirList.map((item, idx) => item.id ?? item.ayah_number ?? idx)));
    const collapseAll = () => setExpanded(new Set());

    if (loading) {
        return (
            <div className='p-6'>
                <div className='animate-pulse space-y-4'>
                    <div className='h-8 bg-gray-100 dark:bg-slate-800 rounded w-1/3' />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className='h-16 bg-gray-100 dark:bg-slate-800 rounded-xl' />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='p-6 text-center py-20'>
                <p className='text-4xl mb-3'>⚠️</p>
                <p className='text-gray-700 dark:text-white font-semibold mb-1'>
                    {t('tafsir.load_error_title')}
                </p>
                <p className='text-sm text-gray-400 dark:text-gray-500 mb-5'>
                    {t('quran.error_desc')}
                </p>
                <Link
                    href='/dashboard/tafsir'
                    className='text-sm text-amber-600 dark:text-amber-400 hover:underline'
                >
                    {t('tafsir.back_to_surah_list')}
                </Link>
            </div>
        );
    }

    const translation = getLocalizedTranslation(surah?.translation, lang);
    const query = search.trim().toLowerCase();
    const visible = tafsirList.filter((item) => {
        if (!query) return true;
        return [
            item.ayah_number,
            item.number,
            item.arabic,
            getTafsirArabic(item),
            item.text,
            getLocalizedTranslation(item.translation, lang),
            getTafsirTranslation(item, lang),
            getLocalizedField(item, 'content', lang),
            item.primaryTafsir,
            item.secondaryTafsir,
            item.source,
        ]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(query));
    });

    return (
        <div className='pb-16'>
            {/* Sticky header */}
            <div className='sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3'>
                <Link
                    href='/dashboard/tafsir'
                    className='p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors'
                >
                    <BsArrowLeft />
                </Link>
                <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold text-gray-900 dark:text-white leading-none'>
                        {t('tafsir.title')} {surah?.latin ?? surah?.translation?.latin_en ?? slug}
                    </p>
                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                        {translation} · {tafsirList.length} {t('quran.ayah_count')}
                    </p>
                </div>
                <span className='text-lg arabic-text text-gray-500 dark:text-gray-400 shrink-0'>
                    {surah?.name ?? surah?.translation?.ar}
                </span>
            </div>

            {/* Controls */}
            <div className='px-4 pt-4 space-y-3'>
                {/* Search */}
                <div className='relative'>
                    <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm' />
                    <input
                        type='text'
                        placeholder={t('tafsir.search_placeholder') ?? 'Cari ayah atau tafsir...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400'
                    />
                </div>

                {/* Toolbar: expand/collapse + toggles */}
                <div className='flex flex-wrap items-center gap-2'>
                    <button
                        type='button'
                        onClick={expandAll}
                        className='text-xs px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors'
                    >
                        {t('common.expand_all') ?? 'Buka Semua'}
                    </button>
                    <button
                        type='button'
                        onClick={collapseAll}
                        className='text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors'
                    >
                        {t('common.collapse_all') ?? 'Tutup Semua'}
                    </button>
                    <button
                        type='button'
                        onClick={() => setShowLatin((v) => !v)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                            showLatin
                                ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {t('ayah.latin') ?? 'Latin'}
                    </button>
                    <button
                        type='button'
                        onClick={() => setShowTranslation((v) => !v)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                            showTranslation
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        {t('common.translation') ?? 'Terjemahan'}
                    </button>
                    {query && (
                        <span className='text-xs text-gray-400 dark:text-gray-500 ml-auto'>
                            {visible.length} hasil
                        </span>
                    )}
                </div>
            </div>

            {tafsirList.length === 0 && !loading && (
                <div className='text-center py-20'>
                    <p className='text-gray-400 dark:text-gray-500 text-sm'>
                        {t('tafsir.empty_surah')}
                    </p>
                </div>
            )}

            {/* Tafsir accordion */}
            <div className='px-4 pt-3 space-y-2'>
                {visible.map((item, idx) => {
                    const id = item.id ?? item.ayahNumber ?? item.ayah_number ?? idx;
                    const isOpen = expanded.has(id);
                    const arabicText = getTafsirArabic(item);
                    const translationText = getTafsirTranslation(item, lang) || getLocalizedTranslation(item.translation, lang) || item.text;
                    const contentText = getLocalizedField(item, 'content', lang);
                    const primaryTafsir = getTafsirPrimary(item);
                    const secondaryTafsir = getTafsirSecondary(item);
                    return (
                        <div
                            key={id}
                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'
                        >
                            <button
                                type='button'
                                onClick={() => toggle(id)}
                                className='w-full text-left px-4 py-3 flex items-center justify-between gap-3'
                            >
                                <div className='flex items-center gap-3 min-w-0'>
                                    <span className='w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0'>
                                        {item.ayahNumber ?? item.ayah_number ?? item.number ?? idx + 1}
                                    </span>
                                    {arabicText && (
                                        <p
                                            dir='rtl'
                                            className='text-sm arabic-text text-gray-700 dark:text-gray-300 truncate'
                                        >
                                            {arabicText}
                                        </p>
                                    )}
                                </div>
                                {isOpen ? (
                                    <BsChevronDown className='shrink-0 text-gray-400 text-xs' />
                                ) : (
                                    <BsChevronRight className='shrink-0 text-gray-400 text-xs' />
                                )}
                            </button>

                            {isOpen && (
                                <div className='px-4 pb-4 border-t border-gray-50 dark:border-slate-700 pt-3 space-y-3'>
                                    {arabicText && (
                                        <p
                                            dir='rtl'
                                            className='text-xl arabic-text text-gray-800 dark:text-gray-100 leading-loose text-right'
                                        >
                                            {arabicText}
                                        </p>
                                    )}
                                    {item.latin && showLatin && (
                                        <p className='text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed'>
                                            {item.latin}
                                        </p>
                                    )}
                                    {translationText && showTranslation && (
                                        <p className='text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed'>
                                            {translationText}
                                        </p>
                                    )}
                                    {contentText ? (
                                        <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line'>
                                            {contentText}
                                        </p>
                                    ) : null}
                                    {primaryTafsir ? (
                                        <div className='rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3'>
                                            <p className='text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1'>
                                                Tafsir Jalalain
                                            </p>
                                            <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line'>
                                                {primaryTafsir}
                                            </p>
                                        </div>
                                    ) : null}
                                    {secondaryTafsir ? (
                                        <div className='rounded-xl bg-sky-50 dark:bg-sky-900/20 px-4 py-3'>
                                            <p className='text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-400 mb-1'>
                                                Tafsir Quraish Shihab
                                            </p>
                                            <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line'>
                                                {secondaryTafsir}
                                            </p>
                                        </div>
                                    ) : null}
                                    {item.source && (
                                        <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                                            {t('common.source')}: {item.source}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardTafsirReaderPage;
