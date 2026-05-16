'use client';

import { useAuth } from '@/context/Auth';
import { useLocale } from '@/context/Locale';
import { notificationInboxApi } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsBell, BsBellFill, BsCheckAll } from 'react-icons/bs';

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const LOCAL_READ_KEY = 'tholabul_notif_read';

const loadLocalRead = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(LOCAL_READ_KEY) ?? '{}');
        const today = todayStr();
        return stored.date === today ? (stored.ids ?? []) : [];
    } catch {
        return [];
    }
};

const saveLocalRead = (id) => {
    try {
        const current = loadLocalRead();
        const updated = { date: todayStr(), ids: [...new Set([...current, id])] };
        localStorage.setItem(LOCAL_READ_KEY, JSON.stringify(updated));
    } catch {}
};

const NotificationsPage = () => {
    const { t, lang } = useLocale();
    const { isAuthenticated } = useAuth();
    const [notifs, setNotifs] = useState([]);

    const buildLocalNotifs = () => {
        const readIds = loadLocalRead();
        const local = [];
        const today = todayStr();

        try {
            const muhasabah = JSON.parse(
                localStorage.getItem('tholabul_muhasabah') ?? '[]',
            );
            if (!muhasabah.find((m) => m.date === today)) {
                local.push({
                    id: 'auto_muhasabah_today',
                    title: t('notif.muhasabah_title'),
                    body: t('notif.muhasabah_body'),
                    date: today,
                    is_read: readIds.includes('auto_muhasabah_today'),
                    local: true,
                    icon: '📝',
                    actionHref: '/dashboard/muhasabah',
                    actionLabel: t('notif.action_muhasabah'),
                });
            }
        } catch {}

        try {
            const PRAYERS = ['shubuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
            const log = JSON.parse(
                localStorage.getItem(`sholat_log_${today}`) ?? '{}',
            );
            const done = PRAYERS.filter((p) => log[p]).length;
            if (done < 5) {
                local.push({
                    id: 'auto_prayer_today',
                    title: t('notif.prayer_title'),
                    body: t('notif.prayer_body'),
                    date: today,
                    is_read: readIds.includes('auto_prayer_today'),
                    local: true,
                    icon: '🕌',
                    actionHref: '/dashboard/sholat-tracker',
                    actionLabel: t('notif.action_prayer'),
                });
            }
        } catch {}

        try {
            const tilawah = JSON.parse(
                localStorage.getItem('tholabul_tilawah') ?? '[]',
            );
            const hasTodayTilawah = tilawah.some((e) => e.date === today);
            if (!hasTodayTilawah) {
                local.push({
                    id: 'auto_tilawah_today',
                    title: t('notif.tilawah_title'),
                    body: t('notif.tilawah_body'),
                    date: today,
                    is_read: readIds.includes('auto_tilawah_today'),
                    local: true,
                    icon: '📖',
                    actionHref: '/dashboard/tilawah',
                    actionLabel: t('notif.action_tilawah'),
                });
            }
        } catch {}

        try {
            const reviews = JSON.parse(
                localStorage.getItem('muroja_ah_reviews') ?? '{}',
            );
            const hafalan = JSON.parse(
                localStorage.getItem('tholabul_hafalan') ?? '[]',
            );
            const urgentCount = hafalan
                .filter((s) => s.status === 'hafal')
                .filter((s) => {
                    const iso = reviews[s.surah_number];
                    if (!iso) return true;
                    return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) >= 14;
                }).length;
            if (urgentCount > 0) {
                local.push({
                    id: 'auto_muroja_urgent',
                    title: t('notif.muroja_title'),
                    body: `${t('notif.muroja_body_prefix')} ${urgentCount} ${t('notif.muroja_body_suffix')}`,
                    date: today,
                    is_read: readIds.includes('auto_muroja_urgent'),
                    local: true,
                    icon: '🔄',
                    actionHref: '/dashboard/muroja-ah',
                    actionLabel: t('notif.action_muroja'),
                });
            }
        } catch {}

        return local;
    };

    useEffect(() => {
        if (isAuthenticated) {
            notificationInboxApi
                .list()
                .then((r) => r.json())
                .then((d) => {
                    const items = Array.isArray(d?.items) ? d.items : [];
                    const normalized = items.map((n) => ({
                        ...n,
                        date: n.created_at ? n.created_at.slice(0, 10) : todayStr(),
                        actionHref: n.action_href ?? n.action_url ?? n.href ?? null,
                        actionLabel: n.action_label ?? t('notif.open'),
                    }));
                    setNotifs([...buildLocalNotifs(), ...normalized]);
                })
                .catch(() => setNotifs(buildLocalNotifs()));
        } else {
            setNotifs(buildLocalNotifs());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const markRead = async (notif) => {
        if (notif.local) {
            saveLocalRead(notif.id);
            setNotifs((prev) =>
                prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)),
            );
            return;
        }
        setNotifs((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)),
        );
        try {
            await notificationInboxApi.markRead(notif.id);
        } catch {}
    };

    const markAllRead = async () => {
        notifs.filter((n) => n.local && !n.is_read).forEach((n) => saveLocalRead(n.id));
        setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
        if (isAuthenticated) {
            try {
                await notificationInboxApi.markAllRead();
            } catch {}
        }
    };

    const unreadCount = notifs.filter((n) => !n.is_read).length;

    return (
        <div className='px-4 py-6'>
            <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-2'>
                    <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                        {t('notif.title')}
                    </h1>
                    {unreadCount > 0 && (
                        <span className='inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold'>
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className='flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline'
                    >
                        <BsCheckAll />
                        {t('notif.mark_all_read')}
                    </button>
                )}
            </div>

            {notifs.length === 0 ? (
                <div className='text-center py-16'>
                    <BsBell className='mx-auto text-4xl text-gray-300 dark:text-slate-600 mb-3' />
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>
                        {t('notif.empty')}
                    </p>
                </div>
            ) : (
                <ul className='space-y-2'>
                    {notifs.map((notif) => (
                        <li
                            key={notif.id}
                            className={`bg-white dark:bg-slate-800 rounded-xl border p-4 transition-all ${
                                notif.is_read
                                    ? 'border-gray-100 dark:border-slate-700'
                                    : 'border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10'
                            }`}
                        >
                            <div className='flex items-start gap-3'>
                                <div className='mt-0.5 shrink-0'>
                                    {notif.icon ? (
                                        <span className={`text-xl ${notif.is_read ? 'opacity-40' : ''}`}>
                                            {notif.icon}
                                        </span>
                                    ) : (
                                        <span
                                            className={`text-base ${
                                                notif.is_read
                                                    ? 'text-gray-300 dark:text-slate-600'
                                                    : 'text-emerald-500'
                                            }`}
                                        >
                                            {notif.is_read ? <BsBell /> : <BsBellFill />}
                                        </span>
                                    )}
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <p
                                        className={`text-sm font-semibold ${
                                            notif.is_read
                                                ? 'text-gray-600 dark:text-gray-400'
                                                : 'text-gray-800 dark:text-white'
                                        }`}
                                    >
                                        {notif.title}
                                    </p>
                                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>
                                        {notif.body}
                                    </p>
                                    {notif.date && (
                                        <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                                            {new Date(
                                                notif.date + 'T00:00:00',
                                            ).toLocaleDateString(
                                                lang === 'EN' ? 'en-US' : 'id-ID',
                                                {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                },
                                            )}
                                        </p>
                                    )}
                                    <div className='mt-3 flex flex-wrap items-center gap-2'>
                                        {notif.actionHref && (
                                            <Link
                                                href={notif.actionHref}
                                                onClick={() => {
                                                    if (!notif.is_read) markRead(notif);
                                                }}
                                                className='inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400'
                                            >
                                                {notif.actionLabel ?? t('notif.open')}
                                            </Link>
                                        )}
                                        {!notif.is_read && (
                                            <button
                                                type='button'
                                                onClick={() => markRead(notif)}
                                                className='inline-flex items-center rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
                                            >
                                                {t('notif.mark_read')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {!notif.is_read && (
                                    <span className='w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5' />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationsPage;
