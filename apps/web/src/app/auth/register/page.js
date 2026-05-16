'use client';

import { useAuth } from '@/context/Auth';
import { useLocale } from '@/context/Locale';
import { buildLoginHref, getSafeNextPath } from '@/lib/authRedirect';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

const RegisterPage = () => {
    const { register, isAuthenticated, isLoading: authLoading } = useAuth();
    const { t } = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const nextUrl = getSafeNextPath(searchParams.get('next'), '/dashboard');

    useEffect(() => {
        if (authLoading) return;
        if (isAuthenticated) router.replace(nextUrl);
    }, [isAuthenticated, authLoading, nextUrl, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(name, email, password);
            router.push(`${buildLoginHref(nextUrl)}&registered=1`);
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
                        {t('auth.register_title')}
                    </h2>

                    {error && (
                        <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400'>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                                {t('auth.name')}
                            </label>
                            <input
                                type='text'
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                placeholder={t('auth.name_placeholder')}
                            />
                        </div>
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
                            <div className='relative'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='w-full px-3 py-2 pr-10 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                                    placeholder={t('auth.min_chars')}
                                />
                                <button
                                    type='button'
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                    onClick={() => setShowPassword((current) => !current)}
                                    className='absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-emerald-700 dark:text-gray-300 dark:hover:text-emerald-300'
                                >
                                    {showPassword ? <BsEyeSlash /> : <BsEye />}
                                </button>
                            </div>
                        </div>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors'
                        >
                            {isLoading ? t('auth.processing') : t('auth.register_btn')}
                        </button>
                    </form>

                    <p className='mt-5 text-center text-sm text-gray-500 dark:text-gray-400'>
                        {t('auth.have_account')}{' '}
                        <Link
                            href={buildLoginHref(nextUrl)}
                            className='text-emerald-600 dark:text-emerald-400 font-medium hover:underline'
                        >
                            {t('auth.login_here')}
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default function RegisterPageWrapper() {
    return (
        <Suspense>
            <RegisterPage />
        </Suspense>
    );
}
