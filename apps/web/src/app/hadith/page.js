'use client';

import ByBook from '@/app/hadith/byBook';
import ByChapter from '@/app/hadith/byChapter';
import ByHadith from '@/app/hadith/byHadith';
import ByTheme from '@/app/hadith/byTheme';
import HadithTab from '@/app/hadith/hadithTab';
import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { hadithTabList } from '@/lib/const';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const HadithContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tab = searchParams.get('tab') || 'book';
    const activeTab = `#${tab}`;

    const showContent = (menu) => {
        router.push(`/hadith?tab=${menu.replace('#', '')}`, { scroll: false });
    };

    return (
        <>
            <div className='py-2' />
            <HadithTab
                tabs={hadithTabList}
                onClickTab={showContent}
                activeTab={activeTab}
            />
            <div className='py-4' />
            <SwitchComponent activeTab={activeTab} />
        </>
    );
};

const Page = () => {
    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <Suspense fallback={<div className='py-4' />}>
                    <HadithContent />
                </Suspense>
            </Section>
            <Footer />
        </main>
    );
};

export default Page;

const SwitchComponent = ({ activeTab }) => {
    switch (activeTab) {
        case '#book':
            return <ByBook />;
        case '#theme':
            return <ByTheme />;
        case '#chapter':
            return <ByChapter />;
        case '#hadith':
            return <ByHadith />;
        default:
            return <></>;
    }
};
