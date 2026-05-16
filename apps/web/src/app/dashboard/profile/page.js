'use client';

import { useAuth } from '@/context/Auth';
import { useLocale } from '@/context/Locale';
import { hafalanApi, muhasabahApi, streakApi, userApi } from '@/lib/api';
import {
    calcLocalPrayerStreak,
    isHafalanMemorized,
    normalizeHafalan,
    normalizeMuhasabah,
    parseApiJson,
    pickItems,
    readLocalArray,
    writeLocalArray,
} from '@/lib/personalSync';
import { useLayoutMode } from '@/lib/useLayoutMode';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsChevronDown, BsChevronUp, BsPencil } from 'react-icons/bs';

const inputCls =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500';

const ProfileDashboardPage = () => {
    const { user, isAuthenticated, refetchUser } = useAuth();
    const { t } = useLocale();
    const { isWide } = useLayoutMode();
    const [streak, setStreak] = useState(0);
    const [muhasabahCount, setMuhasabahCount] = useState(0);
    const [hafalCount, setHafalCount] = useState(0);
    const [syncError, setSyncError] = useState('');
    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editMsg, setEditMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        const localMuhasabah = readLocalArray('tholabul_muhasabah').map(normalizeMuhasabah);
        const localHafalan = readLocalArray('tholabul_hafalan').map(normalizeHafalan);
        setMuhasabahCount(localMuhasabah.length);
        setHafalCount(localHafalan.filter(isHafalanMemorized).length);

        const loadPersonalCounts = async () => {
            if (!isAuthenticated) return;
            try {
                const [muhasabahPayload, hafalanPayload] = await Promise.all([
                    muhasabahApi.list().then(parseApiJson),
                    hafalanApi.list().then(parseApiJson),
                ]);
                const muhasabah = pickItems(muhasabahPayload).map(normalizeMuhasabah);
                const hafalan = pickItems(hafalanPayload).map(normalizeHafalan);
                setMuhasabahCount(muhasabah.length);
                setHafalCount(hafalan.filter(isHafalanMemorized).length);
                writeLocalArray('tholabul_muhasabah', muhasabah);
                writeLocalArray('tholabul_hafalan', hafalan);
                setSyncError('');
            } catch {
                setSyncError('Stat profil memakai salinan lokal karena sinkron server belum tersedia.');
            }
        };
        loadPersonalCounts();

        if (isAuthenticated) {
            streakApi
                .get()
                .then((r) => r.json())
                .then((d) => setStreak(d?.current ?? d?.streak ?? 0))
                .catch(() => setStreak(calcLocalPrayerStreak()));
        } else {
            setStreak(calcLocalPrayerStreak());
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (user?.name) setEditName(user.name);
    }, [user]);

    const handleEditProfile = async (e) => {
        e.preventDefault();
        if (!user?.id || !editName.trim()) return;
        setEditLoading(true);
        setEditMsg({ type: '', text: '' });
        try {
            const res = await userApi.updateMe(user.id, { name: editName.trim() });
            if (!res.ok) throw new Error();
            refetchUser();
            setEditMsg({ type: 'success', text: t('profile.update_success') });
            setEditOpen(false);
        } catch {
            setEditMsg({ type: 'error', text: t('profile.update_error') });
        } finally {
            setEditLoading(false);
        }
    };

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
        <div className={isWide ? 'px-4 py-6' : 'px-4 py-6 max-w-md mx-auto'}>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>
                {t('profile.title')}
            </h1>
            {syncError ? (
                <div className='mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'>
                    {syncError}
                </div>
            ) : null}

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
                <button
                    type='button'
                    onClick={() => {
                        setEditOpen((current) => !current);
                        setEditMsg({ type: '', text: '' });
                    }}
                    className='mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400'
                >
                    <BsPencil />
                    {t('profile.edit_profile')}
                    {editOpen ? <BsChevronUp /> : <BsChevronDown />}
                </button>
                {editOpen && (
                    <form
                        onSubmit={handleEditProfile}
                        className='mt-4 w-full space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-left dark:border-emerald-900/50 dark:bg-emerald-950/20'
                    >
                        {editMsg.text && (
                            <p
                                className={`text-xs font-semibold ${
                                    editMsg.type === 'error'
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-emerald-700 dark:text-emerald-300'
                                }`}
                            >
                                {editMsg.text}
                            </p>
                        )}
                        <div>
                            <label className='mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400'>
                                {t('auth.name')}
                            </label>
                            <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className='mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400'>
                                Email
                            </label>
                            <input
                                value={user?.email ?? ''}
                                disabled
                                className={`${inputCls} cursor-not-allowed opacity-60`}
                            />
                        </div>
                        <div className='flex justify-end gap-2'>
                            <button
                                type='button'
                                onClick={() => {
                                    setEditOpen(false);
                                    setEditName(user?.name ?? '');
                                    setEditMsg({ type: '', text: '' });
                                }}
                                className='rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-white dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800'
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type='submit'
                                disabled={editLoading}
                                className='rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60'
                            >
                                {editLoading ? t('common.saving') : t('common.save')}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Quick stats */}
            <div className='grid grid-cols-3 gap-3'>
                <Link
                    href='/dashboard/stats'
                    className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center transition-colors hover:border-orange-200 dark:hover:border-orange-700'
                >
                    <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                        {streak}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('profile.streak_label')}
                    </p>
                </Link>
                <Link
                    href='/dashboard/muhasabah'
                    className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center transition-colors hover:border-purple-200 dark:hover:border-purple-700'
                >
                    <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                        {muhasabahCount}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('muhasabah.title')}
                    </p>
                </Link>
                <Link
                    href='/dashboard/hafalan'
                    className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center transition-colors hover:border-emerald-200 dark:hover:border-emerald-700'
                >
                    <p className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                        {hafalCount}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('profile.hafal_label')}
                    </p>
                </Link>
            </div>
        </div>
    );
};

export default ProfileDashboardPage;
