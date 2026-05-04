'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonInline } from '@/components/skeleton/Skeleton';
import { useLocale } from '@/context/Locale';
import { doaApi } from '@/lib/api';
import { getLocalizedField } from '@/lib/translation';
import { useEffect, useRef, useState } from 'react';
import { BsSearch } from 'react-icons/bs';

const CATEGORIES = [
    { value: '', labelKey: 'common.all' },
    { value: 'pagi', labelKey: 'doa.cat.morning' },
    { value: 'petang', labelKey: 'doa.cat.evening' },
    { value: 'makan', labelKey: 'doa.cat.eating' },
    { value: 'tidur', labelKey: 'doa.cat.sleeping' },
    { value: 'safar', labelKey: 'doa.cat.travel' },
    { value: 'ibadah', labelKey: 'doa.cat.worship' },
];

const PAGE_SIZE = 20;

const FALLBACK_DOAS = [
    { id: 1, title: 'Doa Sebelum Tidur (Tasbih)', arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ', transliteration: "Subhanakallahumma wa bihamdika, asyhadu an la ilaha illa anta, astaghfiruka wa atubu ilaik", translation: 'Maha Suci Engkau ya Allah dan dengan memuji-Mu aku bersaksi bahwa tidak ada ilah yang berhak disembah selain Engkau, aku memohon ampun kepada-Mu dan bertaubat kepada-Mu.', category: 'tidur', source: 'HR. Abu Daud & Tirmidzi' },
    { id: 2, title: 'Doa Ketika Bangun Tidur', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', transliteration: 'Alhamdulillahilladzi ahyana ba\'da ma amatana wa ilaihin-nusyur', translation: 'Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nyalah kami dikembalikan.', category: 'pagi', source: 'HR. Bukhari' },
    { id: 3, title: 'Doa Pagi Hari (Dzikir Pagi)', arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', transliteration: "Ashbahna wa ashbahal-mulku lillah, walhamdulillah, la ilaha illallah wahdahu la syarikalah, lahul-mulku walahul-hamd, wa huwa ala kulli syai'in qadir", translation: 'Kami berpagi hari dan berpagi hari juga kerajaan milik Allah, segala puji milik Allah, tidak ada ilah yang berhak disembah kecuali Allah semata yang tidak ada sekutu bagi-Nya.', category: 'pagi', source: 'HR. Muslim' },
    { id: 4, title: 'Doa Petang Hari (Dzikir Petang)', arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: "Amsaina wa amsal-mulku lillah, walhamdulillah, la ilaha illallah wahdahu la syarikalah", translation: 'Kami berpetang hari dan berpetang hari juga kerajaan milik Allah, segala puji milik Allah, tidak ada ilah kecuali Allah semata yang tidak ada sekutu bagi-Nya.', category: 'petang', source: 'HR. Muslim' },
    { id: 5, title: 'Doa Sebelum Makan', arabic: 'بِسْمِ اللَّهِ', transliteration: 'Bismillah', translation: 'Dengan nama Allah.', category: 'makan', source: 'HR. Bukhari & Muslim' },
    { id: 6, title: 'Doa Sesudah Makan', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ', transliteration: 'Alhamdulillahilladzi ath\'amana wa saqana wa ja\'alana minal muslimin', translation: 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami Muslim.', category: 'makan', source: 'HR. Abu Daud & Tirmidzi' },
    { id: 7, title: 'Doa Masuk Rumah', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا', transliteration: "Allahumma inni as'aluka khairal-maulaji wa khairal-makhraji, bismillahi walajná, wa bismillahi kharajna, wa \'alallahi rabbina tawakkalna", translation: 'Ya Allah, aku memohon kepada-Mu sebaik-baik masuk dan sebaik-baik keluar. Dengan nama Allah kami masuk, dan dengan nama Allah kami keluar, dan kepada Allah Tuhan kami kami bertawakal.', category: 'ibadah', source: 'HR. Abu Daud' },
    { id: 8, title: 'Doa Keluar Rumah', arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration: "Bismillahi, tawakkaltu alallahi, wa la hawla wa la quwwata illa billah", translation: 'Dengan nama Allah, aku bertawakal kepada Allah, dan tidak ada daya serta kekuatan kecuali dengan pertolongan Allah.', category: 'ibadah', source: 'HR. Abu Daud & Tirmidzi' },
    { id: 9, title: 'Doa Masuk Masjid', arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', transliteration: "Allahummaftah li abwaba rahmatik", translation: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.', category: 'ibadah', source: 'HR. Muslim' },
    { id: 10, title: 'Doa Keluar Masjid', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', transliteration: "Allahumma inni as'aluka min fadlik", translation: 'Ya Allah, sesungguhnya aku memohon kepada-Mu dari karunia-Mu.', category: 'ibadah', source: 'HR. Muslim' },
    { id: 11, title: 'Doa Bepergian / Safar', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ', transliteration: "Subhanalladzi sakhkhara lana hadza wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun", translation: 'Maha Suci Allah yang telah menundukkan ini bagi kami, padahal kami tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami.', category: 'safar', source: 'HR. Muslim (QS. Az-Zukhruf: 13-14)' },
    { id: 12, title: 'Doa Ketika Memasuki Kota / Tempat Baru', arabic: 'اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ، وَرَبَّ الْأَرَضِينَ السَّبْعِ وَمَا أَقْلَلْنَ، وَرَبَّ الشَّيَاطِينِ وَمَا أَضْلَلْنَ', transliteration: "Allahumma rabbas-samawatis-sab'i wa ma azhlalna, wa rabbal-aradhinas-sab'i wa ma aqhalna...", translation: 'Ya Allah, Tuhan langit yang tujuh dan apa yang dinaunginya, Tuhan bumi yang tujuh dan apa yang dikandungnya...', category: 'safar', source: 'HR. Tirmidzi' },
    { id: 13, title: 'Doa Sebelum Tidur (Ayat Kursi)', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ', transliteration: "Allahu la ilaha illa huwal-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm...", translation: 'Allah, tidak ada ilah selain Dia, Yang Maha Hidup, Yang terus-menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur...', category: 'tidur', source: 'QS. Al-Baqarah: 255' },
    { id: 14, title: 'Doa Istikharah', arabic: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ', transliteration: "Allahumma inni astakhiruka bi'ilmik, wa astaqdiruka biqudratik, wa as'aluka min fadlikal-'azhim", translation: 'Ya Allah, sesungguhnya aku memohon petunjuk kepada-Mu dengan ilmu-Mu, dan aku memohon kemampuan kepada-Mu dengan kekuasaan-Mu, serta aku memohon karunia-Mu yang agung.', category: 'ibadah', source: 'HR. Bukhari' },
    { id: 15, title: 'Doa Mohon Ampunan (Sayyidul Istighfar)', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ', transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduk, wa ana ala ahdika wa wa'dika mas-tattha't", translation: 'Ya Allah, Engkau adalah Tuhanku, tidak ada ilah selain Engkau. Engkau telah menciptakanku dan aku adalah hamba-Mu. Aku berada di atas perjanjian dan janji-Mu semampuku.', category: 'ibadah', source: 'HR. Bukhari' },
    { id: 16, title: 'Doa Mohon Perlindungan dari Kemalasan', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ', transliteration: "Allahumma inni a'udzu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni", translation: 'Ya Allah, aku berlindung kepada-Mu dari rasa gelisah dan sedih, dari kelemahan dan kemalasan, dari kebakhilan dan sifat pengecut.', category: 'ibadah', source: 'HR. Bukhari' },
    { id: 17, title: 'Doa Mohon Kebaikan Dunia dan Akhirat', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adzabannar", translation: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.', category: 'ibadah', source: 'QS. Al-Baqarah: 201' },
    { id: 18, title: 'Doa Mohon Keteguhan Hati', arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', transliteration: "Ya muqallibal-qulubi tsabbit qalbi 'ala dinik", translation: 'Wahai Dzat yang membolak-balikkan hati, teguhkanlah hatiku di atas agama-Mu.', category: 'ibadah', source: 'HR. Tirmidzi' },
    { id: 19, title: 'Doa Masuk Kamar Mandi', arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', transliteration: "Allahumma inni a'udzu bika minal-khubutsi wal-khaba'its", translation: 'Ya Allah, sesungguhnya aku berlindung kepada-Mu dari setan laki-laki dan setan perempuan.', category: 'ibadah', source: 'HR. Bukhari & Muslim' },
    { id: 20, title: 'Doa Keluar Kamar Mandi', arabic: 'غُفْرَانَكَ', transliteration: 'Ghufranaka', translation: 'Ya Allah, aku memohon ampunan-Mu.', category: 'ibadah', source: 'HR. Abu Daud & Tirmidzi' },
];

const FALLBACK_DOAS_EN = {
    1: {
        title: 'Supplication Before Sleep (Tasbih)',
        translation:
            'Glory be to You, O Allah, and with Your praise. I testify that there is no deity worthy of worship except You. I seek Your forgiveness and repent to You.',
    },
    2: {
        title: 'Supplication When Waking Up',
        translation:
            'All praise is for Allah who gave us life after causing us to die, and to Him is the resurrection.',
    },
    3: {
        title: 'Morning Supplication',
        translation:
            'We have entered the morning and the dominion belongs to Allah. All praise is for Allah. There is no deity worthy of worship except Allah alone, without partner.',
    },
    4: {
        title: 'Evening Supplication',
        translation:
            'We have entered the evening and the dominion belongs to Allah. All praise is for Allah. There is no deity except Allah alone, without partner.',
    },
    5: { title: 'Supplication Before Eating', translation: 'In the name of Allah.' },
    6: {
        title: 'Supplication After Eating',
        translation:
            'All praise is for Allah who fed us, gave us drink, and made us Muslims.',
    },
    7: {
        title: 'Supplication When Entering the House',
        translation:
            'O Allah, I ask You for the best entry and the best exit. In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we rely.',
    },
    8: {
        title: 'Supplication When Leaving the House',
        translation:
            'In the name of Allah, I rely upon Allah, and there is no power nor strength except through Allah.',
    },
    9: {
        title: 'Supplication When Entering the Mosque',
        translation: 'O Allah, open for me the doors of Your mercy.',
    },
    10: {
        title: 'Supplication When Leaving the Mosque',
        translation: 'O Allah, I ask You from Your bounty.',
    },
    11: {
        title: 'Travel Supplication',
        translation:
            'Glory be to the One who has subjected this to us, though we could not have controlled it, and surely to our Lord we will return.',
    },
    12: {
        title: 'Supplication When Entering a City or New Place',
        translation:
            'O Allah, Lord of the seven heavens and what they shade, Lord of the seven earths and what they carry...',
    },
    13: {
        title: 'Supplication Before Sleep (Ayat Kursi)',
        translation:
            'Allah, there is no deity except Him, the Ever-Living, the Sustainer. Neither drowsiness nor sleep overtakes Him...',
    },
    14: {
        title: 'Istikharah Supplication',
        translation:
            'O Allah, I seek Your guidance by Your knowledge, seek ability by Your power, and ask You from Your immense bounty.',
    },
    15: {
        title: 'Supplication for Forgiveness (Sayyidul Istighfar)',
        translation:
            'O Allah, You are my Lord; there is no deity except You. You created me and I am Your servant. I remain upon Your covenant and promise as much as I am able.',
    },
    16: {
        title: 'Supplication for Protection from Laziness',
        translation:
            'O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice.',
    },
    17: {
        title: 'Supplication for Good in This World and the Hereafter',
        translation:
            'Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
    },
    18: {
        title: 'Supplication for Steadfastness of the Heart',
        translation: 'O Turner of hearts, keep my heart firm upon Your religion.',
    },
    19: {
        title: 'Supplication When Entering the Bathroom',
        translation:
            'O Allah, I seek refuge in You from male and female devils.',
    },
    20: {
        title: 'Supplication When Leaving the Bathroom',
        translation: 'O Allah, I ask Your forgiveness.',
    },
};

const fallbackDoas = (cat) => {
    const localized = FALLBACK_DOAS.map((item) => ({
        ...item,
        title_en: FALLBACK_DOAS_EN[item.id]?.title,
        translation_en: FALLBACK_DOAS_EN[item.id]?.translation,
    }));
    return cat ? localized.filter((d) => d.category === cat) : localized;
};

const DoaPage = () => {
    const { t, lang } = useLocale();
    const [doas, setDoas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const sentinelRef = useRef(null);

    const fetchPage = (cat, pageNum, append) => {
        if (append) setIsLoadingMore(true);
        else setIsLoading(true);
        const req = cat
            ? doaApi.byCategory(cat, pageNum, PAGE_SIZE)
            : doaApi.list(pageNum, PAGE_SIZE);
        req
            .then((r) => r.json())
            .then((data) => {
                const items = data?.items ?? data ?? [];
                if (items.length === 0 && pageNum === 0 && !append) {
                    setDoas(fallbackDoas(cat));
                    setHasMore(false);
                } else {
                    setDoas((prev) => (append ? [...prev, ...items] : items));
                    setHasMore(items.length >= PAGE_SIZE);
                }
            })
            .catch(() => {
                if (!append) {
                    setDoas(fallbackDoas(cat));
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

    const filtered = doas.filter(
        (d) => {
            if (!search) return true;
            const query = search.toLowerCase();
            const haystack = [
                getLocalizedField(d, 'title', lang, ['name']),
                getLocalizedField(d, 'translation', lang, ['meaning', 'description']),
                d.transliteration,
                d.source,
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
                            الدُّعَاء
                        </p>
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            {t('doa.title')}
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {t('doa.subtitle')}
                        </p>
                    </div>

                    <div className='flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                        <BsSearch className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('doa.search_placeholder')}
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
                            {t('common.showing')} {filtered.length} {t('common.of')} {doas.length} {t('doa.unit')}
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

                    {isLoading && <SkeletonInline rows={5} />}

                    {!isLoading && filtered.length === 0 && (
                        <div className='text-center py-16'>
                            <p className='text-gray-500 dark:text-gray-400'>
                                {doas.length === 0
                                    ? t('doa.empty_unavailable')
                                    : t('doa.no_match')}
                            </p>
                        </div>
                    )}

                    <div className='space-y-3'>
                        {filtered.map((doa) => (
                            <div
                                key={doa.id}
                                className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'
                            >
                                <button
                                    className='w-full text-left px-4 py-3 flex items-center justify-between gap-3'
                                    onClick={() =>
                                        setExpanded(expanded === doa.id ? null : doa.id)
                                    }
                                >
                                    <div>
                                        <span className='text-sm font-semibold text-emerald-900 dark:text-white'>
                                            {getLocalizedField(doa, 'title', lang, ['name'])}
                                        </span>
                                        {doa.category && (
                                            <span className='ml-2 text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full'>
                                                {t(CATEGORIES.find((item) => item.value === doa.category)?.labelKey) || doa.category}
                                            </span>
                                        )}
                                    </div>
                                    <span className='text-gray-400 text-xs shrink-0'>
                                        {expanded === doa.id ? '▲' : '▼'}
                                    </span>
                                </button>

                                {expanded === doa.id && (
                                    <div className='px-4 pb-4 border-t border-gray-50 dark:border-slate-700 pt-3 space-y-3'>
                                        <p
                                            className='text-2xl leading-[2.2] text-right font-kitab text-emerald-900 dark:text-white'
                                            style={{ direction: 'rtl', fontFamily: 'Amiri, serif' }}
                                        >
                                            {doa.arabic}
                                        </p>
                                        {doa.transliteration && (
                                            <p className='text-sm italic text-gray-500 dark:text-gray-400'>
                                                {doa.transliteration}
                                            </p>
                                        )}
                                        <p className='text-sm text-gray-700 dark:text-gray-300'>
                                            {getLocalizedField(doa, 'translation', lang, [
                                                'meaning',
                                                'description',
                                            ])}
                                        </p>
                                        {doa.source && (
                                            <p className='text-xs text-gray-400 dark:text-gray-500'>
                                                {t('common.source')}: {doa.source}
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

                    {!hasMore && doas.length > 0 && !isLoading && (
                        <p className='text-center text-xs text-gray-400 dark:text-gray-600 py-4'>
                            {t('doa.all_shown')}
                        </p>
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default DoaPage;
