'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
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

const formatDate = (str) => {
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
};

const SholatTrackerPage = () => {
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
                    {/* Header */}
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center'>
                            <MdMosque className='text-xl text-emerald-700 dark:text-emerald-400' />
                        </div>
                        <div>
                            <h1 className='text-xl font-bold text-emerald-900 dark:text-white'>
                                Sholat Tracker
                            </h1>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                                {new Date().toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        {saving && (
                            <span className='ml-auto text-xs text-gray-400 dark:text-gray-500 animate-pulse'>
                                Menyimpan...
                            </span>
                        )}
                    </div>

                    {/* Today summary */}
                    <div className='bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-2xl p-5 mb-5 text-white'>
                        <div className='flex items-end justify-between mb-3'>
                            <div>
                                <p className='text-sm text-emerald-200'>Hari ini</p>
                                <p className={`text-4xl font-extrabold ${todayScore === 5 ? 'text-white' : 'text-white'}`}>
                                    {todayScore}
                                    <span className='text-xl font-medium text-emerald-200'>/5</span>
                                </p>
                            </div>
                            <p className='text-sm text-emerald-200'>
                                {todayScore === 5
                                    ? 'Sempurna! Alhamdulillah 🎉'
                                    : todayScore >= 3
                                      ? 'Terus semangat! 💪'
                                      : 'Jangan lewatkan sholat 🙏'}
                            </p>
                        </div>
                        <div className='flex gap-1'>
                            {PRAYERS.map((p) => (
                                <div
                                    key={p.key}
                                    className={`flex-1 h-2 rounded-full transition-all ${log[p.key] ? 'bg-white' : 'bg-emerald-800/60'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Prayer checklist */}
                    <div className='space-y-2 mb-6'>
                        {PRAYERS.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => toggle(p.key)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                                    log[p.key]
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
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
                                {log[p.key] && (
                                    <span className='text-xs text-emerald-500 font-medium'>✓ Dikerjakan</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* 7-day history */}
                    <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5'>
                        <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4'>
                            Riwayat 7 Hari
                        </h2>
                        <div className='space-y-2'>
                            {last7Days().map((d) => {
                                const s = score(history[d] ?? EMPTY_LOG());
                                const isToday = d === today;
                                return (
                                    <div key={d} className='flex items-center gap-3'>
                                        <span className='text-xs text-gray-500 dark:text-gray-400 w-28 flex-shrink-0'>
                                            {isToday ? 'Hari ini' : formatDate(d)}
                                        </span>
                                        <div className='flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden'>
                                            <div
                                                className={`h-full rounded-full transition-all ${scoreBg(s)}`}
                                                style={{ width: `${(s / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span
                                            className={`text-xs font-bold w-8 text-right flex-shrink-0 ${scoreColor(s)}`}
                                        >
                                            {s}/5
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default SholatTrackerPage;
