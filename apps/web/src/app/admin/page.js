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
        title: 'Blog / Articles',
        desc: 'Manage articles, categories, and tags.',
    },
    {
        href: '/admin/siroh',
        icon: <BsJournalText className='text-3xl text-blue-500' />,
        title: "Prophet's Biography",
        desc: 'Manage sirah chapters and content.',
    },
    {
        href: '/admin/doa',
        icon: <BsBookHalf className='text-3xl text-purple-500' />,
        title: 'Prayers',
        desc: 'Manage the prayer collection with translations.',
    },
    {
        href: '/admin/dzikir',
        icon: <BsRepeat className='text-3xl text-teal-500' />,
        title: 'Dhikr',
        desc: 'Manage morning, evening, and after-prayer dhikr.',
    },
    {
        href: '/admin/asmaul-husna',
        icon: <BsStar className='text-3xl text-yellow-500' />,
        title: 'Asmaul Husna',
        desc: 'Manage the 99 names of Allah and their meanings.',
    },
    {
        href: '/admin/kajian',
        icon: <BsCameraVideo className='text-3xl text-red-500' />,
        title: 'Studies',
        desc: 'Manage study video links from multiple platforms.',
    },
    {
        href: '/admin/kamus',
        icon: <BsBook className='text-3xl text-indigo-500' />,
        title: 'Arabic Dictionary',
        desc: 'Manage the Arabic-Indonesian dictionary.',
    },
    {
        href: '/admin/quiz',
        icon: <BsQuestionCircle className='text-3xl text-orange-500' />,
        title: 'Quiz',
        desc: 'Manage Islamic quiz questions.',
    },
    {
        href: '/admin/sejarah',
        icon: <BsClock className='text-3xl text-gray-500' />,
        title: 'Islamic History',
        desc: 'Manage the Islamic civilization history timeline.',
    },
    {
        href: '/admin/asbabun-nuzul',
        icon: <BsBookmark className='text-3xl text-cyan-500' />,
        title: 'Asbabun Nuzul',
        desc: 'Manage reasons behind Quranic revelation.',
    },
    {
        href: '/admin/wirid',
        icon: <BsHeart className='text-3xl text-pink-500' />,
        title: 'Wird',
        desc: 'Manage daily wird and routine deeds.',
    },
    {
        href: '/admin/tahlil',
        icon: <BsMoon className='text-3xl text-violet-500' />,
        title: 'Tahlil',
        desc: 'Manage the tahlil reading sequence.',
    },
    {
        href: '/admin/manasik',
        icon: <BsMap className='text-3xl text-amber-600' />,
        title: 'Manasik',
        desc: 'Manage Hajj and Umrah manasik guides.',
    },
    {
        href: '/admin/fiqh',
        icon: <BsListCheck className='text-3xl text-lime-600' />,
        title: 'Fiqh',
        desc: 'Manage daily worship fiqh materials.',
    },
];

const AdminDashboard = () => {
    return (
        <div className='p-8'>
            <div className='mb-8'>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Dashboard</h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                    Manage content Thullaabul &apos;Ilmi
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
