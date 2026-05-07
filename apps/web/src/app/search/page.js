import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import SearchClient from './SearchClient';

export default function SearchPage({ searchParams }) {
    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <SearchClient initialQuery={searchParams?.q ?? ''} />
            </Section>
            <Footer />
        </main>
    );
}
