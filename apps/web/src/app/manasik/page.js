'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useState } from 'react';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import { MdOutlineDirectionsWalk } from 'react-icons/md';

const UMRAH_STEPS = [
    {
        order: 1,
        title: 'Niat Ihram',
        arabic: 'لَبَّيْكَ اللَّهُمَّ عُمْرَةً',
        latin: 'Labbaikallahumma umratan',
        translation: 'Aku penuhi panggilan-Mu ya Allah untuk umrah',
        description:
            'Kenakan pakaian ihram (kain putih tanpa jahitan untuk laki-laki). Mandi sunnah, wudhu, sholat sunnah 2 rakaat, lalu niat umrah dari miqat. Setelah niat, berlaku larangan ihram.',
        wajib: true,
        notes: 'Miqat Madinah: Bir Ali / Dzulhulaifah. Miqat dari arah lain berbeda.',
    },
    {
        order: 2,
        title: 'Talbiyah',
        arabic:
            'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لَا شَرِيكَ لَكَ',
        latin:
            'Labbaik Allahumma labbaik, labbaika la syarika laka labbaik, innal hamda wan niʼmata laka wal mulk, la syarika lak',
        translation:
            'Aku memenuhi panggilan-Mu ya Allah, tidak ada sekutu bagi-Mu, sesungguhnya segala puji, nikmat, dan kekuasaan adalah milik-Mu, tidak ada sekutu bagi-Mu',
        description: 'Ucapkan talbiyah berulang-ulang selama dalam ihram hingga memulai tawaf.',
        wajib: true,
    },
    {
        order: 3,
        title: 'Tawaf',
        arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ',
        latin: 'Bismillahi wallahu akbar',
        translation: 'Dengan nama Allah, Allah Maha Besar',
        description:
            '7 kali mengelilingi Ka\'bah berlawanan arah jarum jam, dimulai dari Hajar Aswad. Lakukan raml (jalan cepat) pada 3 putaran pertama untuk laki-laki. Akhiri dengan sholat 2 rakaat di Maqam Ibrahim.',
        wajib: true,
        notes: 'Suci dari hadats wajib saat tawaf. Perempuan boleh memasuki Ka\'bah meski haid untuk tawaf wada menurut sebagian ulama.',
    },
    {
        order: 4,
        title: "Sa'i",
        arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ',
        latin: "Innas-Shafa wal-Marwata min sya'a'irillah",
        translation: 'Sesungguhnya Shafa dan Marwah adalah sebagian dari syi\'ar Allah',
        description:
            'Berjalan 7 kali antara bukit Shafa dan Marwah (dimulai dari Shafa). Berlari kecil di antara dua tanda hijau untuk laki-laki. Mengikuti jejak Hajar yang mencari air untuk Ismail.',
        wajib: true,
    },
    {
        order: 5,
        title: 'Tahallul (Cukur/Potong Rambut)',
        arabic: 'اللَّهُمَّ إِنِّي أَحْلِقُ رَأْسِي ابْتِغَاءَ مَرْضَاتِكَ',
        latin: 'Allahumma inni ahliqu ra\'si ibtigha\'a mardhatik',
        translation: 'Ya Allah, sesungguhnya aku mencukur kepalaku untuk mengharap ridha-Mu',
        description:
            'Cukur kepala (afdhal) atau potong sebagian rambut minimal 3 helai. Dengan ini, ihram selesai dan semua larangan ihram gugur.',
        wajib: true,
        notes: 'Sunnah: mencukur habis kepala (khususnya laki-laki). Perempuan hanya memotong sebatas ruas jari.',
    },
];

const HAJI_STEPS = [
    {
        order: 1,
        title: 'Niat Ihram Haji',
        arabic: 'لَبَّيْكَ اللَّهُمَّ حَجًّا',
        latin: 'Labbaikallahumma hajjan',
        translation: 'Aku penuhi panggilan-Mu ya Allah untuk haji',
        description:
            'Kenakan ihram dari miqat atau dari Mekkah (bagi yang sudah di sana). Niat haji dimulai pada 8 Dzulhijjah (Hari Tarwiyah). Larangan ihram berlaku hingga tahallul.',
        wajib: true,
    },
    {
        order: 2,
        title: 'Hari Tarwiyah — Menuju Mina',
        arabic: '',
        latin: '',
        translation: '',
        description:
            '8 Dzulhijjah: Berangkat ke Mina. Bermalam dan sholat 5 waktu di Mina (Dzuhur, Ashar, Maghrib, Isya, Subuh). Ini sunnah yang diamalkan Nabi ﷺ.',
        wajib: false,
        notes: 'Sunnah muakkadah. Sebagian ulama mewajibkan.',
    },
    {
        order: 3,
        title: 'Wukuf di Arafah',
        arabic: 'الحَجُّ عَرَفَةُ',
        latin: 'Al-Hajju Arafah',
        translation: 'Haji itu (inti-nya) adalah Arafah',
        description:
            '9 Dzulhijjah: Wukuf di Arafah sejak tergelincir matahari (Dzuhur) hingga terbenam. Perbanyak doa, zikir, dan istighfar. Ini rukun haji yang paling utama — tidak sah haji tanpanya.',
        wajib: true,
        notes: 'HR. Tirmidzi dan Abu Dawud: "Haji itu Arafah." Siapa melewatkan Arafah berarti hajinya batal.',
    },
    {
        order: 4,
        title: 'Mabit di Muzdalifah',
        arabic: 'فَإِذَا أَفَضْتُم مِّنْ عَرَفَاتٍ فَاذْكُرُوا اللَّهَ',
        latin: 'Fa idza afadhtum min Arafatin fadzkurullaha',
        translation: 'Maka apabila kamu bertolak dari Arafah, berdzikirlah kepada Allah',
        description:
            'Setelah wukuf Arafah, berangkat ke Muzdalifah. Bermalam dan perbanyak dzikir. Kumpulkan kerikil untuk jumrah (7 batu kecil untuk Aqabah atau lebih). Sholat Maghrib dan Isya dijamak-qashar.',
        wajib: true,
    },
    {
        order: 5,
        title: 'Melempar Jumrah Aqabah',
        arabic: 'بِسْمِ اللَّهِ اللَّهُ أَكْبَرُ',
        latin: 'Bismillahi Allahu Akbar',
        translation: 'Dengan nama Allah, Allah Maha Besar',
        description:
            '10 Dzulhijjah: Lempar jumrah Aqabah (jumrah kubra) dengan 7 kerikil, mengucapkan takbir setiap lemparan. Dilakukan setelah meninggalkan Muzdalifah sebelum matahari terbenam.',
        wajib: true,
        notes: 'Waktu terbaik: setelah Subuh hingga Dzuhur. Dibolehkan malam hari bagi yang lemah.',
    },
    {
        order: 6,
        title: 'Menyembelih Hadyu & Tahallul Pertama',
        arabic: 'وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ',
        latin: 'Wa atimmul hajja wal umrata lillah',
        translation: 'Dan sempurnakanlah ibadah haji dan umrah karena Allah',
        description:
            'Sembelih hewan hadyu (wajib bagi haji tamattu\' dan qiran). Cukur/potong rambut (tahallul awal). Setelah ini boleh melepas ihram kecuali hubungan suami-istri.',
        wajib: true,
    },
    {
        order: 7,
        title: 'Tawaf Ifadhah',
        arabic: 'ثُمَّ لْيَقْضُوا تَفَثَهُمْ',
        latin: 'Tsumma lyaqdhuu tafatsahum',
        translation: 'Kemudian hendaklah mereka menghilangkan kotoran (melakukan tawaf)',
        description:
            'Tawaf 7 kali di Masjidil Haram. Ini rukun haji wajib. Dilanjutkan dengan Sa\'i jika belum sa\'i sebelumnya. Setelah tawaf ifadhah, tahallul kedua — semua larangan ihram gugur.',
        wajib: true,
    },
    {
        order: 8,
        title: 'Mabit di Mina (Hari Tasyriq)',
        arabic: 'وَاذْكُرُوا اللَّهَ فِي أَيَّامٍ مَّعْدُودَاتٍ',
        latin: "Wadzkurullaha fi ayyamin ma'dudat",
        translation: 'Dan berdzikirlah kepada Allah dalam beberapa hari yang ditentukan',
        description:
            '11, 12, 13 Dzulhijjah: Bermalam di Mina dan melempar jumrah ula, wustha, dan aqabah (masing-masing 7 batu) setiap hari. Boleh nafar awal (pulang 12 Dzulhijjah) atau nafar tsani (13 Dzulhijjah).',
        wajib: true,
    },
    {
        order: 9,
        title: 'Tawaf Wada (Perpisahan)',
        arabic: 'وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ',
        latin: "Walyaththawwafu bil Baytil 'atiq",
        translation: 'Dan hendaklah mereka tawaf di Baitullah yang tua',
        description:
            'Tawaf perpisahan sebelum meninggalkan Mekkah. Wajib bagi yang hendak pulang dari Mekkah. Dikecualikan bagi perempuan yang sedang haid/nifas.',
        wajib: true,
        notes: 'Siapa meninggalkan Mekkah tanpa tawaf wada wajib membayar dam.',
    },
];

const ManasikPage = () => {
    const [activeTab, setActiveTab] = useState('umrah');
    const [openIdx, setOpenIdx] = useState(null);

    const steps = activeTab === 'umrah' ? UMRAH_STEPS : HAJI_STEPS;

    const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i));

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-2xl'>
                    {/* Header */}
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center'>
                            <MdOutlineDirectionsWalk className='text-xl text-emerald-700 dark:text-emerald-400' />
                        </div>
                        <div>
                            <h1 className='text-xl font-bold text-emerald-900 dark:text-white'>
                                Manasik Haji & Umrah
                            </h1>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                                Panduan tata cara ibadah langkah demi langkah
                            </p>
                        </div>
                    </div>

                    {/* Tab */}
                    <div className='flex gap-2 mb-6'>
                        {[
                            { key: 'umrah', label: 'Umrah', steps: UMRAH_STEPS.length },
                            { key: 'haji', label: 'Haji', steps: HAJI_STEPS.length },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setOpenIdx(null);
                                }}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                    activeTab === tab.key
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-600'
                                }`}
                            >
                                {tab.label}
                                <span className='ml-1.5 text-xs opacity-70'>
                                    ({tab.steps} langkah)
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className='flex items-center gap-4 mb-5 text-xs text-gray-500 dark:text-gray-400'>
                        <span className='flex items-center gap-1.5'>
                            <span className='inline-block w-2 h-2 rounded-full bg-emerald-600' />
                            Rukun/Wajib
                        </span>
                        <span className='flex items-center gap-1.5'>
                            <span className='inline-block w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600' />
                            Sunnah
                        </span>
                    </div>

                    {/* Steps */}
                    <div className='space-y-3'>
                        {steps.map((step, i) => {
                            const isOpen = openIdx === i;
                            return (
                                <div
                                    key={i}
                                    className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'
                                >
                                    <button
                                        onClick={() => toggle(i)}
                                        className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left'
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                                step.wajib
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            {step.order}
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                                                {step.title}
                                            </p>
                                            {!isOpen && step.arabic && (
                                                <p
                                                    className='text-xs text-gray-400 dark:text-gray-500 truncate'
                                                    style={{ fontFamily: 'Amiri, serif' }}
                                                >
                                                    {step.arabic.slice(0, 40)}
                                                    {step.arabic.length > 40 ? '...' : ''}
                                                </p>
                                            )}
                                        </div>
                                        {isOpen ? (
                                            <BsChevronUp className='text-gray-400 flex-shrink-0' />
                                        ) : (
                                            <BsChevronDown className='text-gray-400 flex-shrink-0' />
                                        )}
                                    </button>

                                    {isOpen && (
                                        <div className='border-t border-gray-100 dark:border-slate-700 px-4 py-4 space-y-3'>
                                            {/* Arabic */}
                                            {step.arabic && (
                                                <p
                                                    dir='rtl'
                                                    className='text-xl leading-loose text-gray-900 dark:text-white text-right'
                                                    style={{ fontFamily: 'Amiri, serif' }}
                                                >
                                                    {step.arabic}
                                                </p>
                                            )}

                                            {/* Latin */}
                                            {step.latin && (
                                                <p className='text-sm text-emerald-700 dark:text-emerald-400 italic'>
                                                    {step.latin}
                                                </p>
                                            )}

                                            {/* Translation */}
                                            {step.translation && (
                                                <p className='text-sm text-gray-600 dark:text-gray-300 border-l-2 border-emerald-200 dark:border-emerald-800 pl-3'>
                                                    {step.translation}
                                                </p>
                                            )}

                                            {/* Description */}
                                            <div className='bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3'>
                                                <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
                                                    {step.description}
                                                </p>
                                            </div>

                                            {/* Notes */}
                                            {step.notes && (
                                                <div className='bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2'>
                                                    <p className='text-xs text-amber-700 dark:text-amber-400'>
                                                        📝 {step.notes}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Badge */}
                                            <div>
                                                <span
                                                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                        step.wajib
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {step.wajib ? 'Rukun / Wajib' : 'Sunnah'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className='mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl px-4 py-3'>
                        <p className='text-xs text-amber-700 dark:text-amber-400'>
                            ⚠️ Panduan ini bersifat umum. Untuk ibadah yang sesungguhnya, ikuti bimbingan
                            pembimbing haji/umrah dan bacaan kitab manasik yang sahih.
                        </p>
                    </div>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default ManasikPage;
