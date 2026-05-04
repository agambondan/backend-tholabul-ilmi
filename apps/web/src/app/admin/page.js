'use client';

import Link from 'next/link';
import {
    BsBook,
    BsBookHalf,
    BsBookmark,
    BsCameraVideo,
    BsClock,
    BsFileText,
    BsHeart,
    BsJournalText,
    BsListCheck,
    BsMap,
    BsMoon,
    BsQuestionCircle,
    BsRepeat,
    BsStar,
} from 'react-icons/bs';

const cards = [
    {
        href: '/admin/blog',
        icon: <BsFileText className='text-3xl text-emerald-500' />,
        title: 'Blog / Artikel',
        desc: 'Kelola artikel, kategori, dan tag.',
    },
    {
        href: '/admin/siroh',
        icon: <BsJournalText className='text-3xl text-blue-500' />,
        title: 'Siroh Nabawiyah',
        desc: 'Kelola bab dan konten Siroh Nabawiyah.',
    },
    {
        href: '/admin/doa',
        icon: <BsBookHalf className='text-3xl text-purple-500' />,
        title: 'Doa',
        desc: 'Kelola koleksi doa lengkap dengan terjemahan.',
    },
    {
        href: '/admin/dzikir',
        icon: <BsRepeat className='text-3xl text-teal-500' />,
        title: 'Dzikir',
        desc: 'Kelola dzikir pagi, petang, dan sesudah sholat.',
    },
    {
        href: '/admin/asmaul-husna',
        icon: <BsStar className='text-3xl text-yellow-500' />,
        title: 'Asmaul Husna',
        desc: 'Kelola 99 nama-nama Allah beserta artinya.',
    },
    {
        href: '/admin/kajian',
        icon: <BsCameraVideo className='text-3xl text-red-500' />,
        title: 'Kajian',
        desc: 'Kelola link kajian video dari berbagai platform.',
    },
    {
        href: '/admin/kamus',
        icon: <BsBook className='text-3xl text-indigo-500' />,
        title: 'Kamus Arab',
        desc: 'Kelola kamus bahasa Arab-Indonesia.',
    },
    {
        href: '/admin/quiz',
        icon: <BsQuestionCircle className='text-3xl text-orange-500' />,
        title: 'Quiz',
        desc: 'Kelola soal-soal kuis islami.',
    },
    {
        href: '/admin/sejarah',
        icon: <BsClock className='text-3xl text-gray-500' />,
        title: 'Sejarah Islam',
        desc: 'Kelola timeline sejarah peradaban Islam.',
    },
    {
        href: '/admin/asbabun-nuzul',
        icon: <BsBookmark className='text-3xl text-cyan-500' />,
        title: 'Asbabun Nuzul',
        desc: 'Kelola sebab-sebab turunnya ayat Al-Quran.',
    },
    {
        href: '/admin/wirid',
        icon: <BsHeart className='text-3xl text-pink-500' />,
        title: 'Wirid',
        desc: 'Kelola wirid harian dan amalan rutin.',
    },
    {
        href: '/admin/tahlil',
        icon: <BsMoon className='text-3xl text-violet-500' />,
        title: 'Tahlil',
        desc: 'Kelola susunan bacaan tahlil.',
    },
    {
        href: '/admin/manasik',
        icon: <BsMap className='text-3xl text-amber-600' />,
        title: 'Manasik',
        desc: 'Kelola panduan manasik haji dan umrah.',
    },
    {
        href: '/admin/fiqh',
        icon: <BsListCheck className='text-3xl text-lime-600' />,
        title: 'Fiqh',
        desc: 'Kelola materi fiqh ibadah sehari-hari.',
    },
];

const AdminDashboard = () => {
    return (
        <div className='p-8'>
            <div className='mb-8'>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Dashboard</h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                    Kelola konten Thullaabul &apos;Ilmi
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                {cards.map((card) => (
                    <Link
                        key={card.href}
                        href={card.href}
                        className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow'
                    >
                        <div className='mb-3'>{card.icon}</div>
                        <h2 className='text-base font-bold text-gray-900 dark:text-white mb-1'>
                            {card.title}
                        </h2>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>{card.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
