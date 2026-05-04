import SearchClient from './SearchClient';

export default function SearchPage({ searchParams }) {
    return <SearchClient initialQuery={searchParams?.q ?? ''} />;
}
