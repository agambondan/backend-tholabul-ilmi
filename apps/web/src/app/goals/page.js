'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { goalsApi } from '@/lib/api';
import { useLocale } from '@/context/Locale';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsCheckCircleFill, BsPlusCircle, BsSearch, BsTrash, BsX } from 'react-icons/bs';
import { MdFlag, MdOutlineTrackChanges } from 'react-icons/md';

const GOAL_TYPES = [
    { key: 'hafalan', labelKey: 'goals.type_hafalan', unitKey: 'goals.unit_surah', icon: '📖' },
    { key: 'tilawah', labelKey: 'goals.type_tilawah', unitKey: 'goals.unit_page', icon: '📕' },
    { key: 'hadith', labelKey: 'goals.type_hadith', unitKey: 'goals.unit_hadith', icon: '📚' },
    { key: 'amalan', labelKey: 'goals.type_amalan', unitKey: 'goals.unit_day', icon: '✅' },
];

const LS_KEY = 'tholabul_goals';

const loadLocal = () => {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
    } catch {
        return [];
    }
};

const saveLocal = (goals) => {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(goals));
    } catch {}
};

const pct = (current, target) => Math.min(100, Math.round((current / target) * 100));

const typeInfo = (key) => GOAL_TYPES.find((t) => t.key === key) ?? GOAL_TYPES[0];

const GoalsPage = () => {
    const { t, lang } = useLocale();
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ type: 'hafalan', target: '', deadline: '', title: '' });
    const [saving, setSaving] = useState(false);
    const [updating, setUpdating] = useState(null);
    const [updateVal, setUpdateVal] = useState('');
    const [search, setSearch] = useState('');
    const typeLabel = useCallback((type) => t(typeInfo(type).labelKey), [t]);
    const typeUnit = useCallback((type) => t(typeInfo(type).unitKey), [t]);

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        const local = loadLocal();
        setGoals(local);
        goalsApi
            .list()
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setGoals(data);
                    saveLocal(data);
                }
            })
            .catch(() => {});
    }, [isAuthenticated, authLoading]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.target || Number(form.target) <= 0) return;
        setSaving(true);
        const newGoal = {
            id: Date.now().toString(),
            type: form.type,
            title:
                form.title.trim() ||
                `${typeLabel(form.type)} - ${t('goals.target_word')} ${form.target} ${typeUnit(form.type)}`,
            target_value: Number(form.target),
            current_value: 0,
            deadline: form.deadline || null,
            is_completed: false,
            created_at: new Date().toISOString(),
        };
        try {
            const res = await goalsApi.create({
                type: newGoal.type,
                title: newGoal.title,
                target_value: newGoal.target_value,
                deadline: newGoal.deadline,
            });
            const data = await res.json().catch(() => newGoal);
            const saved = { ...newGoal, ...data };
            const updated = [saved, ...goals];
            setGoals(updated);
            saveLocal(updated);
        } catch {
            const updated = [newGoal, ...goals];
            setGoals(updated);
            saveLocal(updated);
        } finally {
            setSaving(false);
            setForm({ type: 'hafalan', target: '', deadline: '', title: '' });
            setShowForm(false);
        }
    };

    const handleUpdateProgress = async (goal) => {
        const val = Number(updateVal);
        if (isNaN(val) || val < 0) return;
        const updated = goals.map((g) =>
            g.id === goal.id
                ? {
                      ...g,
                      current_value: val,
                      is_completed: val >= g.target_value,
                  }
                : g,
        );
        setGoals(updated);
        saveLocal(updated);
        setUpdating(null);
        setUpdateVal('');
        goalsApi.update(goal.id, { current_value: val }).catch(() => {});
    };

    const handleDelete = (id) => {
        const updated = goals.filter((g) => g.id !== id);
        setGoals(updated);
        saveLocal(updated);
        goalsApi.delete(id).catch(() => {});
    };

    const active = goals.filter((g) => !g.is_completed);
    const completed = goals.filter((g) => g.is_completed);
    const query = search.trim().toLowerCase();
    const filteredActive = useMemo(
        () =>
            active.filter((goal) => {
                if (!query) return true;
                const haystack = [
                    goal.title,
                    goal.type,
                    typeLabel(goal.type),
                    typeUnit(goal.type),
                    goal.deadline,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(query);
            }),
        [active, query, typeLabel, typeUnit],
    );
    const filteredCompleted = useMemo(
        () =>
            completed.filter((goal) => {
                if (!query) return true;
                const haystack = [
                    goal.title,
                    goal.type,
                    typeLabel(goal.type),
                    typeUnit(goal.type),
                    goal.deadline,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(query);
            }),
        [completed, query, typeLabel, typeUnit],
    );

    if (authLoading) return null;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-xl'>
                    {/* Header */}
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center'>
                                <MdOutlineTrackChanges className='text-xl text-emerald-700 dark:text-emerald-400' />
                            </div>
                            <div>
                                <h1 className='text-xl font-bold text-emerald-900 dark:text-white'>
                                    {t('goals.title')}
                                </h1>
                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    {active.length} {t('goals.active_count_suffix')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForm((v) => !v)}
                            className='flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors'
                        >
                            <BsPlusCircle />
                            {t('goals.create_btn')}
                        </button>
                    </div>

                    <div className='flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                        <BsSearch className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('goals.search_placeholder')}
                            className='flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none'
                        />
                        {search && (
                            <button
                                type='button'
                                onClick={() => setSearch('')}
                                className='text-xs font-medium text-emerald-600 dark:text-emerald-400'
                            >
                                {t('goals.clear')}
                            </button>
                        )}
                    </div>

                    <div className='grid grid-cols-3 gap-3 mb-4'>
                        <div className='rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3'>
                            <p className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                                {t('goals.stat_total')}
                            </p>
                            <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>
                                {goals.length}
                            </p>
                        </div>
                        <div className='rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3'>
                            <p className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                                {t('goals.stat_active')}
                            </p>
                            <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>
                                {active.length}
                            </p>
                        </div>
                        <div className='rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3'>
                            <p className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                                {t('goals.stat_done')}
                            </p>
                            <p className='text-lg font-bold text-emerald-700 dark:text-emerald-400'>
                                {completed.length}
                            </p>
                        </div>
                    </div>

                    {/* Create form */}
                    {showForm && (
                        <div className='bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 mb-5'>
                            <div className='flex items-center justify-between mb-4'>
                                <p className='text-sm font-semibold text-emerald-900 dark:text-white'>
                                    {t('goals.new_target')}
                                </p>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className='text-gray-400 hover:text-gray-600'
                                >
                                    <BsX className='text-xl' />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className='space-y-3'>
                                {/* Type */}
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        {t('goals.type_label')}
                                    </label>
                                    <div className='grid grid-cols-2 gap-2'>
                                        {GOAL_TYPES.map((type) => (
                                            <button
                                                key={type.key}
                                                type='button'
                                                onClick={() => setForm((f) => ({ ...f, type: type.key }))}
                                                className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                                                    form.type === type.key
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                        : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {type.icon} {t(type.labelKey)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        {t('goals.name_label')}
                                    </label>
                                    <input
                                        value={form.title}
                                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                        placeholder={`${t('common.example')}: ${t('goals.example_prefix')} ${typeLabel(form.type)}`}
                                        className='w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                    />
                                </div>

                                {/* Target value */}
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        {t('goals.label_target')} ({typeUnit(form.type)})
                                    </label>
                                    <input
                                        type='number'
                                        min='1'
                                        value={form.target}
                                        onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                                        required
                                        placeholder={`${t('goals.amount_placeholder')} ${typeUnit(form.type)}`}
                                        className='w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                    />
                                </div>

                                {/* Deadline */}
                                <div>
                                    <label className='block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                        {t('goals.deadline_label')}
                                    </label>
                                    <input
                                        type='date'
                                        value={form.deadline}
                                        onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                                        className='w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                    />
                                </div>

                                <button
                                    type='submit'
                                    disabled={saving}
                                    className='w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors'
                                >
                                    {saving ? t('goals.saving') : t('goals.create_btn')}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Active goals */}
                    {filteredActive.length > 0 && (
                        <div className='mb-6'>
                            <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2'>
                                <MdFlag className='text-emerald-500' />
                                {t('goals.active_section')} ({filteredActive.length})
                            </h2>
                            <div className='space-y-3'>
                                {filteredActive.map((g) => {
                                    const goalType = typeInfo(g.type);
                                    const p = pct(g.current_value ?? 0, g.target_value);
                                    return (
                                        <div
                                            key={g.id}
                                            className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'
                                        >
                                            <div className='flex items-start justify-between gap-2 mb-3'>
                                                <div>
                                                    <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                                                        {goalType.icon} {g.title}
                                                    </p>
                                                    {g.deadline && (
                                                        <p className='text-xs text-gray-400 dark:text-gray-500'>
                                                            {t('goals.deadline_prefix')}{' '}
                                                            {new Date(
                                                                g.deadline + 'T00:00:00',
                                                            ).toLocaleDateString(lang === 'EN' ? 'en-US' : 'id-ID', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric',
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(g.id)}
                                                    className='text-gray-300 hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400 transition-colors flex-shrink-0'
                                                >
                                                    <BsTrash />
                                                </button>
                                            </div>

                                            {/* Progress bar */}
                                            <div className='mb-2'>
                                                <div className='flex items-center justify-between text-xs mb-1'>
                                                    <span className='text-gray-500 dark:text-gray-400'>
                                                        {g.current_value ?? 0} / {g.target_value} {typeUnit(g.type)}
                                                    </span>
                                                    <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                                                        {p}%
                                                    </span>
                                                </div>
                                                <div className='h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden'>
                                                    <div
                                                        className='h-full bg-emerald-500 rounded-full transition-all'
                                                        style={{ width: `${p}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Update progress */}
                                            {updating === g.id ? (
                                                <div className='flex gap-2 mt-2'>
                                                    <input
                                                        type='number'
                                                        min='0'
                                                        max={g.target_value}
                                                        value={updateVal}
                                                        onChange={(e) => setUpdateVal(e.target.value)}
                                                        placeholder={`${t('goals.current_placeholder')} (${typeUnit(g.type)})`}
                                                        className='flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500'
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateProgress(g)}
                                                        className='px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-medium'
                                                    >
                                                        {t('common.save')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setUpdating(null);
                                                            setUpdateVal('');
                                                        }}
                                                        className='px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs'
                                                    >
                                                        {t('muhasabah.cancel')}
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setUpdating(g.id);
                                                        setUpdateVal(String(g.current_value ?? 0));
                                                    }}
                                                    className='mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline'
                                                >
                                                    + {t('goals.update')}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {active.length > 0 && filteredActive.length === 0 && (
                        <div className='text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-6'>
                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                {t('goals.no_active_search')}
                            </p>
                        </div>
                    )}

                    {/* Completed goals */}
                    {filteredCompleted.length > 0 && (
                        <div>
                            <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2'>
                                <BsCheckCircleFill className='text-emerald-500' />
                                {t('goals.stat_done')} ({filteredCompleted.length})
                            </h2>
                            <div className='space-y-2'>
                                {filteredCompleted.map((g) => {
                                    const goalType = typeInfo(g.type);
                                    return (
                                        <div
                                            key={g.id}
                                            className='flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40 px-4 py-3'
                                        >
                                            <BsCheckCircleFill className='text-emerald-500 flex-shrink-0' />
                                            <div className='flex-1'>
                                                <p className='text-sm font-medium text-emerald-800 dark:text-emerald-300'>
                                                    {goalType.icon} {g.title}
                                                </p>
                                                <p className='text-xs text-emerald-600 dark:text-emerald-500'>
                                                    {g.target_value} {typeUnit(g.type)} {t('goals.reached')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(g.id)}
                                                className='text-emerald-300 hover:text-red-400 transition-colors'
                                            >
                                                <BsTrash />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {completed.length > 0 && filteredCompleted.length === 0 && (
                        <div className='text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                {t('goals.no_match_completed')}
                            </p>
                        </div>
                    )}

                    {goals.length === 0 && !showForm && (
                        <div className='text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
                            <MdOutlineTrackChanges className='text-5xl text-gray-200 dark:text-slate-700 mx-auto mb-3' />
                            <p className='text-sm text-gray-400 dark:text-gray-500'>{t('goals.empty')}</p>
                            <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                                {t('goals.empty_hint2')}
                            </p>
                        </div>
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default GoalsPage;
