'use client';

import { useAuth } from '@/context/Auth';
import { useLocale } from '@/context/Locale';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const PRAYERS = ['Shubuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];

const calcStreak = () => {
    let streak = 0;
    const d = new Date();
    while (streak < 365) {
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        try {
            const entry = JSON.parse(localStorage.getItem(`sholat_log_${ds}`) ?? '{}');
            const count = PRAYERS.filter((p) => entry[p.toLowerCase()]).length;
            if (count < 5) break;
        } catch {
            break;
        }
        streak++;
        d.setDate(d.getDate() - 1);
    }
    return streak;
};

const ProfileDashboardPage = () => {
    const { user } = useAuth();
    const { t } = useLocale();
    const [streak, setStreak] = useState(0);
    const [muhasabahCount, setMuhasabahCount] = useState(0);
    const [hafalCount, setHafalCount] = useState(0);

    useEffect(() => {
        try {
            setStreak(calcStreak());
            setMuhasabahCount(
                JSON.parse(localStorage.getItem('tholabul_muhasabah') ?? '[]').length,
            );
            const hafalan = JSON.parse(localStorage.getItem('tholabul_hafalan') ?? '[]');
            setHafalCount(hafalan.filter((s) => s.status === 'hafal').length);
        } catch {}
    }, []);

    const initials = user?.name
        ? user.name
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
        : '?';

    const roleBadge =
        user?.role === 'admin'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';

    return (
        <div className='px-4 py-6 max-w-md mx-auto'>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>
                {t('profile.title')}
            </h1>

            {/* Avatar & info */}
            <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 flex flex-col items-center text-center mb-5'>
                <div className='w-20 h-20 rounded-full bg-emerald-700 flex items-center justify-center mb-4'>
                    <span className='text-white text-2xl font-bold'>{initials}</span>
                </div>
                <p className='text-lg font-bold text-gray-900 dark:text-white'>
                    {user?.name ?? t('common.anonymous')}
                </p>
                <p className='text-sm text-gray-400 dark:text-gray-500 mt-0.5'>
                    {user?.email ?? ''}
                </p>
                {user?.role && (
                    <span
                        className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge}`}
                    >
                        {user.role}
                    </span>
                )}
                <Link
                    href='/dashboard/profile'
                    className='mt-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium'
                >
                    {t('profile.edit')}
                </Link>
            </div>

            {/* Quick stats */}
            <div className='grid grid-cols-3 gap-3'>
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center'>
                    <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                        {streak}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('profile.streak_label')}
                    </p>
                </div>
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center'>
                    <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                        {muhasabahCount}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('muhasabah.title')}
                    </p>
                </div>
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center'>
                    <p className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                        {hafalCount}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('profile.hafal_label')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileDashboardPage;
