'use client';

import { useLocale } from '@/context/Locale';
import { useEffect, useState } from 'react';
import { BsBell, BsBellFill, BsCheckAll } from 'react-icons/bs';

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const NotificationsPage = () => {
    const { t } = useLocale();
    const [notifs, setNotifs] = useState([]);

    useEffect(() => {
        let stored = [];
        try {
            stored = JSON.parse(localStorage.getItem('tholabul_notifications') ?? '[]');
        } catch {}

        // Auto-generate muhasabah reminder if not done today
        try {
            const muhasabah = JSON.parse(
                localStorage.getItem('tholabul_muhasabah') ?? '[]',
            );
            const todayMuhasabah = muhasabah.find((m) => m.date === todayStr());
            const reminderExists = stored.some((n) => n.id === 'auto_muhasabah_today');
            if (!todayMuhasabah && !reminderExists) {
                stored = [
                    {
                        id: 'auto_muhasabah_today',
                        title: 'Pengingat Muhasabah',
                        body: 'Jangan lupa muhasabah hari ini 📝',
                        date: todayStr(),
                        read: false,
                    },
                    ...stored,
                ];
            }
        } catch {}

        setNotifs(stored);
    }, []);

    const persist = (updated) => {
        setNotifs(updated);
        try {
            localStorage.setItem('tholabul_notifications', JSON.stringify(updated));
        } catch {}
    };

    const markAllRead = () => {
        persist(notifs.map((n) => ({ ...n, read: true })));
    };

    const markRead = (id) => {
        persist(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const unreadCount = notifs.filter((n) => !n.read).length;

    return (
        <div className='px-4 py-6 max-w-2xl mx-auto'>
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
                            onClick={() => markRead(notif.id)}
                            className={`bg-white dark:bg-slate-800 rounded-xl border p-4 cursor-pointer transition-all ${
                                notif.read
                                    ? 'border-gray-100 dark:border-slate-700'
                                    : 'border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10'
                            }`}
                        >
                            <div className='flex items-start gap-3'>
                                <div
                                    className={`mt-0.5 text-base shrink-0 ${
                                        notif.read
                                            ? 'text-gray-300 dark:text-slate-600'
                                            : 'text-emerald-500'
                                    }`}
                                >
                                    {notif.read ? <BsBell /> : <BsBellFill />}
                                </div>
                                <div className='min-w-0'>
                                    <p
                                        className={`text-sm font-semibold ${
                                            notif.read
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
                                            {new Date(notif.date + 'T00:00:00').toLocaleDateString(
                                                'id-ID',
                                                {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                },
                                            )}
                                        </p>
                                    )}
                                </div>
                                {!notif.read && (
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
