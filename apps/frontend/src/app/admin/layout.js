'use client';

import { useAuth } from '@/context/Auth';
import { Spinner3 } from '@/components/spinner/Spinner';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
    BsBook,
    BsBookHalf,
    BsBookmark,
    BsCameraVideo,
    BsClock,
    BsFileText,
    BsGrid,
    BsHeart,
    BsJournalText,
    BsListCheck,
    BsMap,
    BsMoon,
    BsPeople,
    BsQuestionCircle,
    BsRepeat,
    BsStar,
} from 'react-icons/bs';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: <BsGrid /> },
    { href: '/admin/blog', label: 'Blog', icon: <BsFileText /> },
    { href: '/admin/siroh', label: 'Siroh', icon: <BsJournalText /> },
    { href: '/admin/doa', label: 'Doa', icon: <BsBookHalf /> },
    { href: '/admin/dzikir', label: 'Dzikir', icon: <BsRepeat /> },
    { href: '/admin/asmaul-husna', label: 'Asmaul Husna', icon: <BsStar /> },
    { href: '/admin/kajian', label: 'Kajian', icon: <BsCameraVideo /> },
    { href: '/admin/kamus', label: 'Kamus', icon: <BsBook /> },
    { href: '/admin/quiz', label: 'Quiz', icon: <BsQuestionCircle /> },
    { href: '/admin/sejarah', label: 'Sejarah', icon: <BsClock /> },
    { href: '/admin/asbabun-nuzul', label: 'Asbabun Nuzul', icon: <BsBookmark /> },
    { href: '/admin/wirid', label: 'Wirid', icon: <BsHeart /> },
    { href: '/admin/tahlil', label: 'Tahlil', icon: <BsMoon /> },
    { href: '/admin/manasik', label: 'Manasik', icon: <BsMap /> },
    { href: '/admin/fiqh', label: 'Fiqh', icon: <BsListCheck /> },
    { href: '/admin/users', label: 'Users', icon: <BsPeople /> },
];

const AdminLayout = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated || user?.role !== 'admin') {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !isAuthenticated || user?.role !== 'admin') {
        return <Spinner3 />;
    }

    return (
        <div className='min-h-screen flex bg-gray-50 dark:bg-gray-950'>
            <aside className='w-52 shrink-0 bg-emerald-900 dark:bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-40'>
                <div className='p-4 border-b border-emerald-800 dark:border-gray-800'>
                    <Link
                        href='/'
                        className='text-xs text-emerald-300 hover:text-white transition-colors'
                    >
                        ← Kembali ke App
                    </Link>
                    <p className='text-sm font-bold text-white mt-1'>Admin Panel</p>
                </div>

                <nav className='flex-1 p-3 space-y-1 overflow-y-auto'>
                    {NAV.map((link) => {
                        const isActive =
                            link.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive
                                        ? 'bg-emerald-700 text-white font-medium'
                                        : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
                                }`}
                            >
                                <span className='text-base'>{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className='p-4 border-t border-emerald-800 dark:border-gray-800'>
                    <p className='text-xs text-emerald-300 truncate'>{user?.name}</p>
                    <p className='text-[11px] text-emerald-500 truncate'>{user?.email}</p>
                </div>
            </aside>

            <main className='flex-1 ml-52 min-h-screen overflow-auto'>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
