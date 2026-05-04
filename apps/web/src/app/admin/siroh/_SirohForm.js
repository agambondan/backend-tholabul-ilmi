'use client';

import { adminSirohApi } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const slugify = (str) =>
    str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

const SirohForm = ({ initialData = null, contentId = null }) => {
    const router = useRouter();
    const isEdit = !!contentId;

    const [title, setTitle] = useState(initialData?.title ?? '');
    const [slug, setSlug] = useState(initialData?.slug ?? '');
    const [content, setContent] = useState(initialData?.content ?? '');
    const [categoryId, setCategoryId] = useState(
        initialData?.category_id ? String(initialData.category_id) : ''
    );
    const [order, setOrder] = useState(String(initialData?.order ?? '0'));
    const [slugEdited, setSlugEdited] = useState(isEdit);

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        adminSirohApi
            .listCategories()
            .then((r) => r.json())
            .then((data) => setCategories(data?.items ?? data ?? []))
            .catch(() => {});
    }, []);

    const handleTitleChange = (val) => {
        setTitle(val);
        if (!slugEdited) setSlug(slugify(val));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryId) {
            setError('Pilih kategori terlebih dahulu.');
            return;
        }
        setError('');
        setIsLoading(true);
        const payload = {
            title,
            slug,
            content,
            category_id: Number(categoryId),
            order: Number(order) || 0,
        };
        try {
            if (isEdit) {
                await adminSirohApi.updateContent(contentId, payload);
            } else {
                await adminSirohApi.createContent(payload);
            }
            router.push('/admin/siroh');
        } catch {
            setError('Gagal menyimpan. Cek koneksi atau data yang diisi.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputCls =
        'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500';

    return (
        <form onSubmit={handleSubmit} className='max-w-3xl space-y-5'>
            {error && (
                <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400'>
                    {error}
                </div>
            )}

            <div className='grid sm:grid-cols-2 gap-4'>
                <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                        Kategori / Bab <span className='text-red-500'>*</span>
                    </label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className={inputCls}
                        required
                    >
                        <option value=''>— Pilih Kategori —</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.title}
                            </option>
                        ))}
                    </select>
                    {categories.length === 0 && (
                        <p className='text-xs text-amber-500 mt-1'>
                            Buat kategori dulu di halaman{' '}
                            <Link href='/admin/siroh' className='underline'>
                                Kelola Siroh
                            </Link>
                            .
                        </p>
                    )}
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                        Urutan
                    </label>
                    <input
                        type='number'
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        className={inputCls}
                        placeholder='0'
                        min='0'
                    />
                </div>
            </div>

            <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Judul <span className='text-red-500'>*</span>
                </label>
                <input
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={inputCls}
                    placeholder='Judul bab siroh...'
                />
            </div>

            <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Slug
                </label>
                <input
                    value={slug}
                    onChange={(e) => {
                        setSlugEdited(true);
                        setSlug(e.target.value);
                    }}
                    className={inputCls}
                    placeholder='url-friendly-slug'
                />
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                    /siroh/{slug || '...'}
                </p>
            </div>

            <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Konten <span className='text-red-500'>*</span>
                </label>
                <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={18}
                    className={`${inputCls} font-mono leading-relaxed`}
                    placeholder='Tulis konten siroh di sini. Gunakan baris baru untuk memisahkan paragraf...'
                />
                <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                    {content.length.toLocaleString()} karakter
                </p>
            </div>

            <div className='flex gap-3 pt-2'>
                <button
                    type='submit'
                    disabled={isLoading}
                    className='px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors'
                >
                    {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Konten'}
                </button>
                <Link
                    href='/admin/siroh'
                    className='px-6 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors'
                >
                    Batal
                </Link>
            </div>
        </form>
    );
};

export default SirohForm;
