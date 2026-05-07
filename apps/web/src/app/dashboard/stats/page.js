'use client';

import { useLocale } from '@/context/Locale';
import { useAuth } from '@/context/Auth';
import { bookmarkApi, achievementApi } from '@/lib/api';
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
    const { t, lang } = useLocale();
    const { isAuthenticated } = useAuth();
    const [todayPrayer, setTodayPrayer] = useState({});
    const [muhasabahCount, setMuhasabahCount] = useState(0);
    const [activeGoals, setActiveGoals] = useState(0);
    const [bookmarkCount, setBookmarkCount] = useState(0);
    const [hafalCount, setHafalCount] = useState(0);
    const [last7, setLast7] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [points, setPoints] = useState(0);
    const [prayerStreak, setPrayerStreak] = useState(0);
    const [tilawahWeek, setTilawahWeek] = useState(0);
    const [tilawahMonth, setTilawahMonth] = useState(0);

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
            const hafalan = JSON.parse(localStorage.getItem('tholabul_hafalan') ?? '[]');
            setHafalCount(hafalan.filter((s) => s.status === 'hafal').length);
        } catch {}

        // Calculate sholat streak
        try {
            let streak = 0;
            for (let i = 0; i >= -365; i--) {
                const ds = dateStrOffset(i);
                const entry = JSON.parse(
                    localStorage.getItem(`sholat_log_${ds}`) ?? '{}',
                );
                const count = PRAYERS.filter((p) => entry[p.toLowerCase()]).length;
                if (count > 0) {
                    streak++;
                } else {
                    break;
                }
            }
            setPrayerStreak(streak);
        } catch {}

        // Tilawah stats (pages)
        try {
            const tilawah = JSON.parse(
                localStorage.getItem('tholabul_tilawah') ?? '[]',
            );
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            setTilawahWeek(
                tilawah
                    .filter((e) => new Date(e.date + 'T00:00:00') >= startOfWeek)
                    .reduce((s, e) => s + (e.pages ?? 0), 0),
            );
            setTilawahMonth(
                tilawah
                    .filter((e) => {
                        const d = new Date(e.date + 'T00:00:00');
                        return (
                            d.getMonth() === now.getMonth() &&
                            d.getFullYear() === now.getFullYear()
                        );
                    })
                    .reduce((s, e) => s + (e.pages ?? 0), 0),
            );
        } catch {}

        bookmarkApi
            .list()
            .then((r) => r.json())
            .then((d) => {
                const items = d?.items ?? d ?? [];
                setBookmarkCount(Array.isArray(items) ? items.length : 0);
            })
            .catch(() => {});

        if (isAuthenticated) {
            achievementApi
                .mine()
                .then((r) => r.json())
                .then((d) => setAchievements(Array.isArray(d) ? d : (d?.data ?? [])))
                .catch(() => {});
            achievementApi
                .points()
                .then((r) => r.json())
                .then((d) => setPoints(d?.total_points ?? d?.data?.total_points ?? 0))
                .catch(() => {});
        }

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
    }, [isAuthenticated]);

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
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'>
                    <div className='flex items-center gap-1.5'>
                        <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                            {prayerStreak}
                        </p>
                        <span className='text-xl'>🔥</span>
                    </div>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('stats.prayer_streak')}
                    </p>
                </div>
                {isAuthenticated && (
                    <div className='col-span-2 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl p-4 flex items-center justify-between'>
                        <div>
                            <p className='text-2xl font-bold text-white'>{points}</p>
                            <p className='text-xs text-amber-100 mt-0.5'>
                                {t('stats.total_points')}
                            </p>
                        </div>
                        <span className='text-4xl'>⭐</span>
                    </div>
                )}
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

            {/* Tilawah summary */}
            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 mb-6'>
                <p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
                    {t('stats.tilawah_title')}
                </p>
                <div className='flex gap-6'>
                    <div>
                        <p className='text-2xl font-bold text-teal-600 dark:text-teal-400'>
                            {tilawahWeek}
                            <span className='text-xs font-normal text-gray-400 dark:text-gray-500 ml-1'>
                                {t('tilawah.pages_unit')}
                            </span>
                        </p>
                        <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                            {t('stats.this_week')}
                        </p>
                    </div>
                    <div>
                        <p className='text-2xl font-bold text-teal-600 dark:text-teal-400'>
                            {tilawahMonth}
                            <span className='text-xs font-normal text-gray-400 dark:text-gray-500 ml-1'>
                                {t('tilawah.pages_unit')}
                            </span>
                        </p>
                        <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                            {t('stats.this_month')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Achievement badges */}
            {isAuthenticated && achievements.length > 0 && (
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 mb-6'>
                    <p className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
                        {t('stats.achievements')} ({achievements.length})
                    </p>
                    <div className='grid grid-cols-3 gap-2'>
                        {achievements.map((ua) => {
                            const a = ua.achievement ?? ua;
                            return (
                                <div
                                    key={ua.id ?? a.id}
                                    className='flex flex-col items-center bg-amber-50 dark:bg-slate-700 rounded-lg p-2 text-center'
                                >
                                    <span className='text-2xl mb-1'>{a.icon || '🏅'}</span>
                                    <p className='text-[11px] font-semibold text-gray-700 dark:text-gray-200 leading-tight'>
                                        {a.name}
                                    </p>
                                    <p className='text-[10px] text-gray-400 dark:text-gray-400 mt-0.5 leading-tight'>
                                        {a.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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
                                        lang === 'EN' ? 'en-US' : 'id-ID',
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
