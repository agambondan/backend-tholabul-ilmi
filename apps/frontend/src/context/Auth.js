'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const refreshingRef = useRef(null);

    useEffect(() => {
        const stored =
            typeof window !== 'undefined'
                ? localStorage.getItem('auth_token')
                : null;
        if (stored) {
            setToken(stored);
            fetchMe(stored).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const doRefresh = async () => {
        if (refreshingRef.current) return refreshingRef.current;

        refreshingRef.current = (async () => {
            try {
                const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!res.ok) {
                    clearSession();
                    return null;
                }
                const data = await res.json();
                const newToken = data.token ?? data.access_token;
                if (!newToken) {
                    clearSession();
                    return null;
                }
                localStorage.setItem('auth_token', newToken);
                setToken(newToken);
                return newToken;
            } catch {
                clearSession();
                return null;
            } finally {
                refreshingRef.current = null;
            }
        })();

        return refreshingRef.current;
    };

    const clearSession = () => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    };

    const fetchMe = async (tok) => {
        try {
            const res = await fetch(`${API_URL}/api/v1/users/me`, {
                credentials: 'include',
                headers: { Authorization: `Bearer ${tok}` },
            });
            if (res.ok) {
                setUser(await res.json());
                return true;
            }
            if (res.status === 401) {
                const newToken = await doRefresh();
                if (newToken) {
                    const retry = await fetch(`${API_URL}/api/v1/users/me`, {
                        credentials: 'include',
                        headers: { Authorization: `Bearer ${newToken}` },
                    });
                    if (retry.ok) {
                        setUser(await retry.json());
                        return true;
                    }
                }
                clearSession();
            }
        } catch {
            clearSession();
        }
        return false;
    };

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login gagal');
        const tok = data.token ?? data.access_token;
        localStorage.setItem('auth_token', tok);
        setToken(tok);
        setUser(data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const res = await fetch(`${API_URL}/api/v1/auth/register`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registrasi gagal');
        return data;
    };

    const refetchUser = () => {
        const tok =
            typeof window !== 'undefined'
                ? localStorage.getItem('auth_token')
                : null;
        if (tok) fetchMe(tok);
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/api/v1/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // best effort
        }
        clearSession();
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isLoading,
                isAuthenticated: !!token,
                login,
                register,
                logout,
                refetchUser,
                doRefresh,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
