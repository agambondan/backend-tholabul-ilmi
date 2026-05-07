import SearchClient from '@/app/search/SearchClient';

export default function DashboardSearchPage({ searchParams }) {
    return (
        <div className='py-2'>
            <SearchClient initialQuery={searchParams?.q ?? ''} />
        </div>
    );
}
