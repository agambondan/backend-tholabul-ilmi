'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useLocale } from '@/context/Locale';
import { useState } from 'react';
import { BsChevronDown, BsChevronUp, BsSearch } from 'react-icons/bs';
import { MdTimeline } from 'react-icons/md';

const CATEGORIES = [
    { key: 'semua', labelKey: 'common.all' },
    { key: 'nabi', labelKey: 'history.cat.prophet' },
    { key: 'khulafa', labelKey: 'history.cat.khulafa' },
    { key: 'dinasti', labelKey: 'history.cat.dynasty' },
    { key: 'ulama', labelKey: 'history.cat.scholar' },
    { key: 'peristiwa', labelKey: 'history.cat.event' },
];

const CAT_COLOR = {
    nabi: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    khulafa: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dinasti: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    ulama: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    peristiwa: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const TIMELINE = [
    {
        year: '570 M',
        hijri: '—',
        title: 'Kelahiran Nabi Muhammad ﷺ',
        category: 'nabi',
        description:
            'Nabi Muhammad ﷺ lahir di Mekkah pada tahun yang dikenal sebagai "Tahun Gajah", bertepatan dengan peristiwa pasukan gajah Abrahah yang gagal menghancurkan Ka\'bah.',
        significant: true,
    },
    {
        year: '610 M',
        hijri: '—',
        title: 'Wahyu Pertama — Iqra!',
        category: 'nabi',
        description:
            'Nabi Muhammad ﷺ menerima wahyu pertama di Gua Hira melalui Malaikat Jibril. Surat Al-Alaq ayat 1-5 turun sebagai permulaan risalah kenabian.',
        significant: true,
    },
    {
        year: '622 M',
        hijri: '1 H',
        title: 'Hijrah ke Madinah',
        category: 'nabi',
        description:
            'Nabi ﷺ dan para sahabat berhijrah dari Mekkah ke Madinah (Yatsrib). Peristiwa ini menjadi awal penanggalan Hijriah dan tonggak berdirinya komunitas Muslim pertama.',
        significant: true,
    },
    {
        year: '624 M',
        hijri: '2 H',
        title: 'Perang Badr',
        category: 'peristiwa',
        description:
            'Perang pertama umat Islam melawan Quraisy. Pasukan Muslim 313 orang mengalahkan 1.000 pasukan Quraisy. Allah menurunkan bantuan malaikat. Disebut dalam Al-Quran sebagai "Yaumul Furqan".',
        significant: true,
    },
    {
        year: '625 M',
        hijri: '3 H',
        title: 'Perang Uhud',
        category: 'peristiwa',
        description:
            'Perang di lereng Gunung Uhud. Umat Islam sempat mengalami kekalahan sementara karena sebagian pasukan meninggalkan pos. Paman Nabi, Hamzah bin Abdul Muthalib, syahid dalam perang ini.',
    },
    {
        year: '627 M',
        hijri: '5 H',
        title: 'Perang Khandaq (Ahzab)',
        category: 'peristiwa',
        description:
            'Koalisi Arab Quraisy dan Yahudi mengepung Madinah. Atas usul Salman Al-Farisi, umat Islam menggali parit di sekeliling kota. Pengepungan gagal setelah 20-27 hari.',
    },
    {
        year: '628 M',
        hijri: '6 H',
        title: 'Perjanjian Hudaibiyah',
        category: 'peristiwa',
        description:
            'Perjanjian damai 10 tahun antara Nabi ﷺ dan Quraisy. Meskipun tampak merugikan Muslim, Al-Quran menyebutnya "Fathan Mubina" (kemenangan yang nyata) karena membuka jalan dakwah Islam.',
        significant: true,
    },
    {
        year: '630 M',
        hijri: '8 H',
        title: 'Fathu Makkah (Pembebasan Mekkah)',
        category: 'nabi',
        description:
            'Pasukan Muslim 10.000 orang memasuki Mekkah tanpa pertumpahan darah besar. Nabi ﷺ memaafkan penduduk Mekkah. Ka\'bah dibersihkan dari 360 berhala. Ribuan masuk Islam.',
        significant: true,
    },
    {
        year: '632 M',
        hijri: '10 H',
        title: 'Haji Wada & Wafatnya Nabi ﷺ',
        category: 'nabi',
        description:
            'Nabi ﷺ menyampaikan Khutbah Wada (Perpisahan) di Arafah. Beliau wafat pada 12 Rabiʼul Awwal 11 H. Islam telah sempurna sebagaimana wahyu terakhir: "Al-yauma akmaltu lakum dinakum..."',
        significant: true,
    },
    {
        year: '632–634 M',
        hijri: '11–13 H',
        title: 'Khalifah Abu Bakar As-Siddiq',
        category: 'khulafa',
        description:
            'Khalifah pertama. Berhasil memadamkan perang Riddah (murtad), memerangi nabi palsu, dan mulai mengumpulkan mushaf Al-Quran. Memperluas Islam ke Irak dan Syam.',
        significant: true,
    },
    {
        year: '634–644 M',
        hijri: '13–23 H',
        title: 'Khalifah Umar bin Khattab',
        category: 'khulafa',
        description:
            'Khalifah kedua. Di bawah kepemimpinannya Islam meluas ke Persia, Mesir, Syam, dan Palestina. Mendirikan sistem administrasi negara Islam, baitul mal, dan penanggalan Hijriah resmi.',
        significant: true,
    },
    {
        year: '644–656 M',
        hijri: '23–35 H',
        title: 'Khalifah Utsman bin Affan',
        category: 'khulafa',
        description:
            'Khalifah ketiga. Berhasil menyatukan mushaf Al-Quran dalam satu standar bacaan (Mushaf Utsmani). Islam meluas ke Armenia, Azerbaijan, dan Afrika Utara.',
        significant: true,
    },
    {
        year: '656–661 M',
        hijri: '35–40 H',
        title: 'Khalifah Ali bin Abi Thalib',
        category: 'khulafa',
        description:
            'Khalifah keempat, sepupu dan menantu Nabi ﷺ. Masa kepemimpinannya diwarnai fitnah besar (al-Fitnah al-Kubra). Beliau syahid di Kufah tahun 661 M.',
        significant: true,
    },
    {
        year: '661–750 M',
        hijri: '40–132 H',
        title: 'Dinasti Umayyah',
        category: 'dinasti',
        description:
            'Kekhalifahan Islam pertama berbentuk dinasti, berpusat di Damaskus. Wilayah Islam meluas ke Spanyol (Al-Andalus), Maroko, hingga India. Membangun Masjid Umayyah dan Kubah Batu di Jerusalem.',
        significant: true,
    },
    {
        year: '750–1258 M',
        hijri: '132–656 H',
        title: 'Dinasti Abbasiyah — Zaman Keemasan Islam',
        category: 'dinasti',
        description:
            'Berpusat di Baghdad. Masa keemasan ilmu pengetahuan Islam: Bait al-Hikmah, Al-Khawarizmi (aljabar), Ibn Sina (kedokteran), Al-Ghazali (filsafat), Ibn Rushd. Baghdad hancur diserang Mongol 1258.',
        significant: true,
    },
    {
        year: '801–873 M',
        hijri: '~185–259 H',
        title: 'Imam Ahmad bin Hanbal',
        category: 'ulama',
        description:
            'Pendiri mazhab Hanbali. Bertahan teguh membela kemakhlukan Al-Quran dalam ujian mihnah di zaman Khalifah Al-Maʼmun. Kumpulan hadithnya dalam Musnad Ahmad berisi 30.000+ hadith.',
    },
    {
        year: '1095–1291 M',
        hijri: '~488–690 H',
        title: 'Perang Salib',
        category: 'peristiwa',
        description:
            'Serangkaian perang oleh tentara Kristen Eropa untuk merebut Tanah Suci. Shalahuddin Al-Ayyubi merebut kembali Jerusalem pada 1187 M dengan kemuliaan dan kemurahan hati yang diakui sejarah.',
        significant: true,
    },
    {
        year: '1258 M',
        hijri: '656 H',
        title: 'Kejatuhan Baghdad — Mongol Menghancurkan Abbasiyah',
        category: 'peristiwa',
        description:
            'Pasukan Mongol Hulagu Khan menghancurkan Baghdad, membunuh ratusan ribu penduduk, dan membakar perpustakaan Bait al-Hikmah. Menjadi salah satu tragedi terbesar dalam sejarah Islam.',
        significant: true,
    },
    {
        year: '1299–1922 M',
        hijri: '~699–1341 H',
        title: 'Kesultanan Utsmaniyah (Ottoman)',
        category: 'dinasti',
        description:
            'Kekaisaran Islam terbesar dan terlama. Berpusat di Turki, menguasai tiga benua selama 600 tahun. Sultan Mehmed II menaklukkan Konstantinopel 1453. Runtuh pasca Perang Dunia I.',
        significant: true,
    },
    {
        year: '1703–1792 M',
        hijri: '~1115–1206 H',
        title: 'Syaikh Muhammad bin Abdul Wahhab',
        category: 'ulama',
        description:
            'Ulama pembaruan Islam dari Najd, Arab Saudi. Menyerukan kembali kepada tauhid murni dan memberantas bid\'ah. Kerjasama dengan Muhammad bin Saud menjadi fondasi Kerajaan Saudi modern.',
    },
    {
        year: '1924 M',
        hijri: '1342 H',
        title: 'Penghapusan Khilafah Utsmaniyah',
        category: 'peristiwa',
        description:
            'Mustafa Kemal Ataturk menghapus institusi Khilafah setelah keruntuhan Ottoman. Turki menjadi negara republik sekuler. Menjadi momen bersejarah yang mempengaruhi dunia Islam hingga kini.',
        significant: true,
    },
];

const TIMELINE_EN = {
    'Kelahiran Nabi Muhammad ﷺ': {
        title: 'Birth of Prophet Muhammad ﷺ',
        description:
            'Prophet Muhammad ﷺ was born in Makkah in the Year of the Elephant, when Abraha’s army failed to destroy the Kaaba.',
    },
    'Wahyu Pertama — Iqra!': {
        title: 'The First Revelation: Iqra',
        description:
            'Prophet Muhammad ﷺ received the first revelation in the Cave of Hira through Angel Jibril. The opening verses of Surah Al-Alaq marked the beginning of prophethood.',
    },
    'Hijrah ke Madinah': {
        title: 'Hijrah to Madinah',
        description:
            'The Prophet ﷺ and his companions migrated from Makkah to Madinah. This became the start of the Hijri calendar and the first Muslim community.',
    },
    'Perang Badr': {
        title: 'Battle of Badr',
        description:
            'The first major battle between the Muslims and Quraysh. A small Muslim force defeated a much larger army, and the day is known as Yaumul Furqan.',
    },
    'Perang Uhud': {
        title: 'Battle of Uhud',
        description:
            'A battle near Mount Uhud where the Muslims faced a temporary setback after some archers left their post. Hamzah ibn Abdul Muttalib was martyred.',
    },
    'Perang Khandaq (Ahzab)': {
        title: 'Battle of the Trench',
        description:
            'A coalition besieged Madinah. Following Salman Al-Farisi’s suggestion, the Muslims dug a trench and the siege eventually failed.',
    },
    'Perjanjian Hudaibiyah': {
        title: 'Treaty of Hudaybiyyah',
        description:
            'A ten-year peace treaty between the Prophet ﷺ and Quraysh. Though it seemed unfavorable at first, it opened a major path for Islamic dawah.',
    },
    'Fathu Makkah (Pembebasan Mekkah)': {
        title: 'Conquest of Makkah',
        description:
            'The Muslims entered Makkah with a large army and little bloodshed. The Prophet ﷺ forgave its people and the Kaaba was purified from idols.',
    },
    'Haji Wada & Wafatnya Nabi ﷺ': {
        title: "Farewell Hajj and the Prophet's Passing",
        description:
            'The Prophet ﷺ delivered the Farewell Sermon at Arafah and passed away in 11 H after Islam had been completed.',
    },
    'Khalifah Abu Bakar As-Siddiq': {
        title: 'Caliph Abu Bakr As-Siddiq',
        description:
            'The first caliph. He suppressed the Ridda wars, fought false prophets, began compiling the Quran, and expanded Islam into Iraq and Sham.',
    },
    'Khalifah Umar bin Khattab': {
        title: 'Caliph Umar ibn Al-Khattab',
        description:
            'The second caliph. Under his leadership, Islam expanded into Persia, Egypt, Sham, and Palestine, and state administration was strengthened.',
    },
    'Khalifah Utsman bin Affan': {
        title: 'Caliph Uthman ibn Affan',
        description:
            'The third caliph. He unified the Quranic mushaf on one standard reading and Islam expanded into Armenia, Azerbaijan, and North Africa.',
    },
    'Khalifah Ali bin Abi Thalib': {
        title: 'Caliph Ali ibn Abi Talib',
        description:
            'The fourth caliph, cousin and son-in-law of the Prophet ﷺ. His rule was marked by major trials, and he was martyred in Kufah.',
    },
    'Dinasti Umayyah': {
        title: 'Umayyad Dynasty',
        description:
            'The first dynastic Islamic caliphate, centered in Damascus. Muslim lands expanded to Al-Andalus, Morocco, and India.',
    },
    'Dinasti Abbasiyah — Zaman Keemasan Islam': {
        title: 'Abbasid Dynasty: The Golden Age of Islam',
        description:
            'Centered in Baghdad, this era saw major advances in knowledge through institutions such as Bayt Al-Hikmah before Baghdad fell to the Mongols.',
    },
    'Imam Ahmad bin Hanbal': {
        title: 'Imam Ahmad ibn Hanbal',
        description:
            'Founder of the Hanbali school. He remained firm during the mihnah and his Musnad contains tens of thousands of hadith reports.',
    },
    'Perang Salib': {
        title: 'The Crusades',
        description:
            'A series of wars by European forces over the Holy Land. Salahuddin Al-Ayyubi recaptured Jerusalem in 1187 with widely noted honor and mercy.',
    },
    'Kejatuhan Baghdad — Mongol Menghancurkan Abbasiyah': {
        title: 'Fall of Baghdad: The Mongol Destruction of the Abbasids',
        description:
            'Hulagu Khan’s Mongol army destroyed Baghdad, killed many inhabitants, and burned libraries, marking one of the greatest tragedies in Islamic history.',
    },
    'Kesultanan Utsmaniyah (Ottoman)': {
        title: 'Ottoman Sultanate',
        description:
            'One of the largest and longest-lasting Islamic empires, ruling across three continents for centuries before collapsing after World War I.',
    },
    'Syaikh Muhammad bin Abdul Wahhab': {
        title: 'Shaykh Muhammad ibn Abdul Wahhab',
        description:
            'A reform scholar from Najd who called people back to pure tawhid and opposed religious innovations.',
    },
    'Penghapusan Khilafah Utsmaniyah': {
        title: 'Abolition of the Ottoman Caliphate',
        description:
            'Mustafa Kemal Ataturk abolished the caliphate after the Ottoman collapse, reshaping the modern Muslim world.',
    },
};

const localizeEvent = (event, field, lang) =>
    String(lang).toUpperCase() === 'EN'
        ? TIMELINE_EN[event.title]?.[field] ?? event[field]
        : event[field];

const SejarahPage = () => {
    const { t, lang } = useLocale();
    const [activeCategory, setActiveCategory] = useState('semua');
    const [search, setSearch] = useState('');
    const [openId, setOpenId] = useState(null);

    const filtered = TIMELINE.filter((ev) => {
        const matchCat = activeCategory === 'semua' || ev.category === activeCategory;
        const q = search.trim().toLowerCase();
        const matchSearch =
            !q ||
            [
                localizeEvent(ev, 'title', lang),
                localizeEvent(ev, 'description', lang),
                ev.year,
                ev.hijri,
                ev.category,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(q);
        return matchCat && matchSearch;
    });

    const toggle = (i) => setOpenId((prev) => (prev === i ? null : i));

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-2xl'>
                    {/* Header */}
                    <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center'>
                            <MdTimeline className='text-xl text-emerald-700 dark:text-emerald-400' />
                        </div>
                        <div>
                            <h1 className='text-xl font-bold text-emerald-900 dark:text-white'>
                                {t('history.title')}
                            </h1>
                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                                {t('history.subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className='flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                        <BsSearch className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('history.search_placeholder')}
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

                    <p className='text-xs text-gray-400 dark:text-gray-500 mb-4'>
                        {filtered.length} {t('history.event_unit')}
                    </p>

                    {/* Timeline */}
                    {filtered.length === 0 ? (
                        <div className='text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
                            <p className='text-gray-500 dark:text-gray-400 text-sm'>
                                {t('history.no_match')}
                            </p>
                        </div>
                    ) : (
                        <div className='relative'>
                            {/* Vertical line */}
                            <div className='absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700' />

                            <div className='space-y-4'>
                                {filtered.map((ev, i) => {
                                    const isOpen = openId === i;
                                    return (
                                        <div key={i} className='flex gap-4'>
                                            {/* Dot */}
                                            <div className='flex-shrink-0 relative z-10 mt-3'>
                                                <div
                                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                                                        ev.significant
                                                            ? 'bg-emerald-600 border-emerald-500 text-white'
                                                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600'
                                                    }`}
                                                >
                                                    <span className='text-[9px] font-bold leading-none text-center'>
                                                        {ev.significant ? '★' : '•'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card */}
                                            <div className='flex-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
                                                <button
                                                    onClick={() => toggle(i)}
                                                    className='w-full flex items-start justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors'
                                                >
                                                    <div className='flex-1 min-w-0'>
                                                        <div className='flex items-center gap-2 flex-wrap mb-1'>
                                                            <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0'>
                                                                {ev.year}
                                                            </span>
                                                            {ev.hijri && ev.hijri !== '—' && (
                                                                <span className='text-[10px] text-gray-400 dark:text-gray-500'>
                                                                    ({ev.hijri})
                                                                </span>
                                                            )}
                                                            <span
                                                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[ev.category] ?? 'bg-gray-100 text-gray-600'}`}
                                                            >
                                                                {
                                                                    t(
                                                                        CATEGORIES.find(
                                                                            (c) => c.key === ev.category,
                                                                        )?.labelKey,
                                                                    )
                                                                }
                                                            </span>
                                                        </div>
                                                        <p className='text-sm font-semibold text-gray-900 dark:text-white leading-snug'>
                                                            {localizeEvent(ev, 'title', lang)}
                                                        </p>
                                                    </div>
                                                    {isOpen ? (
                                                        <BsChevronUp className='text-gray-400 flex-shrink-0 mt-1' />
                                                    ) : (
                                                        <BsChevronDown className='text-gray-400 flex-shrink-0 mt-1' />
                                                    )}
                                                </button>

                                                {isOpen && (
                                                    <div className='px-4 pb-4 border-t border-gray-100 dark:border-slate-700 pt-3'>
                                                        <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>
                                                            {localizeEvent(ev, 'description', lang)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <p className='text-center text-xs text-gray-400 dark:text-gray-500 mt-8'>
                        {t('history.source_note')}
                    </p>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default SejarahPage;
