'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonList, SkeletonInline } from '@/components/skeleton/Skeleton';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { notificationApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { BsBell, BsBellSlash } from 'react-icons/bs';

const NOTIFICATION_TYPES = [
    {
        type: 'daily_quran',
        label: 'Pengingat Baca Quran',
        description: 'Ingatkan saya untuk membaca Al-Quran setiap hari',
        icon: '📖',
    },
    {
        type: 'daily_hadith',
        label: 'Pengingat Baca Hadith',
        description: 'Ingatkan saya untuk membaca Hadith setiap hari',
        icon: '📚',
    },
    {
        type: 'doa',
        label: 'Pengingat Doa & Dzikir',
        description: 'Ingatkan saya untuk membaca doa dan dzikir harian',
        icon: '🤲',
    },
];

const Toggle = ({ checked, onChange, disabled }) => (
    <button
        type='button'
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            checked ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-600'
        }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

const defaultSetting = (type) => ({
    type,
    time: '07:00',
    is_active: false,
});

const NotificationsPage = () => {
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
    const [settings, setSettings] = useState(
        NOTIFICATION_TYPES.map((t) => defaultSetting(t.type)),
    );
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [bulkSaving, setBulkSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        notificationApi
            .getSettings()
            .then((r) => {
                if (!r.ok) throw new Error();
                return r.json();
            })
            .then((data) => {
                const fetched = Array.isArray(data) ? data : data.data ?? [];
                setSettings(
                    NOTIFICATION_TYPES.map((t) => {
                        const existing = fetched.find((s) => s.type === t.type);
                        return existing ?? defaultSetting(t.type);
                    }),
                );
            })
            .catch(() => {
                // Backend not ready yet, use default settings
            })
            .finally(() => setIsLoading(false));
    }, [isAuthenticated, authLoading]);

    const updateLocal = (type, patch) => {
        setSettings((prev) =>
            prev.map((s) => (s.type === type ? { ...s, ...patch } : s)),
        );
    };

    const applyBulkActive = (active) => {
        setSettings((prev) =>
            prev.map((setting) => ({
                ...setting,
                is_active: active,
                time: setting.time ?? '07:00',
            })),
        );
    };

    const handleSave = async (type) => {
        const setting = settings.find((s) => s.type === type);
        if (!setting) return;
        setSaving(type);
        setSaveMsg({ type: '', text: '' });
        try {
            const res = await notificationApi.updateSettings(setting);
            if (!res.ok) throw new Error('Gagal menyimpan pengaturan');
            setSaveMsg({ type: 'success', text: 'Pengaturan tersimpan.' });
            setTimeout(() => setSaveMsg({ type: '', text: '' }), 3000);
        } catch (err) {
            setSaveMsg({ type: 'error', text: err.message || 'Terjadi kesalahan' });
        } finally {
            setSaving(null);
        }
    };

    const handleSaveAll = async () => {
        setBulkSaving(true);
        setSaveMsg({ type: '', text: '' });
        try {
            const results = await Promise.all(
                settings.map((setting) =>
                    notificationApi.updateSettings(setting).then((res) => ({ res, setting })),
                ),
            );
            if (results.some(({ res }) => !res.ok)) {
                throw new Error('Masih ada pengaturan yang gagal disimpan');
            }
            setSaveMsg({ type: 'success', text: 'Semua pengaturan notifikasi tersimpan.' });
            setTimeout(() => setSaveMsg({ type: '', text: '' }), 3000);
        } catch (err) {
            setSaveMsg({ type: 'error', text: err.message || 'Gagal menyimpan semua pengaturan' });
        } finally {
            setBulkSaving(false);
        }
    };

    const activeCount = settings.filter((setting) => setting.is_active).length;

    if (authLoading) return <SkeletonList />;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-2xl'>
                    <div className='text-center mb-8'>
                        <BsBell className='text-4xl text-emerald-600 dark:text-emerald-400 mx-auto mb-2' />
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            Pengaturan Notifikasi
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            Atur jadwal pengingat harian untuk menjaga konsistensi ibadahmu
                        </p>
                    </div>

                    {saveMsg.text && (
                        <div
                            className={`mb-4 p-3 rounded-lg text-sm text-center ${
                                saveMsg.type === 'success'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            }`}
                        >
                            {saveMsg.text}
                        </div>
                    )}

                    <div className='grid grid-cols-3 gap-3 mb-4'>
                        <div className='rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3'>
                            <p className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                                Total
                            </p>
                            <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>
                                {settings.length}
                            </p>
                        </div>
                        <div className='rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3'>
                            <p className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                                Aktif
                            </p>
                            <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>
                                {activeCount}
                            </p>
                        </div>
                        <div className='rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3'>
                            <p className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                                Nonaktif
                            </p>
                            <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>
                                {settings.length - activeCount}
                            </p>
                        </div>
                    </div>

                    <div className='flex gap-2 mb-4 flex-wrap'>
                        <button
                            type='button'
                            onClick={() => applyBulkActive(true)}
                            className='px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition-colors'
                        >
                            Aktifkan semua
                        </button>
                        <button
                            type='button'
                            onClick={() => applyBulkActive(false)}
                            className='px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors'
                        >
                            Nonaktifkan semua
                        </button>
                        <button
                            type='button'
                            onClick={handleSaveAll}
                            disabled={bulkSaving}
                            className='px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 transition-colors'
                        >
                            {bulkSaving ? 'Menyimpan...' : 'Simpan semua'}
                        </button>
                    </div>

                    {isLoading ? (
                        <SkeletonInline rows={3} />
                    ) : (
                        <div className='space-y-4'>
                            {NOTIFICATION_TYPES.map((notif) => {
                                const setting =
                                    settings.find((s) => s.type === notif.type) ??
                                    defaultSetting(notif.type);
                                return (
                                    <div
                                        key={notif.type}
                                        className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5'
                                    >
                                        <div className='flex items-start justify-between gap-4'>
                                            <div className='flex items-start gap-3'>
                                                <span className='text-2xl mt-0.5'>{notif.icon}</span>
                                                <div>
                                                    <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                                                        {notif.label}
                                                    </p>
                                                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                                                        {notif.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <Toggle
                                                checked={setting.is_active}
                                                onChange={(val) =>
                                                    updateLocal(notif.type, { is_active: val })
                                                }
                                            />
                                        </div>

                                        {setting.is_active && (
                                            <div className='mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center gap-3'>
                                                <label className='text-xs font-medium text-gray-600 dark:text-gray-400 shrink-0'>
                                                    Waktu pengingat
                                                </label>
                                                <input
                                                    type='time'
                                                    value={setting.time ?? '07:00'}
                                                    onChange={(e) =>
                                                        updateLocal(notif.type, { time: e.target.value })
                                                    }
                                                    className='flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                                />
                                                <button
                                                    onClick={() => handleSave(notif.type)}
                                                    disabled={saving === notif.type}
                                                    className='px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 disabled:opacity-50 transition-colors shrink-0'
                                                >
                                                    {saving === notif.type ? 'Menyimpan...' : 'Simpan'}
                                                </button>
                                            </div>
                                        )}

                                        {!setting.is_active && (
                                            <div className='mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500'>
                                                <BsBellSlash className='shrink-0' />
                                                Pengingat nonaktif
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className='mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs'>
                        <p className='font-medium mb-1'>Catatan</p>
                        <p>
                            Pengiriman via email atau push notification masih menunggu integrasi
                            backend. Pastikan kamu mengizinkan notifikasi dari browser untuk
                            menerima pengingat.
                        </p>
                    </div>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default NotificationsPage;
