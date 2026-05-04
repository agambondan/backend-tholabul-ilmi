'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonHafalan } from '@/components/skeleton/Skeleton';
import { useLocale } from '@/context/Locale';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { hafalanApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { BsCheckCircleFill, BsCircle, BsRecordCircle } from 'react-icons/bs';

const STATUS_OPTIONS = [
    { value: 'not_started', labelKey: 'hafalan.not_started', icon: <BsCircle />, color: 'text-gray-400' },
    { value: 'in_progress', labelKey: 'hafalan.in_progress_short', icon: <BsRecordCircle />, color: 'text-yellow-500' },
    { value: 'memorized', labelKey: 'hafalan.memorized', icon: <BsCheckCircleFill />, color: 'text-emerald-500' },
];

const StatusBadge = ({ status, t }) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
    return (
        <span className={`flex items-center gap-1 text-xs font-medium ${opt.color}`}>
            {opt.icon}
            {t(opt.labelKey)}
        </span>
    );
};

const HafalanPage = () => {
    const { t } = useLocale();
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
    const [hafalan, setHafalan] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            const [listRes, summaryRes] = await Promise.all([
                hafalanApi.list().then((r) => r.json()),
                hafalanApi.summary().then((r) => r.json()),
            ]);
            setHafalan(listRes?.items ?? listRes ?? []);
            setSummary(summaryRes);
        } catch {
            setError(t('hafalan.load_error'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        load();
    }, [isAuthenticated, authLoading]);

    const handleStatusChange = async (surahId, status) => {
        setUpdating(surahId);
        setError('');
        try {
            await hafalanApi.update(surahId, status);
            setHafalan((prev) =>
                prev.map((s) => (s.surah_id === surahId ? { ...s, status } : s))
            );
        } catch {
            setError(t('hafalan.save_error'));
        } finally {
            setUpdating(null);
        }
    };

    if (authLoading || isLoading) return <SkeletonHafalan />;

    const memorized = hafalan.filter((s) => s.status === 'memorized').length;
    const inProgress = hafalan.filter((s) => s.status === 'in_progress').length;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-3xl'>
                    <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-2'>
                        {t('hafalan.page_title')}
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mb-6'>
                        {t('hafalan.page_subtitle')}
                    </p>

                    {error && (
                        <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400'>
                            {error}
                        </div>
                    )}

                    {summary && (
                        <div className='grid grid-cols-3 gap-3 mb-6'>
                            <div className='bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 text-center'>
                                <p className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                                    {summary.memorized ?? memorized}
                                </p>
                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{t('hafalan.memorized')}</p>
                            </div>
                            <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl p-4 text-center'>
                                <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                                    {summary.in_progress ?? inProgress}
                                </p>
                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{t('hafalan.in_progress_short')}</p>
                            </div>
                            <div className='bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-4 text-center'>
                                <p className='text-2xl font-bold text-gray-600 dark:text-gray-300'>
                                    {summary.not_started ?? 114 - memorized - inProgress}
                                </p>
                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{t('hafalan.not_started')}</p>
                            </div>
                        </div>
                    )}

                    <div className='space-y-2'>
                        {hafalan.map((surah) => (
                            <div
                                key={surah.surah_id ?? surah.id}
                                className='flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700'
                            >
                                <div className='flex items-center gap-3'>
                                    <span className='w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center justify-center'>
                                        {surah.surah_number ?? surah.number}
                                    </span>
                                    <div>
                                        <p className='text-sm font-medium text-emerald-900 dark:text-white'>
                                            {surah.surah_latin ?? surah.name}
                                        </p>
                                        <p
                                            className='text-xs text-gray-400'
                                            style={{ fontFamily: 'Amiri, serif' }}
                                        >
                                            {surah.surah_ar ?? surah.arabic}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <StatusBadge status={surah.status ?? 'not_started'} t={t} />
                                    <select
                                        value={surah.status ?? 'not_started'}
                                        disabled={updating === (surah.surah_id ?? surah.id)}
                                        onChange={(e) =>
                                            handleStatusChange(
                                                surah.surah_id ?? surah.id,
                                                e.target.value
                                            )
                                        }
                                        className='text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50'
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {t(opt.labelKey)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default HafalanPage;
