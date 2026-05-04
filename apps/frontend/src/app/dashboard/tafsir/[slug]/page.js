'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsArrowLeft, BsChevronDown, BsChevronRight } from 'react-icons/bs';

const getTranslation = (t) => {
    if (!t) return '';
    if (typeof t === 'string') return t;
    return t.idn ?? t.id ?? t.en ?? '';
};

const DashboardTafsirReaderPage = ({ params }) => {
    const slug = decodeURIComponent(params.slug);

    const [surah, setSurah] = useState(null);
    const [tafsirList, setTafsirList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(false);
        setSurah(null);
        setTafsirList([]);

        // Find surah number from slug via surah list
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/surah?size=114&sort=number`)
            .then((r) => r.json())
            .then((data) => {
                const list = data?.items ?? data ?? [];
                const found = list.find(
                    (s) => s.latin?.toLowerCase() === slug.toLowerCase(),
                );
                if (!found) throw new Error('not found');
                setSurah(found);
                return fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tafsir/surah/${found.number}`,
                );
            })
            .then((r) => r.json())
            .then((data) => {
                setTafsirList(data?.items ?? data ?? []);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className='p-6 max-w-3xl mx-auto'>
                <div className='animate-pulse space-y-4'>
                    <div className='h-8 bg-gray-100 dark:bg-slate-800 rounded w-1/3' />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className='h-16 bg-gray-100 dark:bg-slate-800 rounded-xl' />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='p-6 max-w-3xl mx-auto text-center py-20'>
                <p className='text-4xl mb-3'>⚠️</p>
                <p className='text-gray-700 dark:text-white font-semibold mb-1'>
                    Gagal Memuat Tafsir
                </p>
                <p className='text-sm text-gray-400 dark:text-gray-500 mb-5'>
                    Server API tidak dapat dijangkau.
                </p>
                <Link
                    href='/dashboard/tafsir'
                    className='text-sm text-amber-600 dark:text-amber-400 hover:underline'
                >
                    ← Kembali ke daftar surah
                </Link>
            </div>
        );
    }

    const translation = getTranslation(surah?.translation);

    return (
        <div className='max-w-3xl mx-auto pb-16'>
            {/* Sticky header */}
            <div className='sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3'>
                <Link
                    href='/dashboard/tafsir'
                    className='p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors'
                >
                    <BsArrowLeft />
                </Link>
                <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold text-gray-900 dark:text-white leading-none'>
                        Tafsir {surah?.latin ?? slug}
                    </p>
                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                        {translation} · {tafsirList.length} ayat
                    </p>
                </div>
                <span className='text-lg arabic-text text-gray-500 dark:text-gray-400 shrink-0'>
                    {surah?.name}
                </span>
            </div>

            {tafsirList.length === 0 && !loading && (
                <div className='text-center py-20'>
                    <p className='text-gray-400 dark:text-gray-500 text-sm'>
                        Belum ada tafsir untuk surah ini.
                    </p>
                </div>
            )}

            {/* Tafsir accordion */}
            <div className='px-4 pt-4 space-y-2'>
                {tafsirList.map((item, idx) => {
                    const id = item.id ?? item.ayah_number ?? idx;
                    const isOpen = expanded === id;
                    return (
                        <div
                            key={id}
                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'
                        >
                            <button
                                onClick={() => setExpanded(isOpen ? null : id)}
                                className='w-full text-left px-4 py-3 flex items-center justify-between gap-3'
                            >
                                <div className='flex items-center gap-3 min-w-0'>
                                    <span className='w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0'>
                                        {item.ayah_number ?? item.number ?? idx + 1}
                                    </span>
                                    {item.arabic && (
                                        <p
                                            dir='rtl'
                                            className='text-sm arabic-text text-gray-700 dark:text-gray-300 truncate'
                                        >
                                            {item.arabic}
                                        </p>
                                    )}
                                </div>
                                {isOpen ? (
                                    <BsChevronDown className='shrink-0 text-gray-400 text-xs' />
                                ) : (
                                    <BsChevronRight className='shrink-0 text-gray-400 text-xs' />
                                )}
                            </button>

                            {isOpen && (
                                <div className='px-4 pb-4 border-t border-gray-50 dark:border-slate-700 pt-3 space-y-3'>
                                    {item.arabic && (
                                        <p
                                            dir='rtl'
                                            className='text-xl arabic-text text-gray-800 dark:text-gray-100 leading-loose text-right'
                                        >
                                            {item.arabic}
                                        </p>
                                    )}
                                    {(getTranslation(item.translation) || item.text) && (
                                        <p className='text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed'>
                                            {getTranslation(item.translation) || item.text}
                                        </p>
                                    )}
                                    {item.content && (
                                        <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line'>
                                            {item.content}
                                        </p>
                                    )}
                                    {item.source && (
                                        <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                                            Sumber: {item.source}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardTafsirReaderPage;
