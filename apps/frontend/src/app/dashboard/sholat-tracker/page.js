'use client';

import { useLocale } from '@/context/Locale';
import { useEffect, useState } from 'react';
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs';

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

const SholatTrackerPage = () => {
    const { t } = useLocale();
    const [log, setLog] = useState({});
    const [last7, setLast7] = useState([]);

    useEffect(() => {
        try {
            const stored = JSON.parse(
                localStorage.getItem(`sholat_log_${todayStr()}`) ?? '{}',
            );
            setLog(stored);
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

    const toggle = (prayer) => {
        const key = prayer.toLowerCase();
        const updated = { ...log, [key]: !log[key] };
        setLog(updated);
        try {
            localStorage.setItem(
                `sholat_log_${todayStr()}`,
                JSON.stringify(updated),
            );
        } catch {}
        setLast7((prev) =>
            prev.map((row) => {
                if (row.date !== todayStr()) return row;
                const count = PRAYERS.filter(
                    (p) => (p.toLowerCase() === key ? !log[key] : updated[p.toLowerCase()]),
                ).length;
                return { ...row, count };
            }),
        );
    };

    const doneCount = PRAYERS.filter((p) => log[p.toLowerCase()]).length;
    const pct = Math.round((doneCount / 5) * 100);

    return (
        <div className='px-4 py-6 max-w-2xl mx-auto'>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>
                {t('sholat.title')}
            </h1>

            {/* Progress card */}
            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 mb-6'>
                <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        {t('sholat.today')}
                    </span>
                    <span className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                        {doneCount}/5
                    </span>
                </div>
                <div className='h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden'>
                    <div
                        className='h-full bg-emerald-500 rounded-full transition-all duration-500'
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-1.5'>
                    {pct}% {t('sholat.pct_done')}
                </p>
            </div>

            {/* Prayer buttons */}
            <div className='grid grid-cols-1 gap-3 mb-8'>
                {PRAYERS.map((p) => {
                    const done = !!log[p.toLowerCase()];
                    return (
                        <button
                            key={p}
                            onClick={() => toggle(p)}
                            className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all text-left w-full ${
                                done
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                                    : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700'
                            }`}
                        >
                            {done ? (
                                <BsCheckCircleFill className='text-emerald-500 text-2xl shrink-0' />
                            ) : (
                                <BsCircle className='text-gray-300 dark:text-slate-600 text-2xl shrink-0' />
                            )}
                            <span
                                className={`text-base font-medium ${
                                    done
                                        ? 'text-emerald-700 dark:text-emerald-400'
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {p}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Last 7 days table */}
            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
                <div className='px-5 py-3 border-b border-gray-100 dark:border-slate-700'>
                    <p className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        {t('sholat.last_7_days')}
                    </p>
                </div>
                <table className='w-full text-sm'>
                    <thead>
                        <tr className='text-xs text-gray-400 dark:text-gray-500 border-b border-gray-50 dark:border-slate-700'>
                            <th className='text-left px-5 py-2 font-medium'>
                                {t('sholat.date_col')}
                            </th>
                            <th className='text-right px-5 py-2 font-medium'>
                                {t('sholat.prayers_col')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {last7.map((row) => (
                            <tr
                                key={row.date}
                                className={`border-b border-gray-50 dark:border-slate-700/50 last:border-0 ${
                                    row.date === todayStr()
                                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10'
                                        : ''
                                }`}
                            >
                                <td className='px-5 py-2.5 text-gray-700 dark:text-gray-300'>
                                    {new Date(row.date + 'T00:00:00').toLocaleDateString(
                                        'id-ID',
                                        { weekday: 'short', day: 'numeric', month: 'short' },
                                    )}
                                </td>
                                <td className='px-5 py-2.5 text-right'>
                                    <span
                                        className={`font-semibold ${
                                            row.count === 5
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : row.count >= 3
                                                  ? 'text-amber-500 dark:text-amber-400'
                                                  : 'text-gray-400 dark:text-gray-500'
                                        }`}
                                    >
                                        {row.count}/5
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SholatTrackerPage;
