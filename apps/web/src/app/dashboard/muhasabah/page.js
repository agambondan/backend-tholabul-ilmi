'use client';

import { useAuth } from '@/context/Auth';
import { useLocale } from '@/context/Locale';
import { muhasabahApi, streakApi } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';
import { BsPencilSquare, BsTrash, BsX } from 'react-icons/bs';

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const MOODS = [
    { value: 'baik', label: 'Baik', emoji: '😊' },
    { value: 'biasa', label: 'Biasa', emoji: '😐' },
    { value: 'berat', label: 'Berat', emoji: '😢' },
    { value: 'syukur', label: 'Syukur', emoji: '🤲' },
];

const getMoodEmoji = (v) => MOODS.find((m) => m.value === v)?.emoji ?? '😐';

const MuhasabahPage = () => {
    const { t, lang } = useLocale();
    const { isAuthenticated } = useAuth();
    const [list, setList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ date: todayStr(), mood: 'baik', content: '' });
    const textRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            if (isAuthenticated) {
                try {
                    const res = await muhasabahApi.list();
                    const data = await res.json();
                    const items = (data?.items ?? data ?? []).map((e) => ({
                        id: String(e.id),
                        date: (e.date ?? e.created_at ?? '').slice(0, 10),
                        mood: e.mood ?? 'biasa',
                        content: e.content ?? e.notes ?? '',
                    }));
                    if (items.length > 0) {
                        setList(items);
                        try {
                            localStorage.setItem(
                                'tholabul_muhasabah',
                                JSON.stringify(items),
                            );
                        } catch {}
                        return;
                    }
                } catch {}
            }
            try {
                setList(JSON.parse(localStorage.getItem('tholabul_muhasabah') ?? '[]'));
            } catch {}
        };
        load();
    }, [isAuthenticated]);

    useEffect(() => {
        if (showModal && textRef.current) textRef.current.focus();
    }, [showModal]);

    const persist = (updated) => {
        setList(updated);
        try {
            localStorage.setItem('tholabul_muhasabah', JSON.stringify(updated));
        } catch {}
    };

    const openModal = () => {
        setForm({ date: todayStr(), mood: 'baik', content: '' });
        setShowModal(true);
    };

    const save = () => {
        if (!form.content.trim()) return;
        const entry = { id: Date.now().toString(), ...form };
        persist([entry, ...list]);
        if (isAuthenticated) {
            muhasabahApi
                .create({ date: form.date, mood: form.mood, content: form.content })
                .catch(() => {});
            streakApi.logActivity('muhasabah').catch(() => {});
        }
        setShowModal(false);
    };

    const remove = (id) => {
        if (!confirm(t('muhasabah.delete_confirm'))) return;
        persist(list.filter((e) => e.id !== id));
        if (isAuthenticated) {
            muhasabahApi.delete(id).catch(() => {});
        }
    };

    return (
        <div className='px-4 py-6'>
            <div className='flex items-center justify-between mb-6'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                    {t('muhasabah.title')}
                </h1>
                <button
                    onClick={openModal}
                    className='flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors'
                >
                    <BsPencilSquare />
                    {t('muhasabah.write_btn')}
                </button>
            </div>

            {list.length === 0 ? (
                <div className='text-center py-16'>
                    <p className='text-4xl mb-3'>🤲</p>
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>
                        {t('muhasabah.empty')}
                    </p>
                    <button
                        onClick={openModal}
                        className='mt-4 text-emerald-600 dark:text-emerald-400 text-sm hover:underline'
                    >
                        {t('muhasabah.write_first')}
                    </button>
                </div>
            ) : (
                <ul className='space-y-3'>
                    {list.map((entry) => (
                        <li
                            key={entry.id}
                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'
                        >
                            <div className='flex items-start justify-between gap-3'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <span className='text-2xl'>{getMoodEmoji(entry.mood)}</span>
                                    <span className='text-xs text-gray-400 dark:text-gray-500'>
                                        {entry.date
                                            ? new Date(
                                                  entry.date + 'T00:00:00',
                                              ).toLocaleDateString(
                                                lang === 'EN' ? 'en-US' : 'id-ID',
                                                {
                                                  weekday: 'long',
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                                },
                                              )
                                            : ''}
                                    </span>
                                </div>
                                <button
                                    onClick={() => remove(entry.id)}
                                    className='text-gray-300 dark:text-slate-600 hover:text-red-500 transition-colors shrink-0'
                                >
                                    <BsTrash />
                                </button>
                            </div>
                            <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
                                {entry.content.length > 100
                                    ? entry.content.slice(0, 100) + '...'
                                    : entry.content}
                            </p>
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
                                {t('muhasabah.write_btn')}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            >
                                <BsX className='text-xl' />
                            </button>
                        </div>

                        <div className='space-y-4'>
                            <div>
                                <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                    {t('muhasabah.label_date')}
                                </label>
                                <input
                                    type='date'
                                    value={form.date}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, date: e.target.value }))
                                    }
                                    className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                />
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                    {t('muhasabah.label_mood')}
                                </label>
                                <select
                                    value={form.mood}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, mood: e.target.value }))
                                    }
                                    className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                >
                                    {MOODS.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.emoji} {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                    {t('muhasabah.label_notes')}
                                </label>
                                <textarea
                                    ref={textRef}
                                    value={form.content}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, content: e.target.value }))
                                    }
                                    rows={5}
                                    placeholder={t('muhasabah.placeholder')}
                                    className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none'
                                />
                            </div>
                        </div>

                        <div className='flex justify-end gap-2 mt-5'>
                            <button
                                onClick={() => setShowModal(false)}
                                className='px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors'
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={save}
                                disabled={!form.content.trim()}
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

export default MuhasabahPage;
