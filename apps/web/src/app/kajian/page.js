'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useLocale } from '@/context/Locale';
import { kajianApi } from '@/lib/api';
import { getLocalizedField } from '@/lib/translation';
import { useEffect, useState } from 'react';
import { BsPlayCircle, BsSearch, BsYoutube } from 'react-icons/bs';
import { MdOutlinePlayLesson } from 'react-icons/md';

const CATEGORIES = [
    { key: 'semua', labelKey: 'common.all' },
    { key: 'aqidah', labelKey: 'kajian.category_aqidah' },
    { key: 'fiqh', labelKey: 'kajian.category_fiqh' },
    { key: 'tazkiyah', labelKey: 'kajian.category_tazkiyah' },
    { key: 'sirah', labelKey: 'kajian.category_sirah' },
    { key: 'tafsir', labelKey: 'kajian.category_tafsir' },
    { key: 'hadith', labelKey: 'kajian.category_hadith' },
];

const FALLBACK_KAJIAN_EN = {
    1: {
        title: 'Aqidah of Ahlus Sunnah wal Jamaah',
        description: 'A complete explanation of correct Islamic creed based on the Quran and Sunnah.',
    },
    2: {
        title: 'Practical Fiqh of Worship',
        description: 'A practical guide to daily worship: purification, prayer, fasting, and zakat.',
    },
    3: {
        title: 'Tazkiyatun Nafs: Purification of the Soul',
        description: 'Studies on purifying the heart and soul from inner diseases.',
    },
    4: {
        title: 'Complete Prophetic Biography',
        description: 'The life journey of Prophet Muhammad ﷺ from birth until his passing.',
    },
    5: {
        title: "Tafsir of Juz Amma",
        description: 'Explanation of the short surahs in Juz 30 that are often recited.',
    },
    6: {
        title: "Explanation of Nawawi's Forty Hadith",
        description: "Explanation of Imam Nawawi's 42 selected hadith that form foundations of Islamic knowledge.",
    },
    7: {
        title: 'Kitab At-Tawhid: Shaykh Muhammad At-Tamimi',
        description: 'Explanation of Kitab At-Tawhid, an essential work for understanding tawhid correctly.',
    },
    8: {
        title: 'Fiqh of Ramadan Fasting',
        description: 'Rulings of Ramadan fasting: intention, invalidators, fidyah, and related issues.',
    },
    9: {
        title: 'Tafsir of Al-Fatihah',
        description: 'A deeper explanation of the meanings and virtues of Surah Al-Fatihah.',
    },
    10: {
        title: 'Self-Reflection and Purification of the Heart',
        description: 'Reflections and studies on self-accounting, reliance on Allah, and love for Allah.',
    },
    11: {
        title: 'Selected Hadith from Sahih Bukhari',
        description: 'Selected hadith from Sahih Bukhari with brief and practical explanations.',
    },
    12: {
        title: 'Sirah: Stories of the Companions',
        description: 'Inspiring stories of the companions of the Prophet ﷺ and their examples.',
    },
};

const fallbackKajianField = (item, field, lang) => {
    if (String(lang).toUpperCase() === 'EN') {
        const translated = FALLBACK_KAJIAN_EN[item.id]?.[field];
        if (translated) return translated;
    }
    return getLocalizedField(item, field, lang);
};

const FALLBACK_KAJIAN = [
    {
        id: 1,
        title: 'Aqidah Ahlus Sunnah wal Jamaah',
        ustadz: 'Ust. Khalid Basalamah',
        category: 'aqidah',
        platform: 'youtube',
        url: 'https://www.youtube.com/@UstadzKhalidBasalamah',
        duration: 'Playlist',
        thumbnail: null,
        description: 'Penjelasan lengkap tentang aqidah Islam yang benar berdasarkan Al-Quran dan Sunnah.',
    },
    {
        id: 2,
        title: 'Fiqh Ibadah Praktis',
        ustadz: 'Ust. Adi Hidayat',
        category: 'fiqh',
        platform: 'youtube',
        url: 'https://www.youtube.com/@UstadzAdiHidayat',
        duration: 'Playlist',
        thumbnail: null,
        description: 'Panduan fiqh ibadah sehari-hari yang praktis — thaharah, sholat, puasa, zakat.',
    },
    {
        id: 3,
        title: 'Tazkiyatun Nafs — Pembersihan Jiwa',
        ustadz: 'Ust. Hanan Attaki',
        category: 'tazkiyah',
        platform: 'youtube',
        url: 'https://www.youtube.com/@HananAttaki',
        duration: 'Playlist',
        thumbnail: null,
        description: 'Kajian tentang pembersihan hati dan jiwa dari penyakit-penyakit bathin.',
    },
    {
        id: 4,
        title: 'Sirah Nabawiyah Lengkap',
        ustadz: 'Ust. Budi Ashari',
        category: 'sirah',
        platform: 'youtube',
        url: 'https://www.youtube.com/@Yufid',
        duration: 'Playlist',
        thumbnail: null,
        description: 'Perjalanan hidup Nabi Muhammad ﷺ dari lahir hingga wafat secara lengkap.',
    },
    {
        id: 5,
        title: 'Tafsir Juz Amma',
        ustadz: 'Ust. Firanda Andirja',
        category: 'tafsir',
        platform: 'youtube',
        url: 'https://www.youtube.com/@firandaandirja',
        duration: 'Playlist',
        thumbnail: null,
        description: 'Penjelasan tafsir surah-surah pendek dalam Juz 30 yang sering dibaca.',
    },
    {
        id: 6,
        title: 'Syarah Hadith Arbain Nawawi',
        ustadz: 'Ust. Zainal Abidin',
        category: 'hadith',
        platform: 'youtube',
        url: 'https://www.youtube.com/@Yufid',
        duration: '42 episode',
        thumbnail: null,
        description: 'Penjelasan 42 hadith pilihan Imam Nawawi yang menjadi fondasi ilmu Islam.',
    },
    {
        id: 7,
        title: 'Kitab Tauhid — Syaikh Muhammad At-Tamimi',
        ustadz: 'Ust. Yazid Jawwas',
        category: 'aqidah',
        platform: 'youtube',
        url: 'https://www.youtube.com/@Yufid',
        duration: 'Playlist',
        thumbnail: null,
        description: 'Penjelasan kitab Tauhid yang sangat penting untuk memahami tauhid dengan benar.',
    },
    {
        id: 8,
        title: 'Fiqh Puasa Ramadan',
        ustadz: 'Ust. Abdul Somad',
        category: 'fiqh',
        platform: 'youtube',
        url: 'https://www.youtube.com/@ustadzabdulsomad',
        duration: 'Playlist',
        thumbnail: null,
        description: 'Hukum-hukum puasa Ramadan secara lengkap: niat, hal yang membatalkan, fidyah, dll.',
    },
    {
        id: 9,
        title: 'Tafsir Al-Fatihah',
        ustadz: 'Ust. Nouman Ali Khan (Sub ID)',
        category: 'tafsir',
        platform: 'youtube',
        url: 'https://www.youtube.com/@BarakatoTV',
        duration: 'Series',
        thumbnail: null,
        description: 'Penjelasan mendalam tentang makna dan keajaiban Surah Al-Fatihah.',
    },
    {
        id: 10,
        title: 'Muhasabah & Tazkiyah Hati',
        ustadz: 'Ust. Salim A. Fillah',
        category: 'tazkiyah',
        platform: 'youtube',
        url: 'https://www.youtube.com/@salimafillah',
        duration: 'Playlist',
        thumbnail: null,
        description: 'Renungan dan kajian tentang muhasabah diri, tawakkal, dan kecintaan kepada Allah.',
    },
    {
        id: 11,
        title: 'Hadith Shahih Bukhari Pilihan',
        ustadz: 'Ust. Ammi Nur Baits',
        category: 'hadith',
        platform: 'youtube',
        url: 'https://www.youtube.com/@konsultasisyariah',
        duration: 'Playlist',
        thumbnail: null,
        description: 'Hadith-hadith pilihan dari Shahih Bukhari dengan penjelasan singkat dan praktis.',
    },
    {
        id: 12,
        title: 'Sirah: Kisah Para Sahabat',
        ustadz: 'Ust. Syafiq Riza Basalamah',
        category: 'sirah',
        platform: 'youtube',
        url: 'https://www.youtube.com/@syafikriza',
        duration: 'Playlist',
        thumbnail: null,
        description: 'Kisah-kisah inspiratif para sahabat Nabi ﷺ yang penuh teladan.',
    },
];

const catColor = {
    aqidah: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    fiqh: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    tazkiyah: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    sirah: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    tafsir: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    hadith: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const KajianPage = () => {
    const { t, lang } = useLocale();
    const [kajian, setKajian] = useState(FALLBACK_KAJIAN);
    const [activeCategory, setActiveCategory] = useState('semua');
    const [search, setSearch] = useState('');

    useEffect(() => {
        kajianApi
            .list()
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) setKajian(data);
            })
            .catch(() => {});
    }, []);

    const filtered = kajian.filter((k) => {
        const matchCat = activeCategory === 'semua' || k.category === activeCategory;
        const matchSearch =
            !search ||
            [
                fallbackKajianField(k, 'title', lang),
                k.ustadz,
                fallbackKajianField(k, 'description', lang),
                k.category,
                k.duration,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const totalKajian = kajian.length;
    const youtubeCount = kajian.filter((item) => item.platform === 'youtube').length;
    const categoryCount = new Set(kajian.map((item) => item.category)).size;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-3xl'>
                    {/* Header */}
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center'>
                            <MdOutlinePlayLesson className='text-xl text-emerald-700 dark:text-emerald-400' />
                        </div>
                        <div>
                            <h1 className='text-xl font-bold text-emerald-900 dark:text-white'>
                                {t('kajian.public_title')}
                            </h1>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                                {t('kajian.public_subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className='flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                        <BsSearch className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            placeholder={t('kajian.public_search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className='flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none'
                        />
                        {search && (
                            <button
                                type='button'
                                onClick={() => setSearch('')}
                                className='text-xs font-medium text-emerald-600 dark:text-emerald-400'
                            >
                                {t('common.clear')}
                            </button>
                        )}
                    </div>

                    <div className='grid grid-cols-3 gap-3 mb-4'>
                        <div className='rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3'>
                            <p className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                                {t('kajian.total_label')}
                            </p>
                            <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>
                                {totalKajian}
                            </p>
                        </div>
                        <div className='rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3'>
                            <p className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                                {t('kajian.youtube_label')}
                            </p>
                            <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>
                                {youtubeCount}
                            </p>
                        </div>
                        <div className='rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3'>
                            <p className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                                {t('kajian.categories_label')}
                            </p>
                            <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>
                                {categoryCount}
                            </p>
                        </div>
                    </div>

                    {/* Category filter */}
                    <div className='flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide'>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                                    activeCategory === cat.key
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-slate-600'
                                }`}
                            >
                                {t(cat.labelKey)}
                            </button>
                        ))}
                    </div>

                    {/* Results count */}
                    <div className='mb-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500'>
                        <span>
                            {filtered.length} {t('kajian.results_found')}
                        </span>
                        {search && (
                            <button
                                type='button'
                                onClick={() => setSearch('')}
                                className='font-medium text-emerald-600 dark:text-emerald-400'
                            >
                                {t('common.reset_search')}
                            </button>
                        )}
                    </div>

                    {/* Cards */}
                    {filtered.length === 0 ? (
                        <div className='text-center py-16 text-gray-400 dark:text-gray-500'>
                            <BsPlayCircle className='text-4xl mx-auto mb-3' />
                            <p className='text-sm'>{t('kajian.not_found')}</p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            {filtered.map((k) => (
                                <a
                                    key={k.id}
                                    href={k.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='group bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all p-4 flex flex-col gap-3'
                                >
                                    {/* Category + platform */}
                                    <div className='flex items-center justify-between'>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor[k.category] ?? 'bg-gray-100 text-gray-600'}`}
                                        >
                                            {t(CATEGORIES.find((cat) => cat.key === k.category)?.labelKey) || k.category}
                                        </span>
                                        {k.platform === 'youtube' && (
                                            <BsYoutube className='text-red-500 text-lg' />
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div className='flex-1'>
                                        <h3 className='text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug'>
                                            {fallbackKajianField(k, 'title', lang)}
                                        </h3>
                                        <p className='text-xs text-emerald-600 dark:text-emerald-400 mt-0.5'>
                                            {k.ustadz}
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <p className='text-xs text-gray-500 dark:text-gray-400 line-clamp-2'>
                                        {fallbackKajianField(k, 'description', lang)}
                                    </p>

                                    {/* Footer */}
                                    <div className='flex items-center justify-between'>
                                        <span className='text-xs text-gray-400 dark:text-gray-500'>
                                            {k.duration}
                                        </span>
                                        <span className='text-xs text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline'>
                                            {t('kajian.watch')}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    <p className='text-center text-xs text-gray-400 dark:text-gray-500 mt-8'>
                        {t('kajian.external_note')}
                    </p>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default KajianPage;
