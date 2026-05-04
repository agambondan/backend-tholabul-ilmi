'use client';
/* eslint-disable @next/next/no-img-element */

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { SkeletonList } from '@/components/skeleton/Skeleton';
import { blogApi } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const normalizeItems = (data) => data?.items ?? data?.data ?? data ?? [];

const normalizeText = (value) => String(value ?? '').trim().toLowerCase();

const formatDate = (value) => {
    if (!value) return '';
    try {
        return new Date(value).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return '';
    }
};

const BlogDetailPage = ({ params }) => {
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [popularPosts, setPopularPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isActive = true;

        const load = async () => {
            setIsLoading(true);
            setError(false);
            setPost(null);
            setRelatedPosts([]);
            setPopularPosts([]);

            try {
                const [detailRes, listRes] = await Promise.allSettled([
                    blogApi.detail(params.slug),
                    blogApi.list(0, 50),
                ]);

                if (detailRes.status !== 'fulfilled' || !detailRes.value.ok) {
                    throw new Error('failed to load detail');
                }

                const detailData = await detailRes.value.json();
                if (!detailData || detailData.error) {
                    throw new Error('empty detail');
                }

                if (!isActive) return;
                setPost(detailData);

                if (listRes.status === 'fulfilled' && listRes.value.ok) {
                    const blogList = normalizeItems(await listRes.value.json());
                    const currentSlug = normalizeText(detailData.slug ?? params.slug);
                    const currentCategory = normalizeText(detailData.category);
                    const currentTags = new Set(
                        Array.isArray(detailData.tags)
                            ? detailData.tags.map(normalizeText).filter(Boolean)
                            : [],
                    );

                    const related = blogList
                        .filter((item) => normalizeText(item.slug ?? item.id) !== currentSlug)
                        .filter((item) => {
                            const itemCategory = normalizeText(item.category);
                            const itemTags = Array.isArray(item.tags)
                                ? item.tags.map(normalizeText).filter(Boolean)
                                : [];

                            if (currentCategory && itemCategory === currentCategory) return true;
                            return itemTags.some((tag) => currentTags.has(tag));
                        })
                        .sort((a, b) => {
                            const aDate = new Date(a.published_at ?? a.created_at ?? 0).getTime();
                            const bDate = new Date(b.published_at ?? b.created_at ?? 0).getTime();
                            return bDate - aDate;
                        })
                        .slice(0, 4);

                    const popular = blogList
                        .filter((item) => normalizeText(item.slug ?? item.id) !== currentSlug)
                        .sort(
                            (a, b) =>
                                (b.view_count ?? 0) - (a.view_count ?? 0) ||
                                new Date(b.published_at ?? b.created_at ?? 0).getTime() -
                                    new Date(a.published_at ?? a.created_at ?? 0).getTime(),
                        )
                        .slice(0, 3);

                    if (isActive) {
                        setRelatedPosts(related);
                        setPopularPosts(popular);
                    }
                }
            } catch {
                if (isActive) setError(true);
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        load();

        return () => {
            isActive = false;
        };
    }, [params.slug]);

    if (isLoading) return <SkeletonList title={false} rows={5} />;

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-4xl'>
                    <Link
                        href='/blog'
                        className='inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:underline mb-6'
                    >
                        ← Kembali ke Artikel
                    </Link>

                    {error && (
                        <div className='text-center py-12'>
                            <p className='text-gray-500 dark:text-gray-400'>
                                Artikel tidak ditemukan.
                            </p>
                        </div>
                    )}

                    {post && (
                        <article className='bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden'>
                            <div className='p-5 md:p-8'>
                                {post.category && (
                                    <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-3 block'>
                                        {post.category}
                                    </span>
                                )}
                                <h1 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-snug'>
                                    {post.title}
                                </h1>
                                <div className='flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-6 pb-6 border-b border-gray-100 dark:border-slate-700'>
                                    {post.author && <span>Oleh {post.author}</span>}
                                    {post.published_at && (
                                        <span>{formatDate(post.published_at)}</span>
                                    )}
                                    {post.view_count != null && (
                                        <span>{post.view_count.toLocaleString()} dibaca</span>
                                    )}
                                </div>

                                {post.cover_image && (
                                    <img
                                        src={post.cover_image}
                                        alt={post.title}
                                        className='w-full rounded-xl mb-6 max-h-80 object-cover'
                                    />
                                )}

                                <div className='text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 text-sm'>
                                    {post.content
                                        ?.split('\n')
                                        .filter(Boolean)
                                        .map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                </div>
                            </div>

                            {post.tags && post.tags.length > 0 && (
                                <div className='flex gap-2 flex-wrap px-5 md:px-8 py-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40'>
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className='px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full text-xs'
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {(relatedPosts.length > 0 || popularPosts.length > 0) && (
                                <div className='p-5 md:p-8 border-t border-gray-100 dark:border-slate-800 space-y-8'>
                                    {relatedPosts.length > 0 && (
                                        <section>
                                            <div className='flex items-center justify-between gap-3 mb-4'>
                                                <div>
                                                    <p className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide'>
                                                        Artikel Terkait
                                                    </p>
                                                    <h2 className='text-lg font-bold text-gray-900 dark:text-white'>
                                                        Lanjut membaca
                                                    </h2>
                                                </div>
                                            </div>

                                            <div className='grid gap-3 md:grid-cols-2'>
                                                {relatedPosts.map((item) => (
                                                    <Link
                                                        key={item.id ?? item.slug}
                                                        href={`/blog/${item.slug}`}
                                                        className='block rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all'
                                                    >
                                                        {item.category && (
                                                            <p className='text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2'>
                                                                {item.category}
                                                            </p>
                                                        )}
                                                        <h3 className='font-bold text-gray-900 dark:text-white line-clamp-2 mb-2'>
                                                            {item.title}
                                                        </h3>
                                                        {item.excerpt && (
                                                            <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
                                                                {item.excerpt}
                                                            </p>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {popularPosts.length > 0 && (
                                        <section>
                                            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3'>
                                                Artikel Populer
                                            </p>
                                            <div className='space-y-3'>
                                                {popularPosts.map((item) => (
                                                    <Link
                                                        key={item.id ?? item.slug}
                                                        href={`/blog/${item.slug}`}
                                                        className='flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 px-4 py-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors'
                                                    >
                                                        <div className='min-w-0'>
                                                            <h3 className='font-medium text-gray-900 dark:text-white line-clamp-1'>
                                                                {item.title}
                                                            </h3>
                                                            <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                                                {formatDate(item.published_at ?? item.created_at)}
                                                            </p>
                                                        </div>
                                                        {item.view_count != null && (
                                                            <span className='shrink-0 text-xs font-semibold text-emerald-700 dark:text-emerald-300'>
                                                                {item.view_count.toLocaleString()} dibaca
                                                            </span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}
                        </article>
                    )}
                </div>
            </Section>
            <Footer />
        </main>
    );
};

export default BlogDetailPage;
