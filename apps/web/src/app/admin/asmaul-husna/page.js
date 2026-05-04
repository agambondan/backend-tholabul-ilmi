'use client';

import { adminAsmaulHusnaApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { BsPencil, BsPlusCircle, BsTrash, BsX } from 'react-icons/bs';

const EMPTY_FORM = {
    number: '',
    arabic: '',
    transliteration: '',
    indonesian: '',
    english: '',
    description: '',
};

const AdminAsmaulHusnaPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const r = await adminAsmaulHusnaApi.list(0, 200);
            const data = await r.json();
            const arr = data?.items ?? data ?? [];
            setItems([...arr].sort((a, b) => (a.number ?? 0) - (b.number ?? 0)));
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setEditId(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditId(item.id ?? item._id);
        setForm({
            number: item.number ?? '',
            arabic: item.arabic ?? '',
            transliteration: item.transliteration ?? '',
            indonesian: item.indonesian ?? '',
            english: item.english ?? '',
            description: item.description ?? '',
        });
        setShowModal(true);
    };

    const save = async () => {
        setSaving(true);
        try {
            const payload = { ...form, number: Number(form.number) };
            if (editId) {
                await adminAsmaulHusnaApi.update(editId, payload);
            } else {
                await adminAsmaulHusnaApi.create(payload);
            }
            setShowModal(false);
            load();
        } catch {
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await adminAsmaulHusnaApi.delete(deleteId);
            setDeleteId(null);
            load();
        } catch {}
    };

    const filtered = items.filter(
        (i) =>
            i.transliteration?.toLowerCase().includes(search.toLowerCase()) ||
            i.indonesian?.toLowerCase().includes(search.toLowerCase()) ||
            String(i.number).includes(search),
    );

    return (
        <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                        Asmaul Husna
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {items.length} / 99 names
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className='flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors'
                >
                    <BsPlusCircle />
                    Add
                </button>
            </div>

            <div className='mb-4'>
                <input
                    type='text'
                    placeholder='Search name or meaning...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white'
                />
            </div>

            {loading ? (
                <p className='text-sm text-gray-500'>Loading...</p>
            ) : (
                <div className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden'>
                    <table className='w-full text-sm'>
                        <thead className='bg-gray-50 dark:bg-slate-700'>
                            <tr>
                                <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 w-12'>
                                    No
                                </th>
                                <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300'>
                                    Arabic
                                </th>
                                <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300'>
                                    Latin
                                </th>
                                <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 hidden md:table-cell'>
                                    Meaning (ID)
                                </th>
                                <th className='px-4 py-3 w-20'></th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100 dark:divide-slate-700'>
                            {filtered.map((item) => (
                                <tr
                                    key={item.id ?? item._id}
                                    className='hover:bg-gray-50 dark:hover:bg-slate-750'
                                >
                                    <td className='px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs'>
                                        {item.number}
                                    </td>
                                    <td className='px-4 py-3 text-gray-900 dark:text-white font-arabic text-lg'>
                                        {item.arabic}
                                    </td>
                                    <td className='px-4 py-3 text-gray-700 dark:text-gray-300 italic'>
                                        {item.transliteration}
                                    </td>
                                    <td className='px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell'>
                                        {item.indonesian}
                                    </td>
                                    <td className='px-4 py-3'>
                                        <div className='flex items-center gap-2 justify-end'>
                                            <button
                                                onClick={() => openEdit(item)}
                                                className='p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded'
                                            >
                                                <BsPencil />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeleteId(item.id ?? item._id)
                                                }
                                                className='p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded'
                                            >
                                                <BsTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className='px-4 py-8 text-center text-gray-400'
                                    >
                                        No data yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700'>
                            <h2 className='font-bold text-gray-900 dark:text-white'>
                                {editId ? 'Edit Asmaul Husna' : 'Add Asmaul Husna'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            >
                                <BsX className='text-xl' />
                            </button>
                        </div>
                        <div className='p-5 space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                        Nomor
                                    </label>
                                    <input
                                        type='number'
                                        value={form.number}
                                        onChange={(e) =>
                                            setForm({ ...form, number: e.target.value })
                                        }
                                        min={1}
                                        max={99}
                                        className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                        Arabic
                                    </label>
                                    <input
                                        type='text'
                                        value={form.arabic}
                                        onChange={(e) =>
                                            setForm({ ...form, arabic: e.target.value })
                                        }
                                        dir='rtl'
                                        className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-arabic text-lg'
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                    Latin
                                </label>
                                <input
                                    type='text'
                                    value={form.transliteration}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            transliteration: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                        Meaning (Indonesian)
                                    </label>
                                    <input
                                        type='text'
                                        value={form.indonesian}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                indonesian: e.target.value,
                                            })
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                        Meaning (English)
                                    </label>
                                    <input
                                        type='text'
                                        value={form.english}
                                        onChange={(e) =>
                                            setForm({ ...form, english: e.target.value })
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                                    />
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                    Notes
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    rows={3}
                                    className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                                />
                            </div>
                        </div>
                        <div className='flex gap-3 p-5 border-t border-gray-100 dark:border-slate-700'>
                            <button
                                onClick={() => setShowModal(false)}
                                className='flex-1 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={save}
                                disabled={saving || !form.arabic}
                                className='flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium'
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteId && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
                    <div className='bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6'>
                        <h2 className='font-bold text-gray-900 dark:text-white mb-2'>
                            Delete this name?
                        </h2>
                        <p className='text-sm text-gray-500 dark:text-gray-400 mb-5'>
                            Deleted data cannot be restored.
                        </p>
                        <div className='flex gap-3'>
                            <button
                                onClick={() => setDeleteId(null)}
                                className='flex-1 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className='flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium'
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAsmaulHusnaPage;
