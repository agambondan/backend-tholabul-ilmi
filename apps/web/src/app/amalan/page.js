'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonList, SkeletonInline } from '@/components/skeleton/Skeleton';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { amalanApi } from '@/lib/api';
import { useLocale } from '@/context/Locale';
import { getLocalizedField } from '@/lib/translation';
import { useCallback, useEffect, useState } from 'react';
import { BsCheckCircleFill, BsCircle, BsSearch } from 'react-icons/bs';

const CATEGORY_LABELS = {
    sholat: 'amalan.category_prayer',
    puasa: 'amalan.category_fasting',
    dzikir: 'amalan.category_dhikr',
    sedekah: 'amalan.category_charity',
};

const AmalanPage = () => {
    const { t, lang } = useLocale();
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
    const [todayItems, setTodayItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('today');
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        loadData();
    }, [isAuthenticated, authLoading]);

    const loadData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const todayRes = await amalanApi.today();
            if (todayRes.ok) {
                const d = await todayRes.json();
                setTodayItems(Array.isArray(d) ? d : d.data ?? []);
            }
        } catch {
            setError(t('amalan.load_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const loadHistory = useCallback(async () => {
        if (history.length > 0) return;
        setHistoryLoading(true);
        try {
            const res = await amalanApi.history();
            if (res.ok) {
                const d = await res.json();
                setHistory(Array.isArray(d) ? d : d.data ?? []);
            }
        } catch {
            setError(t('amalan.history_load_error'));
        } finally {
            setHistoryLoading(false);
        }
    }, [history.length]);

    useEffect(() => {
        if (activeTab === 'history') loadHistory();
    }, [activeTab, loadHistory]);

    const handleToggle = async (item) => {
        const prevItems = todayItems;
        setTodayItems((prev) =>
            prev.map((x) => (x.id === item.id ? { ...x, is_done: !x.is_done } : x)),
        );
        try {
            const res = await amalanApi.check(item.id);
            if (!res.ok) throw new Error('update failed');
        } catch {
            setTodayItems(prevItems);
        }
    };

    const groupByCategory = (items) => {
        return items.reduce((acc, item) => {
            const cat = item.category || 'lainnya';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});
    };

    const doneCount = todayItems.filter((x) => x.is_done).length;
    const totalCount = todayItems.length;
    const query = search.trim().toLowerCase();

    const matches = (item) => {
        if (!query) return true;
        const haystack = [
            getLocalizedField(item, 'name', lang, ['title']),
            getLocalizedField(item, 'description', lang),
            item.category,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return haystack.includes(query);
    };

    const visibleTodayItems = todayItems.filter(matches);
    const visibleHistory = history.filter((day) => {
        if (!query) return true;
        const dayLabel = new Date(day.date)
            .toLocaleDateString(lang === 'EN' ? 'en-US' : 'id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            })
            .toLowerCase();
        const itemsText = (day.items ?? [])
            .map((item) =>
                [
                    getLocalizedField(item, 'name', lang, ['title']),
                    getLocalizedField(item, 'description', lang),
                    item.category,
                ]
                    .filter(Boolean)
                    .join(' '),
            )
            .join(' ')
            .toLowerCase();
        return dayLabel.includes(query) || itemsText.includes(query);
    });

    if (authLoading) return <SkeletonList />;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-2xl'>
                    <div className='text-center mb-8'>
                        <p
                            className='text-3xl text-emerald-700 dark:text-emerald-400 mb-2'
                            style={{ fontFamily: 'Amiri, serif' }}
                        >
                            الأَعْمَال
                        </p>
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            {t('amalan.title')}
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {t('amalan.checklist_subtitle')}
                        </p>
                    </div>

                    <div className='flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                        <BsSearch className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('amalan.search_placeholder')}
                            className='flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none'
                        />
                        {search && (
                            <button
                                type='button'
                                onClick={() => setSearch('')}
                                className='text-xs font-medium text-emerald-600 dark:text-emerald-400'
                            >
                                {t('amalan.clear')}
                            </button>
                        )}
                    </div>

                    <div className='flex gap-2 mb-6'>
                        {['today', 'history'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-slate-600'
                                }`}
                            >
                                {tab === 'today' ? t('amalan.tab_today') : t('amalan.tab_history')}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className='mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm'>
                            {error}
                        </div>
                    )}

                    {activeTab === 'today' && (
                        <>
                            {isLoading ? (
                                <SkeletonInline rows={3} />
                            ) : todayItems.length === 0 ? (
                                <div className='text-center py-16 text-gray-400 dark:text-gray-600 text-sm'>
                                    {t('amalan.unavailable')}
                                </div>
                            ) : visibleTodayItems.length === 0 ? (
                                <div className='text-center py-16 text-gray-400 dark:text-gray-600 text-sm'>
                                    {t('amalan.no_search')}
                                </div>
                            ) : (
                                <>
                                    <div className='mb-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex items-center justify-between'>
                                        <div>
                                            <p className='text-sm font-medium text-emerald-900 dark:text-emerald-200'>
                                                {t('amalan.progress_today')}
                                            </p>
                                            <p className='text-xs text-emerald-600 dark:text-emerald-400 mt-0.5'>
                                                {doneCount} {t('amalan.of')} {totalCount} {t('amalan.progress_detail')}
                                            </p>
                                        </div>
                                        <div className='relative w-14 h-14'>
                                            <svg
                                                viewBox='0 0 36 36'
                                                className='w-14 h-14 -rotate-90'
                                            >
                                                <circle
                                                    cx='18'
                                                    cy='18'
                                                    r='15.9'
                                                    fill='none'
                                                    stroke='#d1fae5'
                                                    strokeWidth='3'
                                                />
                                                <circle
                                                    cx='18'
                                                    cy='18'
                                                    r='15.9'
                                                    fill='none'
                                                    stroke='#059669'
                                                    strokeWidth='3'
                                                    strokeDasharray={`${totalCount > 0 ? (doneCount / totalCount) * 100 : 0} 100`}
                                                    strokeLinecap='round'
                                                />
                                            </svg>
                                            <span className='absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-300'>
                                                {totalCount > 0
                                                    ? Math.round((doneCount / totalCount) * 100)
                                                    : 0}
                                                %
                                            </span>
                                        </div>
                                    </div>

                                    {Object.entries(groupByCategory(visibleTodayItems)).map(
                                        ([cat, items]) => (
                                            <div key={cat} className='mb-4'>
                                                <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-1'>
                                                    {CATEGORY_LABELS[cat] ? t(CATEGORY_LABELS[cat]) : cat}
                                                </h3>
                                                <div className='space-y-2'>
                                                    {items.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => handleToggle(item)}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                                                item.is_done
                                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                                                    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-600'
                                                            }`}
                                                        >
                                                            {item.is_done ? (
                                                                <BsCheckCircleFill className='text-emerald-600 dark:text-emerald-400 text-lg shrink-0' />
                                                            ) : (
                                                                <BsCircle className='text-gray-400 text-lg shrink-0' />
                                                            )}
                                                            <div className='flex-1 min-w-0'>
                                                                <p
                                                                    className={`text-sm font-medium ${item.is_done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'}`}
                                                                >
                                                                    {getLocalizedField(item, 'name', lang, ['title'])}
                                                                </p>
                                                                {getLocalizedField(item, 'description', lang) && (
                                                                    <p className='text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5'>
                                                                        {getLocalizedField(item, 'description', lang)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {activeTab === 'history' && (
                        <>
                            {historyLoading ? (
                                <SkeletonInline rows={3} />
                            ) : history.length === 0 ? (
                                <div className='text-center py-16 text-gray-400 dark:text-gray-600 text-sm'>
                                    {t('amalan.empty_history')}
                                </div>
                            ) : visibleHistory.length === 0 ? (
                                <div className='text-center py-16 text-gray-400 dark:text-gray-600 text-sm'>
                                    {t('amalan.no_history_search')}
                                </div>
                            ) : (
                                <div className='space-y-3'>
                                    {visibleHistory.map((day) => (
                                        <div
                                            key={day.date}
                                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 px-4 py-3'
                                        >
                                            <div className='flex items-center justify-between mb-2'>
                                                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                                    {new Date(day.date).toLocaleDateString(
                                                        lang === 'EN' ? 'en-US' : 'id-ID',
                                                        {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long',
                                                        },
                                                    )}
                                                </p>
                                                <span className='text-xs text-emerald-600 dark:text-emerald-400 font-medium'>
                                                    {day.done_count ?? 0}/{day.total_count ?? 0}
                                                </span>
                                            </div>
                                            {day.items && (
                                                <div className='flex flex-wrap gap-1.5'>
                                                    {day.items.map((it) => (
                                                        <span
                                                            key={it.id}
                                                            className={`text-xs px-2 py-0.5 rounded-full ${
                                                                it.is_done
                                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                                                            }`}
                                                        >
                                                            {getLocalizedField(it, 'name', lang, ['title'])}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default AmalanPage;
