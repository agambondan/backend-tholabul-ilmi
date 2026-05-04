'use client';

import { useAuth } from '@/context/Auth';
import { useLocale } from '@/context/Locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LoginPage = () => {
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const { t } = useLocale();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (isAuthenticated) router.replace('/');
    }, [isAuthenticated, authLoading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            router.push('/');
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <main className='min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <Link href='/' className='inline-block'>
                        <h1 className='text-2xl font-extrabold text-emerald-800 dark:text-emerald-400'>
                            Thullaabul &apos;Ilmi
                        </h1>
                        <p
                            className='text-sm text-emerald-600 dark:text-emerald-500'
                            style={{ fontFamily: 'Amiri, serif' }}
                        >
                            طُلَّابُ الْعِلْمِ
                        </p>
                    </Link>
                </div>

                <div className='bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8'>
                    <h2 className='text-xl font-bold text-emerald-900 dark:text-white mb-6'>
                        {t('auth.sign_in_title')}
                    </h2>

                    {error && (
                        <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400'>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                {t('auth.email')}
                            </label>
                            <input
                                type='email'
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                placeholder='nama@email.com'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                {t('auth.password')}
                            </label>
                            <input
                                type='password'
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                placeholder='••••••••'
                            />
                        </div>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors'
                        >
                            {isLoading ? t('auth.processing') : t('auth.login_btn')}
                        </button>
                    </form>

                    <p className='mt-5 text-center text-sm text-gray-500 dark:text-gray-400'>
                        {t('auth.no_account')}{' '}
                        <Link
                            href='/auth/register'
                            className='text-emerald-600 dark:text-emerald-400 font-medium hover:underline'
                        >
                            {t('auth.register_now')}
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;
