'use client';

import { useAuth } from '@/context/Auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useRequireAuth = () => {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (auth.isLoading) return;
        if (!auth.isAuthenticated) {
            router.push('/auth/login');
        }
    }, [auth.isLoading, auth.isAuthenticated, router]);

    return auth;
};
