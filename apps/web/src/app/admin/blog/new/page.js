'use client';

import BlogForm from '../_BlogForm';
import { useLocale } from '@/context/Locale';

const NewBlogPage = () => {
    const { t } = useLocale();

    return (
        <div className='p-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
                {t('admin.blog.new_article')}
            </h1>
            <BlogForm />
        </div>
    );
};

export default NewBlogPage;
