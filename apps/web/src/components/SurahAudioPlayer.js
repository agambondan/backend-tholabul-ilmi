'use client';

import { useLocale } from '@/context/Locale';
import { audioApi } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';
import {
    BsPauseFill,
    BsPlayFill,
    BsSkipBackwardFill,
    BsSkipForwardFill,
    BsVolumeUpFill,
    BsX,
} from 'react-icons/bs';

// Compact audio player untuk surah-level. Mendukung multi-qori dan auto-play
// ke surah berikutnya jika user menyalakan continuous mode.
export default function SurahAudioPlayer({ surahNumber, surahName, onSurahChange }) {
    const { t } = useLocale();
    const audioRef = useRef(null);
    const [audioList, setAudioList] = useState([]);
    const [selectedQari, setSelectedQari] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [continuous, setContinuous] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!surahNumber || !open) return;
        setLoading(true);
        setError('');
        audioApi
            .bySurah(surahNumber)
            .then((r) => r.json())
            .then((data) => {
                const items = data?.items ?? data ?? [];
                if (!Array.isArray(items) || items.length === 0) {
                    setError(t('audio.empty') ?? 'Audio belum tersedia.');
                    setAudioList([]);
                    return;
                }
                setAudioList(items);
                setSelectedQari((prev) => prev ?? items[0].qari_slug);
            })
            .catch(() => setError(t('audio.error') ?? 'Gagal memuat audio.'))
            .finally(() => setLoading(false));
    }, [surahNumber, open, t]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            setIsPlaying(false);
        }
    }, [surahNumber]);

    const currentAudio = audioList.find((a) => a.qari_slug === selectedQari) ?? audioList[0];

    const ensureAudio = () => {
        if (!currentAudio) return null;
        if (!audioRef.current || audioRef.current.dataset.qari !== currentAudio.qari_slug) {
            if (audioRef.current) audioRef.current.pause();
            const audio = new Audio(currentAudio.audio_url);
            audio.dataset.qari = currentAudio.qari_slug;
            audio.onended = () => {
                setIsPlaying(false);
                if (continuous && onSurahChange && surahNumber < 114) {
                    onSurahChange(surahNumber + 1);
                }
            };
            audio.onpause = () => setIsPlaying(false);
            audio.onplay = () => setIsPlaying(true);
            audioRef.current = audio;
        }
        return audioRef.current;
    };

    const togglePlay = () => {
        const audio = ensureAudio();
        if (!audio) return;
        if (audio.paused) {
            audio.play().catch(() => setError(t('audio.play_error') ?? 'Tidak dapat memutar audio.'));
        } else {
            audio.pause();
        }
    };

    const stop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setOpen(false);
        setIsPlaying(false);
    };

    if (!open) {
        return (
            <button
                type='button'
                onClick={() => setOpen(true)}
                className='inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors'
            >
                <BsVolumeUpFill />
                {t('audio.listen_surah') ?? 'Dengar Surah'}
            </button>
        );
    }

    return (
        <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-3'>
            <div className='bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-xl p-3'>
                <div className='flex items-center justify-between gap-2 mb-2'>
                    <div className='min-w-0'>
                        <p className='text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate'>
                            {surahName ?? `Surah ${surahNumber}`}
                        </p>
                        {currentAudio && (
                            <p className='text-[11px] text-gray-500 dark:text-gray-400 truncate'>
                                {currentAudio.qari_name}
                            </p>
                        )}
                    </div>
                    <button
                        type='button'
                        onClick={stop}
                        className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    >
                        <BsX className='text-lg' />
                    </button>
                </div>

                {loading && (
                    <p className='text-xs text-gray-400 dark:text-gray-500 text-center py-2'>
                        {t('common.loading') ?? 'Memuat...'}
                    </p>
                )}

                {error && !loading && (
                    <p className='text-xs text-red-500 dark:text-red-400 text-center py-2'>
                        {error}
                    </p>
                )}

                {currentAudio && !loading && !error && (
                    <>
                        <div className='flex items-center justify-center gap-2 mb-2'>
                            <button
                                type='button'
                                onClick={() => onSurahChange?.(Math.max(1, surahNumber - 1))}
                                disabled={surahNumber <= 1}
                                className='p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors'
                            >
                                <BsSkipBackwardFill />
                            </button>
                            <button
                                type='button'
                                onClick={togglePlay}
                                className='p-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors'
                            >
                                {isPlaying ? <BsPauseFill className='text-xl' /> : <BsPlayFill className='text-xl' />}
                            </button>
                            <button
                                type='button'
                                onClick={() => onSurahChange?.(Math.min(114, surahNumber + 1))}
                                disabled={surahNumber >= 114}
                                className='p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors'
                            >
                                <BsSkipForwardFill />
                            </button>
                        </div>

                        {audioList.length > 1 && (
                            <div className='flex flex-wrap gap-1 mb-2 max-h-16 overflow-y-auto'>
                                {audioList.map((a) => (
                                    <button
                                        key={a.qari_slug}
                                        type='button'
                                        onClick={() => setSelectedQari(a.qari_slug)}
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                                            selectedQari === a.qari_slug
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        {a.qari_name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <label className='flex items-center justify-between gap-2 px-1 cursor-pointer'>
                            <span className='text-xs text-gray-600 dark:text-gray-400'>
                                {t('audio.continuous') ?? 'Auto-play surah berikutnya'}
                            </span>
                            <input
                                type='checkbox'
                                checked={continuous}
                                onChange={(e) => setContinuous(e.target.checked)}
                                className='accent-emerald-600'
                            />
                        </label>
                    </>
                )}
            </div>
        </div>
    );
}
