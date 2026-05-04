'use client';

import { useLocale } from '@/context/Locale';
import { useEffect, useState } from 'react';
import { BsCheckCircleFill, BsTrash, BsX } from 'react-icons/bs';
import { MdFlag } from 'react-icons/md';

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const UNITS = ['ayat', 'halaman', 'kali', 'hari', 'umum'];
const CATEGORIES = ['Quran', 'Hadith', 'Ibadah', 'Ilmu', 'Lainnya'];

const emptyForm = () => ({
    title: '',
    target: '',
    current: '',
    unit: 'kali',
    deadline: '',
    category: 'Lainnya',
});

const GoalsPage = () => {
    const { t } = useLocale();
    const [goals, setGoals] = useState([]);
    const [tab, setTab] = useState('aktif');
    const [showModal, setShowModal] = useState(false);
    const [editGoal, setEditGoal] = useState(null);
    const [form, setForm] = useState(emptyForm());

    useEffect(() => {
        try {
            setGoals(JSON.parse(localStorage.getItem('tholabul_goals') ?? '[]'));
        } catch {}
    }, []);

    const persist = (updated) => {
        setGoals(updated);
        try {
            localStorage.setItem('tholabul_goals', JSON.stringify(updated));
        } catch {}
    };

    const openAdd = () => {
        setEditGoal(null);
        setForm(emptyForm());
        setShowModal(true);
    };

    const openEdit = (goal) => {
        setEditGoal(goal);
        setForm({
            title: goal.title,
            target: String(goal.target),
            current: String(goal.current ?? 0),
            unit: goal.unit ?? 'kali',
            deadline: goal.deadline ?? '',
            category: goal.category ?? 'Lainnya',
        });
        setShowModal(true);
    };

    const save = () => {
        if (!form.title.trim() || !form.target) return;
        if (editGoal) {
            const updated = goals.map((g) =>
                g.id === editGoal.id
                    ? {
                          ...g,
                          title: form.title,
                          target: Number(form.target),
                          current: Number(form.current),
                          unit: form.unit,
                          deadline: form.deadline,
                          category: form.category,
                      }
                    : g,
            );
            persist(updated);
        } else {
            const entry = {
                id: Date.now().toString(),
                title: form.title,
                target: Number(form.target),
                current: 0,
                unit: form.unit,
                deadline: form.deadline,
                category: form.category,
                completed: false,
            };
            persist([entry, ...goals]);
        }
        setShowModal(false);
    };

    const markComplete = (id) => {
        persist(goals.map((g) => (g.id === id ? { ...g, completed: true } : g)));
    };

    const remove = (id) => {
        if (!confirm('Hapus target ini?')) return;
        persist(goals.filter((g) => g.id !== id));
    };

    const filtered = goals.filter((g) =>
        tab === 'aktif' ? !g.completed : g.completed,
    );

    return (
        <div className='px-4 py-6 max-w-2xl mx-auto'>
            <div className='flex items-center justify-between mb-6'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                    {t('goals.title')}
                </h1>
                <button
                    onClick={openAdd}
                    className='flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors'
                >
                    <MdFlag />
                    {t('goals.add')}
                </button>
            </div>

            {/* Tabs */}
            <div className='flex gap-1 mb-5 bg-gray-100 dark:bg-slate-800 rounded-lg p-1 w-fit'>
                {['aktif', 'selesai'].map((tabKey) => (
                    <button
                        key={tabKey}
                        onClick={() => setTab(tabKey)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                            tab === tabKey
                                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        {tabKey === 'aktif' ? t('goals.active') : t('goals.done')}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className='text-center py-16'>
                    <p className='text-4xl mb-3'>🎯</p>
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>
                        {tab === 'aktif' ? t('goals.empty_active') : t('goals.empty_done')}
                    </p>
                    {tab === 'aktif' && (
                        <button
                            onClick={openAdd}
                            className='mt-4 text-emerald-600 dark:text-emerald-400 text-sm hover:underline'
                        >
                            {t('goals.add_first')}
                        </button>
                    )}
                </div>
            ) : (
                <ul className='space-y-3'>
                    {filtered.map((goal) => {
                        const pct = Math.min(
                            100,
                            Math.round(
                                ((goal.current ?? 0) / Math.max(1, goal.target)) * 100,
                            ),
                        );
                        return (
                            <li
                                key={goal.id}
                                className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'
                            >
                                <div className='flex items-start justify-between gap-2 mb-2'>
                                    <div>
                                        <p className='text-sm font-semibold text-gray-800 dark:text-white'>
                                            {goal.title}
                                        </p>
                                        <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                            {goal.category} · {goal.current ?? 0}/{goal.target}{' '}
                                            {goal.unit}
                                            {goal.deadline
                                                ? ` · ${t('goals.deadline')}: ${goal.deadline}`
                                                : ''}
                                        </p>
                                    </div>
                                    <div className='flex items-center gap-1.5 shrink-0'>
                                        {!goal.completed && (
                                            <>
                                                <button
                                                    onClick={() => openEdit(goal)}
                                                    className='text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors'
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() => markComplete(goal.id)}
                                                    className='text-emerald-500 hover:text-emerald-700 transition-colors'
                                                    title='Tandai selesai'
                                                >
                                                    <BsCheckCircleFill />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => remove(goal.id)}
                                            className='text-gray-300 dark:text-slate-600 hover:text-red-500 transition-colors'
                                        >
                                            <BsTrash />
                                        </button>
                                    </div>
                                </div>
                                <div className='h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden'>
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            goal.completed
                                                ? 'bg-gray-400 dark:bg-slate-500'
                                                : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                                    {pct}%
                                </p>
                            </li>
                        );
                    })}
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
                                {editGoal ? t('goals.update') : t('goals.add')}
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
                                    {t('goals.label_title')}
                                </label>
                                <input
                                    type='text'
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, title: e.target.value }))
                                    }
                                    placeholder='Hafal surah Al-Mulk...'
                                    className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        {t('goals.label_target')}
                                    </label>
                                    <input
                                        type='number'
                                        min='1'
                                        value={form.target}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, target: e.target.value }))
                                        }
                                        placeholder='30'
                                        className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        {t('goals.label_unit')}
                                    </label>
                                    <select
                                        value={form.unit}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, unit: e.target.value }))
                                        }
                                        className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                    >
                                        {UNITS.map((u) => (
                                            <option key={u} value={u}>
                                                {u}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {editGoal && (
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        {t('goals.label_current')}
                                    </label>
                                    <input
                                        type='number'
                                        min='0'
                                        value={form.current}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, current: e.target.value }))
                                        }
                                        className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                    />
                                </div>
                            )}

                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        {t('goals.label_category')}
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, category: e.target.value }))
                                        }
                                        className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        {t('goals.label_deadline')}
                                    </label>
                                    <input
                                        type='date'
                                        value={form.deadline}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, deadline: e.target.value }))
                                        }
                                        className='w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                    />
                                </div>
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
                                disabled={!form.title.trim() || !form.target}
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

export default GoalsPage;
