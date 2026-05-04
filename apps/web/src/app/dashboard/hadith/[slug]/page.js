'use client';

import GradeBadge, { HadithAuthenticity } from '@/components/GradeBadge';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

// Themes API returns [{ theme: { id, translation: { en, idn } }, book: {...} }]
const themeId = (t) => t?.theme?.id ?? t?.id;
const themeName = (t) =>
    t?.theme?.translation?.en ??
    t?.theme?.translation?.idn ??
    toStr(t?.name ?? t?.title);

// Chapters API returns [{ id, translation: { en, idn } }]
const chapterName = (c) =>
    c?.translation?.en ?? c?.translation?.idn ?? toStr(c?.name ?? c?.title) ?? `Bab ${c?.id}`;

export default function DashboardHadithDetailPage({ params }) {
    const { slug } = params;

    const [themes, setThemes] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [hadiths, setHadiths] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState(null); // stores theme ID (number)
    const [selectedChapter, setSelectedChapter] = useState(null); // stores full chapter object
    const [loading, setLoading] = useState(true);
    const [loadingHadith, setLoadingHadith] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [bookName, setBookName] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/v1/themes/book/${slug}`)
            .then((r) => r.json())
            .then((d) => {
                const list = Array.isArray(d?.items ?? d) ? (d?.items ?? d) : [];
                setThemes(list);
                if (list.length > 0) {
                    setSelectedTheme(themeId(list[0]));
                    setBookName(
                        list[0]?.book?.translation?.idn ??
                            list[0]?.book?.name ??
                            slug,
                    );
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        if (!selectedTheme) return;
        fetch(`${API_URL}/api/v1/chapters/book/${slug}/theme/${selectedTheme}?size=100`)
            .then((r) => r.json())
            .then((d) => {
                const list = Array.isArray(d?.items ?? d) ? (d?.items ?? d) : [];
                setChapters(list);
                setSelectedChapter(list.length > 0 ? list[0] : null);
            })
            .catch(() => {});
    }, [selectedTheme, slug]);

    useEffect(() => {
        if (!selectedTheme || !selectedChapter) return;
        setHadiths([]);
        setPage(0);
        setHasMore(true);
        loadHadiths(0, selectedTheme, selectedChapter.id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTheme, selectedChapter]);

    const loadHadiths = async (pg, tid, cid, reset = false) => {
        setLoadingHadith(true);
        try {
            const res = await fetch(
                `${API_URL}/api/v1/hadiths/book/${slug}/theme/${tid}/chapter/${cid}?page=${pg}&size=20`,
            );
            const data = await res.json();
            const items = Array.isArray(data?.items ?? data) ? (data?.items ?? data) : [];
            if (reset) {
                setHadiths(items);
            } else {
                setHadiths((prev) => [...prev, ...items]);
            }
            setHasMore(items.length === 20);
        } catch {
            setHasMore(false);
        } finally {
            setLoadingHadith(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        if (selectedTheme && selectedChapter) {
            loadHadiths(nextPage, selectedTheme, selectedChapter.id);
        }
    };

    return (
        <div className='p-4 max-w-3xl mx-auto'>
            <Link
                href='/dashboard/hadith'
                className='inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4'
            >
                ← Kembali
            </Link>

            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
                {bookName || slug}
            </h1>

            {loading ? (
                <div className='text-center py-16 text-gray-400 dark:text-gray-500 text-sm'>
                    Memuat...
                </div>
            ) : (
                <>
                    {/* Theme tabs */}
                    {themes.length > 1 && (
                        <div className='flex gap-1 mb-4 flex-wrap'>
                            {themes.map((t) => {
                                const tid = themeId(t);
                                return (
                                    <button
                                        key={tid}
                                        onClick={() => setSelectedTheme(tid)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            selectedTheme === tid
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        {themeName(t)}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Chapter select */}
                    {chapters.length > 0 && (
                        <select
                            value={selectedChapter?.id ?? ''}
                            onChange={(e) => {
                                const ch = chapters.find(
                                    (c) => String(c.id) === e.target.value,
                                );
                                if (ch) setSelectedChapter(ch);
                            }}
                            className='w-full mb-5 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400'
                        >
                            {chapters.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {chapterName(c)}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Hadith list */}
                    <div className='space-y-4'>
                        {hadiths.map((h, idx) => (
                            <div
                                key={h.id ?? idx}
                                className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5'
                            >
                                <div className='flex items-center gap-2 mb-3'>
                                    <span className='w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0'>
                                        {h.number ?? idx + 1}
                                    </span>
                                    <GradeBadge grade={h.grade} />
                                </div>
                                {(h.translation?.ar ?? h.arab) && (
                                    <p
                                        dir='rtl'
                                        className='font-arabic text-xl text-gray-800 dark:text-gray-100 leading-loose text-right mb-4'
                                    >
                                        {h.translation?.ar ?? h.arab}
                                    </p>
                                )}
                                {(h.translation?.idn ?? h.translation?.en ?? h.indonesia) && (
                                    <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                                        {h.translation?.idn ?? h.translation?.en ?? h.indonesia}
                                    </p>
                                )}
                                {h.perawi && (
                                    <p className='text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium'>
                                        {toStr(h.perawi)}
                                    </p>
                                )}
                                {(h.grade ||
                                    h.shahih_by ||
                                    h.dhaif_by ||
                                    h.grade_notes ||
                                    h.sanad) && (
                                    <div className='mt-4'>
                                        <HadithAuthenticity hadith={h} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {loadingHadith && (
                        <div className='text-center py-8 text-gray-400 dark:text-gray-500 text-sm'>
                            Memuat hadith...
                        </div>
                    )}

                    {!loadingHadith && hadiths.length === 0 && (
                        <div className='text-center py-12 text-gray-400 dark:text-gray-500 text-sm'>
                            Tidak ada hadith ditemukan.
                        </div>
                    )}

                    {hasMore && !loadingHadith && hadiths.length > 0 && (
                        <div className='text-center mt-6'>
                            <button
                                onClick={loadMore}
                                className='px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
                            >
                                Muat lebih banyak
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
