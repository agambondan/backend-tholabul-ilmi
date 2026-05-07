'use client';

import InfiniteScrollAyahPage from '@/app/quran/[...slug]/InfiniteScrollAyahPage';

const DashboardQuranReaderPage = ({ params, searchParams }) => {
    return (
        <div className='px-2 py-4'>
            <InfiniteScrollAyahPage
                params={{ slug: params.slug }}
                searchParams={searchParams}
                basePath='/dashboard/quran'
            />
        </div>
    );
};

export default DashboardQuranReaderPage;
