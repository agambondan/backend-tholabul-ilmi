'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/context/Locale';

const PRAYER_MAP = [
    { key: 'Fajr', label: 'Subuh', icon: '🌙' },
    { key: 'Sunrise', label: 'Syuruq', icon: '🌅' },
    { key: 'Dhuhr', label: 'Dzuhur', icon: '☀️' },
    { key: 'Asr', label: 'Ashar', icon: '🌤️' },
    { key: 'Maghrib', label: 'Maghrib', icon: '🌇' },
    { key: 'Isha', label: 'Isya', icon: '🌃' },
];

const toAladhanDate = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

const parseHour = (timeStr) => {
    if (!timeStr || timeStr === '-') return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m ?? 0);
};

const JadwalSholatPage = () => {
    const { t } = useLocale();
    const [timings, setTimings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const dateStr = toAladhanDate();
                const res = await fetch(
                    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=-6.2088&longitude=106.8456&method=11`,
                );
                const data = await res.json();
                setTimings(data?.data?.timings ?? null);
            } catch {
                setError(true);
            }
            setLoading(false);
        };
        fetchSchedule();
    }, []);

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const prayerRows = PRAYER_MAP.map(({ key, label, icon }) => {
        const raw = timings?.[key] ?? '-';
        const clean = raw !== '-' ? raw.replace(/ \(.*\)$/, '') : '-';
        return { key, label, icon, time: clean };
    });

    // Find current prayer: last prayer whose time <= now
    let currentPrayerKey = null;
    if (!loading && !error && timings) {
        for (const row of prayerRows) {
            const mins = parseHour(row.time);
            if (mins !== null && mins <= nowMinutes) {
                currentPrayerKey = row.key;
            }
        }
    }

    return (
        <div className='px-4 py-6 max-w-md mx-auto'>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-1'>
                {t('jadwal.title')}
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
                {now.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })}
            </p>
            <p className='text-xs text-gray-400 dark:text-gray-500 mb-6'>
                {t('jadwal.subtitle')}
            </p>

            {loading ? (
                <div className='text-center py-16 text-gray-400 dark:text-gray-500 text-sm'>
                    {t('jadwal.loading')}
                </div>
            ) : (
                <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
                    {prayerRows.map((row, idx) => {
                        const isCurrent = row.key === currentPrayerKey;
                        return (
                            <div
                                key={row.key}
                                className={`flex items-center justify-between px-5 py-4 ${
                                    idx !== prayerRows.length - 1
                                        ? 'border-b border-gray-50 dark:border-slate-700/50'
                                        : ''
                                } ${
                                    isCurrent
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                        : ''
                                }`}
                            >
                                <div className='flex items-center gap-3'>
                                    <span className='text-xl'>{row.icon}</span>
                                    <span
                                        className={`text-sm font-medium ${
                                            isCurrent
                                                ? 'text-emerald-700 dark:text-emerald-400'
                                                : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {row.label}
                                    </span>
                                    {isCurrent && (
                                        <span className='text-[10px] px-1.5 py-0.5 bg-emerald-500 text-white rounded-full font-medium'>
                                            {t('jadwal.current_badge')}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={`text-sm font-bold ${
                                        isCurrent
                                            ? 'text-emerald-700 dark:text-emerald-400'
                                            : 'text-gray-800 dark:text-white'
                                    }`}
                                >
                                    {row.time}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {error && (
                <p className='text-center text-sm text-red-500 mt-4'>
                    {t('jadwal.error')}
                </p>
            )}
        </div>
    );
};

export default JadwalSholatPage;
