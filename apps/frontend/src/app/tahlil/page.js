'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useState } from 'react';
import { BsBookHalf, BsChevronDown, BsChevronUp } from 'react-icons/bs';

const SECTIONS = [
    {
        id: 'fatihah',
        title: 'Al-Fatihah',
        count: '1×',
        note: 'Dibaca sebagai pembuka',
        items: [
            {
                arabic:
                    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
                latin: "Bismillāhir raḥmānir raḥīm. Alḥamdu lillāhi rabbil 'ālamīn. Ar-raḥmānir raḥīm. Māliki yaumid dīn. Iyyāka na'budu wa iyyāka nasta'īn. Ihdinash shirāṭal mustaqīm. Shirāṭal ladzīna an'amta 'alaihim ghairil maghdūbi 'alaihim wa lad-dāllīn.",
                meaning:
                    'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam. Yang Maha Pengasih lagi Maha Penyayang. Yang menguasai hari pembalasan. Hanya kepada Engkau kami menyembah dan hanya kepada Engkau kami memohon pertolongan. Tunjukilah kami jalan yang lurus — jalan orang-orang yang telah Engkau beri nikmat, bukan jalan mereka yang dimurkai dan bukan pula jalan mereka yang sesat.',
            },
        ],
    },
    {
        id: 'ikhlas',
        title: 'Al-Ikhlas',
        count: '3× / 7× / 11×',
        note: 'Dibaca 3, 7, atau 11 kali',
        items: [
            {
                arabic:
                    'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
                latin: "Qul huwallāhu aḥad. Allāhuṣ ṣamad. Lam yalid wa lam yūlad. Wa lam yakun lahū kufuwan aḥad.",
                meaning:
                    'Katakanlah: Dialah Allah Yang Maha Esa. Allah tempat meminta segala sesuatu. Dia tidak beranak dan tidak diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia.',
            },
        ],
    },
    {
        id: 'falaq',
        title: 'Al-Falaq',
        count: '1×',
        note: 'Mohon perlindungan dari kejahatan',
        items: [
            {
                arabic:
                    'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
                latin: "Qul a'ūdzu birabbil falaq. Min syarri mā khalaq. Wa min syarri ghāsiqin idzā waqab. Wa min syarrin naffātsāti fil 'uqad. Wa min syarri ḥāsidin idzā ḥasad.",
                meaning:
                    'Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh, dari kejahatan makhluk-Nya, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan wanita-wanita tukang sihir yang menghembus pada buhul-buhul, dan dari kejahatan orang yang dengki apabila ia dengki.',
            },
        ],
    },
    {
        id: 'nas',
        title: 'An-Nas',
        count: '1×',
        note: 'Mohon perlindungan dari bisikan setan',
        items: [
            {
                arabic:
                    'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
                latin: "Qul a'ūdzu birabbin nās. Malikin nās. Ilāhin nās. Min syarril waswāsil khannās. Alladzī yuwaswisu fī ṣudūrin nās. Minal jinnati wan nās.",
                meaning:
                    'Katakanlah: Aku berlindung kepada Tuhan manusia, Raja manusia, Sembahan manusia, dari kejahatan bisikan setan yang biasa bersembunyi, yang membisikkan kejahatan ke dalam dada manusia, dari golongan jin dan manusia.',
            },
        ],
    },
    {
        id: 'ayat-kursi',
        title: 'Ayat Kursi',
        count: '1×',
        note: 'Al-Baqarah: 255',
        items: [
            {
                arabic:
                    'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
                latin: "Allāhu lā ilāha illā huwal ḥayyul qayyūm. Lā ta'khuduhū sinatun wa lā naum. Lahū mā fis samāwāti wa mā fil arḍ. Man dzal ladzī yasyfa'u 'indahū illā bi idznih. Ya'lamu mā baina aidīhim wa mā khalfahum. Wa lā yuḥīṭūna bi syai'im min 'ilmihī illā bimā syā'. Wasi'a kursiyyuhus samāwāti wal arḍ. Wa lā ya'ūduhū ḥifẓuhumā. Wa huwal 'aliyyul 'aẓīm.",
                meaning:
                    'Allah, tidak ada Tuhan selain Dia, Yang Maha Hidup, Yang terus-menerus mengurus makhluk-Nya. Tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa seizin-Nya. Dia mengetahui apa yang ada di hadapan mereka dan apa yang ada di belakang mereka. Mereka tidak mengetahui sesuatu pun dari ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dia tidak merasa berat memelihara keduanya. Dialah Yang Mahatinggi, Mahabesar.',
            },
        ],
    },
    {
        id: 'tahlil-kalimat',
        title: 'Tahlil & Tasbih',
        count: '33×/33×/33×/100×',
        note: 'Kalimat tayyibah yang utama',
        items: [
            {
                arabic: 'سُبْحَانَ اللَّهِ',
                latin: 'Subḥānallāh',
                meaning: 'Maha Suci Allah — dibaca 33×',
            },
            {
                arabic: 'اَلْحَمْدُ لِلَّهِ',
                latin: 'Alḥamdulillāh',
                meaning: 'Segala puji bagi Allah — dibaca 33×',
            },
            {
                arabic: 'اللَّهُ أَكْبَرُ',
                latin: 'Allāhu akbar',
                meaning: 'Allah Maha Besar — dibaca 33×',
            },
            {
                arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
                latin: "Lā ilāha illallāh waḥdahū lā syarīka lah, lahul mulku wa lahul ḥamdu wa huwa 'alā kulli syai'in qadīr.",
                meaning: 'Tidak ada Tuhan selain Allah, tiada sekutu bagi-Nya, bagi-Nya kerajaan dan bagi-Nya segala pujian, dan Dia Mahakuasa atas segala sesuatu — dibaca 100× (atau 10× setelah 33+33+33)',
            },
        ],
    },
    {
        id: 'sholawat',
        title: 'Sholawat Nabi',
        count: '10× / 33×',
        note: 'Kirim sholawat untuk Nabi ﷺ',
        items: [
            {
                arabic:
                    'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
                latin: "Allāhumma ṣalli 'alā Muḥammadin wa 'alā āli Muḥammad, kamā ṣallaita 'alā Ibrāhīma wa 'alā āli Ibrāhīm. Innaka ḥamīdun majīd.",
                meaning:
                    'Ya Allah, limpahkanlah sholawat kepada Muhammad dan keluarga Muhammad, sebagaimana Engkau telah melimpahkan sholawat kepada Ibrahim dan keluarga Ibrahim. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.',
            },
        ],
    },
    {
        id: 'doa-tahlil',
        title: 'Doa Tahlil',
        count: '1×',
        note: 'Doa penutup tahlilan untuk yang telah wafat',
        items: [
            {
                arabic:
                    'اَللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ',
                latin: "Allāhummaghfir lahu warḥamhu wa 'āfihi wa'fu 'anhu, wa akrim nuzulahu, wa wassi' mudkhalahu, waghsilhu bil mā'i wats tsalji wal barad, wa naqqihi minal khaṭāyā kamā yunaqqaṡ tsaubul abyadhu minad danas.",
                meaning:
                    'Ya Allah, ampunilah dia, rahmatilah dia, selamatkanlah dia, maafkanlah dia, muliakanlah tempat tinggalnya, luaskanlah kuburnya, cucilah dia dengan air, salju, dan embun, sucikanlah dia dari kesalahan sebagaimana kain putih dibersihkan dari kotoran.',
            },
        ],
    },
    {
        id: 'penutup',
        title: 'Penutup: Al-Fatihah',
        count: '1×',
        note: 'Dibaca sebagai penutup, hadiah pahala untuk almarhum/almarhumah',
        items: [
            {
                arabic: 'اَلْفَاتِحَةُ...',
                latin: 'Al-Fātiḥah...',
                meaning: 'Baca Al-Fatihah sekali sebagai penutup, dengan niat menghadiahkan pahalanya.',
            },
        ],
    },
];

const TahlilPage = () => {
    const [open, setOpen] = useState(new Set(['fatihah']));
    const [showLatin, setShowLatin] = useState(true);
    const [showMeaning, setShowMeaning] = useState(true);

    const toggle = (id) => {
        setOpen((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const expandAll = () => setOpen(new Set(SECTIONS.map((s) => s.id)));
    const collapseAll = () => setOpen(new Set());

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-2xl'>
                    {/* Header */}
                    <div className='flex items-center gap-3 mb-2'>
                        <div className='w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center'>
                            <BsBookHalf className='text-xl text-emerald-700 dark:text-emerald-400' />
                        </div>
                        <div>
                            <h1 className='text-xl font-bold text-emerald-900 dark:text-white'>
                                Tahlil & Yasin
                            </h1>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                                Panduan bacaan tahlilan lengkap
                            </p>
                        </div>
                    </div>

                    {/* Display controls */}
                    <div className='flex items-center gap-2 mb-5 flex-wrap'>
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
                        <div className='ml-auto flex gap-2'>
                            <button
                                onClick={expandAll}
                                className='text-xs text-emerald-600 dark:text-emerald-400 hover:underline'
                            >
                                Buka semua
                            </button>
                            <button
                                onClick={collapseAll}
                                className='text-xs text-gray-400 dark:text-gray-500 hover:underline'
                            >
                                Tutup semua
                            </button>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className='space-y-2'>
                        {SECTIONS.map((sec, idx) => (
                            <div
                                key={sec.id}
                                className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'
                            >
                                <button
                                    onClick={() => toggle(sec.id)}
                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left'
                                >
                                    <span className='w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0'>
                                        {idx + 1}
                                    </span>
                                    <div className='flex-1'>
                                        <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                                            {sec.title}
                                        </p>
                                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                                            {sec.count} · {sec.note}
                                        </p>
                                    </div>
                                    {open.has(sec.id) ? (
                                        <BsChevronUp className='text-gray-400 flex-shrink-0' />
                                    ) : (
                                        <BsChevronDown className='text-gray-400 flex-shrink-0' />
                                    )}
                                </button>

                                {open.has(sec.id) && (
                                    <div className='border-t border-gray-100 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-700/50'>
                                        {sec.items.map((item, i) => (
                                            <div key={i} className='px-4 py-4 space-y-2'>
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
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Note */}
                    <div className='mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/40'>
                        <p className='text-xs text-amber-700 dark:text-amber-400'>
                            <strong>Catatan:</strong> Urutan bacaan tahlil dapat bervariasi sesuai tradisi daerah masing-masing. Panduan ini mengikuti tatacara umum yang lazim dipraktikkan. Untuk Surah Yasin lengkap, kunjungi halaman{' '}
                            <a href='/quran/surah/Yasin' className='underline font-medium'>
                                Al-Quran — Surah Yasin
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default TahlilPage;
