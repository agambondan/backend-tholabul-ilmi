'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { asmaulHusnaApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { BsSearch } from 'react-icons/bs';


const AsmaulHusnaPage = () => {
    const [names, setNames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        asmaulHusnaApi
            .list()
            .then((r) => r.json())
            .then((data) => {
                const items = (data?.items ?? data ?? []).map((item) => ({
                    ...item,
                    description: item.description ?? item.meaning ?? '',
                }));
                if (items.length > 0) setNames(items);
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const filteredNames = names.filter((name) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
            name.arabic.includes(query) ||
            name.transliteration.toLowerCase().includes(query) ||
            name.indonesian.toLowerCase().includes(query) ||
            name.english.toLowerCase().includes(query)
        );
    });

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-5xl'>
                    <div className='text-center mb-8'>
                        <p
                            className='text-3xl text-emerald-700 dark:text-emerald-400 mb-2'
                            style={{ fontFamily: 'Amiri, serif' }}
                        >
                            أَسْمَاءُ اللهِ الْحُسْنَى
                        </p>
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            Asmaul Husna
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            99 Nama Allah yang Indah beserta artinya
                        </p>
                    </div>

                    <div className='flex items-center gap-2 mb-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                        <BsSearch className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Cari nama, transliterasi, atau arti...'
                            className='flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none'
                        />
                    </div>

                    {isLoading ? (
                        <div className='grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3'>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className='p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 animate-pulse'>
                                    <div className='h-3 bg-gray-200 dark:bg-slate-700 rounded mb-3 w-1/4' />
                                    <div className='h-8 bg-gray-200 dark:bg-slate-700 rounded mb-2' />
                                    <div className='h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4' />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3'>
                            {filteredNames.map((name) => (
                                <button
                                    key={name.number}
                                    onClick={() => setSelected(name)}
                                    className='text-left p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all'
                                >
                                    <div className='flex items-start justify-between mb-2'>
                                        <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full w-6 h-6 flex items-center justify-center'>
                                            {name.number}
                                        </span>
                                    </div>
                                    <p
                                        className='text-2xl font-bold text-emerald-900 dark:text-white mb-1 text-right'
                                        style={{ fontFamily: 'Amiri, serif' }}
                                    >
                                        {name.arabic}
                                    </p>
                                    <p className='text-xs text-gray-500 dark:text-gray-400 italic mb-0.5'>
                                        {name.transliteration}
                                    </p>
                                    <p className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                                        {name.indonesian}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredNames.length === 0 && (
                        <p className='text-center text-xs text-gray-400 dark:text-gray-600 py-4'>
                            Tidak ada nama yang cocok dengan pencarian.
                        </p>
                    )}
                </div>
            </Section>

            {selected && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'
                    onClick={() => setSelected(null)}
                >
                    <div
                        className='bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 dark:border-slate-700'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='text-center mb-4'>
                            <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-3 py-1'>
                                #{selected.number}
                            </span>
                        </div>
                        <p
                            className='text-4xl font-bold text-emerald-900 dark:text-white text-center mb-2'
                            style={{ fontFamily: 'Amiri, serif' }}
                        >
                            {selected.arabic}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400 italic text-center mb-1'>
                            {selected.transliteration}
                        </p>
                        <p className='text-base font-semibold text-emerald-800 dark:text-emerald-300 text-center mb-2'>
                            {selected.indonesian}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400 text-center mb-4'>
                            {selected.english}
                        </p>
                        {selected.description && (
                            <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3'>
                                {selected.description}
                            </p>
                        )}
                        <button
                            onClick={() => setSelected(null)}
                            className='mt-5 w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors'
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
};

export default AsmaulHusnaPage;
