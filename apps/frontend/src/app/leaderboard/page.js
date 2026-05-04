'use client';
/* eslint-disable @next/next/no-img-element */

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonInline } from '@/components/skeleton/Skeleton';
import { useAuth } from '@/context/Auth';
import { leaderboardApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { BsFire, BsSearch, BsTrophyFill } from 'react-icons/bs';
import { MdBookmark } from 'react-icons/md';

const TABS = [
    { key: 'streak', label: 'Streak Terbaik', icon: <BsFire /> },
    { key: 'hafalan', label: 'Hafalan Terbanyak', icon: <MdBookmark /> },
];

const MEDAL = ['🥇', '🥈', '🥉'];

const LeaderboardPage = () => {
    const { isAuthenticated } = useAuth();
    const [tab, setTab] = useState('streak');
    const [streakData, setStreakData] = useState([]);
    const [hafalanData, setHafalanData] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setError('');
            try {
                const reqs = [leaderboardApi.streak(), leaderboardApi.hafalan()];
                if (isAuthenticated) reqs.push(leaderboardApi.me());
                const results = await Promise.allSettled(reqs);

                if (results[0].status === 'fulfilled' && results[0].value.ok) {
                    const d = await results[0].value.json();
                    setStreakData(Array.isArray(d) ? d : d.data ?? []);
                }
                if (results[1].status === 'fulfilled' && results[1].value.ok) {
                    const d = await results[1].value.json();
                    setHafalanData(Array.isArray(d) ? d : d.data ?? []);
                }
                if (results[2] && results[2].status === 'fulfilled' && results[2].value.ok) {
                    setMyRank(await results[2].value.json());
                }
            } catch {
                setError('Gagal memuat data leaderboard');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [isAuthenticated]);

    const currentData = tab === 'streak' ? streakData : hafalanData;
    const searchQuery = search.trim().toLowerCase();
    const visibleData = currentData.filter((entry) => {
        if (!searchQuery) return true;
        const haystack = [
            entry.name,
            entry.streak,
            entry.current_streak,
            entry.hafalan_count,
            entry.count,
        ]
            .filter((value) => value !== null && value !== undefined)
            .join(' ')
            .toLowerCase();
        return haystack.includes(searchQuery);
    });

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-2xl'>
                    <div className='text-center mb-8'>
                        <BsTrophyFill className='text-4xl text-yellow-500 mx-auto mb-2' />
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            Leaderboard
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            Ranking hafalan dan streak di antara pengguna
                        </p>
                    </div>

                    {myRank && (
                        <div className='mb-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 px-4 py-3 flex items-center justify-between'>
                            <div>
                                <p className='text-xs text-emerald-600 dark:text-emerald-400 font-medium'>
                                    Posisi Kamu
                                </p>
                                <p className='text-sm font-bold text-emerald-900 dark:text-white mt-0.5'>
                                    #{myRank.streak_rank ?? '—'} Streak ·{' '}
                                    #{myRank.hafalan_rank ?? '—'} Hafalan
                                </p>
                            </div>
                            <div className='text-right'>
                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    {myRank.streak ?? 0} hari streak
                                </p>
                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    {myRank.hafalan_count ?? 0} surah hafal
                                </p>
                            </div>
                        </div>
                    )}

                    <div className='flex gap-2 mb-6'>
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    tab === t.key
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-slate-600'
                                }`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className='flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                        <BsSearch className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Cari nama pengguna...'
                            className='flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none'
                        />
                        {search && (
                            <button
                                type='button'
                                onClick={() => setSearch('')}
                                className='text-xs font-medium text-emerald-600 dark:text-emerald-400'
                            >
                                Hapus
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className='mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm text-center'>
                            {error}
                        </div>
                    )}

                    {!isLoading && currentData.length > 0 && (
                        <div className='mb-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500'>
                            <span>
                                Menampilkan {visibleData.length} dari {currentData.length} pengguna
                            </span>
                            {search && (
                                <button
                                    type='button'
                                    onClick={() => setSearch('')}
                                    className='font-medium text-emerald-600 dark:text-emerald-400'
                                >
                                    Reset pencarian
                                </button>
                            )}
                        </div>
                    )}

                    {isLoading ? (
                        <SkeletonInline rows={5} />
                    ) : visibleData.length === 0 ? (
                        <div className='text-center py-16 text-gray-400 dark:text-gray-600 text-sm'>
                            {currentData.length === 0
                                ? 'Data leaderboard belum tersedia.'
                                : 'Tidak ada pengguna yang cocok dengan pencarian.'}
                        </div>
                    ) : (
                        <div className='space-y-2'>
                            {visibleData.map((entry, idx) => (
                                <div
                                    key={entry.user_id ?? entry.id ?? idx}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                                        idx < 3
                                            ? 'bg-white dark:bg-slate-800 border-yellow-200 dark:border-yellow-900'
                                            : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'
                                    }`}
                                >
                                    <div className='w-7 text-center shrink-0'>
                                        {idx < 3 ? (
                                            <span className='text-xl'>{MEDAL[idx]}</span>
                                        ) : (
                                            <span className='text-sm font-bold text-gray-400'>
                                                {idx + 1}
                                            </span>
                                        )}
                                    </div>

                                    {entry.avatar ? (
                                        <img
                                            src={entry.avatar}
                                            alt={entry.name}
                                            className='w-9 h-9 rounded-full object-cover shrink-0'
                                        />
                                    ) : (
                                        <div className='w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0'>
                                            <span className='text-sm font-bold text-emerald-700 dark:text-emerald-400'>
                                                {(entry.name ?? '?')[0].toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-medium text-gray-800 dark:text-white truncate'>
                                            {entry.name ?? 'Anonim'}
                                        </p>
                                    </div>

                                    <div className='shrink-0 text-right'>
                                        {tab === 'streak' ? (
                                            <p className='text-sm font-bold text-orange-500 flex items-center gap-1'>
                                                <BsFire />
                                                {entry.streak ?? entry.current_streak ?? 0} hari
                                            </p>
                                        ) : (
                                            <p className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
                                                {entry.hafalan_count ?? entry.count ?? 0} surah
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default LeaderboardPage;
