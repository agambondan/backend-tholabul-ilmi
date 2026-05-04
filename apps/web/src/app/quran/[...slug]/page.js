'use client';

import InfiniteScrollAyahPage from '@/app/quran/[...slug]/InfiniteScrollAyahPage';
import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';

const SuratPage = ({ params, searchParams }) => {
    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='px-4'>
                    <InfiniteScrollAyahPage params={params} searchParams={searchParams} />
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default SuratPage;
