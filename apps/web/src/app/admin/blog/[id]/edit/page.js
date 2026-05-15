'use client';

export const dynamic = 'force-dynamic';

import { Spinner3 } from '@/components/spinner/Spinner';
import { useLocale } from '@/context/Locale';
import { adminBlogApi } from '@/lib/api';
import { useEffect, useState, use } from 'react';
import BlogForm from '../../_BlogForm';

const EditBlogPage = props => {
    const params = use(props.params);
    const { t } = useLocale();
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        adminBlogApi
            .listAll()
            .then((r) => r.json())
            .then((data) => {
                const items = data?.items ?? data ?? [];
                const found = items.find((p) => String(p.id) === String(params.id));
                if (found) setPost(found);
                else setError(true);
            })
            .catch(() => setError(true))
            .finally(() => setIsLoading(false));
    }, [params.id]);

    if (isLoading) return <Spinner3 />;

    if (error) {
        return (
            <div className='p-8'>
                <p className='text-red-500 dark:text-red-400'>{t('admin.blog.not_found')}</p>
            </div>
        );
    }

    return (
        <div className='p-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
                {t('admin.blog.edit_article')}
            </h1>
            <BlogForm initialData={post} postId={params.id} />
        </div>
    );
};

export default EditBlogPage;
