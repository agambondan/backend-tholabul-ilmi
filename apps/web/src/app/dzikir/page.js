'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonInline } from '@/components/skeleton/Skeleton';
import { useLocale } from '@/context/Locale';
import { dzikirApi } from '@/lib/api';
import { getLocalizedField } from '@/lib/translation';
import { useEffect, useRef, useState } from 'react';
import { BsSearch } from 'react-icons/bs';

const CATEGORIES = [
    { value: '', labelKey: 'common.all' },
    { value: 'pagi', labelKey: 'dzikir.category_morning' },
    { value: 'petang', labelKey: 'dzikir.category_evening' },
    { value: 'setelah_sholat', labelKey: 'dzikir.category_after_prayer' },
    { value: 'tidur', labelKey: 'dzikir.category_sleep' },
    { value: 'safar', labelKey: 'dzikir.category_travel' },
    { value: 'dzikir_umum', labelKey: 'dzikir.category_general' },
];

const PAGE_SIZE = 20;

const FALLBACK_DZIKIR = [
    { id: 1, title: 'Dzikir Pagi — Ayat Kursi', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', transliteration: "Allahu la ilaha illa huwal-hayyul-qayyum", translation: 'Allah, tidak ada tuhan selain Dia, Yang Maha Hidup, Yang terus-menerus mengurus makhluk-Nya.', count: '1x', source: 'QS. Al-Baqarah: 255', category: 'pagi' },
    { id: 2, title: 'Dzikir Pagi — Al-Ikhlas, Al-Falaq, An-Nas', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ...', transliteration: "Qul huwallahu ahad...", translation: 'Baca Surah Al-Ikhlas, Al-Falaq, dan An-Nas masing-masing 3x.', count: '3x', source: 'HR. Abu Daud', category: 'pagi' },
    { id: 3, title: 'Sayyidul Istighfar (Pagi)', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ', transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduk, wa ana ala ahdika wa wa'dika mas-tattha't", translation: 'Ya Allah, Engkau adalah Tuhanku, tidak ada ilah selain Engkau. Engkau telah menciptakanku dan aku adalah hamba-Mu.', count: '1x', source: 'HR. Bukhari', category: 'pagi' },
    { id: 4, title: 'Dzikir Pagi — Hisnul Muslim', arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: "Ashbahna wa ashbahal-mulku lillah, walhamdulillah, la ilaha illallah wahdahu la syarikalah", translation: 'Kami berpagi hari dan berpagi hari juga kerajaan milik Allah, segala puji milik Allah.', count: '1x', source: 'HR. Muslim', category: 'pagi' },
    { id: 5, title: 'Dzikir Pagi — Perlindungan', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ', transliteration: "Allahumma bika ashbahna wa bika amsaina wa bika nahya wa bika namutu wa ilaikannusyur", translation: 'Ya Allah, dengan-Mu kami berpagi hari, dan dengan-Mu kami berpetang hari, dengan-Mu kami hidup, dan dengan-Mu kami mati.', count: '1x', source: 'HR. Tirmidzi', category: 'pagi' },
    { id: 6, title: 'Dzikir Petang — Ayat Kursi', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', transliteration: "Allahu la ilaha illa huwal-hayyul-qayyum", translation: 'Allah, tidak ada tuhan selain Dia, Yang Maha Hidup, Yang terus-menerus mengurus makhluk-Nya.', count: '1x', source: 'QS. Al-Baqarah: 255', category: 'petang' },
    { id: 7, title: 'Dzikir Petang — Hisnul Muslim', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: "Amsaina wa amsal-mulku lillah, walhamdulillah, la ilaha illallah wahdahu la syarikalah", translation: 'Kami berpetang hari dan berpetang hari juga kerajaan milik Allah, segala puji milik Allah.', count: '1x', source: 'HR. Muslim', category: 'petang' },
    { id: 8, title: 'Subhanallah wa Bihamdih', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subhanallahi wa bihamdih', translation: 'Maha Suci Allah dan segala puji bagi-Nya.', count: '100x', source: 'HR. Bukhari & Muslim', category: 'dzikir_umum' },
    { id: 9, title: 'Subhanallah, Alhamdulillah, Allahu Akbar', arabic: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَاللَّهُ أَكْبَرُ', transliteration: 'Subhanallah, Alhamdulillah, Allahu Akbar', translation: 'Maha Suci Allah, segala puji bagi Allah, Allah Maha Besar.', count: '33x masing-masing', source: 'HR. Muslim', category: 'setelah_sholat' },
    { id: 10, title: 'Istighfar Setelah Sholat', arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', translation: 'Aku memohon ampun kepada Allah.', count: '3x', source: 'HR. Muslim', category: 'setelah_sholat' },
    { id: 11, title: "La Ilaha Illallah Wahdah", arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', transliteration: "La ilaha illallah wahdahu la syarikalah, lahul-mulku walahul-hamd, wa huwa ala kulli syai'in qadir", translation: 'Tidak ada tuhan selain Allah, tidak ada sekutu bagi-Nya, milik-Nya kerajaan dan pujian, Dia Maha Kuasa atas segalanya.', count: '10x', source: 'HR. Tirmidzi', category: 'setelah_sholat' },
    { id: 12, title: 'Doa Safar — Sebelum Berangkat', arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى', transliteration: "Allahumma inna nas'aluka fi safarina hadzal-birra wat-taqwa", translation: 'Ya Allah, kami memohon kepadamu dalam perjalanan ini kebaikan dan ketakwaan.', count: '1x', source: 'HR. Muslim', category: 'safar' },
    { id: 13, title: 'Dzikir Sebelum Tidur', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', transliteration: "Bismikallahuma amutu wa ahya", translation: 'Dengan nama-Mu ya Allah, aku mati dan aku hidup.', count: '1x', source: 'HR. Bukhari', category: 'tidur' },
    { id: 14, title: 'Doa Ketika Gelisah', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', transliteration: "Hasbiyallahu la ilaha illa huwa, alaihi tawakkaltu wa huwa rabbul-arshil-azhim", translation: 'Cukuplah Allah bagiku, tidak ada tuhan selain Dia, kepada-Nya aku bertawakal, dan Dia adalah Tuhan Arsy yang agung.', count: '7x', source: 'QS. At-Taubah: 129', category: 'dzikir_umum' },
    { id: 15, title: 'Sholawat Ibrahimiyah', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ', transliteration: "Allahumma shalli ala muhammadin wa ala ali muhammad, kama shallaita ala ibrahima wa ala ali ibrahim", translation: 'Ya Allah, limpahkanlah shalawat kepada Muhammad dan keluarga Muhammad, sebagaimana Engkau limpahkan shalawat kepada Ibrahim dan keluarga Ibrahim.', count: '10x', source: 'HR. Bukhari', category: 'setelah_sholat' },
];

const FALLBACK_DZIKIR_EN = {
    1: {
        title: 'Morning Dhikr: Ayat Kursi',
        translation:
            'Allah, there is no deity except Him, the Ever-Living, the Sustainer.',
    },
    2: {
        title: 'Morning Dhikr: Al-Ikhlas, Al-Falaq, An-Nas',
        translation: 'Recite Surah Al-Ikhlas, Al-Falaq, and An-Nas three times each.',
    },
    3: {
        title: 'Sayyidul Istighfar (Morning)',
        translation:
            'O Allah, You are my Lord; there is no deity except You. You created me and I am Your servant.',
    },
    4: {
        title: 'Morning Dhikr: Hisnul Muslim',
        translation:
            'We have entered the morning and the dominion belongs to Allah. All praise is for Allah.',
    },
    5: {
        title: 'Morning Dhikr: Protection',
        translation:
            'O Allah, by You we enter the morning and evening; by You we live and die, and to You is the resurrection.',
    },
    6: {
        title: 'Evening Dhikr: Ayat Kursi',
        translation:
            'Allah, there is no deity except Him, the Ever-Living, the Sustainer.',
    },
    7: {
        title: 'Evening Dhikr: Hisnul Muslim',
        translation:
            'We have entered the evening and the dominion belongs to Allah. All praise is for Allah.',
    },
    8: {
        title: 'Subhanallah wa Bihamdih',
        translation: 'Glory be to Allah and all praise is for Him.',
    },
    9: {
        title: 'Subhanallah, Alhamdulillah, Allahu Akbar',
        translation: 'Glory be to Allah, all praise is for Allah, Allah is the Greatest.',
    },
    10: {
        title: 'Istighfar After Prayer',
        translation: 'I seek forgiveness from Allah.',
    },
    11: {
        title: 'La Ilaha Illallah Wahdah',
        translation:
            'There is no deity except Allah alone, without partner. To Him belongs the dominion and praise, and He has power over all things.',
    },
    12: {
        title: 'Travel Supplication: Before Departing',
        translation:
            'O Allah, we ask You in this journey for righteousness and piety.',
    },
    13: {
        title: 'Dhikr Before Sleep',
        translation: 'In Your name, O Allah, I die and I live.',
    },
    14: {
        title: 'Supplication When Anxious',
        translation:
            'Allah is sufficient for me. There is no deity except Him. Upon Him I rely, and He is the Lord of the mighty Throne.',
    },
    15: {
        title: 'Ibrahimiyah Blessings',
        translation:
            'O Allah, send blessings upon Muhammad and the family of Muhammad as You sent blessings upon Ibrahim and the family of Ibrahim.',
    },
};

const fallbackDzikir = (cat) => {
    const localized = FALLBACK_DZIKIR.map((item) => ({
        ...item,
        title_en: FALLBACK_DZIKIR_EN[item.id]?.title,
        translation_en: FALLBACK_DZIKIR_EN[item.id]?.translation,
    }));
    return cat ? localized.filter((d) => d.category === cat) : localized;
};

const DzikirPage = () => {
    const { t, lang } = useLocale();
    const [dzikirList, setDzikirList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [error, setError] = useState('');
    const sentinelRef = useRef(null);

    const fetchPage = (cat, pageNum, append) => {
        if (append) setIsLoadingMore(true);
        else {
            setIsLoading(true);
            setError('');
        }
        const req = cat
            ? dzikirApi.byCategory(cat, pageNum, PAGE_SIZE)
            : dzikirApi.list(pageNum, PAGE_SIZE);
        req
            .then((r) => {
                if (!r.ok) throw new Error(t('common.network_error'));
                return r.json();
            })
            .then((data) => {
                const items = data?.items ?? data ?? [];
                if (items.length === 0 && pageNum === 0 && !append) {
                    setDzikirList(fallbackDzikir(cat));
                    setHasMore(false);
                } else {
                    setDzikirList((prev) => (append ? [...prev, ...items] : items));
                    setHasMore(items.length >= PAGE_SIZE);
                }
            })
            .catch(() => {
                if (!append) {
                    setDzikirList(fallbackDzikir(cat));
                }
                setHasMore(false);
            })
            .finally(() => {
                if (append) setIsLoadingMore(false);
                else setIsLoading(false);
            });
    };

    useEffect(() => {
        setPage(0);
        fetchPage(category, 0, false);
    }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (page === 0) return;
        fetchPage(category, page, true);
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
                    setPage((p) => p + 1);
                }
            },
            { rootMargin: '100px' },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [hasMore, isLoading, isLoadingMore]);

    const filtered = dzikirList.filter(
        (d) => {
            if (!search) return true;
            const query = search.toLowerCase();
            const haystack = [
                getLocalizedField(d, 'title', lang, ['name']),
                getLocalizedField(d, 'translation', lang, ['meaning', 'description']),
                d.transliteration,
                d.source,
                getLocalizedField(d, 'fadhilah', lang, ['virtue']),
                d.category,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(query);
        },
    );

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-3xl'>
                    <div className='text-center mb-8'>
                        <p
                            className='text-3xl text-emerald-700 dark:text-emerald-400 mb-2'
                            style={{ fontFamily: 'Amiri, serif' }}
                        >
                            الذِّكْر
                        </p>
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            {t('dzikir.public_title')}
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {t('dzikir.public_subtitle')}
                        </p>
                    </div>

                    <div className='flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                        <BsSearch className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('dzikir.search_placeholder')}
                            className='flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none'
                        />
                    </div>

                    <div className='flex gap-2 flex-wrap mb-6'>
                        {CATEGORIES.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => setCategory(c.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    category === c.value
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-slate-600'
                                }`}
                            >
                                {t(c.labelKey)}
                            </button>
                        ))}
                    </div>

                    <div className='mb-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500'>
                        <span>
                            {t('common.showing')} {filtered.length} {t('common.of')} {dzikirList.length}{' '}
                            {t('dzikir.unit')}
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

                    {error && (
                        <div className='mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm'>
                            {error}
                        </div>
                    )}

                    {isLoading && <SkeletonInline rows={5} />}

                    {!isLoading && filtered.length === 0 && !error && (
                        <div className='text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
                            <p className='text-gray-500 dark:text-gray-400'>
                                {dzikirList.length === 0
                                    ? t('dzikir.unavailable')
                                    : t('dzikir.no_match')}
                            </p>
                        </div>
                    )}

                    <div className='space-y-3'>
                        {filtered.map((dzikir) => (
                            <div
                                key={dzikir.id}
                                className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'
                            >
                                <button
                                    className='w-full text-left px-4 py-3 flex items-center justify-between gap-3'
                                    onClick={() =>
                                        setExpanded(expanded === dzikir.id ? null : dzikir.id)
                                    }
                                >
                                    <div>
                                        <span className='text-sm font-semibold text-emerald-900 dark:text-white'>
                                            {getLocalizedField(dzikir, 'title', lang, ['name'])}
                                        </span>
                                        {dzikir.category && (
                                            <span className='ml-2 text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full'>
                                                {t(CATEGORIES.find((item) => item.value === dzikir.category)?.labelKey) || dzikir.category.replace('_', ' ')}
                                            </span>
                                        )}
                                        {dzikir.count && dzikir.count > 1 && (
                                            <span className='ml-2 text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full'>
                                                ×{dzikir.count}
                                            </span>
                                        )}
                                    </div>
                                    <span className='text-gray-400 text-xs shrink-0'>
                                        {expanded === dzikir.id ? '▲' : '▼'}
                                    </span>
                                </button>

                                {expanded === dzikir.id && (
                                    <div className='px-4 pb-4 border-t border-gray-50 dark:border-slate-700 pt-3 space-y-3'>
                                        <p
                                            className='text-2xl leading-[2.2] text-right font-kitab text-emerald-900 dark:text-white'
                                            style={{ direction: 'rtl', fontFamily: 'Amiri, serif' }}
                                        >
                                            {dzikir.arabic}
                                        </p>
                                        {dzikir.transliteration && (
                                            <p className='text-sm italic text-gray-500 dark:text-gray-400'>
                                                {dzikir.transliteration}
                                            </p>
                                        )}
                                        <p className='text-sm text-gray-700 dark:text-gray-300'>
                                            {getLocalizedField(dzikir, 'translation', lang, [
                                                'meaning',
                                                'description',
                                            ])}
                                        </p>
                                        {getLocalizedField(dzikir, 'fadhilah', lang, ['virtue']) && (
                                            <div className='bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2'>
                                                <p className='text-xs font-medium text-amber-700 dark:text-amber-400 mb-0.5'>
                                                    {t('dzikir.fadhilah')}
                                                </p>
                                                <p className='text-xs text-amber-600 dark:text-amber-300'>
                                                    {getLocalizedField(dzikir, 'fadhilah', lang, ['virtue'])}
                                                </p>
                                            </div>
                                        )}
                                        {dzikir.source && (
                                            <p className='text-xs text-gray-400 dark:text-gray-500'>
                                                {t('common.source')}: {dzikir.source}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {isLoadingMore && (
                        <div className='flex justify-center py-6'>
                            <div className='w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin' />
                        </div>
                    )}

                    <div ref={sentinelRef} className='h-1' />

                    {!hasMore && dzikirList.length > 0 && !isLoading && (
                        <p className='text-center text-xs text-gray-400 dark:text-gray-600 py-4'>
                            {t('dzikir.all_displayed')}
                        </p>
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default DzikirPage;
