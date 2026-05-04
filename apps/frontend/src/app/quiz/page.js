'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import { useState } from 'react';
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import { FaBrain } from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';

const QUIZ_BANK = [
    {
        q: 'Berapa jumlah surat dalam Al-Quran?',
        options: ['112', '114', '116', '120'],
        answer: 1,
        explanation: 'Al-Quran terdiri dari 114 surat, dimulai dari Al-Fatihah dan diakhiri dengan An-Nas.',
    },
    {
        q: 'Surat apakah yang disebut "jantung Al-Quran"?',
        options: ['Al-Fatihah', 'Al-Baqarah', 'Yasin', 'Al-Ikhlas'],
        answer: 2,
        explanation: 'Surat Yasin disebut jantung Al-Quran berdasarkan hadits riwayat Abu Dawud dan Tirmidzi.',
    },
    {
        q: 'Berapa jumlah juz dalam Al-Quran?',
        options: ['20', '25', '30', '35'],
        answer: 2,
        explanation: 'Al-Quran dibagi menjadi 30 juz untuk memudahkan pembacaan dan penghafalan.',
    },
    {
        q: 'Surat Al-Quran yang paling panjang adalah...',
        options: ['Ali Imran', 'Al-Baqarah', 'An-Nisa', 'Al-Maidah'],
        answer: 1,
        explanation: 'Al-Baqarah adalah surat terpanjang dengan 286 ayat.',
    },
    {
        q: 'Surat Al-Quran yang paling pendek adalah...',
        options: ['Al-Ikhlas', 'Al-Kawthar', 'Al-Asr', 'An-Nas'],
        answer: 1,
        explanation: 'Al-Kawthar (surat ke-108) hanya terdiri dari 3 ayat, menjadikannya surat terpendek.',
    },
    {
        q: 'Berapa jumlah kitab hadith shahih dalam koleksi Kutub al-Sittah?',
        options: ['4', '6', '8', '9'],
        answer: 1,
        explanation: 'Kutub al-Sittah adalah 6 kitab hadith utama: Shahih Bukhari, Shahih Muslim, Sunan Abu Dawud, Sunan Tirmidzi, Sunan Nasa\'i, dan Sunan Ibnu Majah.',
    },
    {
        q: 'Apa arti dari kalimat "La ilaha illallah"?',
        options: [
            'Muhammad adalah utusan Allah',
            'Tidak ada Tuhan selain Allah',
            'Allah Maha Besar',
            'Segala puji bagi Allah',
        ],
        answer: 1,
        explanation: '"La ilaha illallah" berarti "Tidak ada Tuhan yang berhak disembah selain Allah". Ini adalah inti dari syahadat tauhid.',
    },
    {
        q: 'Berapa rakaat sholat Subuh?',
        options: ['2', '3', '4', '5'],
        answer: 0,
        explanation: 'Sholat Subuh terdiri dari 2 rakaat fardhu, dan diawali dengan adzan serta iqamah.',
    },
    {
        q: 'Rukun Islam yang ke-4 adalah...',
        options: ['Sholat', 'Puasa', 'Zakat', 'Haji'],
        answer: 2,
        explanation: 'Rukun Islam: (1) Syahadat, (2) Sholat, (3) Zakat, (4) Puasa, (5) Haji bagi yang mampu.',
    },
    {
        q: 'Pada tanggal berapa diperingati Hari Raya Idul Adha?',
        options: ['1 Syawal', '10 Dzulhijjah', '15 Sya\'ban', '27 Rajab'],
        answer: 1,
        explanation: 'Idul Adha diperingati pada tanggal 10 Dzulhijjah dan bersamaan dengan ibadah haji di Arafah.',
    },
    {
        q: 'Asmaul Husna adalah nama-nama Allah yang berjumlah...',
        options: ['66', '88', '99', '114'],
        answer: 2,
        explanation: 'Asmaul Husna adalah 99 nama Allah yang indah. HR. Tirmidzi: "Sesungguhnya Allah mempunyai 99 nama..."',
    },
    {
        q: 'Siapakah sahabat Nabi yang dijuluki "As-Siddiq" (yang sangat membenarkan)?',
        options: ['Umar bin Khattab', 'Abu Bakar', 'Ali bin Abi Thalib', 'Utsman bin Affan'],
        answer: 1,
        explanation: 'Abu Bakar As-Siddiq mendapat julukan tersebut karena beliau langsung membenarkan peristiwa Isra Mikraj Nabi.',
    },
    {
        q: 'Kota Mekkah terletak di negara mana?',
        options: ['Uni Emirat Arab', 'Kuwait', 'Arab Saudi', 'Qatar'],
        answer: 2,
        explanation: 'Mekkah Al-Mukarramah terletak di wilayah Hijaz, Arab Saudi. Di sini terdapat Masjidil Haram dan Ka\'bah.',
    },
    {
        q: 'Apa nama malam yang lebih baik dari 1000 bulan?',
        options: ['Malam Nisfu Sya\'ban', 'Malam Isra Mikraj', 'Lailatul Qadr', 'Malam Idul Fitri'],
        answer: 2,
        explanation: 'Lailatul Qadr terjadi di salah satu malam ganjil di 10 hari terakhir Ramadhan. QS. Al-Qadr: 1-5.',
    },
    {
        q: 'Berapa bilangan nisab zakat maal dalam gram emas?',
        options: ['65g', '75g', '85g', '95g'],
        answer: 2,
        explanation: 'Nisab zakat maal adalah 85 gram emas murni. Jika harta mencapai jumlah ini dan sudah 1 tahun (haul), wajib dizakati 2,5%.',
    },
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const QUESTIONS_PER_ROUND = 10;

export default function QuizPage() {
    const [phase, setPhase] = useState('intro'); // intro | quiz | result
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [showExp, setShowExp] = useState(false);

    const startQuiz = () => {
        setQuestions(shuffle(QUIZ_BANK).slice(0, QUESTIONS_PER_ROUND));
        setCurrent(0);
        setAnswers([]);
        setSelected(null);
        setShowExp(false);
        setPhase('quiz');
    };

    const handleAnswer = (idx) => {
        if (selected !== null) return;
        setSelected(idx);
        setShowExp(true);
    };

    const nextQuestion = () => {
        const q = questions[current];
        setAnswers((prev) => [
            ...prev,
            { correct: selected === q.answer, selected, answer: q.answer },
        ]);
        if (current + 1 >= questions.length) {
            setPhase('result');
        } else {
            setCurrent((c) => c + 1);
            setSelected(null);
            setShowExp(false);
        }
    };

    const score = answers.filter((a) => a.correct).length;
    const pct = Math.round((score / questions.length) * 100);

    const resultMessage = () => {
        if (pct === 100) return { emoji: '🏆', msg: 'Sempurna! MasyaAllah!' };
        if (pct >= 80) return { emoji: '⭐', msg: 'Luar biasa! Kamu sangat paham!' };
        if (pct >= 60) return { emoji: '👍', msg: 'Bagus! Terus belajar!' };
        if (pct >= 40) return { emoji: '📖', msg: 'Perlu lebih banyak belajar.' };
        return { emoji: '💪', msg: 'Jangan menyerah, terus belajar Islam!' };
    };

    if (phase === 'intro') {
        return (
            <main className='min-h-screen flex flex-col bg-parchment-50 dark:bg-slate-900'>
                <NavbarTailwindCss />
                <div className='max-w-lg flex-1 w-full flex-1 w-full mx-auto px-4 pt-24 pb-8 text-center'>
                    <div className='inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/40 rounded-3xl mb-6'>
                        <FaBrain className='text-4xl text-purple-600 dark:text-purple-400' />
                    </div>
                    <h1 className='text-4xl font-extrabold text-emerald-900 dark:text-emerald-100 mb-3'>
                        Quiz Islami
                    </h1>
                    <p className='text-gray-500 dark:text-gray-400 mb-3 text-sm max-w-sm mx-auto'>
                        Uji pengetahuan Islam kamu dengan {QUESTIONS_PER_ROUND} pertanyaan seputar Al-Quran, Hadith, Fiqh, dan Sejarah Islam.
                    </p>
                    <p className='text-xs text-gray-400 dark:text-gray-500 mb-8'>
                        {QUIZ_BANK.length} soal tersedia • Acak setiap sesi
                    </p>
                    <button
                        onClick={startQuiz}
                        className='bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-extrabold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                    >
                        Mulai Quiz
                    </button>
                </div>
                <Footer />
            </main>
        );
    }

    if (phase === 'result') {
        const { emoji, msg } = resultMessage();
        return (
            <main className='min-h-screen flex flex-col bg-parchment-50 dark:bg-slate-900'>
                <NavbarTailwindCss />
                <div className='max-w-lg flex-1 w-full flex-1 w-full mx-auto px-4 pt-24 pb-8 text-center'>
                    <div className='text-7xl mb-4'>{emoji}</div>
                    <h2 className='text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mb-2'>
                        Selesai!
                    </h2>
                    <p className='text-gray-500 dark:text-gray-400 mb-6'>{msg}</p>

                    <div className='bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 mb-6'>
                        <p className='text-7xl font-extrabold text-emerald-700 dark:text-emerald-300 mb-1'>
                            {score}
                            <span className='text-3xl text-gray-400'>/{questions.length}</span>
                        </p>
                        <div className='w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3 mb-3 overflow-hidden'>
                            <div
                                className='h-3 rounded-full bg-emerald-500 transition-all duration-700'
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <p className='text-gray-500 dark:text-gray-400 text-sm'>{pct}% benar</p>
                    </div>

                    <div className='space-y-2 text-left mb-8'>
                        {answers.map((a, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${
                                    a.correct
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                                }`}
                            >
                                {a.correct ? (
                                    <BsCheckCircleFill className='flex-shrink-0' />
                                ) : (
                                    <BsXCircleFill className='flex-shrink-0' />
                                )}
                                <span className='truncate'>{questions[i].q}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={startQuiz}
                        className='flex items-center gap-2 mx-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold transition-all'
                    >
                        <MdRefresh /> Ulangi Quiz
                    </button>
                </div>
                <Footer />
            </main>
        );
    }

    const q = questions[current];

    return (
        <main className='min-h-screen flex flex-col bg-parchment-50 dark:bg-slate-900'>
            <NavbarTailwindCss />
            <div className='max-w-lg flex-1 w-full mx-auto px-4 pt-24 pb-8'>
                {/* Progress */}
                <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-semibold text-gray-500 dark:text-gray-400'>
                        Soal {current + 1} / {questions.length}
                    </span>
                    <span className='text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
                        ✅ {answers.filter((a) => a.correct).length} benar
                    </span>
                </div>
                <div className='w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2 mb-6 overflow-hidden'>
                    <div
                        className='h-2 rounded-full bg-emerald-500 transition-all'
                        style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                    />
                </div>

                {/* Question */}
                <div className='bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-5'>
                    <p className='text-lg font-bold text-gray-900 dark:text-white leading-snug'>
                        {q.q}
                    </p>
                </div>

                {/* Options */}
                <div className='space-y-3 mb-5'>
                    {q.options.map((opt, i) => {
                        let cls =
                            'w-full text-left px-5 py-3.5 rounded-2xl border text-sm font-semibold transition-all ';
                        if (selected === null) {
                            cls +=
                                'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-800 dark:text-gray-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20';
                        } else if (i === q.answer) {
                            cls +=
                                'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 text-emerald-800 dark:text-emerald-200';
                        } else if (i === selected) {
                            cls +=
                                'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-800 dark:text-red-300';
                        } else {
                            cls +=
                                'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-500 opacity-60';
                        }
                        return (
                            <button key={i} className={cls} onClick={() => handleAnswer(i)}>
                                <span className='inline-block w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 text-xs font-extrabold text-center leading-6 mr-3'>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {showExp && (
                    <div
                        className={`p-4 rounded-2xl text-sm mb-5 ${
                            selected === q.answer
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        }`}
                    >
                        <p className='font-bold mb-1'>
                            {selected === q.answer ? '✅ Benar!' : `❌ Kurang tepat. Jawaban: ${q.options[q.answer]}`}
                        </p>
                        <p>{q.explanation}</p>
                    </div>
                )}

                {selected !== null && (
                    <button
                        onClick={nextQuestion}
                        className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold transition-all'
                    >
                        {current + 1 < questions.length ? 'Soal Berikutnya →' : 'Lihat Hasil'}
                    </button>
                )}
            </div>
            <Footer />
        </main>
    );
}
