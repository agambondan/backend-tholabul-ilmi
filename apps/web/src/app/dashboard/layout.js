'use client';

import { useAuth } from '@/context/Auth';
import { useLocale } from '@/context/Locale';
import { ConvertFLagLanguage } from '@/lib/converter';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { RiArrowDropDownLine, RiArrowDropUpLine } from 'react-icons/ri';
import {
    BsBarChart,
    BsBell,
    BsBook,
    BsBookmark,
    BsCalendar3,
    BsChevronLeft,
    BsChevronRight,
    BsJournalCheck,
    BsPerson,
    BsStickyFill,
    BsTrophyFill,
} from 'react-icons/bs';
import { FaBrain, FaQuran } from 'react-icons/fa';
import { GiOpenBook } from 'react-icons/gi';
import { ImBook } from 'react-icons/im';
import {
    MdAccessTime,
    MdCalendarMonth,
    MdFlag,
    MdFormatListBulleted,
    MdMenuBook,
    MdMosque,
    MdOutlineAutoStories,
    MdOutlineDirectionsWalk,
    MdOutlinePlayLesson,
    MdRefresh,
    MdSelfImprovement,
    MdStar,
    MdTimeline,
} from 'react-icons/md';

const LANGS = ['ID', 'EN'];
const SIDEBAR_STORAGE_KEY = 'tholabul_dashboard_sidebar_collapsed';

const DashboardLayout = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { t, lang, setLang } = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [langOpen, setLangOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const langRef = useRef(null);

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

    const GROUPS = [
        {
            titleKey: 'sidebar.main_reading',
            links: [
                { labelKey: 'link.quran', href: '/dashboard/quran', icon: <FaQuran /> },
                { labelKey: 'link.hadith', href: '/dashboard/hadith', icon: <ImBook /> },
            ],
        },
        {
            titleKey: 'sidebar.worship_tracker',
            links: [
                { labelKey: 'link.sholat_tracker', href: '/dashboard/sholat-tracker', icon: <MdMosque /> },
                { labelKey: 'link.recitation', href: '/dashboard/tilawah', icon: <BsJournalCheck /> },
                { labelKey: 'link.memorization', href: '/dashboard/hafalan', icon: <BsBook /> },
                { labelKey: 'link.review', href: '/dashboard/muroja-ah', icon: <MdRefresh /> },
                { labelKey: 'link.deeds', href: '/dashboard/amalan', icon: <MdFormatListBulleted /> },
                { labelKey: 'link.muhasabah', href: '/dashboard/muhasabah', icon: <MdSelfImprovement /> },
                { labelKey: 'link.goals', href: '/dashboard/goals', icon: <MdFlag /> },
            ],
        },
        {
            titleKey: 'sidebar.islamic_content',
            links: [
                { labelKey: 'link.tafsir', href: '/dashboard/tafsir', icon: <MdOutlineAutoStories /> },
                { labelKey: 'link.asmaul_husna', href: '/dashboard/asmaul-husna', icon: <MdStar /> },
                { labelKey: 'link.doa', href: '/dashboard/doa', icon: <MdSelfImprovement /> },
                { labelKey: 'link.dhikr', href: '/dashboard/dzikir', icon: <GiOpenBook /> },
                { labelKey: 'link.wird', href: '/dashboard/wirid', icon: <GiOpenBook /> },
                { labelKey: 'link.tahlil', href: '/dashboard/tahlil', icon: <BsBook /> },
                { labelKey: 'link.kajian', href: '/dashboard/kajian', icon: <MdOutlinePlayLesson /> },
                { labelKey: 'link.sirah_short', href: '/dashboard/siroh', icon: <MdMenuBook /> },
                { labelKey: 'link.brief_fiqh', href: '/dashboard/fiqh', icon: <MdMenuBook /> },
                { labelKey: 'link.islamic_history', href: '/dashboard/sejarah', icon: <MdTimeline /> },
                { labelKey: 'link.manasik', href: '/dashboard/manasik', icon: <MdOutlineDirectionsWalk /> },
            ],
        },
        {
            titleKey: 'sidebar.tools',
            links: [
                { labelKey: 'link.prayer_schedule', href: '/dashboard/jadwal-sholat', icon: <MdAccessTime /> },
                { labelKey: 'link.hijri_calendar', href: '/dashboard/hijri', icon: <MdCalendarMonth /> },
                { labelKey: 'link.arabic_dict', href: '/dashboard/kamus', icon: <BsBook /> },
                { labelKey: 'link.quiz', href: '/dashboard/quiz', icon: <FaBrain /> },
                { labelKey: 'link.leaderboard', href: '/dashboard/leaderboard', icon: <BsTrophyFill /> },
                { labelKey: 'link.imsakiyah', href: '/dashboard/imsakiyah', icon: <BsCalendar3 /> },
            ],
        },
        {
            titleKey: 'sidebar.account',
            links: [
                { labelKey: 'link.bookmarks', href: '/dashboard/bookmarks', icon: <BsBookmark /> },
                { labelKey: 'link.notes', href: '/dashboard/notes', icon: <BsStickyFill /> },
                { labelKey: 'link.statistics', href: '/dashboard/stats', icon: <BsBarChart /> },
                { labelKey: 'link.notifications', href: '/dashboard/notifications', icon: <BsBell /> },
                { labelKey: 'link.profile', href: '/dashboard/profile', icon: <BsPerson /> },
            ],
        },
    ];

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) return null;

    const sidebarWidth = isCollapsed ? 'w-16' : 'w-60';
    const mainOffset = isCollapsed ? 'ml-16' : 'ml-60';
    const sidebarToggleLabel = isCollapsed
        ? t('sidebar.expand')
        : t('sidebar.collapse');

    return (
        <div className='min-h-screen flex bg-gray-50 dark:bg-gray-950'>
            {/* Sidebar */}
            <aside
                className={`${sidebarWidth} shrink-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col fixed inset-y-0 left-0 z-40 transition-[width] duration-200`}
            >
                {/* Logo */}
                <div
                    className={`border-b border-gray-100 dark:border-slate-800 ${
                        isCollapsed ? 'p-3' : 'p-4'
                    }`}
                >
                    <Link
                        href='/'
                        title="Thullaabul 'Ilmi"
                        className={`flex items-center group ${
                            isCollapsed ? 'justify-center' : 'gap-2.5'
                        }`}
                    >
                        <div className='w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0'>
                            <span className='text-white text-xs font-bold'>ط</span>
                        </div>
                        {!isCollapsed && (
                            <div>
                                <p className='text-sm font-bold text-gray-900 dark:text-white leading-none'>
                                    Thullaabul &apos;Ilmi
                                </p>
                                <p className='text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 arabic-text'>
                                    طُلَّابُ الْعِلْمِ
                                </p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* User info */}
                <div className='px-4 py-3 border-b border-gray-100 dark:border-slate-800'>
                    {isCollapsed ? (
                        <div
                            title={user?.name ?? t('common.user')}
                            className='mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        >
                            {(user?.name ?? t('common.user')).slice(0, 1).toUpperCase()}
                        </div>
                    ) : (
                        <>
                            <p className='text-sm font-medium text-gray-800 dark:text-white truncate'>
                                {user?.name ?? t('common.user')}
                            </p>
                            <p className='text-xs text-gray-400 dark:text-gray-500 truncate'>
                                {user?.email ?? ''}
                            </p>
                        </>
                    )}
                </div>

                {/* Dashboard link */}
                <div className='px-3 pt-3'>
                    <Link
                        href='/dashboard'
                        title={t('link.dashboard')}
                        className={`flex items-center py-2 rounded-lg text-sm font-medium transition-colors ${
                            isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
                        } ${
                            pathname === '/dashboard'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <BsBarChart className='shrink-0' />
                        {!isCollapsed && <span>{t('link.dashboard')}</span>}
                    </Link>
                </div>

                {/* Nav groups */}
                <nav className='flex-1 overflow-y-auto px-3 py-2 space-y-4'>
                    {GROUPS.map((group) => (
                        <div key={group.titleKey}>
                            {isCollapsed ? (
                                <div className='mx-3 mb-1 h-px bg-gray-100 dark:bg-slate-800' />
                            ) : (
                                <p className='px-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1'>
                                    {t(group.titleKey)}
                                </p>
                            )}
                            <ul className='space-y-0.5'>
                                {group.links.map((link) => {
                                    const isActive =
                                        pathname === link.href ||
                                        (link.href !== '/' &&
                                            pathname.startsWith(link.href + '/'));
                                    return (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                title={t(link.labelKey)}
                                                className={`flex items-center py-1.5 rounded-lg text-sm transition-colors ${
                                                    isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
                                                } ${
                                                    isActive
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <span className='shrink-0 text-base'>
                                                    {link.icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className='truncate'>{t(link.labelKey)}</span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

            </aside>

            {/* Main content */}
            <main
                className={`${mainOffset} flex-1 min-h-screen overflow-auto transition-[margin] duration-200`}
            >
                {/* Header */}
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
                            onClick={() => setLangOpen((v) => !v)}
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
                                {LANGS.map((l) => (
                                    <li key={l}>
                                        <button
                                            type='button'
                                            className='flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors text-gray-800 dark:text-white'
                                            onClick={() => {
                                                setLang(l);
                                                setLangOpen(false);
                                            }}
                                        >
                                            <span className='inline-flex rounded-sm overflow-hidden ring-1 ring-gray-200 dark:ring-slate-600 leading-none'>
                                                {ConvertFLagLanguage(l)}
                                            </span>
                                            <span>{l === 'ID' ? 'Indonesia' : 'English'}</span>
                                            {lang === l && (
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

export default DashboardLayout;
