'use client';

import { useLayoutMode } from '@/lib/useLayoutMode';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { RiSettings3Fill } from 'react-icons/ri';
import { TbLayoutDistributeHorizontal, TbLayoutSidebarRight } from 'react-icons/tb';

const SettingButton = ({ isShowFixedComponent }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [showFixedComponent, setShowFixedComponent] = useState(false);
    const { isWide, setLayout } = useLayoutMode();
    const popupRef = useRef(null);

    useEffect(() => {
        let timeoutId;

        const handleScroll = () => {
            setShowFixedComponent(true);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setShowFixedComponent(false), 2000);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (!showPopup) return;
        const handler = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setShowPopup(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showPopup]);

    return (
        <div
            ref={popupRef}
            className={classNames({
                'fixed right-2 z-10': true,
                'bottom-[70px]':
                    showFixedComponent && isShowFixedComponent === undefined,
                'bottom-2':
                    !showFixedComponent && isShowFixedComponent === undefined,
                // eslint-disable-next-line no-dupe-keys
                'bottom-2': isShowFixedComponent,
            })}
        >
            <button
                className='dark:bg-slate-200 bg-slate-800 dark:text-black text-white rounded-full p-3 shadow hover:opacity-80 transition-opacity'
                onClick={() => setShowPopup((p) => !p)}
                title='Pengaturan'
            >
                <RiSettings3Fill size={24} />
            </button>

            {showPopup && (
                <div className='absolute right-0 bottom-16 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-xl w-52 p-3 shadow-lg text-sm text-emerald-900 dark:text-white'>
                    <p className='font-semibold mb-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                        Pengaturan
                    </p>

                    {/* Layout toggle */}
                    <div className='mb-1'>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mb-2'>
                            Tampilan Ayat
                        </p>
                        <div className='flex gap-2'>
                            <button
                                onClick={() => setLayout(false)}
                                className={classNames(
                                    'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-all',
                                    {
                                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold':
                                            !isWide,
                                        'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-500':
                                            isWide,
                                    }
                                )}
                            >
                                <TbLayoutSidebarRight size={18} />
                                Kompak
                            </button>
                            <button
                                onClick={() => setLayout(true)}
                                className={classNames(
                                    'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-all',
                                    {
                                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold':
                                            isWide,
                                        'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-500':
                                            !isWide,
                                    }
                                )}
                            >
                                <TbLayoutDistributeHorizontal size={18} />
                                Wide
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingButton;
