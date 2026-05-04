'use client';

import BlogForm from '../_BlogForm';

const NewBlogPage = () => {
    return (
        <div className='p-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
                Artikel Baru
            </h1>
            <BlogForm />
        </div>
    );
};

export default NewBlogPage;
