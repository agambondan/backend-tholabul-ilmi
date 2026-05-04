'use client';

import { adminQuizApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { BsPencil, BsPlusCircle, BsTrash, BsX } from 'react-icons/bs';

const CATEGORIES = ['aqidah', 'fiqh', 'sejarah', 'akhlak', 'quran', 'hadits', 'umum'];

const EMPTY_FORM = {
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    answer: '0',
    explanation: '',
    category: 'umum',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'];

const AdminQuizPage = () => {
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
            const r = await adminQuizApi.list(0, 500);
            const data = await r.json();
            setItems(data?.items ?? data ?? []);
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
        const opts = item.options ?? [];
        setForm({
            question: item.question ?? '',
            option_a: opts[0] ?? item.option_a ?? '',
            option_b: opts[1] ?? item.option_b ?? '',
            option_c: opts[2] ?? item.option_c ?? '',
            option_d: opts[3] ?? item.option_d ?? '',
            answer: String(item.answer ?? '0'),
            explanation: item.explanation ?? '',
            category: item.category ?? 'umum',
        });
        setShowModal(true);
    };

    const save = async () => {
        setSaving(true);
        try {
            const payload = {
                question: form.question,
                options: [form.option_a, form.option_b, form.option_c, form.option_d],
                answer: Number(form.answer),
                explanation: form.explanation,
                category: form.category,
            };
            if (editId) {
                await adminQuizApi.update(editId, payload);
            } else {
                await adminQuizApi.create(payload);
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
            await adminQuizApi.delete(deleteId);
            setDeleteId(null);
            load();
        } catch {}
    };

    const filtered = items.filter(
        (i) =>
            i.question?.toLowerCase().includes(search.toLowerCase()) ||
            i.category?.toLowerCase().includes(search.toLowerCase()),
    );

    const getAnswerLabel = (item) => {
        const idx = item.answer ?? 0;
        const opts = item.options ?? [item.option_a, item.option_b, item.option_c, item.option_d];
        return `${OPTION_LABELS[idx]}: ${opts[idx] ?? ''}`;
    };

    return (
        <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h1 className='text-xl font-bold text-gray-900 dark:text-white'>Quiz</h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {items.length} questions
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className='flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors'
                >
                    <BsPlusCircle />
                    Add Question
                </button>
            </div>

            <div className='mb-4'>
                <input
                    type='text'
                    placeholder='Search question or category...'
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
                                <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300'>
                                    Question
                                </th>
                                <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 w-28'>
                                    Category
                                </th>
                                <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 hidden md:table-cell'>
                                    Answer
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
                                    <td className='px-4 py-3 text-gray-900 dark:text-white max-w-xs truncate'>
                                        {item.question}
                                    </td>
                                    <td className='px-4 py-3'>
                                        <span className='px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs capitalize'>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className='px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell text-xs max-w-xs truncate'>
                                        {getAnswerLabel(item)}
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
                                        colSpan={4}
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
                                {editId ? 'Edit Question' : 'Add Question'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            >
                                <BsX className='text-xl' />
                            </button>
                        </div>
                        <div className='p-5 space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                    Question
                                </label>
                                <textarea
                                    value={form.question}
                                    onChange={(e) =>
                                        setForm({ ...form, question: e.target.value })
                                    }
                                    rows={2}
                                    className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                                />
                            </div>
                            {OPTION_KEYS.map((key, idx) => (
                                <div key={key}>
                                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                        Options {OPTION_LABELS[idx]}
                                    </label>
                                    <input
                                        type='text'
                                        value={form[key]}
                                        onChange={(e) =>
                                            setForm({ ...form, [key]: e.target.value })
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                                    />
                                </div>
                            ))}
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                        Answer Correct
                                    </label>
                                    <select
                                        value={form.answer}
                                        onChange={(e) =>
                                            setForm({ ...form, answer: e.target.value })
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                                    >
                                        {OPTION_LABELS.map((label, idx) => (
                                            <option key={idx} value={String(idx)}>
                                                Options {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                        Category
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) =>
                                            setForm({ ...form, category: e.target.value })
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white'
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                    Explanation (opsional)
                                </label>
                                <textarea
                                    value={form.explanation}
                                    onChange={(e) =>
                                        setForm({ ...form, explanation: e.target.value })
                                    }
                                    rows={2}
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
                                disabled={saving || !form.question || !form.option_a}
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
                            Delete this question?
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

export default AdminQuizPage;
