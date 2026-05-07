'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonStats } from '@/components/skeleton/Skeleton';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { useLocale } from '@/context/Locale';
import { useLayoutMode } from '@/lib/useLayoutMode';
import { statsApi } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsBook, BsCheckCircle, BsFire, BsGraphUp } from 'react-icons/bs';
import { MdCalendarMonth } from 'react-icons/md';

const DAY_LABELS = {
    ID: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    EN: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const MONTH_NAMES = {
    ID: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    EN: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const WeeklyChart = ({ data, lang, t }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map((d) => d.count ?? 0), 1);
    return (
        <div className='flex items-end gap-1.5 h-20'>
            {data.map((d, i) => {
                const height = Math.max(((d.count ?? 0) / max) * 100, 4);
                return (
                    <div key={i} className='flex flex-col items-center flex-1 gap-1'>
                        <div
                            className='w-full rounded-t-sm bg-emerald-500 dark:bg-emerald-600 transition-all'
                            style={{ height: `${height}%` }}
                            title={`${d.count ?? 0} ${t('stats.activity_unit')}`}
                        />
                        <span className='text-[10px] text-gray-400 dark:text-gray-500'>
                            {DAY_LABELS[lang]?.[new Date(d.date).getDay()] ?? d.date}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const MonthlyChart = ({ data, lang, t }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map((d) => d.count ?? 0), 1);
    return (
        <div className='flex items-end gap-1 h-24'>
            {data.map((d, i) => {
                const height = Math.max(((d.count ?? 0) / max) * 100, 4);
                const monthIdx = new Date(d.month + '-01').getMonth();
                return (
                    <div key={i} className='flex flex-col items-center flex-1 gap-1'>
                        <span className='text-[9px] text-gray-500 dark:text-gray-400 font-medium'>
                            {d.count ?? 0}
                        </span>
                        <div
                            className='w-full rounded-t-sm bg-teal-500 dark:bg-teal-600 transition-all'
                            style={{ height: `${height}%` }}
                            title={`${d.month}: ${d.count ?? 0} ${t('stats.activity_unit')}`}
                        />
                        <span className='text-[9px] text-gray-400 dark:text-gray-500'>
                            {MONTH_NAMES[lang]?.[monthIdx] ?? ''}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const currentMonthStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getBestEntry = (items, keyName) =>
    items.reduce((best, item) => {
        const itemCount = item?.count ?? item?.[keyName] ?? 0;
        const bestCount = best?.count ?? best?.[keyName] ?? 0;
        return itemCount > bestCount ? item : best;
    }, null);

const StatsPage = () => {
    const { lang, t } = useLocale();
    const { isWide } = useLayoutMode();
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
    const [stats, setStats] = useState(null);
    const [weekly, setWeekly] = useState([]);
    const [monthly, setMonthly] = useState(null);
    const [monthlyTrend, setMonthlyTrend] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        Promise.allSettled([
            statsApi.summary().then((r) => r.json()),
            statsApi.weekly().then((r) => r.json()),
            statsApi.monthly(currentMonthStr()).then((r) => r.json()),
            statsApi.yearly(new Date().getFullYear()).then((r) => r.json()),
        ]).then(([s, w, m, y]) => {
            if (s.status === 'fulfilled') setStats(s.value);
            if (w.status === 'fulfilled') setWeekly(w.value?.days ?? w.value ?? []);
            if (m.status === 'fulfilled') setMonthly(m.value);
            if (y.status === 'fulfilled') setMonthlyTrend(y.value?.months ?? y.value ?? []);
            setIsLoading(false);
        });
    }, [isAuthenticated, authLoading]);

    if (authLoading || isLoading) return <SkeletonStats />;

    const thisMonth = new Date().toLocaleDateString(lang === 'EN' ? 'en-US' : 'id-ID', { month: 'long', year: 'numeric' });
    const totalWeekly = weekly.reduce((sum, day) => sum + (day.count ?? 0), 0);
    const bestDay = weekly.length > 0 ? getBestEntry(weekly) : null;
    const bestMonth = monthlyTrend.length > 0 ? getBestEntry(monthlyTrend) : null;
    const averageWeekly = weekly.length > 0 ? totalWeekly / weekly.length : 0;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className={isWide ? 'w-full px-4' : 'container mx-auto px-4 max-w-2xl'}>
                    <div className='flex items-center gap-2 mb-6'>
                        <BsGraphUp className='text-emerald-600 dark:text-emerald-400 text-xl' />
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white'>
                            {t('stats.title')}
                        </h1>
                    </div>

                    {/* Weekly activity chart */}
                    {weekly.length > 0 && (
                        <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-4'>
                            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4'>
                                {t('stats.weekly_activity')}
                            </p>
                            <WeeklyChart data={weekly} lang={lang} t={t} />
                        </div>
                    )}

                    {/* Summary stats */}
                    {stats && (
                        <div className='grid grid-cols-2 gap-3 mb-4'>
                            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <BsBook className='text-emerald-500' />
                                    <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase'>
                                        {t('stats.ayah_read')}
                                    </span>
                                </div>
                                <p className='text-3xl font-extrabold text-emerald-800 dark:text-emerald-400'>
                                    {stats.total_ayah_read?.toLocaleString() ?? 0}
                                </p>
                            </div>
                            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <BsBook className='text-blue-500' />
                                    <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase'>
                                        {t('stats.hadith_read')}
                                    </span>
                                </div>
                                <p className='text-3xl font-extrabold text-blue-700 dark:text-blue-400'>
                                    {stats.total_hadith_read?.toLocaleString() ?? 0}
                                </p>
                            </div>
                            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <BsFire className='text-orange-500' />
                                    <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase'>
                                        Streak
                                    </span>
                                </div>
                                <p className='text-3xl font-extrabold text-orange-600 dark:text-orange-400'>
                                    {stats.current_streak ?? 0}
                                    <span className='text-base font-normal ml-1'>{t('leaderboard.days_unit')}</span>
                                </p>
                            </div>
                            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <BsCheckCircle className='text-emerald-500' />
                                    <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase'>
                                        {t('hafalan.title')}
                                    </span>
                                </div>
                                <p className='text-3xl font-extrabold text-emerald-700 dark:text-emerald-400'>
                                    {stats.hafalan_count ?? 0}
                                    <span className='text-base font-normal ml-1'>{t('stats.surah_unit')}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {(bestDay || bestMonth || weekly.length > 0) && (
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4'>
                            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                                <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1'>
                                    {t('stats.best_day')}
                                </p>
                                <p className='text-base font-bold text-emerald-800 dark:text-emerald-400'>
                                    {bestDay ? DAY_LABELS[lang]?.[new Date(bestDay.date).getDay()] ?? '—' : '—'}
                                </p>
                                <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                    {bestDay?.count ?? 0} {t('stats.activity_unit')}
                                </p>
                            </div>
                            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                                <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1'>
                                    {t('stats.daily_average')}
                                </p>
                                <p className='text-base font-bold text-blue-700 dark:text-blue-400'>
                                    {averageWeekly.toFixed(1)}
                                </p>
                                <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                    {t('stats.activity_per_day')}
                                </p>
                            </div>
                            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                                <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1'>
                                    {t('stats.best_month')}
                                </p>
                                <p className='text-base font-bold text-teal-700 dark:text-teal-400'>
                                    {bestMonth
                                        ? MONTH_NAMES[lang]?.[new Date(`${bestMonth.month}-01`).getMonth()] ??
                                          bestMonth.month
                                        : '—'}
                                </p>
                                <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                    {bestMonth?.count ?? 0} {t('stats.activity_unit')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Monthly recap */}
                    {monthly && (
                        <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-4'>
                            <div className='flex items-center gap-2 mb-4'>
                                <MdCalendarMonth className='text-teal-500' />
                                <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                                    {t('stats.monthly_recap')} — {thisMonth}
                                </p>
                            </div>
                            <div className='grid grid-cols-3 gap-3 mb-4'>
                                <div className='text-center'>
                                    <p className='text-2xl font-extrabold text-teal-700 dark:text-teal-400'>
                                        {monthly.total_ayah ?? 0}
                                    </p>
                                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                        {t('stats.ayah_unit')}
                                    </p>
                                </div>
                                <div className='text-center'>
                                    <p className='text-2xl font-extrabold text-teal-700 dark:text-teal-400'>
                                        {monthly.total_hadith ?? 0}
                                    </p>
                                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                        Hadith
                                    </p>
                                </div>
                                <div className='text-center'>
                                    <p className='text-2xl font-extrabold text-teal-700 dark:text-teal-400'>
                                        {monthly.active_days ?? 0}
                                    </p>
                                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                        {t('stats.active_days')}
                                    </p>
                                </div>
                            </div>
                            {monthly.tilawah_pages != null && (
                                <div className='bg-teal-50 dark:bg-teal-900/20 rounded-lg px-4 py-2'>
                                    <p className='text-xs text-teal-700 dark:text-teal-400'>
                                        {t('stats.tilawah_this_month')}:{' '}
                                        <span className='font-bold'>{monthly.tilawah_pages}</span> {t('tilawah.pages_unit')}
                                        {monthly.estimated_khatam != null && (
                                            <span className='text-teal-600 dark:text-teal-500'>
                                                {' '}
                                                · {t('stats.estimated_khatam')}:{' '}
                                                <span className='font-bold'>{monthly.estimated_khatam}</span> {t('leaderboard.days_unit')}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Yearly trend */}
                    {monthlyTrend.length > 0 && (
                        <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-4'>
                            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4'>
                                {t('stats.yearly_trend')} {new Date().getFullYear()}
                            </p>
                            <MonthlyChart data={monthlyTrend} lang={lang} t={t} />
                        </div>
                    )}

                    {!stats && !isLoading && (
                        <div className='text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
                            <BsGraphUp className='text-5xl text-gray-200 dark:text-slate-600 mx-auto mb-4' />
                            <p className='text-gray-500 dark:text-gray-400 mb-1'>
                                {t('stats.empty_title')}
                            </p>
                            <p className='text-sm text-gray-400 dark:text-gray-500'>
                                {t('stats.empty_hint_public')}
                            </p>
                            <div className='flex gap-3 justify-center mt-5'>
                                <Link
                                    href='/quran'
                                    className='px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors'
                                >
                                    {t('home.hero_read_quran')}
                                </Link>
                                <Link
                                    href='/hadith'
                                    className='px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg transition-colors'
                                >
                                    {t('home.hero_read_hadith')}
                                </Link>
                            </div>
                        </div>
                    )}

                    {!weekly.length && !monthly && !monthlyTrend.length && stats && (
                        <div className='mt-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 text-center'>
                            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
                                {t('stats.no_data')}
                            </p>
                            <p className='text-xs text-gray-400 dark:text-gray-500'>
                                {t('stats.no_data_hint')}
                            </p>
                        </div>
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default StatsPage;
