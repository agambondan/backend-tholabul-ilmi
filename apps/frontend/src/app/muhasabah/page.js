'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { muhasabahApi } from '@/lib/api';
import { useLocale } from '@/context/Locale';
import { useEffect, useState } from 'react';
import { BsPencilSquare, BsSearch, BsTrash, BsX } from 'react-icons/bs';
import { MdSelfImprovement } from 'react-icons/md';

const MOODS = [
    { key: 'baik', label: 'Alhamdulillah baik', emoji: '😊', color: 'text-emerald-600' },
    { key: 'cukup', label: 'Cukup baik', emoji: '🙂', color: 'text-yellow-600' },
    { key: 'perlu_perbaikan', label: 'Perlu perbaikan', emoji: '😔', color: 'text-red-500' },
];

const PROMPTS = [
    'Apa amal terbaik yang kamu lakukan hari ini?',
    'Apa yang kurang dari ibadahmu hari ini?',
    'Apa niat yang ingin kamu perbaiki untuk esok hari?',
    'Bagaimana hubunganmu dengan Allah dan sesama hari ini?',
    'Apa yang kamu syukuri hari ini?',
    'Adakah dosa yang kamu sesali? Mohon ampun kepada Allah.',
    'Apa ilmu baru yang kamu pelajari hari ini?',
];

const LS_KEY = 'tholabul_muhasabah';

const loadLocal = () => {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
    } catch {
        return [];
    }
};

const saveLocal = (entries) => {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(entries));
    } catch {}
};

const dateStr = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatDate = (str) =>
    new Date(str + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

const randomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

const MuhasabahPage = () => {
    const { t } = useLocale();
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
    const [entries, setEntries] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('baik');
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [prompt, setPrompt] = useState(randomPrompt());
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        const local = loadLocal();
        setEntries(local);
        muhasabahApi
            .list()
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setEntries(data);
                    saveLocal(data);
                }
            })
            .catch(() => {});
    }, [isAuthenticated, authLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSaving(true);
        const newEntry = {
            id: Date.now().toString(),
            content: content.trim(),
            mood,
            date: dateStr(),
            created_at: new Date().toISOString(),
        };
        try {
            const res = await muhasabahApi.create({ content: newEntry.content, mood });
            const data = await res.json().catch(() => newEntry);
            const saved = { ...newEntry, ...data };
            const updated = [saved, ...entries];
            setEntries(updated);
            saveLocal(updated);
        } catch {
            const updated = [newEntry, ...entries];
            setEntries(updated);
            saveLocal(updated);
        } finally {
            setSaving(false);
            setContent('');
            setMood('baik');
            setShowForm(false);
            setPrompt(randomPrompt());
        }
    };

    const handleDelete = async (id) => {
        const updated = entries.filter((e) => e.id !== id);
        setEntries(updated);
        saveLocal(updated);
        setDeleteId(null);
        muhasabahApi.delete(id).catch(() => {});
    };

    const moodInfo = (key) => MOODS.find((m) => m.key === key) ?? MOODS[0];
    const query = search.trim().toLowerCase();
    const filteredEntries = entries.filter((entry) => {
        if (!query) return true;
        const haystack = [
            entry.content,
            entry.mood,
            entry.date,
            moodInfo(entry.mood).label,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return haystack.includes(query);
    });
    const moodSummary = MOODS.map((moodItem) => ({
        ...moodItem,
        count: entries.filter((entry) => entry.mood === moodItem.key).length,
    }));

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
                                <MdSelfImprovement className='text-xl text-emerald-700 dark:text-emerald-400' />
                            </div>
                            <div>
                                <h1 className='text-xl font-bold text-emerald-900 dark:text-white'>
                                    {t('muhasabah.title')}
                                </h1>
                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    {t('muhasabah.introspeksi_subtitle')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowForm((v) => !v);
                                setPrompt(randomPrompt());
                            }}
                            className='flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors'
                        >
                            <BsPencilSquare />
                            {t('muhasabah.write_btn')}
                        </button>
                    </div>

                    <div className='flex items-center gap-2 mb-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                        <BsSearch className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('muhasabah.search_placeholder')}
                            className='flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none'
                        />
                        {search && (
                            <button
                                type='button'
                                onClick={() => setSearch('')}
                                className='text-xs font-medium text-emerald-600 dark:text-emerald-400'
                            >
                                {t('muhasabah.clear')}
                            </button>
                        )}
                    </div>

                    <div className='grid grid-cols-3 gap-3 mb-5'>
                        {moodSummary.map((item) => (
                            <div
                                key={item.key}
                                className='rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3'
                            >
                                <p className='text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500'>
                                    {item.label}
                                </p>
                                <p className={`text-lg font-bold ${item.color}`}>{item.count}</p>
                            </div>
                        ))}
                    </div>

                    {/* Write form */}
                    {showForm && (
                        <div className='bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 mb-5'>
                            <div className='flex items-center justify-between mb-4'>
                                <p className='text-sm font-semibold text-emerald-900 dark:text-white'>
                                    {t('muhasabah.today_label')}
                                </p>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                >
                                    <BsX className='text-xl' />
                                </button>
                            </div>

                            {/* Prompt */}
                            <div className='bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-4 py-3 mb-4'>
                                <p className='text-xs text-emerald-700 dark:text-emerald-400 italic'>
                                    💭 &ldquo;{prompt}&rdquo;
                                </p>
                                <button
                                    type='button'
                                    onClick={() => setPrompt(randomPrompt())}
                                    className='text-xs text-emerald-600 dark:text-emerald-500 hover:underline mt-1'
                                >
                                    {t('muhasabah.change_prompt')}
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className='space-y-4'>
                                {/* Mood */}
                                <div>
                                    <p className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-2'>
                                        {t('muhasabah.mood_label')}
                                    </p>
                                    <div className='flex gap-2'>
                                        {MOODS.map((m) => (
                                            <button
                                                key={m.key}
                                                type='button'
                                                onClick={() => setMood(m.key)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${
                                                    mood === m.key
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                        : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:border-emerald-300'
                                                }`}
                                            >
                                                {m.emoji} {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={t('muhasabah.content_placeholder')}
                                    rows={5}
                                    required
                                    className='w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none'
                                />

                                <button
                                    type='submit'
                                    disabled={saving || !content.trim()}
                                    className='w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors'
                                >
                                    {saving ? t('muhasabah.saving') : t('muhasabah.save_btn')}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Entries */}
                    {entries.length === 0 ? (
                        <div className='text-center py-16'>
                            <MdSelfImprovement className='text-5xl text-gray-200 dark:text-slate-700 mx-auto mb-3' />
                            <p className='text-sm text-gray-400 dark:text-gray-500'>
                                {t('muhasabah.empty')}
                            </p>
                            <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                                {t('muhasabah.empty_hint')}
                            </p>
                        </div>
                    ) : filteredEntries.length === 0 ? (
                        <div className='text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700'>
                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                {t('muhasabah.no_search')}
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {filteredEntries.map((entry) => {
                                const m = moodInfo(entry.mood);
                                return (
                                    <div
                                        key={entry.id}
                                        className='bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4'
                                    >
                                        <div className='flex items-start justify-between gap-2 mb-2'>
                                            <div>
                                                <p className='text-xs text-gray-400 dark:text-gray-500'>
                                                    {entry.date ? formatDate(entry.date) : ''}
                                                </p>
                                                <span className={`text-xs font-medium ${m.color}`}>
                                                    {m.emoji} {m.label}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    deleteId === entry.id
                                                        ? handleDelete(entry.id)
                                                        : setDeleteId(entry.id)
                                                }
                                                className='text-gray-300 hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400 transition-colors flex-shrink-0'
                                            >
                                                <BsTrash />
                                            </button>
                                        </div>
                                        {deleteId === entry.id && (
                                            <p className='text-xs text-red-500 mb-2'>
                                                {t('muhasabah.confirm_delete')}{' '}
                                                <button
                                                    onClick={() => setDeleteId(null)}
                                                    className='underline'
                                                >
                                                    {t('muhasabah.cancel')}
                                                </button>
                                            </p>
                                        )}
                                        <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap'>
                                            {entry.content}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default MuhasabahPage;
