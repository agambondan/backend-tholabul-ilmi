'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useState } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { GiOpenBook } from 'react-icons/gi';

const WIRID_DATA = [
    {
        occasion: 'jumat',
        label: 'Hari Jumat',
        emoji: '🕌',
        description: 'Amalan sunnah dan bacaan khusus hari Jumat',
        items: [
            {
                title: 'Perbanyak Sholawat',
                arabic: 'اَللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
                latin: "Allāhumma ṣalli wa sallim 'alā nabiyyinā Muḥammad.",
                meaning: 'Ya Allah, limpahkanlah sholawat dan salam kepada Nabi kami Muhammad.',
                fadhilah: 'Rasulullah ﷺ bersabda: "Perbanyaklah sholawat kepadaku pada hari Jumat." (HR. Abu Dawud)',
                count: 'Perbanyak',
            },
            {
                title: 'Doa di Waktu Mustajab',
                arabic: 'اَللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّ لَكَ الْحَمْدَ لَا إِلَهَ إِلَّا أَنْتَ الْمَنَّانُ بَدِيعُ السَّمَاوَاتِ وَالْأَرْضِ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
                latin: "Allāhumma innī as'aluka bi anna lakal ḥamda lā ilāha illā antal mannānu badī'us samāwāti wal arḍ. Yā dzal jalāli wal ikrām.",
                meaning:
                    'Ya Allah, aku memohon kepada-Mu, sesungguhnya bagi-Mu segala pujian, tidak ada Tuhan selain Engkau Yang Maha Pemberi, Pencipta langit dan bumi. Wahai Yang memiliki Keagungan dan Kemuliaan.',
                fadhilah: 'Ada waktu mustajab di hari Jumat — perbanyak doa di antara Ashar dan Maghrib.',
                count: 'Perbanyak saat Ashar–Maghrib',
            },
            {
                title: 'Surat Al-Kahfi',
                arabic: 'مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ',
                latin: "Man qara'a sūratal kahfi fī yaumil jumu'ati aḍā'a lahū minan nūri mā bainal jumu'atain.",
                meaning:
                    'Barangsiapa membaca Surah Al-Kahfi pada hari Jumat, maka akan bersinar cahaya baginya di antara dua Jumat.',
                fadhilah: 'Diriwayatkan dalam Al-Mustadrak Al-Hakim. Baca Surah Al-Kahfi pada hari Jumat.',
                count: '1× (full surah)',
            },
        ],
    },
    {
        occasion: 'arafah',
        label: 'Hari Arafah (9 Dzulhijjah)',
        emoji: '🏔️',
        description: 'Bacaan utama pada hari yang mulia — penghapus dosa 2 tahun',
        items: [
            {
                title: 'Tahlil Hari Arafah',
                arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
                latin: "Lā ilāha illallāh waḥdahū lā syarīka lah, lahul mulku wa lahul ḥamdu wa huwa 'alā kulli syai'in qadīr.",
                meaning:
                    'Tidak ada Tuhan selain Allah, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala pujian. Dia Mahakuasa atas segala sesuatu.',
                fadhilah:
                    'Rasulullah ﷺ bersabda: "Sebaik-baik doa adalah doa hari Arafah, dan sebaik-baik yang aku ucapkan dan diucapkan para nabi sebelumku adalah: Lā ilāha illallāh waḥdahū..." (HR. Tirmidzi)',
                count: 'Perbanyak',
            },
            {
                title: 'Takbir Muqayyad',
                arabic: 'اَللَّهُ أَكْبَرُ، اَللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، اَللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
                latin: 'Allāhu akbar, Allāhu akbar, lā ilāha illallāh, wallāhu akbar, Allāhu akbar wa lillāhil ḥamd.',
                meaning:
                    'Allah Maha Besar, Allah Maha Besar, tidak ada Tuhan selain Allah. Allah Maha Besar, Allah Maha Besar, dan segala puji hanya untuk Allah.',
                fadhilah: 'Dibaca mulai Subuh hari Arafah sampai Ashar tanggal 13 Dzulhijjah (hari tasyriq).',
                count: 'Setiap selesai sholat fardhu',
            },
        ],
    },
    {
        occasion: 'lailatul_qadar',
        label: 'Lailatul Qadar',
        emoji: '✨',
        description: 'Malam lebih baik dari seribu bulan — perbanyak doa ini',
        items: [
            {
                title: 'Doa Lailatul Qadar',
                arabic: 'اَللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
                latin: "Allāhumma innaka 'afuwwun tuḥibbul 'afwa fa'fu 'annī.",
                meaning:
                    'Ya Allah, sesungguhnya Engkau Maha Pemaaf dan mencintai permaafan, maka maafkanlah aku.',
                fadhilah:
                    "Aisyah r.a. bertanya kepada Nabi ﷺ: 'Jika aku mendapatkan Lailatul Qadar, apa yang aku ucapkan?' Nabi ﷺ bersabda: 'Ucapkanlah Allāhumma innaka 'afuwwun...' (HR. Tirmidzi — Hasan Shahih)",
                count: 'Perbanyak sepanjang malam',
            },
            {
                title: 'Istighfar',
                arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
                latin: "Astaghfirullāha wa atūbu ilaih.",
                meaning: 'Aku memohon ampun kepada Allah dan bertaubat kepada-Nya.',
                fadhilah: 'Perbanyak istighfar pada malam-malam ganjil 10 terakhir Ramadan.',
                count: '100× atau lebih',
            },
        ],
    },
    {
        occasion: 'ramadan',
        label: 'Ramadan',
        emoji: '🌙',
        description: 'Doa-doa khusus bulan Ramadan',
        items: [
            {
                title: 'Niat Puasa Ramadan',
                arabic: 'نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى',
                latin: "Nawaitu ṣauma ghadin 'an adā'i farḍi syahri ramaḍāna hādzihis sanati lillāhi ta'ālā.",
                meaning:
                    'Aku niat puasa esok hari untuk menunaikan fardhu di bulan Ramadan tahun ini karena Allah Ta\'ala.',
                fadhilah: 'Dibaca saat sahur sebelum Subuh.',
                count: '1× setiap malam/sahur',
            },
            {
                title: 'Doa Buka Puasa',
                arabic: 'اَللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
                latin: "Allāhumma laka ṣumtu wa bika āmantu wa 'alā rizqika afṭart.",
                meaning:
                    'Ya Allah, untuk-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka.',
                fadhilah: 'Dibaca saat berbuka puasa. (HR. Abu Dawud)',
                count: '1× saat berbuka',
            },
            {
                title: 'Doa Setelah Buka Puasa',
                arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
                latin: "Dzahabaẓ ẓama'u wabtallatil 'urūqu wa tsabatal ajru insyā'allāh.",
                meaning:
                    'Telah hilang dahaga, telah basah urat-urat, dan telah tetap pahala — insya Allah.',
                fadhilah: 'Dibaca setelah minum saat berbuka. (HR. Abu Dawud)',
                count: '1×',
            },
        ],
    },
    {
        occasion: 'iedul_fitri',
        label: "Idul Fitri (1 Syawal)",
        emoji: '🎉',
        description: 'Bacaan dan ucapan saat Idul Fitri',
        items: [
            {
                title: 'Takbir Idul Fitri',
                arabic: 'اَللَّهُ أَكْبَرُ اَللَّهُ أَكْبَرُ اَللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، اَللَّهُ أَكْبَرُ اَللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
                latin: 'Allāhu akbar, Allāhu akbar, Allāhu akbar. Lā ilāha illallāh. Allāhu akbar, Allāhu akbar wa lillāhil ḥamd.',
                meaning:
                    'Allah Maha Besar, Allah Maha Besar, Allah Maha Besar. Tidak ada Tuhan selain Allah. Allah Maha Besar, Allah Maha Besar, dan segala puji hanya untuk Allah.',
                fadhilah: 'Dibaca sejak malam Idul Fitri (setelah Maghrib) sampai dimulainya sholat Ied.',
                count: 'Perbanyak',
            },
            {
                title: 'Ucapan Idul Fitri',
                arabic: 'تَقَبَّلَ اللَّهُ مِنَّا وَمِنْكُمْ',
                latin: 'Taqabbalallāhu minnā wa minkum.',
                meaning: 'Semoga Allah menerima (amal ibadah) dari kami dan dari kalian.',
                fadhilah: 'Ucapan yang dicontohkan oleh para sahabat Nabi ﷺ saat Idul Fitri.',
                count: 'Diucapkan saat bertemu',
            },
        ],
    },
    {
        occasion: 'iedul_adha',
        label: 'Idul Adha (10 Dzulhijjah)',
        emoji: '🐑',
        description: 'Bacaan saat Idul Adha dan penyembelihan kurban',
        items: [
            {
                title: 'Takbir Idul Adha',
                arabic: 'اَللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا',
                latin: 'Allāhu akbar kabīran walḥamdu lillāhi katsīran wa subḥānallāhi bukratan wa aṣīlā.',
                meaning:
                    'Allah Maha Besar dengan segala kebesaran, segala puji bagi Allah dengan pujian yang banyak, dan Maha Suci Allah di waktu pagi dan petang.',
                fadhilah: 'Dibaca mulai Subuh hari Arafah sampai Ashar hari tasyriq ke-3 (13 Dzulhijjah).',
                count: 'Setiap selesai sholat fardhu',
            },
            {
                title: 'Doa Menyembelih Kurban',
                arabic: 'بِسْمِ اللَّهِ، اَللَّهُ أَكْبَرُ، اَللَّهُمَّ هَذَا مِنْكَ وَلَكَ، اَللَّهُمَّ تَقَبَّلْ مِنِّي',
                latin: "Bismillāh, Allāhu akbar, Allāhumma hādzā minka wa lak, Allāhumma taqabbal minnī.",
                meaning:
                    'Dengan nama Allah, Allah Maha Besar. Ya Allah, ini adalah (pemberian) dari-Mu dan untuk-Mu. Ya Allah, terimalah dariku.',
                fadhilah:
                    'Dibaca saat menyembelih hewan kurban. Jika berkurban untuk orang lain, sebutkan namanya.',
                count: '1× saat menyembelih',
            },
        ],
    },
];

const WiridPage = () => {
    const [activeOccasion, setActiveOccasion] = useState(WIRID_DATA[0].occasion);
    const [open, setOpen] = useState(new Set());
    const [showLatin, setShowLatin] = useState(true);
    const [showMeaning, setShowMeaning] = useState(true);

    const current = WIRID_DATA.find((w) => w.occasion === activeOccasion) ?? WIRID_DATA[0];

    const toggle = (idx) => {
        setOpen((prev) => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const handleOccasion = (occ) => {
        setActiveOccasion(occ);
        setOpen(new Set());
    };

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-2xl'>
                    {/* Header */}
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center'>
                            <GiOpenBook className='text-xl text-emerald-700 dark:text-emerald-400' />
                        </div>
                        <div>
                            <h1 className='text-xl font-bold text-emerald-900 dark:text-white'>
                                Wirid & Bacaan Sunnah
                            </h1>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                                Bacaan khusus untuk momen istimewa
                            </p>
                        </div>
                    </div>

                    {/* Display controls */}
                    <div className='flex gap-2 mb-4'>
                        <button
                            onClick={() => setShowLatin((v) => !v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showLatin ? 'bg-emerald-700 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
                        >
                            Latin
                        </button>
                        <button
                            onClick={() => setShowMeaning((v) => !v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showMeaning ? 'bg-emerald-700 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
                        >
                            Terjemahan
                        </button>
                    </div>

                    {/* Occasion tabs */}
                    <div className='flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide'>
                        {WIRID_DATA.map((w) => (
                            <button
                                key={w.occasion}
                                onClick={() => handleOccasion(w.occasion)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                                    activeOccasion === w.occasion
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-emerald-300'
                                }`}
                            >
                                {w.emoji} {w.label}
                            </button>
                        ))}
                    </div>

                    {/* Description */}
                    <div className='bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3 mb-5'>
                        <p className='text-sm font-semibold text-emerald-800 dark:text-emerald-300'>
                            {current.emoji} {current.label}
                        </p>
                        <p className='text-xs text-emerald-600 dark:text-emerald-500 mt-0.5'>
                            {current.description}
                        </p>
                    </div>

                    {/* Items */}
                    <div className='space-y-2'>
                        {current.items.map((item, idx) => (
                            <div
                                key={idx}
                                className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'
                            >
                                <button
                                    onClick={() => toggle(idx)}
                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left'
                                >
                                    <span className='w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0'>
                                        {idx + 1}
                                    </span>
                                    <div className='flex-1'>
                                        <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                                            {item.title}
                                        </p>
                                        <p className='text-xs text-gray-400 dark:text-gray-500'>
                                            {item.count}
                                        </p>
                                    </div>
                                    {open.has(idx) ? (
                                        <BsChevronUp className='text-gray-400 flex-shrink-0' />
                                    ) : (
                                        <BsChevronDown className='text-gray-400 flex-shrink-0' />
                                    )}
                                </button>

                                {open.has(idx) && (
                                    <div className='border-t border-gray-100 dark:border-slate-700 px-4 py-4 space-y-3'>
                                        <p
                                            dir='rtl'
                                            className='text-xl leading-loose font-arabic text-gray-900 dark:text-white text-right'
                                        >
                                            {item.arabic}
                                        </p>
                                        {showLatin && (
                                            <p className='text-sm text-emerald-700 dark:text-emerald-400 italic'>
                                                {item.latin}
                                            </p>
                                        )}
                                        {showMeaning && (
                                            <p className='text-sm text-gray-600 dark:text-gray-300'>
                                                {item.meaning}
                                            </p>
                                        )}
                                        <div className='bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2'>
                                            <p className='text-xs text-amber-700 dark:text-amber-400'>
                                                📖 {item.fadhilah}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default WiridPage;
