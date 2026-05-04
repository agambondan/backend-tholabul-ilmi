'use client';

import BookmarkButton from '@/components/BookmarkButton';
import { PopUpIsCopied, ShareAyah } from '@/components/popup/ListImage';
import { audioApi, mufrodatApi, tafsirApi } from '@/lib/api';
import { useLocale } from '@/context/Locale';
import { listMasjidImage } from '@/lib/const';
import { NumberToArabic } from '@/lib/converter';
import { CopyImageToClipboard, CopyToClipboard } from '@/lib/copy';
import { getLocalizedTranslation } from '@/lib/translation';
import { useQuranFont } from '@/lib/useQuranFont';
import classNames from 'classnames';
import html2canvas from 'html2canvas';
import { useEffect, useRef, useState } from 'react';
import {
    BsBook,
    BsFileEarmarkPlay,
    BsPauseFill,
    BsPlayFill,
    BsShare,
    BsThreeDotsVertical,
    BsTranslate,
} from 'react-icons/bs';
import { IoIosLink, IoMdCopy, IoMdImages } from 'react-icons/io';

const AyahPage = ({ surah, ayah, newLimit, isLast }) => {
    const { t, lang } = useLocale();
    const { fontCls } = useQuranFont();
    const cardRef = useRef();
    const audioRef = useRef(null);
    const [isCopied, SetIsCopied] = useState(false);
    const [settingPopUp, SetSettingPopUp] = useState(false);
    const [clipboardPopUp, SetClipboardPopUp] = useState(false);
    const [shareImagePopUp, SetShareImagePopUp] = useState(false);

    const [tafsirOpen, setTafsirOpen] = useState(false);
    const [tafsir, setTafsir] = useState(null);
    const [tafsirLoading, setTafsirLoading] = useState(false);

    const [mufrodatOpen, setMufrodatOpen] = useState(false);
    const [mufrodat, setMufrodat] = useState(null);
    const [mufrodatLoading, setMufrodatLoading] = useState(false);

    const [audioUrls, setAudioUrls] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const ayahTranslation = getLocalizedTranslation(ayah.translation, lang);

    const copyText = (value) => {
        CopyToClipboard(value);
        SetClipboardPopUp(true);
        setTimeout(() => SetClipboardPopUp(false), 2000);
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
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const toggleTafsir = () => {
        if (!tafsirOpen && !tafsir) {
            setTafsirLoading(true);
            tafsirApi
                .byAyah(ayah.id)
                .then((r) => r.json())
                .then((data) => setTafsir(data?.items ?? data ?? []))
                .catch(() => setTafsir([]))
                .finally(() => setTafsirLoading(false));
        }
        setTafsirOpen((v) => !v);
    };

    const toggleMufrodat = () => {
        if (!mufrodatOpen && !mufrodat) {
            setMufrodatLoading(true);
            mufrodatApi
                .byAyah(ayah.id)
                .then((r) => r.json())
                .then((data) => setMufrodat(data?.items ?? data ?? []))
                .catch(() => setMufrodat([]))
                .finally(() => setMufrodatLoading(false));
        }
        setMufrodatOpen((v) => !v);
    };

    const handleAudio = async () => {
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }

        if (audioUrls.length === 0) {
            setAudioLoading(true);
            try {
                const res = await audioApi.byAyah(ayah.id);
                const data = await res.json();
                const urls = data?.items ?? data ?? [];
                setAudioUrls(urls);
                if (urls.length > 0) {
                    playAudio(urls[0].audio_url);
                }
            } catch {
            } finally {
                setAudioLoading(false);
            }
        } else {
            playAudio(audioUrls[0].audio_url);
        }
    };

    const playAudio = (url) => {
        if (!url) return;
        if (!audioRef.current) {
            audioRef.current = new Audio(url);
            audioRef.current.onended = () => setIsPlaying(false);
        } else {
            audioRef.current.src = url;
        }
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    };

    return (
        <div ref={cardRef} id={`${surah.translation.latin_en}-${ayah.number}`}>
            {clipboardPopUp && (
                <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg'>
                    {t('ayah.copied_to_clipboard')}
                </div>
            )}
            {shareImagePopUp && (
                <ShareAyah
                    images={listMasjidImage}
                    isCopiedCallback={() => SetShareImagePopUp(false)}
                    text={`Allah Subhanahu Wa Ta'ala berfirman:\n`
                        .concat(`${ayah.translation.ar} `)
                        .concat(`۝${NumberToArabic(ayah.number)}\n`)
                        .concat(`${ayah.translation.latin_idn}\n`)
                        .concat(`${ayahTranslation}\n`)
                        .concat(
                            `(QS. ${surah.translation.latin_en} ${surah.number}: ${t('common.verse')} ${ayah.number})\n`.concat(
                                `Via Thullaabul 'Ilmi ${window.location.href}#${ayah.number}`
                            )
                        )}
                />
            )}

            <ul
                className={classNames({
                    [`flex flex-row justify-between ${fontCls} p-4 border-b border-gray-100 dark:border-slate-800`]: true,
                    'bg-gray-50/60 dark:bg-slate-800/35': ayah.number % 2 === 1,
                    'bg-white dark:bg-slate-900': ayah.number % 2 === 0,
                    'text-gray-900 dark:text-white': true,
                })}
            >
                <ul className='flex flex-col p-2 space-y-1' style={{ direction: 'ltr' }}>
                    <li className='flex justify-center text-sm font-medium text-gray-500 dark:text-gray-400 pb-1'>
                        {surah.number}:{ayah.number}
                    </li>
                    <li className='flex justify-center'>
                        <button
                            title={isPlaying ? 'Pause' : 'Putar Audio'}
                            onClick={handleAudio}
                            disabled={audioLoading}
                            className={`p-2 rounded-lg text-lg transition-colors disabled:opacity-50 ${
                                isPlaying
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'text-gray-400 dark:text-gray-500 hover:bg-emerald-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            {audioLoading ? (
                                <span className='text-xs'>...</span>
                            ) : isPlaying ? (
                                <BsPauseFill />
                            ) : (
                                <BsFileEarmarkPlay />
                            )}
                        </button>
                    </li>
                    <li className='flex justify-center'>
                        <button
                            title={t('tafsir.title')}
                            onClick={toggleTafsir}
                            className={`p-2 rounded-lg text-lg transition-colors ${
                                tafsirOpen
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'text-gray-400 dark:text-gray-500 hover:bg-emerald-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <BsBook />
                        </button>
                    </li>
                    <li className='flex justify-center'>
                        <button
                            title={t('ayah.mufrodat_title')}
                            onClick={toggleMufrodat}
                            className={`p-2 rounded-lg text-lg transition-colors ${
                                mufrodatOpen
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'text-gray-400 dark:text-gray-500 hover:bg-emerald-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <BsTranslate />
                        </button>
                    </li>
                    <li className='flex justify-center'>
                        <BookmarkButton refType='ayah' refId={ayah.id} />
                    </li>
                    <li className='flex justify-center'>
                        <button
                            title={t('common.share')}
                            onClick={() => SetShareImagePopUp(true)}
                            className='p-2 rounded-lg text-lg hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors'
                        >
                            <BsShare />
                        </button>
                    </li>
                    <li className='flex justify-center relative'>
                        <button
                            title={t('common.more')}
                            onClick={() => SetSettingPopUp(!settingPopUp)}
                            className='p-2 rounded-lg text-lg hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors'
                        >
                            <BsThreeDotsVertical />
                        </button>
                        {settingPopUp && (
                            <div className='absolute left-9 top-0 z-10'>
                                <div className='flex flex-col bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-xl w-40 p-1 shadow-lg text-emerald-900 dark:text-white'>
                                    <button
                                        className='flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors text-left'
                                        onClick={() =>
                                            copyText(`${window.location.href}#${ayah.number}`)
                                        }
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
                                                        `${surah.translation.latin_en}-${ayah.number}`
                                                    )
                                                ).then((canvas) => {
                                                    CopyImageToClipboard(canvas);
                                                    SetIsCopied(true);
                                                    setTimeout(() => SetIsCopied(false), 1000);
                                                });
                                            }, 1000);
                                        }}
                                    >
                                        <IoMdImages />
                                        Copy Image
                                    </button>
                                    <button
                                        className='flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors text-left'
                                        onClick={() =>
                                            copyText(
                                                `Allah Subhanahu Wa Ta'ala berfirman:\n\n`
                                                    .concat(`${ayah.translation.ar}\n\n`)
                                                    .concat(`${ayah.translation.latin_idn}\n\n`)
                                                    .concat(`${ayahTranslation}\n\n`)
                                                    .concat(
                                                        `(QS. ${surah.translation.latin_en} ${surah.number}: ${t('common.verse')} ${ayah.number})\n`.concat(
                                                            `Via Thullaabul 'Ilmi ${window.location.href}#${ayah.number}`
                                                        )
                                                    )
                                            )
                                        }
                                    >
                                        <IoMdCopy />
                                        Copy Ayah
                                    </button>
                                </div>
                            </div>
                        )}
                    </li>
                </ul>

                <ul className='flex flex-col w-full justify-center' style={{ direction: 'rtl' }}>
                    <li
                        style={{ fontSize: '200%', lineHeight: '2.10' }}
                        dangerouslySetInnerHTML={{
                            __html: (
                                ayah.translation.ar_html ?? ayah.translation.ar
                            ).concat(`&nbsp;&#x06DD;${NumberToArabic(ayah.number)}`),
                        }}
                    />
                    {ayah.translation.latin_idn && (
                        <li
                            className='text-left p-2 text-sm text-gray-500 dark:text-gray-400 italic'
                            style={{ direction: 'ltr' }}
                        >
                            {ayah.translation.latin_idn}
                        </li>
                    )}
                    <li className='text-left p-2' style={{ direction: 'ltr' }}>
                        {ayahTranslation}
                    </li>
                </ul>
            </ul>

            {tafsirOpen && (
                <div className='bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 px-4 py-4'>
                    <p className='text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-3'>
                        {t('ayah.tafsir_label')} {surah.number}:{ayah.number}
                    </p>
                    {tafsirLoading && (
                        <p className='text-sm text-gray-400 dark:text-gray-500'>{t('ayah.loading_tafsir')}</p>
                    )}
                    {!tafsirLoading && Array.isArray(tafsir) && tafsir.length === 0 && (
                        <p className='text-sm text-gray-500 dark:text-gray-400 italic'>
                            {t('ayah.tafsir_empty')}
                        </p>
                    )}
                    {!tafsirLoading &&
                        Array.isArray(tafsir) &&
                        tafsir.map((entry, i) => (
                            <div key={i} className='mb-4 last:mb-0'>
                                {entry.source && (
                                    <p className='text-xs font-medium text-amber-600 dark:text-amber-400 mb-1'>
                                        {entry.source}
                                    </p>
                                )}
                                <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
                                    {entry.text ?? entry.content}
                                </p>
                            </div>
                        ))}
                </div>
            )}

            {mufrodatOpen && (
                <div className='bg-sky-50 dark:bg-sky-900/10 border-b border-sky-100 dark:border-sky-900/30 px-4 py-4'>
                    <p className='text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wide mb-3'>
                        {t('ayah.mufrodat_label')} {surah.number}:{ayah.number}
                    </p>
                    {mufrodatLoading && (
                        <p className='text-sm text-gray-400 dark:text-gray-500'>{t('ayah.loading_mufrodat')}</p>
                    )}
                    {!mufrodatLoading && Array.isArray(mufrodat) && mufrodat.length === 0 && (
                        <p className='text-sm text-gray-500 dark:text-gray-400 italic'>
                            {t('ayah.mufrodat_empty')}
                        </p>
                    )}
                    {!mufrodatLoading && Array.isArray(mufrodat) && (
                        <div className='flex flex-wrap gap-2' style={{ direction: 'rtl' }}>
                            {mufrodat.map((word, i) => (
                                <div
                                    key={i}
                                    className='text-center bg-white dark:bg-slate-800 rounded-lg border border-sky-100 dark:border-slate-700 px-3 py-2 min-w-[60px]'
                                >
                                    <p
                                        className='text-lg font-bold text-emerald-900 dark:text-white mb-0.5'
                                        style={{ fontFamily: 'Amiri, serif' }}
                                    >
                                        {word.arabic}
                                    </p>
                                    {word.transliteration && (
                                        <p className='text-xs italic text-gray-400 dark:text-gray-500 mb-0.5'>
                                            {word.transliteration}
                                        </p>
                                    )}
                                    <p className='text-xs text-gray-600 dark:text-gray-300'>
                                        {word.indonesian ?? word.meaning}
                                    </p>
                                    {word.root_word && (
                                        <p className='text-xs text-sky-500 dark:text-sky-400 mt-0.5'>
                                            {word.root_word}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {isCopied && <PopUpIsCopied />}
        </div>
    );
};

export default AyahPage;
