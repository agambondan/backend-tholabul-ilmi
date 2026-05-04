'use client';

import { useLocale } from '@/context/Locale';
import { hafalanApi } from '@/lib/api';
import { useEffect, useState } from 'react';

const STATUSES = ['hafal', 'sedang', 'belum'];

const statusBadge = (status) => {
    if (status === 'hafal')
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
    if (status === 'sedang')
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    return 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400';
};

const cycleStatus = (s) => {
    const idx = STATUSES.indexOf(s);
    return STATUSES[(idx + 1) % STATUSES.length];
};

const HafalanPage = () => {
    const { t } = useLocale();
    const [list, setList] = useState([]);
    const [filter, setFilter] = useState('semua');
    const [loading, setLoading] = useState(true);

    const statusLabel = (s) => {
        if (s === 'hafal') return t('hafalan.memorized');
        if (s === 'sedang') return t('hafalan.in_progress_short');
        return t('hafalan.not_started');
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await hafalanApi.list();
                const json = await res.json();
                const data = json?.items ?? json ?? [];
                if (Array.isArray(data) && data.length > 0) {
                    setList(data);
                    setLoading(false);
                    return;
                }
            } catch {}
            try {
                const local = JSON.parse(
                    localStorage.getItem('tholabul_hafalan') ?? '[]',
                );
                setList(local);
            } catch {}
            setLoading(false);
        };
        loadData();
    }, []);

    const toggleStatus = (idx) => {
        const updated = list.map((item, i) =>
            i === idx ? { ...item, status: cycleStatus(item.status ?? 'belum') } : item,
        );
        setList(updated);
        try {
            localStorage.setItem('tholabul_hafalan', JSON.stringify(updated));
        } catch {}
    };

    const hafal = list.filter((s) => s.status === 'hafal').length;
    const sedang = list.filter((s) => s.status === 'sedang').length;
    const belum = list.filter((s) => !s.status || s.status === 'belum').length;

    const filtered =
        filter === 'semua'
            ? list
            : list.filter((s) => (s.status ?? 'belum') === filter);

    return (
        <div className='px-4 py-6'>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>
                {t('hafalan.title')}
            </h1>

            {/* Stat cards */}
            <div className='grid grid-cols-3 gap-3 mb-6'>
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center'>
                    <p className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                        {hafal}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('hafalan.memorized')}
                    </p>
                </div>
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center'>
                    <p className='text-2xl font-bold text-amber-600 dark:text-amber-400'>
                        {sedang}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('hafalan.in_progress')}
                    </p>
                </div>
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 text-center'>
                    <p className='text-2xl font-bold text-gray-500 dark:text-gray-400'>
                        {belum}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                        {t('hafalan.not_started')}
                    </p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className='flex gap-1 mb-4 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit'>
                {['semua', 'hafal', 'sedang', 'belum'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                            filter === tab
                                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        {tab === 'semua' ? t('common.all') : statusLabel(tab)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className='text-center py-16 text-gray-400 dark:text-gray-500 text-sm'>
                    {t('hafalan.loading')}
                </div>
            ) : filtered.length === 0 ? (
                <div className='text-center py-16'>
                    <p className='text-4xl mb-3'>📖</p>
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>
                        {t('hafalan.empty')}
                    </p>
                </div>
            ) : (
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
                    <table className='w-full text-sm'>
                        <thead>
                            <tr className='text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-slate-700'>
                                <th className='text-left px-4 py-2.5 font-medium w-12'>#</th>
                                <th className='text-left px-4 py-2.5 font-medium'>
                                    {t('hafalan.surah_name')}
                                </th>
                                <th className='text-right px-4 py-2.5 font-medium'>
                                    {t('common.status')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item, idx) => (
                                <tr
                                    key={item.surah_number ?? idx}
                                    className='border-b border-gray-50 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors'
                                >
                                    <td className='px-4 py-2.5 text-gray-400 dark:text-gray-500 text-xs'>
                                        {item.surah_number}
                                    </td>
                                    <td className='px-4 py-2.5 text-gray-700 dark:text-gray-300'>
                                        {item.surah_name}
                                    </td>
                                    <td className='px-4 py-2.5 text-right'>
                                        <button
                                            onClick={() =>
                                                toggleStatus(
                                                    list.findIndex(
                                                        (l) =>
                                                            l.surah_number ===
                                                            item.surah_number,
                                                    ),
                                                )
                                            }
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 ${statusBadge(item.status ?? 'belum')}`}
                                        >
                                            {statusLabel(item.status ?? 'belum')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HafalanPage;
