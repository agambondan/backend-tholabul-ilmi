'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className='min-h-screen bg-parchment-50 dark:bg-slate-900 flex items-center justify-center px-4'>
            <div className='text-center max-w-md'>
                <p className='text-5xl mb-4'>⚠️</p>
                <h1 className='text-xl font-bold text-emerald-900 dark:text-white mb-2'>
                    Terjadi Kesalahan
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed'>
                    {error?.message?.includes('fetch')
                        ? 'Server API tidak dapat dijangkau. Pastikan backend berjalan.'
                        : 'Terjadi kesalahan yang tidak terduga.'}
                </p>
                <div className='flex gap-3 justify-center'>
                    <button
                        onClick={reset}
                        className='bg-emerald-700 hover:bg-emerald-600 text-white text-sm px-5 py-2 rounded-full transition-colors'
                    >
                        Coba Lagi
                    </button>
                    <Link
                        href='/'
                        className='border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-sm px-5 py-2 rounded-full transition-colors'
                    >
                        Ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
