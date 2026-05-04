'use client';

import { useAuth } from '@/context/Auth';
import { bookmarkApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';

const BookmarkButton = ({ refType, refId, className = '' }) => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        bookmarkApi
            .list()
            .then((r) => r.json())
            .then((data) => {
                const found = (data?.items ?? []).find(
                    (b) => b.ref_type === refType && b.ref_id === refId
                );
                if (found) {
                    setIsBookmarked(true);
                    setBookmarkId(found.id);
                }
            })
            .catch(() => {});
    }, [isAuthenticated, refType, refId]);

    const toggle = async () => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        setIsLoading(true);
        const prevBookmarked = isBookmarked;
        const prevBookmarkId = bookmarkId;
        try {
            if (isBookmarked) {
                await bookmarkApi.remove(bookmarkId);
                setIsBookmarked(false);
                setBookmarkId(null);
            } else {
                const res = await bookmarkApi.add(refType, refId);
                const data = await res.json();
                setIsBookmarked(true);
                setBookmarkId(data.id);
            }
        } catch {
            setIsBookmarked(prevBookmarked);
            setBookmarkId(prevBookmarkId);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            title={isBookmarked ? 'Hapus Bookmark' : 'Simpan Bookmark'}
            onClick={toggle}
            disabled={isLoading}
            className={`p-2 rounded-lg text-lg transition-colors disabled:opacity-50 ${
                isBookmarked
                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-slate-700'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-emerald-100 dark:hover:bg-slate-700'
            } ${className}`}
        >
            {isBookmarked ? <BsBookmarkFill /> : <BsBookmark />}
        </button>
    );
};

export default BookmarkButton;
