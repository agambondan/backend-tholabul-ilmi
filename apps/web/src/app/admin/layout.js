'use client';

import { useAuth } from '@/context/Auth';
import { Spinner3 } from '@/components/spinner/Spinner';
import AdminMutationToast from '@/components/admin/AdminMutationToast';
import { useLocale } from '@/context/Locale';
import { ConvertFLagLanguage } from '@/lib/converter';
import { useLayoutMode } from '@/lib/useLayoutMode';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
    BsMoonStarsFill,
    BsPeople,
    BsQuestionCircle,
    BsRepeat,
    BsStar,
    BsSunFill,
} from 'react-icons/bs';
import { MdLogout } from 'react-icons/md';

const NAV = [
    { href: '/admin', labelKey: 'admin.nav.dashboard', icon: <BsGrid /> },
    { href: '/admin/blog', labelKey: 'admin.nav.blog', icon: <BsFileText /> },
    { href: '/admin/siroh', labelKey: 'admin.nav.sirah', icon: <BsJournalText /> },
    { href: '/admin/doa', labelKey: 'admin.nav.prayers', icon: <BsBookHalf /> },
    { href: '/admin/dzikir', labelKey: 'admin.nav.dhikr', icon: <BsRepeat /> },
    { href: '/admin/asmaul-husna', labelKey: 'admin.nav.asmaul', icon: <BsStar /> },
    { href: '/admin/kajian', labelKey: 'admin.nav.studies', icon: <BsCameraVideo /> },
    { href: '/admin/kamus', labelKey: 'admin.nav.dictionary', icon: <BsBook /> },
    { href: '/admin/quiz', labelKey: 'admin.nav.quiz', icon: <BsQuestionCircle /> },
    { href: '/admin/sejarah', labelKey: 'admin.nav.history', icon: <BsClock /> },
    { href: '/admin/asbabun-nuzul', labelKey: 'admin.nav.asbabun', icon: <BsBookmark /> },
    { href: '/admin/wirid', labelKey: 'admin.nav.wird', icon: <BsHeart /> },
    { href: '/admin/tahlil', labelKey: 'admin.nav.tahlil', icon: <BsMoon /> },
    { href: '/admin/manasik', labelKey: 'admin.nav.manasik', icon: <BsMap /> },
    { href: '/admin/fiqh', labelKey: 'admin.nav.fiqh', icon: <BsListCheck /> },
    { href: '/admin/users', labelKey: 'admin.nav.users', icon: <BsPeople /> },
];

const LANGS = ['ID', 'EN'];
const SIDEBAR_STORAGE_KEY = 'tholabul_admin_sidebar_collapsed';

const AdminLayout = ({ children }) => {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { t, lang, setLang } = useLocale();
    const { isWide } = useLayoutMode();
    const router = useRouter();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const accountRef = useRef(null);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated || user?.role !== 'admin') {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, user, router]);

    useEffect(() => {
        const handler = (e) => {
            if (accountRef.current && !accountRef.current.contains(e.target)) {
                setAccountOpen(false);
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

    useEffect(() => {
        const sync = () => {
            const dark = localStorage.getItem('theme') === 'dark';
            document.documentElement.classList.toggle('dark', dark);
            setIsDarkMode(dark);
        };
        sync();
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    const toggleDark = () => {
        setIsDarkMode((prev) => {
            localStorage.setItem('theme', !prev ? 'dark' : 'light');
            return !prev;
        });
    };

    const toggleSidebar = () => {
        setIsCollapsed((current) => {
            const next = !current;
            try {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
            } catch {}
            return next;
        });
    };

    const initials = user?.name
        ? user.name
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
        : '?';

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
            <AdminMutationToast />
            <aside
                className={`${sidebarWidth} shrink-0 bg-emerald-900 dark:bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-40 transition-[width] duration-200`}
            >
                <div className='p-3 border-b border-emerald-800 dark:border-gray-800'>
                    {isCollapsed ? (
                        <Link
                            href='/'
                            title={t('admin.back_to_app')}
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
                                ← {t('admin.back_to_app')}
                            </Link>
                            <p className='text-sm font-bold text-white mt-1 truncate'>
                                {t('admin.panel')}
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
                                title={t(link.labelKey)}
                                className={`flex items-center py-2 rounded-lg text-sm transition-colors ${
                                    isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                                } ${
                                    isActive
                                        ? 'bg-emerald-700 text-white font-medium'
                                        : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
                                }`}
                            >
                                <span className='text-base shrink-0'>{link.icon}</span>
                                {!isCollapsed && <span className='truncate'>{t(link.labelKey)}</span>}
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

                    {/* Account dropdown */}
                    <div className='relative' ref={accountRef}>
                        <button
                            type='button'
                            onClick={() => setAccountOpen((v) => !v)}
                            className='flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors'
                        >
                            <div className='w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center shrink-0'>
                                <span className='text-white text-[11px] font-semibold'>{initials}</span>
                            </div>
                            <span className='text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate hidden sm:block'>
                                {user?.name?.split(' ')[0] ?? 'Admin'}
                            </span>
                            <svg
                                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${accountOpen ? 'rotate-180' : ''}`}
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                                strokeWidth={2.5}
                            >
                                <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                            </svg>
                        </button>

                        {accountOpen && (
                            <div className='absolute right-0 z-50 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden'>
                                {/* User identity */}
                                <div className='px-4 py-3.5 border-b border-gray-100 dark:border-slate-700'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center shrink-0'>
                                            <span className='text-white text-sm font-semibold'>{initials}</span>
                                        </div>
                                        <div className='min-w-0'>
                                            <p className='text-sm font-semibold text-gray-900 dark:text-white truncate'>
                                                {user?.name ?? 'Admin'}
                                            </p>
                                            <p className='text-xs text-gray-400 dark:text-gray-500 truncate'>
                                                {user?.email ?? ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Theme toggle */}
                                <div className='px-4 py-2.5 flex items-center justify-between border-b border-gray-100 dark:border-slate-700'>
                                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                                        {isDarkMode ? t('nav.dark') : t('nav.light')}
                                    </span>
                                    <button
                                        type='button'
                                        onClick={toggleDark}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                            isDarkMode ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-600'
                                        }`}
                                    >
                                        <span
                                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform ${
                                                isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        >
                                            {isDarkMode ? (
                                                <BsMoonStarsFill className='text-emerald-700 text-[9px]' />
                                            ) : (
                                                <BsSunFill className='text-amber-500 text-[9px]' />
                                            )}
                                        </span>
                                    </button>
                                </div>

                                {/* Language selector */}
                                <div className='px-4 py-2.5 flex items-center gap-2 border-b border-gray-100 dark:border-slate-700'>
                                    {LANGS.map((l) => (
                                        <button
                                            key={l}
                                            type='button'
                                            onClick={() => setLang(l)}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                lang === l
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                    : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-500'
                                            }`}
                                        >
                                            <span className='inline-flex rounded-sm overflow-hidden ring-1 ring-gray-200 dark:ring-slate-600 leading-none'>
                                                {ConvertFLagLanguage(l)}
                                            </span>
                                            {l === 'ID' ? 'Indonesia' : 'English'}
                                        </button>
                                    ))}
                                </div>

                                {/* Logout */}
                                <div className='py-1'>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setAccountOpen(false);
                                            logout();
                                        }}
                                        className='flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                                    >
                                        <MdLogout className='text-base' />
                                        {t('nav.logout')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                <div className={isWide ? 'w-full' : 'max-w-5xl mx-auto'}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
