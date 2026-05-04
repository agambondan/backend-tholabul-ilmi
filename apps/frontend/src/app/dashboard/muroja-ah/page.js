'use client';

import { useLocale } from '@/context/Locale';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsCheckCircleFill } from 'react-icons/bs';
import { MdRefresh } from 'react-icons/md';

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const MurojaahPage = () => {
    const { t } = useLocale();
    const [hafalList, setHafalList] = useState([]);
    const [reviewed, setReviewed] = useState({});

    useEffect(() => {
        try {
            const all = JSON.parse(localStorage.getItem('tholabul_hafalan') ?? '[]');
            setHafalList(all.filter((s) => s.status === 'hafal'));
        } catch {}

        const rev = {};
        try {
            const all = JSON.parse(localStorage.getItem('tholabul_hafalan') ?? '[]');
            all.filter((s) => s.status === 'hafal').forEach((s) => {
                const val = localStorage.getItem(`tholabul_muroja_${s.surah_number}`);
                if (val) rev[s.surah_number] = val;
            });
        } catch {}
        setReviewed(rev);
    }, []);

    const markReviewed = (surahNumber) => {
        const today = todayStr();
        try {
            localStorage.setItem(`tholabul_muroja_${surahNumber}`, today);
        } catch {}
        setReviewed((prev) => ({ ...prev, [surahNumber]: today }));
    };

    if (hafalList.length === 0) {
        return (
            <div className='px-4 py-6 max-w-2xl mx-auto'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>
                    {t('muroja.title')}
                </h1>
                <div className='text-center py-16'>
                    <p className='text-4xl mb-3'>📖</p>
                    <p className='text-gray-500 dark:text-gray-400 text-sm mb-4'>
                        {t('muroja.no_hafalan')}
                    </p>
                    <Link
                        href='/dashboard/hafalan'
                        className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors'
                    >
                        {t('muroja.manage_hafalan')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='px-4 py-6 max-w-2xl mx-auto'>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
                {t('muroja.title')}
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-6'>
                {hafalList.length} {t('muroja.surah_count')}
            </p>

            <div className='grid gap-3'>
                {hafalList.map((surah) => {
                    const lastReviewed = reviewed[surah.surah_number];
                    const reviewedToday = lastReviewed === todayStr();
                    return (
                        <div
                            key={surah.surah_number}
                            className={`bg-white dark:bg-slate-800 rounded-xl border transition-all p-4 ${
                                reviewedToday
                                    ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10'
                                    : 'border-gray-100 dark:border-slate-700'
                            }`}
                        >
                            <div className='flex items-center justify-between gap-3'>
                                <div>
                                    <p className='text-sm font-semibold text-gray-800 dark:text-white'>
                                        {surah.surah_number}. {surah.surah_name}
                                    </p>
                                    {lastReviewed ? (
                                        <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                            {t('muroja.last_review')}:{' '}
                                            {new Date(
                                                lastReviewed + 'T00:00:00',
                                            ).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    ) : (
                                        <p className='text-xs text-amber-500 dark:text-amber-400 mt-0.5'>
                                            {t('muroja.never_reviewed')}
                                        </p>
                                    )}
                                </div>
                                <div className='flex items-center gap-2 shrink-0'>
                                    <Link
                                        href={`/dashboard/quran/${surah.surah_name?.toLowerCase()}`}
                                        className='px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1'
                                    >
                                        <MdRefresh />
                                        {t('muroja.start_review')}
                                    </Link>
                                    {!reviewedToday ? (
                                        <button
                                            onClick={() => markReviewed(surah.surah_number)}
                                            className='px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors'
                                        >
                                            {t('muroja.mark_reviewed')}
                                        </button>
                                    ) : (
                                        <span className='flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400'>
                                            <BsCheckCircleFill />
                                            {t('muroja.done')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MurojaahPage;
