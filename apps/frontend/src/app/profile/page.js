'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonProfile } from '@/components/skeleton/Skeleton';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { hafalanApi, progressApi, streakApi, userApi } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    BsBell,
    BsBook,
    BsBookmark,
    BsCheckCircle,
    BsChevronDown,
    BsChevronUp,
    BsFire,
    BsJournalCheck,
    BsLock,
    BsPencil,
    BsPerson,
    BsStickyFill,
    BsTranslate,
} from 'react-icons/bs';
import { FaCalculator } from 'react-icons/fa';
import { GiCompass } from 'react-icons/gi';
import { MdAccessTime, MdFlag, MdFormatListBulleted, MdMosque, MdOutlinePlayLesson, MdRefresh, MdSelfImprovement } from 'react-icons/md';

const inputCls =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500';

const ProfilePage = () => {
    const { user, isAuthenticated, isLoading: authLoading, logout, refetchUser } = useRequireAuth();
    const [streak, setStreak] = useState(null);
    const [quranProgress, setQuranProgress] = useState(null);
    const [hadithProgress, setHadithProgress] = useState(null);
    const [hafalanSummary, setHafalanSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editMsg, setEditMsg] = useState({ type: '', text: '' });

    const [pwdOpen, setPwdOpen] = useState(false);
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

    const [langOpen, setLangOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState('idn');
    const [langLoading, setLangLoading] = useState(false);
    const [langMsg, setLangMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        Promise.allSettled([
            streakApi.get().then((r) => r.json()),
            progressApi.getQuran().then((r) => r.json()),
            progressApi.getHadith().then((r) => r.json()),
            hafalanApi.summary().then((r) => r.json()),
        ]).then(([s, q, h, haf]) => {
            if (s.status === 'fulfilled') setStreak(s.value);
            if (q.status === 'fulfilled') setQuranProgress(q.value);
            if (h.status === 'fulfilled') setHadithProgress(h.value);
            if (haf.status === 'fulfilled') setHafalanSummary(haf.value);
            setIsLoading(false);
        });
    }, [isAuthenticated, authLoading]);

    useEffect(() => {
        if (user?.name) setEditName(user.name);
        if (user?.preferred_lang) setSelectedLang(user.preferred_lang);
    }, [user]);

    const handleEditProfile = async (e) => {
        e.preventDefault();
        if (!editName.trim()) return;
        setEditLoading(true);
        setEditMsg({ type: '', text: '' });
        try {
            const res = await userApi.updateMe(user.id, { name: editName.trim() });
            if (!res.ok) throw new Error();
            refetchUser();
            setEditMsg({ type: 'success', text: 'Profil berhasil diperbarui.' });
            setEditOpen(false);
        } catch {
            setEditMsg({ type: 'error', text: 'Gagal memperbarui profil.' });
        } finally {
            setEditLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPwd !== confirmPwd) {
            setPwdMsg({ type: 'error', text: 'Password baru tidak cocok.' });
            return;
        }
        if (newPwd.length < 8) {
            setPwdMsg({ type: 'error', text: 'Password baru minimal 8 karakter.' });
            return;
        }
        setPwdLoading(true);
        setPwdMsg({ type: '', text: '' });
        try {
            const res = await userApi.changePassword(oldPwd, newPwd);
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Password lama salah.');
            }
            setPwdMsg({ type: 'success', text: 'Password berhasil diubah.' });
            setOldPwd('');
            setNewPwd('');
            setConfirmPwd('');
            setPwdOpen(false);
        } catch (err) {
            setPwdMsg({ type: 'error', text: err.message || 'Gagal mengubah password.' });
        } finally {
            setPwdLoading(false);
        }
    };

    const handleChangeLang = async (lang) => {
        setLangLoading(true);
        setLangMsg({ type: '', text: '' });
        try {
            const res = await userApi.updateMe(user.id, { preferred_lang: lang });
            if (!res.ok) throw new Error();
            setSelectedLang(lang);
            refetchUser();
            setLangMsg({ type: 'success', text: 'Preferensi bahasa disimpan.' });
        } catch {
            setLangMsg({ type: 'error', text: 'Gagal menyimpan preferensi.' });
        } finally {
            setLangLoading(false);
        }
    };

    if (authLoading || isLoading) return <SkeletonProfile />;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-2xl'>
                    {/* Header */}
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center'>
                                <BsPerson className='text-2xl text-emerald-700 dark:text-emerald-400' />
                            </div>
                            <div>
                                <h1 className='text-lg font-bold text-emerald-900 dark:text-white'>
                                    {user?.name ?? 'Pengguna'}
                                </h1>
                                <p className='text-sm text-gray-500 dark:text-gray-400'>
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className='text-sm text-red-500 dark:text-red-400 hover:underline'
                        >
                            Keluar
                        </button>
                    </div>

                    {/* Streak */}
                    {streak && (
                        <div className='bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-2xl p-5 mb-4 text-white'>
                            <div className='flex items-center gap-2 mb-3'>
                                <BsFire className='text-orange-300 text-xl' />
                                <span className='font-semibold'>Streak Membaca</span>
                            </div>
                            <div className='flex gap-6'>
                                <div>
                                    <p className='text-3xl font-extrabold'>{streak.current ?? 0}</p>
                                    <p className='text-xs text-emerald-200 mt-1'>Hari berturut</p>
                                </div>
                                <div>
                                    <p className='text-3xl font-extrabold'>{streak.longest ?? 0}</p>
                                    <p className='text-xs text-emerald-200 mt-1'>Terpanjang</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reading progress */}
                    <div className='grid grid-cols-2 gap-3 mb-4'>
                        {quranProgress && (
                            <Link
                                href={
                                    quranProgress.surah_latin
                                        ? `/quran/surah/${quranProgress.surah_latin}#${quranProgress.ayah_number}`
                                        : '/quran'
                                }
                                className='p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                            >
                                <div className='flex items-center gap-2 mb-2'>
                                    <BsBook className='text-emerald-600 dark:text-emerald-400' />
                                    <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase'>
                                        Terakhir Baca Quran
                                    </span>
                                </div>
                                <p className='text-sm font-bold text-emerald-900 dark:text-white'>
                                    {quranProgress.surah_latin ?? 'Belum mulai'}
                                </p>
                                {quranProgress.ayah_number && (
                                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                                        Ayat {quranProgress.ayah_number}
                                    </p>
                                )}
                            </Link>
                        )}
                        {hadithProgress && (
                            <Link
                                href={
                                    hadithProgress.book_slug
                                        ? `/hadith/${hadithProgress.book_slug}#${hadithProgress.hadith_id}`
                                        : '/hadith'
                                }
                                className='p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                            >
                                <div className='flex items-center gap-2 mb-2'>
                                    <BsBook className='text-emerald-600 dark:text-emerald-400' />
                                    <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase'>
                                        Terakhir Baca Hadith
                                    </span>
                                </div>
                                <p className='text-sm font-bold text-emerald-900 dark:text-white'>
                                    {hadithProgress.book_slug ?? 'Belum mulai'}
                                </p>
                                {hadithProgress.hadith_id && (
                                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                                        Hadith #{hadithProgress.hadith_id}
                                    </p>
                                )}
                            </Link>
                        )}
                    </div>

                    {/* Quick links */}
                    <div className='grid grid-cols-2 gap-3 mb-6'>
                        <Link
                            href='/bookmarks'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <BsBookmark className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Bookmark
                            </span>
                        </Link>
                        <Link
                            href='/hafalan'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <BsCheckCircle className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <div>
                                <span className='text-sm font-medium text-emerald-900 dark:text-white block'>
                                    Hafalan
                                </span>
                                {hafalanSummary && (
                                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                                        {hafalanSummary.memorized ?? 0} hafal
                                    </span>
                                )}
                            </div>
                        </Link>
                        <Link
                            href='/tilawah'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <BsJournalCheck className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Tilawah
                            </span>
                        </Link>
                        <Link
                            href='/amalan'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <MdFormatListBulleted className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Amalan
                            </span>
                        </Link>
                        <Link
                            href='/muroja-ah'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <MdRefresh className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Muroja&apos;ah
                            </span>
                        </Link>
                        <Link
                            href='/notes'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <BsStickyFill className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Catatan
                            </span>
                        </Link>
                        <Link
                            href='/jadwal-sholat'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <MdAccessTime className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Jadwal Sholat
                            </span>
                        </Link>
                        <Link
                            href='/zakat'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <FaCalculator className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Zakat
                            </span>
                        </Link>
                        <Link
                            href='/kiblat'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <GiCompass className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Kiblat
                            </span>
                        </Link>
                        <Link
                            href='/kamus'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <BsBook className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Kamus Arab
                            </span>
                        </Link>
                        <Link
                            href='/sholat-tracker'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <MdMosque className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Sholat Tracker
                            </span>
                        </Link>
                        <Link
                            href='/muhasabah'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <MdSelfImprovement className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Muhasabah
                            </span>
                        </Link>
                        <Link
                            href='/goals'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <MdFlag className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Target Belajar
                            </span>
                        </Link>
                        <Link
                            href='/kajian'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <MdOutlinePlayLesson className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Kajian Islam
                            </span>
                        </Link>
                        <Link
                            href='/notifications'
                            className='flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                        >
                            <BsBell className='text-emerald-600 dark:text-emerald-400 text-xl' />
                            <span className='text-sm font-medium text-emerald-900 dark:text-white'>
                                Notifikasi
                            </span>
                        </Link>
                    </div>

                    {/* Edit profil */}
                    <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-3 overflow-hidden'>
                        <button
                            onClick={() => {
                                setEditOpen((v) => !v);
                                setEditMsg({ type: '', text: '' });
                            }}
                            className='w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors'
                        >
                            <span className='flex items-center gap-2'>
                                <BsPencil className='text-emerald-600 dark:text-emerald-400' />
                                Edit Profil
                            </span>
                            {editOpen ? <BsChevronUp /> : <BsChevronDown />}
                        </button>
                        {editOpen && (
                            <form
                                onSubmit={handleEditProfile}
                                className='px-5 pb-5 pt-1 border-t border-gray-100 dark:border-slate-700 space-y-4'
                            >
                                {editMsg.text && (
                                    <p
                                        className={`text-sm ${editMsg.type === 'error' ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                    >
                                        {editMsg.text}
                                    </p>
                                )}
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        Nama
                                    </label>
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        required
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        Email
                                    </label>
                                    <input
                                        value={user?.email ?? ''}
                                        disabled
                                        className={`${inputCls} opacity-60 cursor-not-allowed`}
                                    />
                                </div>
                                <button
                                    type='submit'
                                    disabled={editLoading}
                                    className='px-5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors'
                                >
                                    {editLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Preferensi bahasa */}
                    <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-3 overflow-hidden'>
                        <button
                            onClick={() => {
                                setLangOpen((v) => !v);
                                setLangMsg({ type: '', text: '' });
                            }}
                            className='w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors'
                        >
                            <span className='flex items-center gap-2'>
                                <BsTranslate className='text-emerald-600 dark:text-emerald-400' />
                                Preferensi Bahasa Terjemahan
                            </span>
                            {langOpen ? <BsChevronUp /> : <BsChevronDown />}
                        </button>
                        {langOpen && (
                            <div className='px-5 pb-5 pt-1 border-t border-gray-100 dark:border-slate-700 space-y-3'>
                                {langMsg.text && (
                                    <p
                                        className={`text-sm ${langMsg.type === 'error' ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                    >
                                        {langMsg.text}
                                    </p>
                                )}
                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    Pilih bahasa terjemahan yang ditampilkan di Quran dan Hadith.
                                </p>
                                <div className='flex gap-2'>
                                    {[
                                        { value: 'idn', label: 'Indonesia' },
                                        { value: 'en', label: 'English' },
                                        { value: 'ar', label: 'العربية' },
                                    ].map((lang) => (
                                        <button
                                            key={lang.value}
                                            onClick={() => handleChangeLang(lang.value)}
                                            disabled={langLoading}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                                selectedLang === lang.value
                                                    ? 'bg-emerald-700 text-white'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-slate-600'
                                            }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ganti password */}
                    <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
                        <button
                            onClick={() => {
                                setPwdOpen((v) => !v);
                                setPwdMsg({ type: '', text: '' });
                            }}
                            className='w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors'
                        >
                            <span className='flex items-center gap-2'>
                                <BsLock className='text-emerald-600 dark:text-emerald-400' />
                                Ganti Password
                            </span>
                            {pwdOpen ? <BsChevronUp /> : <BsChevronDown />}
                        </button>
                        {pwdOpen && (
                            <form
                                onSubmit={handleChangePassword}
                                className='px-5 pb-5 pt-1 border-t border-gray-100 dark:border-slate-700 space-y-4'
                            >
                                {pwdMsg.text && (
                                    <p
                                        className={`text-sm ${pwdMsg.type === 'error' ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                    >
                                        {pwdMsg.text}
                                    </p>
                                )}
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        Password Lama
                                    </label>
                                    <input
                                        type='password'
                                        value={oldPwd}
                                        onChange={(e) => setOldPwd(e.target.value)}
                                        required
                                        className={inputCls}
                                        placeholder='••••••••'
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        Password Baru
                                    </label>
                                    <input
                                        type='password'
                                        value={newPwd}
                                        onChange={(e) => setNewPwd(e.target.value)}
                                        required
                                        minLength={8}
                                        className={inputCls}
                                        placeholder='Min. 8 karakter'
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        Konfirmasi Password Baru
                                    </label>
                                    <input
                                        type='password'
                                        value={confirmPwd}
                                        onChange={(e) => setConfirmPwd(e.target.value)}
                                        required
                                        className={inputCls}
                                        placeholder='Ulangi password baru'
                                    />
                                </div>
                                <button
                                    type='submit'
                                    disabled={pwdLoading}
                                    className='px-5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors'
                                >
                                    {pwdLoading ? 'Menyimpan...' : 'Ubah Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default ProfilePage;
