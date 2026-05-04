'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import { useAuth } from '@/context/Auth';
import { useLocale } from '@/context/Locale';
import { hafalanApi } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsCheck2Circle, BsChevronDown, BsClockHistory } from 'react-icons/bs';
import { MdRefresh } from 'react-icons/md';

const REVIEW_KEY = 'muroja_ah_reviews';

const loadReviews = () => {
    try {
        return JSON.parse(localStorage.getItem(REVIEW_KEY) ?? '{}');
    } catch {
        return {};
    }
};

const saveReview = (surahNumber) => {
    const reviews = loadReviews();
    reviews[surahNumber] = new Date().toISOString();
    localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews));
};

const daysSince = (iso) => {
    if (!iso) return null;
    const diff = Date.now() - new Date(iso).getTime();
    return Math.floor(diff / 86400000);
};

const urgencyColor = (days) => {
    if (days === null) return 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400';
    if (days >= 14) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    if (days >= 7) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
};

export default function MurojaahPage() {
    const { t } = useLocale();
    const { user } = useAuth();

    const urgencyLabel = (days) => {
        if (days === null) return t('murojaah.not_reviewed');
        if (days >= 14) return `${days} ${t('murojaah.urgent_suffix')}`;
        return `${days} ${t('murojaah.days_ago')}`;
    };
    const [hafalan, setHafalan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState({});
    const [filter, setFilter] = useState('all');
    const [openSurah, setOpenSurah] = useState(null);
    const [marking, setMarking] = useState(null);

    useEffect(() => {
        setReviews(loadReviews());
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        hafalanApi
            .list()
            .then((r) => r.json())
            .then((data) => {
                const memorized = (data?.items ?? data ?? []).filter(
                    (s) => s.status === 'hafal',
                );
                setHafalan(memorized);
            })
            .catch(() => setHafalan([]))
            .finally(() => setLoading(false));
    }, [user]);

    const handleMarkReviewed = (surahNumber) => {
        setMarking(surahNumber);
        saveReview(surahNumber);
        setReviews(loadReviews());
        setTimeout(() => setMarking(null), 600);
    };

    const enriched = hafalan.map((s) => {
        const days = daysSince(reviews[s.surah_number ?? s.number]);
        return { ...s, days };
    });

    const filtered = enriched.filter((s) => {
        if (filter === 'urgent') return s.days === null || s.days >= 14;
        if (filter === 'recent') return s.days !== null && s.days < 7;
        return true;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (a.days === null && b.days === null) return 0;
        if (a.days === null) return -1;
        if (b.days === null) return 1;
        return b.days - a.days;
    });

    const stats = {
        total: hafalan.length,
        reviewed: enriched.filter((s) => s.days !== null && s.days < 7).length,
        urgent: enriched.filter((s) => s.days === null || s.days >= 14).length,
    };

    if (!user) {
        return (
            <main className='min-h-screen flex flex-col bg-parchment-50 dark:bg-slate-900'>
                <NavbarTailwindCss />
                <div className='max-w-xl flex-1 w-full mx-auto px-4 pt-24 pb-8 text-center'>
                    <div className='text-5xl mb-4'>📖</div>
                    <h1 className='text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 mb-3'>
                        {t('murojaah.title')}
                    </h1>
                    <p className='text-gray-500 dark:text-gray-400 mb-6'>
                        {t('murojaah.login_desc')}
                    </p>
                    <Link
                        href='/auth/login'
                        className='bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-colors'
                    >
                        Login
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className='min-h-screen flex flex-col bg-parchment-50 dark:bg-slate-900'>
            <NavbarTailwindCss />
            <div className='max-w-2xl flex-1 w-full mx-auto px-4 pt-24 pb-8'>
                {/* Header */}
                <div className='mb-6'>
                    <div className='flex items-center gap-3 mb-2'>
                        <div className='w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center'>
                            <MdRefresh className='text-2xl text-emerald-600 dark:text-emerald-400' />
                        </div>
                        <div>
                            <h1 className='text-2xl font-extrabold text-emerald-900 dark:text-emerald-100'>
                                {t('murojaah.title')}
                            </h1>
                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                {t('murojaah.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {!loading && hafalan.length > 0 && (
                    <div className='grid grid-cols-3 gap-3 mb-6'>
                        {[
                            { label: t('murojaah.stat_total'), value: stats.total, color: 'emerald' },
                            { label: t('murojaah.stat_reviewed'), value: stats.reviewed, color: 'teal' },
                            { label: t('murojaah.stat_urgent'), value: stats.urgent, color: 'red' },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className='bg-white dark:bg-slate-800 rounded-2xl p-3 text-center border border-gray-100 dark:border-slate-700 shadow-sm'
                            >
                                <p
                                    className={`text-2xl font-extrabold ${
                                        s.color === 'red'
                                            ? 'text-red-600 dark:text-red-400'
                                            : s.color === 'teal'
                                              ? 'text-teal-600 dark:text-teal-400'
                                              : 'text-emerald-700 dark:text-emerald-300'
                                    }`}
                                >
                                    {s.value}
                                </p>
                                <p className='text-xs text-gray-500 dark:text-gray-400'>{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filter */}
                {hafalan.length > 0 && (
                    <div className='flex gap-2 mb-4'>
                        {[
                            { value: 'all', label: t('murojaah.filter_all') },
                            { value: 'urgent', label: t('murojaah.filter_urgent') },
                            { value: 'recent', label: t('murojaah.filter_recent') },
                        ].map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                                    filter === f.value
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-600'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {loading && (
                    <div className='text-center py-12'>
                        <div className='w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3' />
                        <p className='text-sm text-gray-500 dark:text-gray-400'>{t('murojaah.loading')}</p>
                    </div>
                )}

                {!loading && hafalan.length === 0 && (
                    <div className='text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
                        <div className='text-5xl mb-4'>📖</div>
                        <p className='text-gray-600 dark:text-gray-300 font-semibold mb-2'>
                            {t('murojaah.empty_title')}
                        </p>
                        <p className='text-sm text-gray-400 dark:text-gray-500 mb-4'>
                            {t('murojaah.empty_hint')}
                        </p>
                        <Link
                            href='/hafalan'
                            className='text-emerald-600 dark:text-emerald-400 font-semibold text-sm hover:underline'
                        >
                            {t('murojaah.open_hafalan')}
                        </Link>
                    </div>
                )}

                {!loading && sorted.length === 0 && hafalan.length > 0 && (
                    <div className='text-center py-8 text-gray-500 dark:text-gray-400 text-sm'>
                        {t('murojaah.no_filter')}
                    </div>
                )}

                {!loading && sorted.length > 0 && (
                    <div className='space-y-2'>
                        {sorted.map((s) => {
                            const num = s.surah_number ?? s.number;
                            const isOpen = openSurah === num;
                            const isMarking = marking === num;
                            return (
                                <div
                                    key={num}
                                    className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden'
                                >
                                    <div
                                        className='flex items-center justify-between px-4 py-3 cursor-pointer'
                                        onClick={() => setOpenSurah(isOpen ? null : num)}
                                    >
                                        <div className='flex items-center gap-3'>
                                            <span className='w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-extrabold flex items-center justify-center'>
                                                {num}
                                            </span>
                                            <div>
                                                <p className='font-semibold text-gray-900 dark:text-white text-sm'>
                                                    {s.name_latin ?? s.name}
                                                </p>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urgencyColor(s.days)}`}
                                                >
                                                    <BsClockHistory className='inline mr-1' />
                                                    {urgencyLabel(s.days)}
                                                </span>
                                            </div>
                                        </div>
                                        <BsChevronDown
                                            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </div>

                                    {isOpen && (
                                        <div className='border-t border-gray-50 dark:border-slate-700 px-4 py-4 flex items-center justify-between gap-3'>
                                            <Link
                                                href={`/quran/surah/${num}`}
                                                className='flex-1 text-center py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors'
                                            >
                                                {t('murojaah.open_surah')}
                                            </Link>
                                            <button
                                                onClick={() => handleMarkReviewed(num)}
                                                disabled={isMarking}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                                    isMarking
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                }`}
                                            >
                                                <BsCheck2Circle />
                                                {isMarking ? t('murojaah.marked') : t('murojaah.mark_done')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className='text-center text-xs text-gray-400 dark:text-gray-500 mt-6'>
                    {t('murojaah.footer_note')}
                </p>
            </div>
            <Footer />
        </main>
    );
}
