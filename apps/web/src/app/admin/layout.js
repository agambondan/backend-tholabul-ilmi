'use client';

import { useAuth } from '@/context/Auth';
import { Spinner3 } from '@/components/spinner/Spinner';
import { useLocale } from '@/context/Locale';
import { ConvertFLagLanguage } from '@/lib/converter';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { RiArrowDropDownLine, RiArrowDropUpLine } from 'react-icons/ri';
import {
    BsBook,
    BsBookHalf,
    BsBookmark,
    BsCameraVideo,
    BsChevronLeft,
    BsChevronRight,
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
    { href: '/admin/siroh', label: 'Sirah', icon: <BsJournalText /> },
    { href: '/admin/doa', label: 'Prayers', icon: <BsBookHalf /> },
    { href: '/admin/dzikir', label: 'Dhikr', icon: <BsRepeat /> },
    { href: '/admin/asmaul-husna', label: 'Asmaul Husna', icon: <BsStar /> },
    { href: '/admin/kajian', label: 'Studies', icon: <BsCameraVideo /> },
    { href: '/admin/kamus', label: 'Dictionary', icon: <BsBook /> },
    { href: '/admin/quiz', label: 'Quiz', icon: <BsQuestionCircle /> },
    { href: '/admin/sejarah', label: 'History', icon: <BsClock /> },
    { href: '/admin/asbabun-nuzul', label: 'Asbabun Nuzul', icon: <BsBookmark /> },
    { href: '/admin/wirid', label: 'Wird', icon: <BsHeart /> },
    { href: '/admin/tahlil', label: 'Tahlil', icon: <BsMoon /> },
    { href: '/admin/manasik', label: 'Manasik', icon: <BsMap /> },
    { href: '/admin/fiqh', label: 'Fiqh', icon: <BsListCheck /> },
    { href: '/admin/users', label: 'Users', icon: <BsPeople /> },
];

const LANGS = ['ID', 'EN'];
const SIDEBAR_STORAGE_KEY = 'tholabul_admin_sidebar_collapsed';

const AdminLayout = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { t, lang, setLang } = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef(null);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated || user?.role !== 'admin') {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, user, router]);

    useEffect(() => {
        const handler = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        try {
            setIsCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1');
        } catch {
            setIsCollapsed(false);
        }
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed((current) => {
            const next = !current;
            try {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
            } catch {
                // Ignore storage failures; the visual toggle should still work.
            }
            return next;
        });
    };

    if (isLoading || !isAuthenticated || user?.role !== 'admin') {
        return <Spinner3 />;
    }

    const sidebarWidth = isCollapsed ? 'w-16' : 'w-52';
    const mainOffset = isCollapsed ? 'ml-16' : 'ml-52';
    const sidebarToggleLabel = isCollapsed
        ? t('sidebar.expand')
        : t('sidebar.collapse');

    return (
        <div className='min-h-screen flex bg-gray-50 dark:bg-gray-950'>
            <aside
                className={`${sidebarWidth} shrink-0 bg-emerald-900 dark:bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-40 transition-[width] duration-200`}
            >
                <div className='p-3 border-b border-emerald-800 dark:border-gray-800'>
                    {isCollapsed ? (
                        <Link
                            href='/'
                            title='Back to App'
                            className='flex h-9 w-9 items-center justify-center rounded-lg text-xs text-emerald-300 hover:bg-emerald-800 hover:text-white transition-colors'
                        >
                            ←
                        </Link>
                    ) : (
                        <div className='min-w-0'>
                            <Link
                                href='/'
                                className='text-xs text-emerald-300 hover:text-white transition-colors'
                            >
                                ← Back to App
                            </Link>
                            <p className='text-sm font-bold text-white mt-1 truncate'>
                                Admin Panel
                            </p>
                        </div>
                    )}
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
                                title={link.label}
                                className={`flex items-center py-2 rounded-lg text-sm transition-colors ${
                                    isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                                } ${
                                    isActive
                                        ? 'bg-emerald-700 text-white font-medium'
                                        : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
                                }`}
                            >
                                <span className='text-base shrink-0'>{link.icon}</span>
                                {!isCollapsed && <span className='truncate'>{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className='p-4 border-t border-emerald-800 dark:border-gray-800'>
                    {isCollapsed ? (
                        <div
                            title={user?.name ?? 'Admin'}
                            className='mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-xs font-semibold text-emerald-100'
                        >
                            {(user?.name ?? 'A').slice(0, 1).toUpperCase()}
                        </div>
                    ) : (
                        <>
                            <p className='text-xs text-emerald-300 truncate'>{user?.name}</p>
                            <p className='text-[11px] text-emerald-500 truncate'>{user?.email}</p>
                        </>
                    )}
                </div>
            </aside>

            <main
                className={`${mainOffset} flex-1 min-h-screen overflow-auto transition-[margin] duration-200`}
            >
                <header className='sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 h-14'>
                    <button
                        type='button'
                        onClick={toggleSidebar}
                        aria-label={sidebarToggleLabel}
                        title={sidebarToggleLabel}
                        className='inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors'
                    >
                        {isCollapsed ? <BsChevronRight /> : <BsChevronLeft />}
                    </button>
                    <div className='relative' ref={langRef}>
                        <button
                            type='button'
                            onClick={() => setLangOpen((value) => !value)}
                            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors'
                        >
                            <span className='inline-flex rounded-sm overflow-hidden ring-1 ring-gray-200 dark:ring-slate-600 leading-none'>
                                {ConvertFLagLanguage(lang)}
                            </span>
                            <span>{lang === 'ID' ? 'Indonesia' : 'English'}</span>
                            {langOpen ? (
                                <RiArrowDropUpLine size={20} />
                            ) : (
                                <RiArrowDropDownLine size={20} />
                            )}
                        </button>
                        {langOpen && (
                            <ul className='absolute right-0 z-50 mt-1 min-w-[10rem] list-none overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xl'>
                                {LANGS.map((item) => (
                                    <li key={item}>
                                        <button
                                            type='button'
                                            className='flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors text-gray-800 dark:text-white'
                                            onClick={() => {
                                                setLang(item);
                                                setLangOpen(false);
                                            }}
                                        >
                                            <span className='inline-flex rounded-sm overflow-hidden ring-1 ring-gray-200 dark:ring-slate-600 leading-none'>
                                                {ConvertFLagLanguage(item)}
                                            </span>
                                            <span>{item === 'ID' ? 'Indonesia' : 'English'}</span>
                                            {lang === item && (
                                                <span className='ml-auto text-emerald-600 dark:text-emerald-400'>
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
