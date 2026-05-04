'use client';

import { useLocale } from '@/context/Locale';
import { useEffect, useState } from 'react';

const PRAYERS = ['Shubuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const dateStrOffset = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const StatsPage = () => {
    const { t } = useLocale();
    const [todayPrayer, setTodayPrayer] = useState({});
    const [muhasabahCount, setMuhasabahCount] = useState(0);
    const [activeGoals, setActiveGoals] = useState(0);
    const [bookmarkCount, setBookmarkCount] = useState(0);
    const [hafalCount, setHafalCount] = useState(0);
    const [last7, setLast7] = useState([]);

    useEffect(() => {
        try {
            setTodayPrayer(
                JSON.parse(localStorage.getItem(`sholat_log_${todayStr()}`) ?? '{}'),
            );
            setMuhasabahCount(
                (JSON.parse(localStorage.getItem('tholabul_muhasabah') ?? '[]')).length,
            );
            const goals = JSON.parse(localStorage.getItem('tholabul_goals') ?? '[]');
            setActiveGoals(goals.filter((g) => !g.completed).length);
            setBookmarkCount(
                (JSON.parse(localStorage.getItem('tholabul_bookmarks') ?? '[]')).length,
            );
            const hafalan = JSON.parse(localStorage.getItem('tholabul_hafalan') ?? '[]');
            setHafalCount(hafalan.filter((s) => s.status === 'hafal').length);
        } catch {}

        const rows = [];
        for (let i = -6; i <= 0; i++) {
            const ds = dateStrOffset(i);
            try {
                const entry = JSON.parse(
                    localStorage.getItem(`sholat_log_${ds}`) ?? '{}',
                );
                const count = PRAYERS.filter((p) => entry[p.toLowerCase()]).length;
                rows.push({ date: ds, count });
            } catch {
                rows.push({ date: ds, count: 0 });
            }
        }
        setLast7(rows);
    }, []);

    const prayerCount = PRAYERS.filter((p) => todayPrayer[p.toLowerCase()]).length;

    return (
        <div className='px-4 py-6'>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>
                {t('stats.title')}
            </h1>

            {/* Stat cards */}
            <div className='grid grid-cols-2 gap-3 mb-6'>
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                    <p className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                        {prayerCount}/5
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('stats.today_prayers')}
                    </p>
                </div>
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                    <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                        {muhasabahCount}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('stats.total_muhasabah')}
                    </p>
                </div>
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                    <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                        {activeGoals}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('stats.active_goals')}
                    </p>
                </div>
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                    <p className='text-2xl font-bold text-amber-600 dark:text-amber-400'>
                        {bookmarkCount}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('stats.total_bookmarks')}
                    </p>
                </div>
            </div>

            {/* Hafalan summary */}
            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 mb-6'>
                <p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                    {t('stats.hafalan_title')}
                </p>
                <p className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                    {hafalCount}
                    <span className='text-sm font-normal text-gray-400 dark:text-gray-500 ml-1'>
                        {t('stats.surah_unit')}
                    </span>
                </p>
            </div>

            {/* Prayer bar chart */}
            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5'>
                <p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4'>
                    {t('stats.prayer_chart_title')}
                </p>
                <div className='flex items-end justify-between gap-2 h-28'>
                    {last7.map((row) => {
                        const heightPct = Math.max(4, (row.count / 5) * 100);
                        const isToday = row.date === todayStr();
                        return (
                            <div
                                key={row.date}
                                className='flex-1 flex flex-col items-center gap-1'
                            >
                                <span className='text-xs font-semibold text-gray-600 dark:text-gray-300'>
                                    {row.count}
                                </span>
                                <div
                                    className={`w-full rounded-t-md transition-all ${
                                        isToday
                                            ? 'bg-emerald-500'
                                            : row.count === 5
                                              ? 'bg-emerald-400'
                                              : row.count >= 3
                                                ? 'bg-amber-400'
                                                : 'bg-gray-200 dark:bg-slate-600'
                                    }`}
                                    style={{ height: `${heightPct}%` }}
                                />
                                <span className='text-[10px] text-gray-400 dark:text-gray-500'>
                                    {new Date(row.date + 'T00:00:00').toLocaleDateString(
                                        'id-ID',
                                        { weekday: 'short' },
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
