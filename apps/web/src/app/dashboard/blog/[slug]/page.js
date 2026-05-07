'use client';

import { BlogDetailContent } from '@/app/blog/[slug]/page';

export default function DashboardBlogDetailPage({ params }) {
    return (
        <div className='py-2'>
            <BlogDetailContent params={params} basePath='/dashboard/blog' />
        </div>
    );
}
