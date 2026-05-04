'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/context/Locale';
import { getLocalizedField, getLocalizedOption } from '@/lib/translation';

const FALLBACK = [
    {
        id: 'q1',
        question: {
            idn: 'Berapa jumlah surah dalam Al-Quran?',
            en: 'How many surahs are in the Quran?',
        },
        options: ['112', '113', '114', '115'],
        answer: 2,
        category: 'quran',
    },
    {
        id: 'q2',
        question: {
            idn: 'Siapakah nabi pertama?',
            en: 'Who was the first prophet?',
        },
        options: [
            { idn: 'Idris', en: 'Idris' },
            { idn: 'Ibrahim', en: 'Ibrahim' },
            { idn: 'Adam', en: 'Adam' },
            { idn: 'Nuh', en: 'Nuh' },
        ],
        answer: 2,
        category: 'sejarah',
    },
    {
        id: 'q3',
        question: {
            idn: 'Apa arti "Islam"?',
            en: 'What does "Islam" mean?',
        },
        options: [
            { idn: 'Iman', en: 'Faith' },
            { idn: 'Damai/Selamat', en: 'Peace/Safety' },
            { idn: 'Taat', en: 'Obedience' },
            { idn: 'Ikhlas', en: 'Sincerity' },
        ],
        answer: 1,
        category: 'aqidah',
    },
];

const toStr = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.name ?? v.title ?? v.label ?? v.value ?? '';
};

const QuizPage = () => {
    const { t, lang } = useLocale();
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/quiz?size=10`,
            );
            const data = await res.json();
            const items = data?.items ?? data ?? [];
            if (Array.isArray(items) && items.length > 0) {
                setQuestions(items);
                setLoading(false);
                return;
            }
        } catch {}
        setQuestions(FALLBACK);
        setLoading(false);
    };

    useEffect(() => {
        loadQuestions();
    }, []);

    const restart = () => {
        setCurrent(0);
        setSelected(null);
        setScore(0);
        setDone(false);
        loadQuestions();
    };

    const handleSelect = (idx) => {
        if (selected !== null) return;
        setSelected(idx);
        if (idx === Number(questions[current].answer)) {
            setScore((s) => s + 1);
        }
    };

    const next = () => {
        if (current + 1 >= questions.length) {
            setDone(true);
        } else {
            setCurrent((c) => c + 1);
            setSelected(null);
        }
    };

    if (loading) {
        return (
            <div className='px-4 py-16 max-w-md mx-auto text-center'>
                <p className='text-gray-400 dark:text-gray-500 text-sm'>{t('quiz.loading')}</p>
            </div>
        );
    }

    if (done) {
        const pct = Math.round((score / questions.length) * 100);
        return (
            <div className='px-4 py-6 max-w-md mx-auto'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-6'>
                    {t('quiz.title')}
                </h1>
                <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8 text-center'>
                    <p className='text-5xl mb-4'>
                        {pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white mb-1'>
                        {t('quiz.score')}: {score}/{questions.length}
                    </p>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mb-6'>
                        {pct}% {t('quiz.correct_pct')}
                    </p>
                    <button
                        onClick={restart}
                        className='px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors'
                    >
                        {t('quiz.try_again')}
                    </button>
                </div>
            </div>
        );
    }

    const q = questions[current];
    const total = questions.length;
    const answerIndex = Number(q.answer);
    const options = Array.isArray(q.options) ? q.options : [];

    return (
        <div className='px-4 py-6 max-w-md mx-auto'>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
                {t('quiz.title')}
            </h1>

            {/* Progress */}
            <div className='mb-4'>
                <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5'>
                    <span>
                        {t('quiz.question_label')} {current + 1}/{total}
                    </span>
                    <span>{Math.round(((current + 1) / total) * 100)}%</span>
                </div>
                <div className='h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden'>
                    <div
                        className='h-full bg-emerald-500 rounded-full transition-all duration-300'
                        style={{ width: `${((current + 1) / total) * 100}%` }}
                    />
                </div>
            </div>

            {/* Category badge */}
            {q.category && (
                <span className='inline-block text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full mb-4 font-medium capitalize'>
                    {toStr(q.category)}
                </span>
            )}

            {/* Question */}
            <div className='bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-4'>
                <p className='text-base font-semibold text-gray-800 dark:text-white leading-relaxed'>
                    {getLocalizedField(q, 'question', lang, ['question_text', 'text', 'title'])}
                </p>
            </div>

            {/* Options */}
            <div className='space-y-2 mb-5'>
                {options.map((opt, idx) => {
                    let cls =
                        'w-full px-4 py-3.5 rounded-xl border text-sm font-medium text-left transition-all ';
                    if (selected === null) {
                        cls +=
                            'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10';
                    } else if (idx === answerIndex) {
                        cls +=
                            'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400';
                    } else if (idx === selected && selected !== answerIndex) {
                        cls +=
                            'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400';
                    } else {
                        cls +=
                            'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400 dark:text-gray-500';
                    }
                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            disabled={selected !== null}
                            className={cls}
                        >
                            <span className='mr-2 text-gray-400 dark:text-gray-500 font-normal'>
                                {String.fromCharCode(65 + idx)}.
                            </span>
                            {getLocalizedOption(opt, lang) || toStr(opt)}
                        </button>
                    );
                })}
            </div>

            {/* Next button */}
            {selected !== null && (
                <button
                    onClick={next}
                    className='w-full py-3 bg-emerald-700 text-white rounded-xl text-sm font-medium hover:bg-emerald-800 transition-colors'
                >
                    {current + 1 >= total ? t('quiz.see_result') : t('quiz.next')}
                </button>
            )}
        </div>
    );
};

export default QuizPage;
