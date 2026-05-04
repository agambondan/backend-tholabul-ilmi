'use client';

import { useLocale } from '@/context/Locale';
import { useEffect, useState } from 'react';
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs';

const AMALAN = [
    'Sholat Subuh Berjamaah',
    'Sholat Dhuha',
    'Sholat Tahajud',
    'Baca Al-Quran',
    'Dzikir Pagi',
    'Dzikir Petang',
    'Puasa Sunnah',
];

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const storageKey = () => `tholabul_amalan_${todayStr()}`;

const AmalanPage = () => {
    const { t } = useLocale();
    const [checked, setChecked] = useState({});

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(storageKey()) ?? '{}');
            setChecked(stored);
        } catch {}
    }, []);

    const toggle = (key) => {
        const updated = { ...checked, [key]: !checked[key] };
        setChecked(updated);
        try {
            localStorage.setItem(storageKey(), JSON.stringify(updated));
        } catch {}
    };

    const doneCount = AMALAN.filter((a) => checked[a]).length;
    const pct = Math.round((doneCount / AMALAN.length) * 100);

    return (
        <div className='px-4 py-6 max-w-2xl mx-auto'>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-1'>
                {t('amalan.title')}
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-6'>
                {t('amalan.completed_today')}:{' '}
                <span className='font-semibold text-emerald-700 dark:text-emerald-400'>
                    {doneCount}
                </span>
            </p>

            {/* Progress */}
            <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 mb-6'>
                <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        {t('amalan.progress')}
                    </span>
                    <span className='text-2xl font-bold text-emerald-700 dark:text-emerald-400'>
                        {doneCount}/{AMALAN.length}
                    </span>
                </div>
                <div className='h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden'>
                    <div
                        className='h-full bg-emerald-500 rounded-full transition-all duration-500'
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-1.5'>{pct}%</p>
            </div>

            {/* Checklist */}
            <ul className='space-y-2'>
                {AMALAN.map((amalan) => {
                    const done = !!checked[amalan];
                    return (
                        <li key={amalan}>
                            <button
                                onClick={() => toggle(amalan)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all text-left ${
                                    done
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
                                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700'
                                }`}
                            >
                                {done ? (
                                    <BsCheckCircleFill className='text-emerald-500 text-xl shrink-0' />
                                ) : (
                                    <BsCircle className='text-gray-300 dark:text-slate-600 text-xl shrink-0' />
                                )}
                                <span
                                    className={`text-sm font-medium ${
                                        done
                                            ? 'text-emerald-700 dark:text-emerald-400 line-through'
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {amalan}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default AmalanPage;
