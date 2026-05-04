'use client';

import BookmarkButton from '@/components/BookmarkButton';
import GradeBadge, { HadithAuthenticity } from '@/components/GradeBadge';
import { PopUpIsCopied, ShareAyah } from '@/components/popup/ListImage';
import { listMasjidImage } from '@/lib/const';
import { CopyImageToClipboard, CopyToClipboard } from '@/lib/copy';
import classNames from 'classnames';
import html2canvas from 'html2canvas';
import { useEffect, useRef, useState } from 'react';
import {
    BsFileEarmarkPlay,
    BsPauseFill,
    BsShare,
    BsThreeDotsVertical,
} from 'react-icons/bs';
import { IoIosLink, IoMdCopy, IoMdImages } from 'react-icons/io';

const HadithPage = ({ params, hadith, book, newLimit, isLast }) => {
    const cardRef = useRef();
    const audioRef = useRef(null);
    const [isCopied, SetIsCopied] = useState(false);
    const [settingPopUp, SetSettingPopUp] = useState(false);
    const [clipboardPopUp, SetClipboardPopUp] = useState(false);
    const [shareImagePopUp, SetShareImagePopUp] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [statusMsg, SetStatusMsg] = useState('');

    const audioSources = (hadith?.media ?? [])
        .map((entry) => entry?.multimedia?.url)
        .filter(Boolean);
    const firstAudioSource = audioSources[0] ?? '';

    const toggleSettingPopUp = () => {
        SetSettingPopUp(!settingPopUp);
    };

    const toggleShareImagePopUp = () => {
        SetShareImagePopUp(!shareImagePopUp);
    };

    const showStatus = (message) => {
        SetStatusMsg(message);
        setTimeout(() => SetStatusMsg(''), 2200);
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setIsPlayingAudio(false);
    };

    const playAudio = async (url) => {
        if (!url) {
            showStatus('Audio hadith belum tersedia');
            return;
        }

        if (!audioRef.current) {
            audioRef.current = new Audio(url);
            audioRef.current.onended = () => setIsPlayingAudio(false);
        } else {
            audioRef.current.src = url;
        }

        try {
            await audioRef.current.play();
            setIsPlayingAudio(true);
        } catch {
            setIsPlayingAudio(false);
            showStatus('Gagal memutar audio hadith');
        }
    };

    const handleAudio = async () => {
        if (!firstAudioSource) {
            showStatus('Audio hadith belum tersedia');
            return;
        }

        if (isPlayingAudio) {
            stopAudio();
            return;
        }

        setAudioLoading(true);
        try {
            await playAudio(firstAudioSource);
        } finally {
            setAudioLoading(false);
        }
    };

    const copyText = (value) => {
        CopyToClipboard(value);
        SetClipboardPopUp(true);
        setTimeout(() => {
            SetClipboardPopUp(false);
        }, 2000);
    };

    useEffect(() => {
        if (!cardRef?.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (isLast && entry.isIntersecting) {
                newLimit();
                observer.unobserve(entry.target);
            }
        });

        observer.observe(cardRef.current);
    }, [isLast, newLimit]);

    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    return (
        <>
            {clipboardPopUp && (
                <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg'>
                    Tersalin ke clipboard!
                </div>
            )}
            {statusMsg && (
                <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg'>
                    {statusMsg}
                </div>
            )}
            {shareImagePopUp ? (
                <ShareAyah
                    images={listMasjidImage}
                    isCopiedCallback={toggleShareImagePopUp}
                    text={`${hadith.translation.ar}\n`
                        .concat(`${hadith.translation.idn}\n`)
                        .concat(
                            `(HR. ${params.slug}: ${hadith.number})\n`.concat(
                                `Via Thullaabul 'Ilmi ${window.location.href}#${hadith.number}`
                            )
                        )}
                />
            ) : (
                ''
            )}
            <ul
                id={`${params.slug}-${hadith.number}`}
                className={classNames({
                    'flex flex-row justify-between font-kitab p-4 border-b border-emerald-100 dark:border-slate-700': true,
                    'bg-parchment-50 dark:bg-slate-800': hadith.number % 2 === 1,
                    'bg-white dark:bg-slate-900': hadith.number % 2 === 0,
                    'text-emerald-900 dark:text-white': true,
                })}
                ref={cardRef}
            >
                <ul className='flex flex-col p-2 space-y-1' style={{ direction: 'ltr' }}>
                    <li className='flex justify-center text-sm font-medium text-gray-500 dark:text-gray-400 pb-1'>
                        {book.slug}:{hadith.number}
                    </li>
                    {hadith.grade && (
                        <li className='flex justify-center'>
                            <GradeBadge grade={hadith.grade} />
                        </li>
                    )}
                    <li className='flex justify-center'>
                        <button
                            title={
                                firstAudioSource
                                    ? isPlayingAudio
                                        ? 'Pause Audio'
                                        : 'Putar Audio'
                                    : 'Audio belum tersedia'
                            }
                            onClick={handleAudio}
                            disabled={audioLoading}
                            className={classNames(
                                'p-2 rounded-lg text-lg transition-colors disabled:opacity-50',
                                firstAudioSource
                                    ? isPlayingAudio
                                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'text-gray-400 dark:text-gray-500 hover:bg-emerald-100 dark:hover:bg-slate-700'
                                    : 'text-gray-300 dark:text-gray-600 hover:bg-emerald-50 dark:hover:bg-slate-800'
                            )}
                        >
                            {audioLoading ? (
                                <span className='text-[10px]'>...</span>
                            ) : isPlayingAudio ? (
                                <BsPauseFill />
                            ) : (
                                <BsFileEarmarkPlay />
                            )}
                        </button>
                    </li>
                    <li className='flex justify-center'>
                        <BookmarkButton refType='hadith' refId={hadith.id} />
                    </li>
                    <li className='flex justify-center'>
                        <button
                            title='Share'
                            onClick={toggleShareImagePopUp}
                            className='p-2 rounded-lg text-lg hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors'
                        >
                            <BsShare />
                        </button>
                    </li>
                    <li className='flex justify-center relative'>
                        <button
                            title='More'
                            onClick={toggleSettingPopUp}
                            className='p-2 rounded-lg text-lg hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors'
                        >
                            <BsThreeDotsVertical />
                        </button>
                        {settingPopUp ? (
                            <div className='absolute left-9 top-0 z-10'>
                                <div className='flex flex-col bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-xl w-40 p-1 shadow-lg text-emerald-900 dark:text-white'>
                                    <button
                                        className='flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors text-left'
                                        onClick={() => {
                                            copyText(
                                                `${window.location.href}#${hadith.number}`
                                            );
                                        }}
                                    >
                                        <IoIosLink />
                                        Copy Link
                                    </button>
                                    <button
                                        className='flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors text-left'
                                        onClick={() => {
                                            SetSettingPopUp(false);
                                            setTimeout(() => {
                                                html2canvas(
                                                    document.getElementById(
                                                        `${params.slug}-${hadith.number}`
                                                    )
                                                ).then((canvas) => {
                                                    CopyImageToClipboard(canvas);
                                                    SetIsCopied(true);
                                                    setTimeout(() => {
                                                        SetIsCopied(false);
                                                    }, 1000);
                                                });
                                            }, 1000);
                                        }}
                                    >
                                        <IoMdImages />
                                        Copy Image
                                    </button>
                                    <button
                                        className='flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors text-left'
                                        onClick={() => {
                                            copyText(
                                                `${hadith.translation.ar}\n`
                                                    .concat(
                                                        `${hadith.translation.idn}\n`
                                                    )
                                                    .concat(
                                                        `(HR. ${params.slug}: ${hadith.number})\n`.concat(
                                                            `Via Thullaabul 'Ilmi ${window.location.href}#${hadith.number}`
                                                        )
                                                    )
                                            );
                                        }}
                                    >
                                        <IoMdCopy />
                                        Copy Text
                                    </button>
                                </div>
                            </div>
                        ) : (
                            ''
                        )}
                    </li>
                </ul>
                <ul
                    className='flex flex-col w-full justify-center'
                    style={{ direction: 'rtl' }}
                >
                    <li className='text-[200%] leading-[2.25]'>{hadith.translation.ar}</li>
                    <li
                        className='text-left p-2 text-base'
                        style={{ direction: 'ltr' }}
                    >
                        {hadith.translation.idn}
                    </li>
                </ul>
            </ul>
            {(hadith.grade ||
                hadith.shahih_by ||
                hadith.dhaif_by ||
                hadith.grade_notes ||
                hadith.sanad) && (
                <div className='px-4 pt-3 pb-1'>
                    <HadithAuthenticity hadith={hadith} />
                </div>
            )}
            <p className='px-4 pt-2 text-[11px] text-gray-400 dark:text-gray-500 text-center'>
                Audio diputar bila media hadith tersedia. Tafsir hadith masih dalam tahap persiapan.
            </p>
            {isCopied ? <PopUpIsCopied /> : <></>}
        </>
    );
};

export default HadithPage;
