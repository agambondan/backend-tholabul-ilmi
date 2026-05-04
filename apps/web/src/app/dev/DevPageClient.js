'use client';

import { useLocale } from '@/context/Locale';
import DeveloperKeyManager from './DeveloperKeyManager';

const BASE_URL = 'https://api.tholabul-ilmi.com';

const groupsByLang = {
    ID: [
        {
            title: 'Al-Quran',
            color: 'emerald',
            endpoints: [
                { method: 'GET', path: '/api/v1/surah', desc: 'Daftar semua surah (114 surah)' },
                { method: 'GET', path: '/api/v1/surah/:slug', desc: 'Detail surah berdasarkan slug Latin' },
                { method: 'GET', path: '/api/v1/ayahs', desc: 'Daftar ayat dengan filter surah' },
                { method: 'GET', path: '/api/v1/tafsir/surah/:number', desc: 'Tafsir per surah' },
                { method: 'GET', path: '/api/v1/tafsir/ayah/:ayahId', desc: 'Tafsir per ayat' },
                { method: 'GET', path: '/api/v1/asbabun-nuzul/surah/:number', desc: 'Asbabun Nuzul per surah' },
                { method: 'GET', path: '/api/v1/audio/surah/:number', desc: 'Audio tilawah per surah' },
            ],
        },
        {
            title: 'Hadith',
            color: 'amber',
            endpoints: [
                { method: 'GET', path: '/api/v1/hadiths/book/:slug', desc: 'Daftar hadith per kitab' },
                { method: 'GET', path: '/api/v1/hadiths/theme/slug/:slug', desc: 'Hadith berdasarkan tema' },
                { method: 'GET', path: '/api/v1/chapters', desc: 'Daftar bab per kitab' },
            ],
        },
        {
            title: 'Doa & Dzikir',
            color: 'purple',
            endpoints: [
                { method: 'GET', path: '/api/v1/doa', desc: 'Semua doa harian' },
                { method: 'GET', path: '/api/v1/doa/:id', desc: 'Detail doa' },
                { method: 'GET', path: '/api/v1/doa/category/:category', desc: 'Doa berdasarkan kategori' },
                { method: 'GET', path: '/api/v1/dzikir', desc: 'Semua dzikir' },
                { method: 'GET', path: '/api/v1/dzikir/:id', desc: 'Detail dzikir' },
                { method: 'GET', path: '/api/v1/dzikir/category/:category', desc: 'Dzikir berdasarkan kategori' },
            ],
        },
        {
            title: 'Asmaul Husna',
            color: 'sky',
            endpoints: [
                { method: 'GET', path: '/api/v1/asmaul-husna', desc: 'Semua 99 Asmaul Husna' },
                { method: 'GET', path: '/api/v1/asmaul-husna/:number', desc: 'Detail per nomor' },
            ],
        },
        {
            title: 'Siroh & Blog',
            color: 'orange',
            endpoints: [
                { method: 'GET', path: '/api/v1/siroh/categories', desc: 'Kategori siroh nabawi' },
                { method: 'GET', path: '/api/v1/siroh/contents', desc: 'Semua konten siroh' },
                { method: 'GET', path: '/api/v1/siroh/contents/:slug', desc: 'Detail konten siroh' },
                { method: 'GET', path: '/api/v1/blog/posts', desc: 'Daftar artikel blog' },
                { method: 'GET', path: '/api/v1/blog/posts/:slug', desc: 'Detail artikel' },
            ],
        },
        {
            title: 'Tools',
            color: 'teal',
            endpoints: [
                { method: 'GET', path: '/api/v1/hijri/today', desc: 'Tanggal Hijriah hari ini' },
                { method: 'GET', path: '/api/v1/hijri', desc: 'Konversi tanggal Masehi ke Hijriah' },
                { method: 'GET', path: '/api/v1/hijri/events', desc: 'Peristiwa penting kalender Hijriah' },
                { method: 'GET', path: '/api/v1/search', desc: 'Pencarian global (quran, hadith, dll)' },
                { method: 'GET', path: '/api/v1/leaderboard/streak', desc: 'Leaderboard streak aktivitas' },
                { method: 'GET', path: '/api/v1/leaderboard/hafalan', desc: 'Leaderboard hafalan surah' },
            ],
        },
    ],
    EN: [
        {
            title: 'Al-Quran',
            color: 'emerald',
            endpoints: [
                { method: 'GET', path: '/api/v1/surah', desc: 'List all surahs (114 surahs)' },
                { method: 'GET', path: '/api/v1/surah/:slug', desc: 'Surah details by Latin slug' },
                { method: 'GET', path: '/api/v1/ayahs', desc: 'List ayahs filtered by surah' },
                { method: 'GET', path: '/api/v1/tafsir/surah/:number', desc: 'Tafsir by surah' },
                { method: 'GET', path: '/api/v1/tafsir/ayah/:ayahId', desc: 'Tafsir by ayah' },
                { method: 'GET', path: '/api/v1/asbabun-nuzul/surah/:number', desc: 'Asbabun Nuzul by surah' },
                { method: 'GET', path: '/api/v1/audio/surah/:number', desc: 'Recitation audio by surah' },
            ],
        },
        {
            title: 'Hadith',
            color: 'amber',
            endpoints: [
                { method: 'GET', path: '/api/v1/hadiths/book/:slug', desc: 'List hadiths by book' },
                { method: 'GET', path: '/api/v1/hadiths/theme/slug/:slug', desc: 'Hadiths by theme' },
                { method: 'GET', path: '/api/v1/chapters', desc: 'List chapters by book' },
            ],
        },
        {
            title: 'Dua & Dhikr',
            color: 'purple',
            endpoints: [
                { method: 'GET', path: '/api/v1/doa', desc: 'All daily duas' },
                { method: 'GET', path: '/api/v1/doa/:id', desc: 'Dua details' },
                { method: 'GET', path: '/api/v1/doa/category/:category', desc: 'Duas by category' },
                { method: 'GET', path: '/api/v1/dzikir', desc: 'All dhikr' },
                { method: 'GET', path: '/api/v1/dzikir/:id', desc: 'Dhikr details' },
                { method: 'GET', path: '/api/v1/dzikir/category/:category', desc: 'Dhikr by category' },
            ],
        },
        {
            title: 'Asmaul Husna',
            color: 'sky',
            endpoints: [
                { method: 'GET', path: '/api/v1/asmaul-husna', desc: 'All 99 Asmaul Husna' },
                { method: 'GET', path: '/api/v1/asmaul-husna/:number', desc: 'Details by number' },
            ],
        },
        {
            title: 'Sirah & Blog',
            color: 'orange',
            endpoints: [
                { method: 'GET', path: '/api/v1/siroh/categories', desc: 'Prophetic sirah categories' },
                { method: 'GET', path: '/api/v1/siroh/contents', desc: 'All sirah content' },
                { method: 'GET', path: '/api/v1/siroh/contents/:slug', desc: 'Sirah content details' },
                { method: 'GET', path: '/api/v1/blog/posts', desc: 'Blog article list' },
                { method: 'GET', path: '/api/v1/blog/posts/:slug', desc: 'Article details' },
            ],
        },
        {
            title: 'Tools',
            color: 'teal',
            endpoints: [
                { method: 'GET', path: '/api/v1/hijri/today', desc: "Today's Hijri date" },
                { method: 'GET', path: '/api/v1/hijri', desc: 'Convert Gregorian date to Hijri' },
                { method: 'GET', path: '/api/v1/hijri/events', desc: 'Important Hijri calendar events' },
                { method: 'GET', path: '/api/v1/search', desc: 'Global search (quran, hadith, etc.)' },
                { method: 'GET', path: '/api/v1/leaderboard/streak', desc: 'Activity streak leaderboard' },
                { method: 'GET', path: '/api/v1/leaderboard/hafalan', desc: 'Surah memorization leaderboard' },
            ],
        },
    ],
};

const colorMap = {
    emerald: {
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        title: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        header: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    amber: {
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        title: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        header: 'bg-amber-50 dark:bg-amber-900/20',
    },
    purple: {
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        title: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        header: 'bg-purple-50 dark:bg-purple-900/20',
    },
    sky: {
        badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
        title: 'text-sky-700 dark:text-sky-400',
        border: 'border-sky-200 dark:border-sky-800',
        header: 'bg-sky-50 dark:bg-sky-900/20',
    },
    orange: {
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        title: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        header: 'bg-orange-50 dark:bg-orange-900/20',
    },
    teal: {
        badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
        title: 'text-teal-700 dark:text-teal-400',
        border: 'border-teal-200 dark:border-teal-800',
        header: 'bg-teal-50 dark:bg-teal-900/20',
    },
};

export default function DevPageClient() {
    const { lang, t } = useLocale();
    const groups = groupsByLang[lang] ?? groupsByLang.ID;

    return (
        <div className='max-w-4xl mx-auto px-4 py-8'>
            <div className='mb-10'>
                <p
                    className='text-3xl text-emerald-700 dark:text-emerald-400 mb-2'
                    style={{ fontFamily: 'Amiri, serif' }}
                >
                    وَاجِهَةُ الْبَرْمَجَة
                </p>
                <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                    {t('dev.title')}
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
                    {t('dev.subtitle')}
                </p>

                <div className='flex items-center gap-3 bg-slate-900 dark:bg-slate-950 rounded-xl px-4 py-3 font-mono text-sm overflow-x-auto'>
                    <span className='text-slate-500 shrink-0'>{t('dev.base_url')}</span>
                    <span className='text-emerald-400 font-semibold'>{BASE_URL}</span>
                </div>
            </div>

            <div className='mb-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200'>
                {t('dev.public_get_prefix')}{' '}
                <span className='font-mono bg-white dark:bg-slate-800 px-1 rounded'>GET</span>{' '}
                {t('dev.public_get_suffix')}
            </div>

            <div className='mb-8'>
                <DeveloperKeyManager />
            </div>

            <div className='flex flex-col gap-6'>
                {groups.map((group) => {
                    const c = colorMap[group.color];
                    return (
                        <div key={group.title} className={`border rounded-2xl overflow-hidden ${c.border}`}>
                            <div className={`px-4 py-3 ${c.header}`}>
                                <h2 className={`font-semibold text-sm ${c.title}`}>
                                    {group.title}
                                </h2>
                            </div>
                            <div className='divide-y divide-gray-100 dark:divide-slate-700/60'>
                                {group.endpoints.map((ep) => (
                                    <div
                                        key={ep.path}
                                        className='flex flex-col sm:flex-row sm:items-start gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors'
                                    >
                                        <span
                                            className={`shrink-0 text-xs font-bold font-mono px-2 py-0.5 rounded ${c.badge} w-fit`}
                                        >
                                            {ep.method}
                                        </span>
                                        <code className='text-sm text-slate-700 dark:text-slate-300 font-mono break-all'>
                                            {ep.path}
                                        </code>
                                        <span className='sm:ml-auto text-xs text-gray-500 dark:text-gray-400 sm:text-right shrink-0 max-w-xs'>
                                            {ep.desc}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className='mt-8 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden'>
                <div className='px-4 py-3 bg-slate-50 dark:bg-slate-800/60'>
                    <h2 className='font-semibold text-sm text-slate-700 dark:text-slate-300'>
                        {t('dev.auth_title')}
                    </h2>
                </div>
                <div className='px-4 py-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                    {t('dev.auth_intro')}
                    <pre className='mt-3 bg-slate-900 dark:bg-slate-950 text-emerald-400 rounded-xl px-4 py-3 font-mono text-xs overflow-x-auto'>
                        {`Authorization: Bearer <token>`}
                    </pre>
                    <p className='mt-3'>{t('dev.auth_scope')}</p>
                </div>
            </div>

            <p className='mt-8 text-center text-xs text-gray-400 dark:text-gray-600'>
                {t('dev.full_docs_soon')}
            </p>
        </div>
    );
}
