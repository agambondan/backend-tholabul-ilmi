'use client';

import Footer from '@/components/Footer';
import ContentWidth from '@/components/layout/ContentWidth';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useLocale } from '@/context/Locale';
import { quranApi } from '@/lib/api';
import { getLocalizedField } from '@/lib/translation';
import Link from 'next/link';
import { useState } from 'react';

const PageMushafContent = () => {
    const { t, lang } = useLocale();
    const [mode, setMode] = useState('page');
    const [value, setValue] = useState(1);
    const [ayahs, setAyahs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const req =
                mode === 'page' ? quranApi.byPage(value) : quranApi.byHizb(value);
            const res = await req;
            const data = await res.json();
            const items = data?.items ?? data?.data?.items ?? [];
            setAyahs(items);
        } catch {
            setAyahs([]);
        } finally {
            setLoading(false);
        }
    };

    const max = mode === 'page' ? 604 : 240;
    const minLabel = t(mode === 'page' ? 'mushaf.go_to_page' : 'mushaf.go_to_hizb');

    return (
        <ContentWidth compact='max-w-3xl' className='px-4'>
            <div className='text-center mb-8'>
                <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                    {t('mushaf.title')}
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {t('mushaf.subtitle')}
                </p>
            </div>

            <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-6'>
                <div className='flex gap-2 mb-4'>
                    <button
                        onClick={() => {
                            setMode('page');
                            setValue(1);
                            setAyahs([]);
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            mode === 'page'
                                ? 'bg-emerald-700 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                        {t('mushaf.by_page')}
                    </button>
                    <button
                        onClick={() => {
                            setMode('hizb');
                            setValue(1);
                            setAyahs([]);
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            mode === 'hizb'
                                ? 'bg-emerald-700 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                        }`}
                    >
                        {t('mushaf.by_hizb')}
                    </button>
                </div>

                <label className='block text-xs text-gray-500 dark:text-gray-400 mb-1'>
                    {minLabel} (1 - {max})
                </label>
                <div className='flex gap-2'>
                    <input
                        type='number'
                        min={1}
                        max={max}
                        value={value}
                        onChange={(e) =>
                            setValue(
                                Math.max(1, Math.min(max, Number(e.target.value) || 1)),
                            )
                        }
                        className='flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-emerald-500'
                    />
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className='px-5 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 disabled:opacity-50'
                    >
                        {loading ? t('common.loading') : t('mushaf.go')}
                    </button>
                </div>
            </div>

            {ayahs.length > 0 && (
                <div className='space-y-3'>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mb-2'>
                        {ayahs.length} {t('mushaf.ayah_unit')}
                    </p>
                    {ayahs.map((a) => (
                        <div
                            key={a.id}
                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'
                        >
                            <div className='flex items-center justify-between mb-2 text-xs text-gray-400 dark:text-gray-500'>
                                <Link
                                    href={`/quran/${a.surah?.number}-${getLocalizedField(a.surah, 'name', lang) || a.surah?.id}`}
                                    className='font-semibold text-emerald-700 dark:text-emerald-400 hover:underline'
                                >
                                    {a.surah?.number}.{' '}
                                    {getLocalizedField(a.surah, 'name', lang) ||
                                        a.surah?.translation?.name}
                                </Link>
                                <span>
                                    {t('mushaf.ayah')} {a.number}
                                </span>
                            </div>
                            <p
                                className='text-2xl leading-[2.2] text-right text-emerald-900 dark:text-white'
                                style={{ direction: 'rtl', fontFamily: 'Amiri, serif' }}
                            >
                                {a.translation?.ar}
                            </p>
                            {a.translation?.[lang === 'EN' ? 'en' : 'idn'] && (
                                <p className='text-sm text-gray-600 dark:text-gray-300 mt-2'>
                                    {a.translation[lang === 'EN' ? 'en' : 'idn']}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!loading && ayahs.length === 0 && (
                <div className='text-center py-12'>
                    <p className='text-gray-400 dark:text-gray-500 text-sm'>
                        {t('mushaf.empty_hint')}
                    </p>
                </div>
            )}
        </ContentWidth>
    );
};

const PageMushafPage = () => (
    <main className='min-h-screen flex flex-col'>
        <NavbarTailwindCss />
        <Section>
            <PageMushafContent />
        </Section>
        <Footer />
    </main>
);

export default PageMushafPage;
