import InfiniteScrollHadithPage from '@/app/hadith/[slug]/InfiniteScrollHadithPage';
import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';

const Page = ({ params, searchParams }) => {
    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='dark:text-white'>
                    <InfiniteScrollHadithPage params={params} searchParams={searchParams} />
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default Page;
