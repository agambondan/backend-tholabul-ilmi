'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonList, SkeletonInline } from '@/components/skeleton/Skeleton';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { tilawahApi } from '@/lib/api';
import { useLocale } from '@/context/Locale';
import { useEffect, useState } from 'react';
import { BsBook, BsPlus } from 'react-icons/bs';

const inputCls =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500';

const TilawahPage = () => {
    const { t } = useLocale();
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
    const [logs, setLogs] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [pages, setPages] = useState('');
    const [juz, setJuz] = useState('');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        load();
    }, [isAuthenticated, authLoading]);

    const load = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [logsRes, summaryRes] = await Promise.all([
                tilawahApi.list(),
                tilawahApi.summary(),
            ]);
            if (logsRes.ok) {
                const d = await logsRes.json();
                setLogs(Array.isArray(d) ? d : d.data ?? []);
            }
            if (summaryRes.ok) {
                setSummary(await summaryRes.json());
            }
        } catch {
            setError(t('tilawah.load_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pages && !juz) {
            setSubmitMsg({ type: 'error', text: t('tilawah.validate_required') });
            return;
        }
        setSubmitting(true);
        setSubmitMsg({ type: '', text: '' });
        try {
            const res = await tilawahApi.add(
                pages ? parseInt(pages, 10) : 0,
                juz ? parseFloat(juz) : 0,
                note,
            );
            if (!res.ok) throw new Error(t('tilawah.general_error'));
            setSubmitMsg({ type: 'success', text: t('tilawah.save_success') });
            setPages('');
            setJuz('');
            setNote('');
            load();
        } catch (err) {
            setSubmitMsg({ type: 'error', text: err.message || t('tilawah.general_error') });
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (str) => {
        if (!str) return '-';
        return new Date(str).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (authLoading) return <SkeletonList />;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-2xl'>
                    <div className='text-center mb-8'>
                        <BsBook className='text-4xl text-emerald-600 dark:text-emerald-400 mx-auto mb-2' />
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            {t('tilawah.tracker_title')}
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {t('tilawah.tracker_subtitle')}
                        </p>
                    </div>

                    {summary && (
                        <div className='grid grid-cols-3 gap-3 mb-6'>
                            {[
                                {
                                    label: t('tilawah.stat_total_pages'),
                                    value: summary.total_pages ?? 0,
                                },
                                {
                                    label: t('tilawah.stat_avg'),
                                    value: `${summary.avg_pages_per_day ?? 0} ${t('tilawah.stat_avg_unit')}`,
                                },
                                {
                                    label: t('tilawah.stat_khatam'),
                                    value: summary.est_khatam_days
                                        ? `${summary.est_khatam_days} ${t('tilawah.stat_khatam_unit')}`
                                        : '—',
                                },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className='bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center'
                                >
                                    <p className='text-xl font-bold text-emerald-700 dark:text-emerald-300'>
                                        {s.value}
                                    </p>
                                    <p className='text-xs text-emerald-600 dark:text-emerald-500 mt-0.5'>
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 mb-6'>
                        <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
                            <BsPlus className='text-lg text-emerald-600' />
                            {t('tilawah.add_log')}
                        </h2>
                        <form onSubmit={handleSubmit} className='space-y-3'>
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='text-xs text-gray-500 dark:text-gray-400 mb-1 block'>
                                        {t('tilawah.label_pages_read')}
                                    </label>
                                    <input
                                        type='number'
                                        min='0'
                                        value={pages}
                                        onChange={(e) => setPages(e.target.value)}
                                        placeholder='0'
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className='text-xs text-gray-500 dark:text-gray-400 mb-1 block'>
                                        {t('tilawah.label_juz_read')}
                                    </label>
                                    <input
                                        type='number'
                                        min='0'
                                        step='0.25'
                                        value={juz}
                                        onChange={(e) => setJuz(e.target.value)}
                                        placeholder='0'
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='text-xs text-gray-500 dark:text-gray-400 mb-1 block'>
                                    {t('tilawah.label_catatan')}
                                </label>
                                <input
                                    type='text'
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder={t('tilawah.catatan_placeholder')}
                                    className={inputCls}
                                />
                            </div>
                            {submitMsg.text && (
                                <p
                                    className={`text-xs ${submitMsg.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                                >
                                    {submitMsg.text}
                                </p>
                            )}
                            <button
                                type='submit'
                                disabled={submitting}
                                className='w-full py-2 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 disabled:opacity-50 transition-colors'
                            >
                                {submitting ? t('tilawah.saving') : t('tilawah.save_btn')}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className='mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm'>
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <SkeletonInline rows={3} />
                    ) : (
                        <div className='space-y-2'>
                            <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
                                {t('tilawah.history')}
                            </h2>
                            {logs.length === 0 ? (
                                <p className='text-center py-8 text-gray-400 dark:text-gray-600 text-sm'>
                                    {t('tilawah.empty_log')}
                                </p>
                            ) : (
                                logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className='flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 px-4 py-3'
                                    >
                                        <div>
                                            <p className='text-sm font-medium text-gray-800 dark:text-white'>
                                                {log.pages_read > 0 && `${log.pages_read} halaman`}
                                                {log.pages_read > 0 && log.juz_read > 0 && ' · '}
                                                {log.juz_read > 0 && `${log.juz_read} juz`}
                                            </p>
                                            {log.note && (
                                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                                                    {log.note}
                                                </p>
                                            )}
                                        </div>
                                        <p className='text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-3'>
                                            {formatDate(log.created_at ?? log.date)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default TilawahPage;
