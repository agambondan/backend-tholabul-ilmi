'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import { useLocale } from '@/context/Locale';
import { useMemo, useState } from 'react';
import { BsChevronDown, BsSearch } from 'react-icons/bs';
import { MdOutlineAutoStories } from 'react-icons/md';

const FIQH_DATA = [
    {
        category: 'Thaharah (Bersuci)',
        arabic: 'الطَّهَارَة',
        icon: '💧',
        items: [
            {
                title: 'Wudhu',
                content:
                    'Fardhu wudhu ada 6: (1) Niat, (2) Membasuh wajah, (3) Membasuh kedua tangan hingga siku, (4) Mengusap sebagian kepala, (5) Membasuh kedua kaki hingga mata kaki, (6) Tertib. Hal yang membatalkan wudhu: keluarnya sesuatu dari dua jalan, hilang akal (tidur bukan dengan duduk tegak), menyentuh kemaluan tanpa penghalang.',
                dalil: 'QS. Al-Maidah: 6',
            },
            {
                title: 'Mandi Wajib (Ghusl)',
                content:
                    'Mandi wajib diwajibkan karena: (1) Bersetubuh, (2) Keluarnya mani, (3) Selesai haid, (4) Nifas, (5) Melahirkan, (6) Meninggal (bagi yang masih hidup memandikan). Fardhu mandi: niat dan meratakan air ke seluruh tubuh.',
                dalil: 'QS. Al-Maidah: 6; HR. Bukhari Muslim',
            },
            {
                title: 'Tayamum',
                content:
                    'Dibolehkan saat tidak ada air atau sakit yang menghalangi penggunaan air. Caranya: (1) Niat, (2) Tepuk debu yang suci 2 kali, (3) Usap wajah dengan tepukan pertama, (4) Usap kedua tangan (sampai siku) dengan tepukan kedua. Tayamum batal dengan hal yang membatalkan wudhu atau saat air tersedia.',
                dalil: 'QS. Al-Maidah: 6',
            },
            {
                title: 'Najis dan Cara Mensucikannya',
                content:
                    'Najis mughallazhah (babi/anjing): sucikan 7x, salah satunya dengan tanah. Najis mutawassithah (umum): hilangkan wujud, rasa, warna, dan baunya dengan air. Najis mukhaffafah (air kencing bayi laki-laki yang belum makan selain ASI): cukup diperciki air.',
                dalil: 'HR. Muslim, Abu Dawud',
            },
        ],
    },
    {
        category: 'Sholat',
        arabic: 'الصَّلَاة',
        icon: '🕌',
        items: [
            {
                title: 'Sholat Fardhu 5 Waktu',
                content:
                    'Wajib atas setiap Muslim yang baligh dan berakal. Waktunya: Subuh (fajar - terbit matahari), Dzuhur (tergelincir - bayangan sama panjang), Ashar (bayangan lebih panjang - terbenam), Maghrib (terbenam - mega merah hilang), Isya (mega merah - tengah malam/fajar). Jumlah rakaat: Subuh 2, Dzuhur 4, Ashar 4, Maghrib 3, Isya 4.',
                dalil: 'QS. Al-Isra: 78; HR. Bukhari Muslim',
            },
            {
                title: 'Sholat Berjamaah',
                content:
                    'Hukum sholat berjamaah adalah fardhu kifayah menurut mayoritas ulama, sunnah muakkad menurut sebagian ulama. Keutamaannya 27 derajat lebih dari sholat sendirian. Syarat makmum: tidak boleh lebih depan dari imam, niat menjadi makmum, mengetahui gerakan imam.',
                dalil: 'HR. Bukhari Muslim',
            },
            {
                title: 'Sholat Qashar dan Jama',
                content:
                    "Qashar: meringkas sholat 4 rakaat menjadi 2 rakaat saat safar (perjalanan ≥ 81 km/2 marhalah). Jama' Taqdim: menggabungkan Dzuhur+Ashar di waktu Dzuhur, atau Maghrib+Isya di waktu Maghrib. Jama' Ta'khir: kebalikannya. Boleh dilakukan saat safar, hujan lebat, atau keadaan darurat.",
                dalil: 'QS. An-Nisa: 101; HR. Muslim',
            },
            {
                title: 'Sholat Sunnah Rawatib',
                content:
                    'Sholat rawatib yang dikerjakan: (1) 2 rakaat sebelum Subuh – sangat dikuatkan, (2) 4 rakaat sebelum Dzuhur, (3) 2 rakaat sesudah Dzuhur, (4) 2 rakaat sesudah Maghrib, (5) 2 rakaat sesudah Isya. Total 12 rakaat rawatib. Sholat 2 rakaat sebelum Subuh afdhal dari dunia dan seisinya.',
                dalil: 'HR. Muslim, Tirmidzi',
            },
            {
                title: 'Sholat Jumat',
                content:
                    'Wajib bagi laki-laki Muslim yang mukallaf, merdeka, mukim (bukan musafir), tidak uzur. Terdiri dari 2 rakaat dengan 2 khutbah sebelumnya. Waktu: sama dengan Dzuhur. Dianjurkan mandi, memakai pakaian terbaik, bersegera ke masjid, dan memperbanyak sholawat pada hari Jumat.',
                dalil: 'QS. Al-Jumuah: 9-10',
            },
        ],
    },
    {
        category: 'Puasa',
        arabic: 'الصِّيَام',
        icon: '🌙',
        items: [
            {
                title: 'Puasa Ramadhan',
                content:
                    'Wajib bagi Muslim yang baligh, berakal, sehat, mukim, dan tidak haid/nifas. Rukun: niat sebelum fajar dan menahan diri dari pembatal sejak fajar hingga terbenam matahari. Pembatal puasa: makan/minum dengan sengaja, hubungan badan, keluar mani dengan sengaja, muntah dengan sengaja, haid/nifas, murtad.',
                dalil: 'QS. Al-Baqarah: 183-185',
            },
            {
                title: 'Puasa Sunnah',
                content:
                    "Puasa Senin-Kamis: amal ditampakkan pada hari itu. Puasa Ayyamul Bidh: 13, 14, 15 setiap bulan Hijriah. Puasa Syawal: 6 hari setelah Ramadhan. Puasa Asyura (10 Muharram): menghapus dosa setahun lalu. Puasa Arafah (9 Dzulhijjah): menghapus dosa 2 tahun.",
                dalil: 'HR. Muslim, Abu Dawud, Tirmidzi',
            },
            {
                title: 'Fidyah dan Kafarat',
                content:
                    'Fidyah: memberi makan 1 orang miskin per hari bagi yang tidak bisa puasa karena sakit permanen atau usia lanjut. Qadha: mengganti puasa yang ditinggalkan dengan uzur (sakit sementara, hamil/menyusui, safar). Kafarat: memerdekakan budak / puasa 2 bulan berturut / memberi makan 60 orang miskin untuk batal puasa karena berhubungan badan.',
                dalil: 'QS. Al-Baqarah: 184; HR. Bukhari Muslim',
            },
        ],
    },
    {
        category: 'Zakat',
        arabic: 'الزَّكَاة',
        icon: '💰',
        items: [
            {
                title: 'Zakat Maal',
                content:
                    'Wajib jika harta mencapai nisab (85 gram emas) dan telah tersimpan 1 tahun (haul). Jenis harta: emas/perak/uang, barang dagangan, hasil pertanian, hewan ternak, hasil tambang, harta temuan. Kadar: 2,5% untuk emas/perak/uang/dagang, 5-10% untuk hasil pertanian, bervariasi untuk hewan.',
                dalil: 'QS. At-Taubah: 60; HR. Bukhari Muslim',
            },
            {
                title: '8 Golongan Penerima Zakat (Ashnaf)',
                content:
                    '(1) Fakir: tidak memiliki apa-apa, (2) Miskin: punya tapi tidak cukup, (3) Amil: pengurus zakat, (4) Muallaf: yang baru masuk Islam, (5) Riqab: budak yang ingin merdeka, (6) Gharim: orang terlilit hutang, (7) Fi Sabilillah: pejuang Islam, (8) Ibnu Sabil: musafir yang kehabisan bekal.',
                dalil: 'QS. At-Taubah: 60',
            },
            {
                title: 'Zakat Fitrah',
                content:
                    'Wajib atas setiap Muslim yang mampu, termasuk anak kecil dan janin dalam kandungan. Besarnya 1 sha\' (±2,5 kg) makanan pokok atau senilainya. Waktu: boleh dibayar sejak awal Ramadhan, wajib sebelum sholat Idul Fitri. Tujuan: membersihkan diri dari kesia-siaan dan ucapan kotor selama Ramadhan.',
                dalil: 'HR. Abu Dawud, Ibnu Majah',
            },
        ],
    },
    {
        category: 'Haji & Umrah',
        arabic: 'الْحَجُّ وَالْعُمْرَة',
        icon: '🕋',
        items: [
            {
                title: 'Rukun Haji',
                content:
                    'Rukun haji ada 6 yang jika ditinggalkan maka haji tidak sah: (1) Ihram, (2) Wukuf di Arafah (9 Dzulhijjah), (3) Thawaf ifadhah, (4) Sa\'i, (5) Tahallul (mencukur/memendekkan rambut), (6) Tertib. Wukuf di Arafah adalah pilar utama haji.',
                dalil: 'HR. Abu Dawud, Tirmidzi',
            },
            {
                title: 'Larangan Saat Ihram',
                content:
                    'Larangan bagi laki-laki: memakai pakaian berjahit dan menutup kepala. Larangan bagi perempuan: menutup wajah dan memakai sarung tangan. Larangan bagi keduanya: memakai wewangian, mencukur/memotong rambut/kuku, berburu hewan darat, akad nikah, dan berhubungan badan.',
                dalil: 'QS. Al-Baqarah: 197; HR. Bukhari Muslim',
            },
            {
                title: 'Umrah dan Rukunnya',
                content:
                    'Umrah hukumnya wajib sekali seumur hidup menurut pendapat yang rajih. Rukun umrah: (1) Ihram dari miqat, (2) Thawaf 7x mengelilingi Kabah, (3) Sa\'i 7x antara Shafa dan Marwah, (4) Tahallul (mencukur/memendekkan rambut). Umrah bisa dilakukan kapan saja sepanjang tahun kecuali hari-hari tertentu menurut sebagian ulama.',
                dalil: 'HR. Bukhari Muslim',
            },
        ],
    },
    {
        category: 'Muamalah',
        arabic: 'الْمُعَامَلَة',
        icon: '🤝',
        items: [
            {
                title: 'Jual Beli (Bai\')',
                content:
                    "Syarat jual beli: (1) Penjual dan pembeli baligh & berakal, (2) Kerelaan kedua pihak, (3) Barang bermanfaat dan bisa diserahkan, (4) Barang milik penjual atau wakilnya. Jual beli yang dilarang: riba, gharar (ketidakjelasan), maysir (judi), haram lidzatihi (barang haram).",
                dalil: 'QS. Al-Baqarah: 275; HR. Bukhari Muslim',
            },
            {
                title: 'Riba dan Jenisnya',
                content:
                    'Riba adalah pengambilan tambahan yang bathil. Riba Fadhl: menukar barang ribawi sejenis yang tidak setimbang. Riba Nasiah: penambahan harga karena penundaan pembayaran (bunga bank). Hukum: haram, termasuk dosa besar. Semua transaksi berbasis bunga (kredit, deposito riba) termasuk dalam larangan ini.',
                dalil: 'QS. Al-Baqarah: 275-278',
            },
            {
                title: 'Warisan (Faraid)',
                content:
                    "Ilmu faraid adalah ilmu wajib dipelajari umat Islam. Ahli waris utama: anak laki-laki (ashabah), anak perempuan (1/2 atau 2/3), istri (1/8 atau 1/4), suami (1/4 atau 1/2), ibu (1/6 atau 1/3), ayah (1/6 + ashabah). Prinsip: laki-laki mendapat 2x bagian perempuan dalam nasab yang sama.",
                dalil: 'QS. An-Nisa: 11-12',
            },
        ],
    },
];

const FIQH_CATEGORY_EN = {
    'Thaharah (Bersuci)': 'Purification',
    Sholat: 'Prayer',
    Puasa: 'Fasting',
    Zakat: 'Zakat',
    'Haji & Umrah': 'Hajj and Umrah',
    Muamalah: 'Transactions',
};

const FIQH_ITEM_EN = {
    Wudhu: {
        title: 'Wudu',
        content:
            'The obligatory parts of wudu are intention, washing the face, washing both arms to the elbows, wiping part of the head, washing both feet to the ankles, and following the correct order. Wudu is invalidated by discharge from the two private passages, loss of consciousness, and touching the private part without a barrier.',
    },
    'Mandi Wajib (Ghusl)': {
        title: 'Obligatory Bath (Ghusl)',
        content:
            'Ghusl becomes obligatory after intercourse, ejaculation, the end of menstruation, postpartum bleeding, childbirth, and death for the deceased. Its essentials are intention and making water reach the entire body.',
    },
    Tayamum: {
        title: 'Tayammum',
        content:
            'Tayammum is allowed when water is unavailable or illness prevents water use. Its steps are intention, striking clean earth, wiping the face, and wiping both hands. It is invalidated by the same things that invalidate wudu or when water becomes available.',
    },
    'Najis dan Cara Mensucikannya': {
        title: 'Impurities and How to Purify Them',
        content:
            'Severe impurity such as dog or pig impurity is washed seven times, one with earth. Common impurity is removed by eliminating its substance, taste, color, and smell with water. Light impurity, such as the urine of a baby boy who only consumes milk, is purified by sprinkling water.',
    },
    'Sholat Fardhu 5 Waktu': {
        title: 'The Five Obligatory Prayers',
        content:
            'The five daily prayers are obligatory for every mature and sane Muslim. Their times are Fajr, Dhuhr, Asr, Maghrib, and Isha, with rakah counts of 2, 4, 4, 3, and 4 respectively.',
    },
    'Sholat Berjamaah': {
        title: 'Congregational Prayer',
        content:
            'Congregational prayer is highly emphasized and carries a reward greater than praying alone. The follower should not stand ahead of the imam, should intend to follow, and should know the imam’s movements.',
    },
    'Sholat Qashar dan Jama': {
        title: 'Shortening and Combining Prayers',
        content:
            'Qasr shortens four-rakah prayers to two during travel. Jama combines Dhuhr with Asr or Maghrib with Isha, either earlier or later, and is allowed during travel, heavy rain, or genuine difficulty.',
    },
    'Sholat Sunnah Rawatib': {
        title: 'Rawatib Sunnah Prayers',
        content:
            'Rawatib prayers include two before Fajr, four before Dhuhr, two after Dhuhr, two after Maghrib, and two after Isha. The two rakah before Fajr are especially emphasized.',
    },
    'Sholat Jumat': {
        title: 'Friday Prayer',
        content:
            'Friday prayer is obligatory for eligible Muslim men. It consists of two rakah preceded by two khutbahs. It is recommended to bathe, wear good clothing, come early, and send abundant blessings upon the Prophet on Friday.',
    },
    'Puasa Ramadhan': {
        title: 'Ramadan Fasting',
        content:
            'Ramadan fasting is obligatory for Muslims who are mature, sane, healthy, resident, and not menstruating or in postpartum bleeding. Its pillars are intention before dawn and refraining from invalidators from dawn until sunset.',
    },
    'Puasa Sunnah': {
        title: 'Voluntary Fasting',
        content:
            'Recommended fasts include Mondays and Thursdays, the white days of each Hijri month, six days of Shawwal, Ashura, and Arafah for those not performing Hajj.',
    },
    'Fidyah dan Kafarat': {
        title: 'Fidyah and Expiation',
        content:
            'Fidyah is feeding one poor person for each missed day for those permanently unable to fast. Qadha replaces missed fasts with a valid excuse. Kaffarah applies to specific severe violations such as intercourse during Ramadan fasting.',
    },
    'Zakat Maal': {
        title: 'Wealth Zakat',
        content:
            'Zakat on wealth is obligatory when wealth reaches the nisab and remains for one lunar year. It applies to gold, silver, money, trade goods, crops, livestock, minerals, and treasures with different rates.',
    },
    '8 Golongan Penerima Zakat (Ashnaf)': {
        title: 'The Eight Recipients of Zakat',
        content:
            'Zakat recipients are the poor, the needy, zakat workers, those whose hearts are to be reconciled, slaves seeking freedom, debtors, those in the path of Allah, and stranded travelers.',
    },
    'Zakat Fitrah': {
        title: 'Zakat Al-Fitr',
        content:
            'Zakat al-fitr is obligatory for every capable Muslim before Eid prayer. It is given as one sa of staple food or its equivalent and purifies the fasting person from idle and improper speech.',
    },
    'Rukun Haji': {
        title: 'Pillars of Hajj',
        content:
            'The pillars of Hajj are ihram, standing at Arafah, tawaf al-ifadah, sai, shaving or shortening the hair, and observing the required order. Standing at Arafah is the central pillar of Hajj.',
    },
    'Larangan Saat Ihram': {
        title: 'Prohibitions During Ihram',
        content:
            'Men may not wear stitched clothing or cover the head. Women may not cover the face or wear gloves. All pilgrims avoid perfume, cutting hair or nails, hunting land animals, marriage contracts, and intercourse.',
    },
    'Umrah dan Rukunnya': {
        title: 'Umrah and Its Pillars',
        content:
            'Umrah is obligatory once in a lifetime according to the stronger view. Its pillars are ihram from the miqat, tawaf, sai between Safa and Marwah, and shaving or shortening the hair.',
    },
    "Jual Beli (Bai')": {
        title: 'Buying and Selling',
        content:
            'Valid sale requires sane and eligible parties, mutual consent, a lawful and deliverable item, and ownership or representation. Prohibited sales include riba, excessive uncertainty, gambling, and intrinsically unlawful goods.',
    },
    'Riba dan Jenisnya': {
        title: 'Riba and Its Types',
        content:
            'Riba is unlawful excess. Riba al-fadl occurs in unequal exchange of similar ribawi goods, while riba al-nasiah occurs through increase due to deferred payment, including interest-based transactions.',
    },
    'Warisan (Faraid)': {
        title: 'Inheritance',
        content:
            'Faraid is the Islamic science of inheritance. Main heirs include sons, daughters, spouses, parents, and others according to detailed shares. A core principle is that a male receives the share of two females in the same lineage category.',
    },
};

const localizeFiqhCategory = (category, lang) =>
    String(lang).toUpperCase() === 'EN' ? FIQH_CATEGORY_EN[category] ?? category : category;

const localizeFiqhItem = (item, field, lang) =>
    String(lang).toUpperCase() === 'EN'
        ? FIQH_ITEM_EN[item.title]?.[field] ?? item[field]
        : item[field];

export default function FiqhPage() {
    const { t, lang } = useLocale();
    const [openCategory, setOpenCategory] = useState(null);
    const [openItem, setOpenItem] = useState({});
    const [search, setSearch] = useState('');

    const toggleCategory = (i) => {
        setOpenCategory(openCategory === i ? null : i);
        setOpenItem({});
    };

    const toggleItem = (ci, ii) => {
        const key = `${ci}-${ii}`;
        setOpenItem((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const filteredData = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return FIQH_DATA;
        return FIQH_DATA.map((category) => {
            const items = category.items.filter((item) => {
                const haystack = [
                    localizeFiqhCategory(category.category, lang),
                    category.arabic,
                    localizeFiqhItem(item, 'title', lang),
                    localizeFiqhItem(item, 'content', lang),
                    item.dalil,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(query);
            });
            return { ...category, items };
        }).filter((category) => category.items.length > 0);
    }, [lang, search]);

    const totalTopics = FIQH_DATA.reduce((sum, category) => sum + category.items.length, 0);
    const visibleTopics = filteredData.reduce((sum, category) => sum + category.items.length, 0);

    return (
        <main className='min-h-screen flex flex-col bg-parchment-50 dark:bg-slate-900'>
            <NavbarTailwindCss />
            <div className='max-w-2xl flex-1 w-full mx-auto px-4 pt-24 pb-8'>
                {/* Header */}
                <div className='mb-8 text-center'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/40 rounded-2xl mb-4'>
                        <MdOutlineAutoStories className='text-3xl text-teal-600 dark:text-teal-400' />
                    </div>
                    <h1 className='text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mb-2'>
                        {t('fiqh.title')}
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {t('fiqh.subtitle')}
                    </p>
                </div>

                <div className='flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                    <BsSearch className='text-gray-400 shrink-0' />
                    <input
                        type='text'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('fiqh.search_placeholder')}
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

                <div className='mb-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500'>
                    <span>
                        {t('common.showing')} {visibleTopics} {t('common.of')} {totalTopics} {t('fiqh.topic_unit')}
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

                {/* Categories */}
                <div className='space-y-3'>
                    {filteredData.length === 0 ? (
                        <div className='text-center py-16 text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
                            {t('fiqh.no_match')}
                        </div>
                    ) : (
                        filteredData.map((cat, ci) => (
                            <div
                                key={ci}
                                className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden'
                            >
                                <button
                                    onClick={() => toggleCategory(ci)}
                                    className='w-full flex items-center justify-between px-5 py-4'
                                >
                                    <div className='flex items-center gap-3'>
                                        <span className='text-2xl'>{cat.icon}</span>
                                        <div className='text-left'>
                                            <p className='font-bold text-gray-900 dark:text-white'>
                                                {localizeFiqhCategory(cat.category, lang)}
                                            </p>
                                            <p
                                                className='text-xs text-gray-400 dark:text-gray-500'
                                                style={{ fontFamily: 'Amiri, serif' }}
                                            >
                                                {cat.arabic}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full'>
                                            {cat.items.length} {t('fiqh.topic_unit')}
                                        </span>
                                        <BsChevronDown
                                            className={`text-gray-400 transition-transform ${openCategory === ci ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </button>

                                {openCategory === ci && (
                                    <div className='border-t border-gray-50 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-700'>
                                        {cat.items.map((item, ii) => {
                                            const key = `${ci}-${ii}`;
                                            const isOpen = !!openItem[key];
                                            return (
                                                <div key={ii}>
                                                    <button
                                                        onClick={() => toggleItem(ci, ii)}
                                                        className='w-full flex items-center justify-between px-5 py-3.5 text-left bg-gray-50/50 dark:bg-slate-800/50'
                                                    >
                                                        <span className='text-sm font-semibold text-emerald-800 dark:text-emerald-300'>
                                                            {localizeFiqhItem(item, 'title', lang)}
                                                        </span>
                                                        <BsChevronDown
                                                            className={`text-gray-400 text-xs flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                        />
                                                    </button>
                                                    {isOpen && (
                                                        <div className='px-5 pb-4 space-y-2'>
                                                            <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
                                                                {localizeFiqhItem(item, 'content', lang)}
                                                            </p>
                                                            {item.dalil && (
                                                                <p className='text-xs text-emerald-600 dark:text-emerald-400 font-medium'>
                                                                    {t('fiqh.evidence')}: {item.dalil}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <p className='text-center text-xs text-gray-400 dark:text-gray-500 mt-8'>
                    {t('fiqh.disclaimer')}
                </p>
            </div>
            <Footer />
        </main>
    );
}
