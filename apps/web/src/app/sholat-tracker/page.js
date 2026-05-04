'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useLocale } from '@/context/Locale';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { sholatTrackerApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs';
import { MdMosque } from 'react-icons/md';

const PRAYERS = [
    { key: 'shubuh', label: 'Shubuh', time: 'Sebelum matahari terbit' },
    { key: 'dzuhur', label: 'Dzuhur', time: 'Tengah hari' },
    { key: 'ashar', label: 'Ashar', time: 'Sore hari' },
    { key: 'maghrib', label: 'Maghrib', time: 'Setelah matahari terbenam' },
    { key: 'isya', label: "Isya'", time: 'Malam hari' },
];

const dateStr = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const EMPTY_LOG = () => ({ shubuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false });

const loadLocal = (date) => {
    try {
        const raw = localStorage.getItem(`sholat_log_${date}`);
        return raw ? JSON.parse(raw) : EMPTY_LOG();
    } catch {
        return EMPTY_LOG();
    }
};

const saveLocal = (date, log) => {
    try {
        localStorage.setItem(`sholat_log_${date}`, JSON.stringify(log));
    } catch {}
};

const last7Days = () =>
    Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return dateStr(d);
    });

const formatDate = (str, locale = 'id-ID') => {
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
};

const SholatTrackerPage = () => {
    const { lang, t } = useLocale();
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
    const today = dateStr();
    const [log, setLog] = useState(EMPTY_LOG());
    const [history, setHistory] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        const todayLog = loadLocal(today);
        setLog(todayLog);
        const hist = {};
        last7Days().forEach((d) => {
            hist[d] = loadLocal(d);
        });
        setHistory(hist);
        sholatTrackerApi
            .today()
            .then((r) => r.json())
            .then((data) => {
                if (data && typeof data === 'object') {
                    const merged = {
                        shubuh: data.shubuh ?? todayLog.shubuh,
                        dzuhur: data.dzuhur ?? todayLog.dzuhur,
                        ashar: data.ashar ?? todayLog.ashar,
                        maghrib: data.maghrib ?? todayLog.maghrib,
                        isya: data.isya ?? todayLog.isya,
                    };
                    setLog(merged);
                    saveLocal(today, merged);
                }
            })
            .catch(() => {});
    }, [isAuthenticated, authLoading, today]);

    const toggle = async (key) => {
        const updated = { ...log, [key]: !log[key] };
        setLog(updated);
        saveLocal(today, updated);
        setHistory((prev) => ({ ...prev, [today]: updated }));
        setSaving(true);
        sholatTrackerApi
            .update(updated)
            .catch(() => {})
            .finally(() => setSaving(false));
    };

    const score = (l) => PRAYERS.filter((p) => l?.[p.key]).length;
    const todayScore = score(log);

    const scoreColor = (s) => {
        if (s === 5) return 'text-emerald-600 dark:text-emerald-400';
        if (s >= 3) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-500 dark:text-red-400';
    };

    const scoreBg = (s) => {
        if (s === 5) return 'bg-emerald-500';
        if (s >= 3) return 'bg-yellow-400';
        return 'bg-red-400';
    };

    if (authLoading) return null;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-xl'>
                    <div className='mb-6 flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center'>
                                <MdMosque className='text-xl text-emerald-700 dark:text-emerald-400' />
                            </div>
                            <div>
                                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                                    {t('sholat.title')}
                                </h1>
                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    {new Date().toLocaleDateString(
                                        lang === 'EN' ? 'en-US' : 'id-ID',
                                        {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        },
                                    )}
                                </p>
                            </div>
                        </div>
                        {saving && (
                            <span className='text-xs text-gray-400 dark:text-gray-500 animate-pulse'>
                                {t('common.saving')}
                            </span>
                        )}
                    </div>

                    <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 mb-6'>
                        <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                                {t('sholat.today')}
                            </span>
                            <span className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                                {todayScore}/5
                            </span>
                        </div>
                        <div className='h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden'>
                            <div
                                className='h-full bg-emerald-500 rounded-full transition-all duration-500'
                                style={{ width: `${(todayScore / 5) * 100}%` }}
                            />
                        </div>
                        <p className='text-xs text-gray-400 dark:text-gray-500 mt-1.5'>
                            {Math.round((todayScore / 5) * 100)}% {t('sholat.pct_done')}
                        </p>
                    </div>

                    <div className='grid grid-cols-1 gap-3 mb-8'>
                        {PRAYERS.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => toggle(p.key)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                                    log[p.key]
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-600'
                                }`}
                            >
                                {log[p.key] ? (
                                    <BsCheckCircleFill className='text-2xl text-emerald-500 flex-shrink-0' />
                                ) : (
                                    <BsCircle className='text-2xl text-gray-300 dark:text-slate-600 flex-shrink-0' />
                                )}
                                <div className='flex-1'>
                                    <p
                                        className={`font-semibold ${log[p.key] ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}
                                    >
                                        {p.label}
                                    </p>
                                    <p className='text-xs text-gray-400 dark:text-gray-500'>{p.time}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
                        <div className='px-5 py-3 border-b border-gray-100 dark:border-slate-700'>
                            <p className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                                {t('sholat.last_7_days')}
                            </p>
                        </div>
                        <table className='w-full text-sm'>
                            <tbody>
                                {last7Days().map((d) => {
                                    const s = score(history[d] ?? EMPTY_LOG());
                                    const isToday = d === today;
                                    return (
                                        <tr
                                            key={d}
                                            className={`border-b border-gray-50 dark:border-slate-700/50 last:border-0 ${
                                                isToday ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                                            }`}
                                        >
                                            <td className='px-5 py-2.5 text-gray-700 dark:text-gray-300'>
                                                {isToday
                                                    ? t('sholat.today')
                                                    : formatDate(
                                                          d,
                                                          lang === 'EN' ? 'en-US' : 'id-ID',
                                                      )}
                                            </td>
                                            <td className='px-5 py-2.5'>
                                                <div className='bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden'>
                                                    <div
                                                        className={`h-full rounded-full transition-all ${scoreBg(s)}`}
                                                        style={{ width: `${(s / 5) * 100}%` }}
                                                    />
                                                </div>
                                            </td>
                                            <td
                                                className={`px-5 py-2.5 text-right text-xs font-bold ${scoreColor(s)}`}
                                            >
                                                {s}/5
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default SholatTrackerPage;
