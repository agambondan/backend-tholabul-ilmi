import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import DeveloperKeyManager from './DeveloperKeyManager';

export const metadata = {
    title: "Developer API — Thullaabul 'Ilmi",
    description: 'Dokumentasi API publik Thullaabul Ilmi untuk developer.',
};

const BASE_URL = 'https://api.tholabul-ilmi.com';

const groups = [
    {
        title: 'Al-Quran',
        color: 'emerald',
        endpoints: [
            { method: 'GET', path: '/api/v1/surah', desc: 'Daftar semua surah (114 surah)', params: 'size, sort' },
            { method: 'GET', path: '/api/v1/surah/:slug', desc: 'Detail surah berdasarkan slug Latin', params: 'slug' },
            { method: 'GET', path: '/api/v1/ayahs', desc: 'Daftar ayat dengan filter surah', params: 'surah_id, size, page' },
            { method: 'GET', path: '/api/v1/tafsir/surah/:number', desc: 'Tafsir per surah', params: 'number' },
            { method: 'GET', path: '/api/v1/tafsir/ayah/:ayahId', desc: 'Tafsir per ayat', params: 'ayahId' },
            { method: 'GET', path: '/api/v1/asbabun-nuzul/surah/:number', desc: 'Asbabun Nuzul per surah', params: 'number' },
            { method: 'GET', path: '/api/v1/audio/surah/:number', desc: 'Audio tilawah per surah', params: 'number' },
        ],
    },
    {
        title: 'Hadith',
        color: 'amber',
        endpoints: [
            { method: 'GET', path: '/api/v1/hadiths/book/:slug', desc: 'Daftar hadith per kitab', params: 'slug, size, page' },
            { method: 'GET', path: '/api/v1/hadiths/theme/slug/:slug', desc: 'Hadith berdasarkan tema', params: 'slug, size, page' },
            { method: 'GET', path: '/api/v1/chapters', desc: 'Daftar bab per kitab', params: 'book_id, size, page' },
        ],
    },
    {
        title: 'Doa & Dzikir',
        color: 'purple',
        endpoints: [
            { method: 'GET', path: '/api/v1/doa', desc: 'Semua doa harian', params: '–' },
            { method: 'GET', path: '/api/v1/doa/:id', desc: 'Detail doa', params: 'id' },
            { method: 'GET', path: '/api/v1/doa/category/:category', desc: 'Doa berdasarkan kategori', params: 'category' },
            { method: 'GET', path: '/api/v1/dzikir', desc: 'Semua dzikir', params: '–' },
            { method: 'GET', path: '/api/v1/dzikir/:id', desc: 'Detail dzikir', params: 'id' },
            { method: 'GET', path: '/api/v1/dzikir/category/:category', desc: 'Dzikir berdasarkan kategori', params: 'category' },
        ],
    },
    {
        title: 'Asmaul Husna',
        color: 'sky',
        endpoints: [
            { method: 'GET', path: '/api/v1/asmaul-husna', desc: 'Semua 99 Asmaul Husna', params: '–' },
            { method: 'GET', path: '/api/v1/asmaul-husna/:number', desc: 'Detail per nomor', params: 'number (1–99)' },
        ],
    },
    {
        title: 'Siroh & Blog',
        color: 'orange',
        endpoints: [
            { method: 'GET', path: '/api/v1/siroh/categories', desc: 'Kategori siroh nabawi', params: '–' },
            { method: 'GET', path: '/api/v1/siroh/contents', desc: 'Semua konten siroh', params: '–' },
            { method: 'GET', path: '/api/v1/siroh/contents/:slug', desc: 'Detail konten siroh', params: 'slug' },
            { method: 'GET', path: '/api/v1/blog/posts', desc: 'Daftar artikel blog', params: 'page, size' },
            { method: 'GET', path: '/api/v1/blog/posts/:slug', desc: 'Detail artikel', params: 'slug' },
        ],
    },
    {
        title: 'Tools',
        color: 'teal',
        endpoints: [
            { method: 'GET', path: '/api/v1/hijri/today', desc: 'Tanggal Hijriah hari ini', params: '–' },
            { method: 'GET', path: '/api/v1/hijri', desc: 'Konversi tanggal Masehi ke Hijriah', params: 'date (YYYY-MM-DD)' },
            { method: 'GET', path: '/api/v1/hijri/events', desc: 'Peristiwa penting kalender Hijriah', params: '–' },
            { method: 'GET', path: '/api/v1/search', desc: 'Pencarian global (quran, hadith, dll)', params: 'q, type, lang' },
            { method: 'GET', path: '/api/v1/leaderboard/streak', desc: 'Leaderboard streak aktivitas', params: '–' },
            { method: 'GET', path: '/api/v1/leaderboard/hafalan', desc: 'Leaderboard hafalan surah', params: '–' },
        ],
    },
];

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

export default function DevPage() {
    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='max-w-4xl mx-auto px-4 py-8'>
                    {/* Header */}
                    <div className='mb-10'>
                        <p
                            className='text-3xl text-emerald-700 dark:text-emerald-400 mb-2'
                            style={{ fontFamily: 'Amiri, serif' }}
                        >
                            وَاجِهَةُ الْبَرْمَجَة
                        </p>
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            Developer API
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
                            REST API publik untuk mengakses data Al-Quran, Hadith, dan konten
                            islami lainnya.
                        </p>

                        {/* Base URL */}
                        <div className='flex items-center gap-3 bg-slate-900 dark:bg-slate-950 rounded-xl px-4 py-3 font-mono text-sm overflow-x-auto'>
                            <span className='text-slate-500 shrink-0'>Base URL</span>
                            <span className='text-emerald-400 font-semibold'>{BASE_URL}</span>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className='mb-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200'>
                        Semua endpoint bertanda <span className='font-mono bg-white dark:bg-slate-800 px-1 rounded'>GET</span> bersifat publik dan tidak memerlukan autentikasi, kecuali endpoint yang memerlukan data pengguna.
                    </div>

                    <div className='mb-8'>
                        <DeveloperKeyManager />
                    </div>

                    {/* Endpoint groups */}
                    <div className='flex flex-col gap-6'>
                        {groups.map((group) => {
                            const c = colorMap[group.color];
                            return (
                                <div
                                    key={group.title}
                                    className={`border rounded-2xl overflow-hidden ${c.border}`}
                                >
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

                    {/* Auth note */}
                    <div className='mt-8 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden'>
                        <div className='px-4 py-3 bg-slate-50 dark:bg-slate-800/60'>
                            <h2 className='font-semibold text-sm text-slate-700 dark:text-slate-300'>
                                Endpoint Terautentikasi
                            </h2>
                        </div>
                        <div className='px-4 py-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                            Beberapa endpoint memerlukan token JWT di header:
                            <pre className='mt-3 bg-slate-900 dark:bg-slate-950 text-emerald-400 rounded-xl px-4 py-3 font-mono text-xs overflow-x-auto'>
                                {`Authorization: Bearer <token>`}
                            </pre>
                            <p className='mt-3'>
                                Endpoint terautentikasi meliputi: bookmark, progress baca, hafalan, tilawah, amalan, streak, dan statistik personal.
                            </p>
                        </div>
                    </div>

                    <p className='mt-8 text-center text-xs text-gray-400 dark:text-gray-600'>
                        Dokumentasi lengkap dengan contoh request & response akan segera tersedia.
                    </p>
                </div>
            </Section>
            <Footer />
        </main>
    );
}
