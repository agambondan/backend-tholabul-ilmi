'use client';

import { useLocale } from '@/context/Locale';
import { useEffect, useState } from 'react';
import { BsPencilSquare, BsTrash, BsX } from 'react-icons/bs';

const NotesPage = () => {
    const { t } = useLocale();
    const [notes, setNotes] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editNote, setEditNote] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', tags: '' });

    useEffect(() => {
        try {
            setNotes(JSON.parse(localStorage.getItem('tholabul_notes') ?? '[]'));
        } catch {}
    }, []);

    const persist = (updated) => {
        setNotes(updated);
        try {
            localStorage.setItem('tholabul_notes', JSON.stringify(updated));
        } catch {}
    };

    const openAdd = () => {
        setEditNote(null);
        setForm({ title: '', content: '', tags: '' });
        setShowModal(true);
    };

    const openEdit = (note) => {
        setEditNote(note);
        setForm({
            title: note.title,
            content: note.content,
            tags: (note.tags ?? []).join(', '),
        });
        setShowModal(true);
    };

    const save = () => {
        if (!form.title.trim()) return;
        const tags = form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
        if (editNote) {
            persist(
                notes.map((n) =>
                    n.id === editNote.id
                        ? { ...n, title: form.title, content: form.content, tags }
                        : n,
                ),
            );
        } else {
            const entry = {
                id: Date.now().toString(),
                title: form.title,
                content: form.content,
                tags,
                date: new Date().toISOString().slice(0, 10),
            };
            persist([entry, ...notes]);
        }
        setShowModal(false);
    };

    const remove = (id) => {
        if (!confirm(t('notes.delete_confirm'))) return;
        persist(notes.filter((n) => n.id !== id));
    };

    const filtered = notes.filter(
        (n) =>
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            (n.content ?? '').toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className='px-4 py-6'>
            <div className='flex items-center justify-between mb-4'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                    {t('notes.title')}
                </h1>
                <button
                    onClick={openAdd}
                    className='flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors'
                >
                    <BsPencilSquare />
                    {t('notes.add')}
                </button>
            </div>

            {/* Search */}
            <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('notes.search_placeholder')}
                className='w-full px-4 py-2.5 mb-5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
            />

            {filtered.length === 0 ? (
                <div className='text-center py-16'>
                    <p className='text-4xl mb-3'>📝</p>
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>
                        {search ? t('notes.empty_search') : t('notes.empty')}
                    </p>
                    {!search && (
                        <button
                            onClick={openAdd}
                            className='mt-4 text-emerald-600 dark:text-emerald-400 text-sm hover:underline'
                        >
                            {t('notes.add_first')}
                        </button>
                    )}
                </div>
            ) : (
                <ul className='space-y-3'>
                    {filtered.map((note) => (
                        <li
                            key={note.id}
                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors cursor-pointer'
                            onClick={() => openEdit(note)}
                        >
                            <div className='flex items-start justify-between gap-2'>
                                <div className='min-w-0'>
                                    <p className='text-sm font-bold text-gray-800 dark:text-white truncate'>
                                        {note.title}
                                    </p>
                                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                        {note.date
                                            ? new Date(
                                                  note.date + 'T00:00:00',
                                              ).toLocaleDateString('id-ID', {
                                                  day: 'numeric',
                                                  month: 'short',
                                                  year: 'numeric',
                                              })
                                            : ''}
                                    </p>
                                    {note.content && (
                                        <p className='text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed'>
                                            {note.content.length > 60
                                                ? note.content.slice(0, 60) + '...'
                                                : note.content}
                                        </p>
                                    )}
                                    {(note.tags ?? []).length > 0 && (
                                        <div className='flex flex-wrap gap-1 mt-2'>
                                            {note.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className='px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full text-[11px]'
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        remove(note.id);
                                    }}
                                    className='text-gray-300 dark:text-slate-600 hover:text-red-500 transition-colors shrink-0'
                                >
                                    <BsTrash />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Modal */}
            {showModal && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
                    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div className='bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-base font-semibold text-gray-900 dark:text-white'>
                                {editNote ? t('notes.edit') : t('notes.add')}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            >
                                <BsX className='text-xl' />
                            </button>
                        </div>

                        <div className='space-y-3'>
                            <div>
                                <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                    {t('notes.label_title')}
                                </label>
                                <input
                                    type='text'
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, title: e.target.value }))
                                    }
                                    placeholder={t('notes.title_placeholder')}
                                    className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                />
                            </div>
                            <div>
                                <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                    {t('notes.label_content')}
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, content: e.target.value }))
                                    }
                                    rows={5}
                                    placeholder={t('notes.content_placeholder')}
                                    className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none'
                                />
                            </div>
                            <div>
                                <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                    {t('notes.label_tags')}
                                </label>
                                <input
                                    type='text'
                                    value={form.tags}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, tags: e.target.value }))
                                    }
                                    placeholder='quran, tadabbur, fiqh'
                                    className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                />
                            </div>
                        </div>

                        <div className='flex justify-end gap-2 mt-5'>
                            <button
                                onClick={() => setShowModal(false)}
                                className='px-4 py-2 text-sm text-gray-600 dark:text-gray-400'
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={save}
                                disabled={!form.title.trim()}
                                className='px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                            >
                                {t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesPage;
