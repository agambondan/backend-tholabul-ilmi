'use client';

import GradeBadge, { HadithAuthenticity } from '@/components/GradeBadge';
import Select, { SelectOptionWithLabel } from '@/components/select/Select';
import { useLocale } from '@/context/Locale';
import { getLocalizedTranslation } from '@/lib/translation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const BOOK_NAMES = {
    bukhari: 'Shahih Bukhari',
    muslim: 'Shahih Muslim',
    abudaud: 'Sunan Abu Daud',
    tirmidzi: 'Jami At-Tirmidzi',
    nasai: "Sunan An-Nasa'i",
    ibnumajah: 'Sunan Ibnu Majah',
    malik: "Muwatha' Malik",
    ahmad: 'Musnad Ahmad',
    darimi: 'Sunan Darimi',
};

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

const themeId = (t) => t?.theme?.id ?? t?.id;
const themeName = (t, lang) =>
    getLocalizedTranslation(t?.theme?.translation, lang) ||
    toStr(t?.name ?? t?.title);

const chapterName = (c, lang) =>
    getLocalizedTranslation(c?.translation, lang) || toStr(c?.name ?? c?.title) || `Bab ${c?.id}`;

export default function DashboardHadithDetailPage({ params }) {
    const { slug } = params;
    const { t, lang } = useLocale();

    const [themes, setThemes] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [hadiths, setHadiths] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
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
                    const firstId = themeId(list[0]);
                    setSelectedTheme(firstId);
                    setBookName(
                        BOOK_NAMES[slug] ||
                            getLocalizedTranslation(list[0]?.book?.translation, lang) ||
                            list[0]?.book?.name ||
                            slug,
                    );
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [slug, lang]);

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
        <div className='p-4'>
                <Link
                    href='/dashboard/hadith'
                    className='inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4'
                >
                    ← {t('common.back')}
                </Link>

                <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
                    {bookName || slug}
                </h1>

                {loading ? (
                    <div className='text-center py-16 text-gray-400 dark:text-gray-500 text-sm'>
                        {t('common.loading')}
                    </div>
                ) : (
                    <>
                        {/* Dropdowns */}
                        <div className='flex flex-col gap-3 mb-5'>
                            <SelectOptionWithLabel
                                id='theme'
                                label={t('hadith.select_theme')}
                                callbackOnChange={(e) => {
                                    const picked = themes.find(
                                        (t) => String(themeId(t)) === e.target.value,
                                    );
                                    if (picked) setSelectedTheme(themeId(picked));
                                }}
                                defaultValue={selectedTheme != null ? String(selectedTheme) : ''}
                            >
                                {themes.map((t) => {
                                    const tid = themeId(t);
                                    return (
                                        <Select.Option key={tid} value={String(tid)}>
                                            {themeName(t, lang)}
                                        </Select.Option>
                                    );
                                })}
                            </SelectOptionWithLabel>

                            {chapters.length > 0 && (
                                <SelectOptionWithLabel
                                    id='chapter'
                                    label={t('hadith.select_chapter')}
                                    callbackOnChange={(e) => {
                                        const ch = chapters.find(
                                            (c) => String(c.id) === e.target.value,
                                        );
                                        if (ch) setSelectedChapter(ch);
                                    }}
                                    defaultValue={selectedChapter?.id != null ? String(selectedChapter.id) : ''}
                                >
                                    {chapters.map((c) => (
                                        <Select.Option key={c.id} value={String(c.id)}>
                                            {chapterName(c, lang)}
                                        </Select.Option>
                                    ))}
                                </SelectOptionWithLabel>
                            )}
                        </div>

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
                                    {(getLocalizedTranslation(h.translation, lang) || h.indonesia) && (
                                        <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                                            {getLocalizedTranslation(h.translation, lang) || h.indonesia}
                                        </p>
                                    )}
                                    {h.perawi && (
                                        <p className='text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium'>
                                            {toStr(h.perawi)}
                                        </p>
                                    )}
                                    {(h.grade || h.shahih_by || h.dhaif_by || h.grade_notes || h.sanad) && (
                                        <div className='mt-4'>
                                            <HadithAuthenticity hadith={h} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {loadingHadith && (
                            <div className='text-center py-8 text-gray-400 dark:text-gray-500 text-sm'>
                                {t('hadith.loading_hadiths')}
                            </div>
                        )}

                        {!loadingHadith && hadiths.length === 0 && (
                            <div className='text-center py-12 text-gray-400 dark:text-gray-500 text-sm'>
                                {t('hadith.not_found_title')}
                            </div>
                        )}

                        {hasMore && !loadingHadith && hadiths.length > 0 && (
                            <div className='text-center mt-6'>
                                <button
                                    onClick={loadMore}
                                    className='px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
                                >
                                    {t('hadith.load_more')}
                                </button>
                            </div>
                        )}
                    </>
                )}
        </div>
    );
}
