'use client';

import { HadithDetailContent } from '@/app/dashboard/hadith/[slug]/page';
import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';

const Page = ({ params }) => {
    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='dark:text-white'>
                    <HadithDetailContent params={params} basePath='/hadith' />
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default Page;
