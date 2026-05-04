'use client';

import { Spinner3 } from '@/components/spinner/Spinner';
import { adminSirohApi } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsPencil, BsPlus, BsTrash, BsX } from 'react-icons/bs';

const AdminSirahPage = () => {
    const [categories, setCategories] = useState([]);
    const [contents, setContents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [newCatTitle, setNewCatTitle] = useState('');
    const [newCatOrder, setNewCatOrder] = useState('');
    const [catLoading, setCatLoading] = useState(false);

    const [editingCat, setEditingCat] = useState(null);
    const [editCatTitle, setEditCatTitle] = useState('');
    const [editCatOrder, setEditCatOrder] = useState('');

    const load = async () => {
        setIsLoading(true);
        try {
            const [catsRes, contentsRes] = await Promise.all([
                adminSirohApi.listCategories().then((r) => r.json()),
                adminSirohApi.listContents().then((r) => r.json()),
            ]);
            setCategories(catsRes?.items ?? catsRes ?? []);
            setContents(contentsRes?.items ?? contentsRes ?? []);
        } catch {
            setError('Failed to load sirah data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCatTitle.trim()) return;
        setCatLoading(true);
        try {
            const res = await adminSirohApi.createCategory({
                title: newCatTitle.trim(),
                order: newCatOrder ? Number(newCatOrder) : 0,
            });
            const data = await res.json();
            if (data?.id) {
                setCategories((prev) => [...prev, data]);
                setNewCatTitle('');
                setNewCatOrder('');
            }
        } catch {
        } finally {
            setCatLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Delete this category? Content di dalamnya juga akan terhapus.')) return;
        const prev = categories;
        setCategories((c) => c.filter((x) => x.id !== id));
        try {
            await adminSirohApi.deleteCategory(id);
        } catch {
            setCategories(prev);
        }
    };

    const startEditCategory = (cat) => {
        setEditingCat(cat.id);
        setEditCatTitle(cat.title);
        setEditCatOrder(String(cat.order ?? 0));
    };

    const handleUpdateCategory = async (id) => {
        try {
            const res = await adminSirohApi.updateCategory(id, {
                title: editCatTitle.trim(),
                order: Number(editCatOrder) || 0,
            });
            const data = await res.json();
            if (data?.id) {
                setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
            }
        } catch {
        } finally {
            setEditingCat(null);
        }
    };

    const handleDeleteContent = async (id) => {
        if (!confirm('Delete this sirah content?')) return;
        const prev = contents;
        setContents((c) => c.filter((x) => x.id !== id));
        try {
            await adminSirohApi.deleteContent(id);
        } catch {
            setContents(prev);
        }
    };

    if (isLoading) return <Spinner3 />;

    return (
        <div className='p-8'>
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                        Prophet&apos;s Biography
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                        {categories.length} categories · {contents.length} contents
                    </p>
                </div>
                <Link
                    href='/admin/siroh/new'
                    className='flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors'
                >
                    <BsPlus className='text-lg' />
                    Content Baru
                </Link>
            </div>

            {error && (
                <p className='text-sm text-red-500 dark:text-red-400 mb-4'>{error}</p>
            )}

            <div className='grid lg:grid-cols-2 gap-8'>
                {/* Categories */}
                <div>
                    <h2 className='text-base font-bold text-gray-900 dark:text-white mb-4'>
                        Category / Bab
                    </h2>

                    <form
                        onSubmit={handleCreateCategory}
                        className='flex gap-2 mb-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-3'
                    >
                        <input
                            value={newCatTitle}
                            onChange={(e) => setNewCatTitle(e.target.value)}
                            placeholder='New category title...'
                            className='flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        />
                        <input
                            value={newCatOrder}
                            onChange={(e) => setNewCatOrder(e.target.value)}
                            placeholder='Order'
                            type='number'
                            className='w-20 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        />
                        <button
                            type='submit'
                            disabled={catLoading}
                            className='px-3 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-lg text-sm transition-colors'
                        >
                            <BsPlus className='text-lg' />
                        </button>
                    </form>

                    <div className='space-y-2'>
                        {categories.length === 0 && (
                            <p className='text-sm text-gray-400 dark:text-gray-500'>
                                No categories yet.
                            </p>
                        )}
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 px-4 py-3'
                            >
                                {editingCat === cat.id ? (
                                    <div className='flex gap-2'>
                                        <input
                                            value={editCatTitle}
                                            onChange={(e) => setEditCatTitle(e.target.value)}
                                            className='flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none'
                                        />
                                        <input
                                            value={editCatOrder}
                                            onChange={(e) => setEditCatOrder(e.target.value)}
                                            type='number'
                                            className='w-16 px-2 py-1 text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none'
                                        />
                                        <button
                                            onClick={() => handleUpdateCategory(cat.id)}
                                            className='px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs'
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingCat(null)}
                                            className='px-2 py-1 text-gray-400 hover:text-gray-600'
                                        >
                                            <BsX />
                                        </button>
                                    </div>
                                ) : (
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <p className='text-sm font-medium text-gray-900 dark:text-white'>
                                                {cat.title}
                                            </p>
                                            <p className='text-xs text-gray-400 dark:text-gray-500'>
                                                Order: {cat.order ?? 0} · {cat.slug}
                                            </p>
                                        </div>
                                        <div className='flex gap-1'>
                                            <button
                                                onClick={() => startEditCategory(cat)}
                                                className='p-1.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors'
                                            >
                                                <BsPencil className='text-xs' />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className='p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                                            >
                                                <BsTrash className='text-xs' />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contents */}
                <div>
                    <h2 className='text-base font-bold text-gray-900 dark:text-white mb-4'>
                        Content
                    </h2>
                    <div className='space-y-2'>
                        {contents.length === 0 && (
                            <p className='text-sm text-gray-400 dark:text-gray-500'>
                                No content yet. Create new content.
                            </p>
                        )}
                        {contents.map((item) => (
                            <div
                                key={item.id}
                                className='flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 px-4 py-3'
                            >
                                <div className='min-w-0 flex-1'>
                                    <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                                        {item.title}
                                    </p>
                                    <p className='text-xs text-gray-400 dark:text-gray-500'>
                                        {categories.find((c) => c.id === item.category_id)?.title ??
                                            `Category #${item.category_id}`}{' '}
                                        · Order {item.order ?? 0}
                                    </p>
                                </div>
                                <div className='flex gap-1 ml-3 shrink-0'>
                                    <Link
                                        href={`/admin/siroh/${item.id}/edit`}
                                        className='p-1.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors'
                                    >
                                        <BsPencil className='text-xs' />
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteContent(item.id)}
                                        className='p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                                    >
                                        <BsTrash className='text-xs' />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSirahPage;
