'use client';

import { useEffect, useState } from 'react';

const AdminMutationToast = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        let timeoutId;

        const handleError = (event) => {
            setMessage(event.detail?.message ?? 'Aksi admin gagal diproses.');
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => setMessage(''), 4500);
        };

        window.addEventListener('admin:mutation-error', handleError);

        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener('admin:mutation-error', handleError);
        };
    }, []);

    if (!message) return null;

    return (
        <div
            role='alert'
            className='fixed right-4 top-4 z-[80] max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-lg dark:border-red-900/60 dark:bg-slate-900 dark:text-red-300'
        >
            {message}
        </div>
    );
};

export default AdminMutationToast;
