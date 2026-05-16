'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useLocale } from '@/context/Locale';
import dynamic from 'next/dynamic';
import { MdMap } from 'react-icons/md';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

export default function PetaPage() {
    const { t } = useLocale();
    return (
        <main className='min-h-screen flex flex-col bg-parchment-50 dark:bg-slate-900'>
            <NavbarTailwindCss />
            <div className='pt-24 container mx-auto px-4 max-w-4xl py-6'>
                <div className='text-center mb-8'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl mb-4'>
                        <MdMap className='text-3xl text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-1'>
                        {t('peta.title') ?? 'Peta Islam Interaktif'}
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {t('peta.subtitle') ?? 'Lokasi bersejarah dalam peradaban Islam'}
                    </p>
                </div>
                <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden' style={{ height: '500px' }}>
                    <MapComponent />
                </div>
            </div>
            <Footer />
        </main>
    );
}
