'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import SourceBadges from '@/components/SourceBadges';
import { useState } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import { MdOutlineMenuBook } from 'react-icons/md';

const PRAYERS = [
    {
        name: 'Sholat Subuh',
        rakat: 2,
        arabic: 'صَلَاةُ الْفَجْرِ',
        time: 'Fajar shadiq → terbit matahari',
        color: 'indigo',
        steps: [
            {
                step: 'Niat',
                arabic:
                    'أُصَلِّي فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلهِ تَعَالَى',
                latin: "Ushalli fardhas-shubhi rak'ataini mustaqbilal-qiblati adaa'an lillahi ta'ala",
                terjemah:
                    "Aku niat sholat fardhu Subuh 2 rakaat menghadap kiblat karena Allah Ta'ala",
            },
            {
                step: 'Takbiratul Ihram',
                arabic: 'اللهُ أَكْبَرُ',
                latin: 'Allahu Akbar',
                terjemah: 'Allah Maha Besar',
                note: 'Angkat kedua tangan sejajar telinga/bahu',
            },
            {
                step: 'Doa Iftitah',
                arabic:
                    'اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْنِي مِنْ خَطَايَايَ بِالثَّلْجِ وَالْمَاءِ وَالْبَرَدِ',
                latin: "Allahumma baa'id baini wa baina khataayaaya kamaa baa'adta bainal-masyriqi wal-maghrib...",
                terjemah:
                    'Ya Allah, jauhkanlah antara aku dan kesalahanku sebagaimana Engkau menjauhkan antara timur dan barat...',
                note: 'Dibaca setelah takbiratul ihram (sunnah)',
            },
            {
                step: 'Al-Fatihah',
                arabic:
                    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ۝ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ مَٰلِكِ يَوْمِ ٱلدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ ۝ صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
                latin: 'Bismillahir-rahmanir-rahim. Alhamdu lillahi rabbil-alamin...',
                terjemah:
                    'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam...',
                note: "Wajib di setiap rakaat. Ucapkan 'Aamiin' setelah selesai",
            },
            {
                step: 'Baca Surat',
                note: 'Baca surat pendek setelah Al-Fatihah pada 2 rakaat pertama (sunnah muakkad)',
            },
            {
                step: "Ruku'",
                arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
                latin: "Subhaana rabbiyal-'azhim",
                terjemah: 'Maha Suci Tuhanku Yang Maha Agung',
                note: 'Baca 3 kali. Bungkukkan badan, tangan memegang lutut, punggung rata',
            },
            {
                step: "I'tidal",
                arabic: 'سَمِعَ اللهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا وَلَكَ الْحَمْدُ',
                latin: "Sami'allahu liman hamidah. Rabbana wa lakal-hamd",
                terjemah:
                    'Allah mendengar orang yang memuji-Nya. Wahai Tuhan kami, segala pujian untuk-Mu',
                note: "Berdiri tegak kembali setelah ruku'",
            },
            {
                step: 'Sujud',
                arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
                latin: "Subhaana rabbiyal-a'laa",
                terjemah: 'Maha Suci Tuhanku Yang Maha Tinggi',
                note: 'Baca 3 kali. 7 anggota sujud: dahi+hidung, 2 telapak tangan, 2 lutut, 2 ujung kaki',
            },
            {
                step: 'Duduk di Antara 2 Sujud',
                arabic: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
                latin: 'Rabbighfir lii, rabbighfir lii',
                terjemah: 'Tuhanku ampunilah aku, Tuhanku ampunilah aku',
            },
            {
                step: 'Tasyahhud Akhir',
                arabic:
                    'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
                latin: "At-tahiyyatu lillahi was-shalawatu wat-thayyibat, as-salamu 'alaika ayyuhan-nabiyyu...",
                terjemah: 'Segala kehormatan, sholawat, dan kebaikan milik Allah...',
                note: 'Duduk tasyahhud akhir pada rakaat terakhir',
            },
            {
                step: 'Shalawat Ibrahim',
                arabic:
                    'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
                latin: "Allahumma shalli 'ala Muhammad wa 'ala ali Muhammad...",
                terjemah:
                    'Ya Allah, berikanlah sholawat kepada Muhammad dan keluarga Muhammad sebagaimana Engkau bersholawat kepada Ibrahim...',
            },
            {
                step: 'Salam',
                arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ',
                latin: "As-salamu 'alaikum wa rahmatullah",
                terjemah: 'Semoga keselamatan dan rahmat Allah atas kalian',
                note: 'Palingkan kepala ke kanan lalu ke kiri',
            },
        ],
    },
    {
        name: 'Sholat Dzuhur',
        rakat: 4,
        arabic: 'صَلَاةُ الظُّهْرِ',
        time: 'Matahari tergelincir → bayangan sama panjang benda',
        color: 'yellow',
        steps: [
            {
                step: 'Niat',
                arabic:
                    'أُصَلِّي فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلهِ تَعَالَى',
                latin: "Ushalli fardhadh-dhuhri arba'a raka'aatin mustaqbilal-qiblati adaa'an lillahi ta'ala",
                terjemah:
                    "Aku niat sholat fardhu Dzuhur 4 rakaat menghadap kiblat karena Allah Ta'ala",
            },
            {
                step: 'Gerakan & Bacaan',
                note: 'Sama dengan Subuh. Perbedaan: 4 rakaat, rakaat 3 & 4 hanya baca Al-Fatihah (tanpa surat tambahan). Ada tasyahhud awal (rakaat ke-2) dan tasyahhud akhir (rakaat ke-4).',
            },
            {
                step: 'Tasyahhud Awal (Rakaat ke-2)',
                arabic:
                    'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
                latin: "At-tahiyyatu lillahi was-shalawatu wat-thayyibat...",
                terjemah: 'Segala kehormatan, sholawat, dan kebaikan milik Allah...',
                note: 'Setelah tasyahhud awal, berdiri lanjut ke rakaat ke-3',
            },
        ],
    },
    {
        name: 'Sholat Ashar',
        rakat: 4,
        arabic: 'صَلَاةُ الْعَصْرِ',
        time: 'Bayangan lebih panjang → terbenam matahari',
        color: 'orange',
        steps: [
            {
                step: 'Niat',
                arabic:
                    'أُصَلِّي فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلهِ تَعَالَى',
                latin: "Ushalli fardhal-'ashri arba'a raka'aatin mustaqbilal-qiblati adaa'an lillahi ta'ala",
                terjemah:
                    "Aku niat sholat fardhu Ashar 4 rakaat menghadap kiblat karena Allah Ta'ala",
            },
            {
                step: 'Gerakan & Bacaan',
                note: 'Sama persis dengan Sholat Dzuhur (4 rakaat). Bedanya hanya niat dan waktu pelaksanaan.',
            },
        ],
    },
    {
        name: 'Sholat Maghrib',
        rakat: 3,
        arabic: 'صَلَاةُ الْمَغْرِبِ',
        time: 'Terbenam matahari → hilang mega merah',
        color: 'red',
        steps: [
            {
                step: 'Niat',
                arabic:
                    'أُصَلِّي فَرْضَ الْمَغْرِبِ ثَلَاثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلهِ تَعَالَى',
                latin: "Ushalli fardhal-maghribi tsalaatsa raka'aatin mustaqbilal-qiblati adaa'an lillahi ta'ala",
                terjemah:
                    "Aku niat sholat fardhu Maghrib 3 rakaat menghadap kiblat karena Allah Ta'ala",
            },
            {
                step: 'Gerakan & Bacaan',
                note: '3 rakaat. Rakaat 1 & 2 baca surat setelah Al-Fatihah. Tasyahhud awal di rakaat ke-2, tasyahhud akhir di rakaat ke-3.',
            },
        ],
    },
    {
        name: 'Sholat Isya',
        rakat: 4,
        arabic: 'صَلَاةُ الْعِشَاءِ',
        time: 'Hilang mega merah → sebelum fajar',
        color: 'purple',
        steps: [
            {
                step: 'Niat',
                arabic:
                    'أُصَلِّي فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلهِ تَعَالَى',
                latin: "Ushalli fardhal-'isyaa'i arba'a raka'aatin mustaqbilal-qiblati adaa'an lillahi ta'ala",
                terjemah:
                    "Aku niat sholat fardhu Isya 4 rakaat menghadap kiblat karena Allah Ta'ala",
            },
            {
                step: 'Gerakan & Bacaan',
                note: 'Sama persis dengan Dzuhur dan Ashar (4 rakaat). Bedanya hanya niat dan waktu.',
            },
        ],
    },
];

const COLOR_BADGE = {
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};

export default function PanduanSholatPage() {
    const [openPrayer, setOpenPrayer] = useState(0);
    const [openStep, setOpenStep] = useState(null);

    return (
        <main className='min-h-screen flex flex-col bg-parchment-50 dark:bg-slate-900'>
            <NavbarTailwindCss />
            <div className='max-w-2xl flex-1 w-full mx-auto px-4 pt-24 pb-8'>
                {/* Header */}
                <div className='mb-8 text-center'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl mb-4'>
                        <MdOutlineMenuBook className='text-3xl text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <h1 className='text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mb-2'>
                        Panduan Sholat
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Tata cara sholat 5 waktu beserta niat, bacaan, dan gerakan
                    </p>
                </div>

                {/* Prayer selector */}
                <div className='flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar'>
                    {PRAYERS.map((p, i) => (
                        <button
                            key={p.name}
                            onClick={() => {
                                setOpenPrayer(i);
                                setOpenStep(null);
                            }}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                                openPrayer === i
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-emerald-400'
                            }`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>

                {/* Prayer info card */}
                {(() => {
                    const p = PRAYERS[openPrayer];
                    return (
                        <div className='space-y-3'>
                            <div className='bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 mb-4'>
                                <div className='flex items-start justify-between gap-4'>
                                    <div>
                                        <h2 className='text-xl font-extrabold text-gray-900 dark:text-white mb-1'>
                                            {p.name}
                                        </h2>
                                        <p
                                            className='text-lg text-gray-600 dark:text-gray-400 mb-2'
                                            style={{ fontFamily: 'Amiri, serif' }}
                                        >
                                            {p.arabic}
                                        </p>
                                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                                            {p.time}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ${COLOR_BADGE[p.color]}`}
                                    >
                                        {p.rakat} rakaat
                                    </span>
                                </div>
                            </div>

                            {/* Steps */}
                            {p.steps.map((s, si) => (
                                <div
                                    key={si}
                                    className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm'
                                >
                                    <button
                                        onClick={() =>
                                            setOpenStep(openStep === si ? null : si)
                                        }
                                        className='w-full flex items-center justify-between px-5 py-4 text-left'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <span className='w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center justify-center flex-shrink-0'>
                                                {si + 1}
                                            </span>
                                            <span className='font-semibold text-gray-800 dark:text-gray-100 text-sm'>
                                                {s.step}
                                            </span>
                                        </div>
                                        <BsChevronDown
                                            className={`text-gray-400 transition-transform flex-shrink-0 ${openStep === si ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {openStep === si && (
                                        <div className='px-5 pb-5 space-y-3 border-t border-gray-50 dark:border-slate-700'>
                                            {s.arabic && (
                                                <p
                                                    className='text-right text-xl leading-loose text-gray-900 dark:text-white pt-3'
                                                    style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}
                                                >
                                                    {s.arabic}
                                                </p>
                                            )}
                                            {s.latin && (
                                                <p className='text-sm text-emerald-700 dark:text-emerald-400 italic'>
                                                    {s.latin}
                                                </p>
                                            )}
                                            {s.terjemah && (
                                                <p className='text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3'>
                                                    &ldquo;{s.terjemah}&rdquo;
                                                </p>
                                            )}
                                            {s.note && (
                                                <p className='text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 flex items-start gap-2'>
                                                    <span className='text-amber-500 flex-shrink-0'>ℹ</span>
                                                    {s.note}
                                                </p>
                                            )}
                                            <SourceBadges source={s.source} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
            <Footer />
        </main>
    );
}
