'use client';
/* eslint-disable react-hooks/exhaustive-deps */

import HadithPage from '@/app/hadith/[slug]/HadithPage';
import Select, { SelectOptionWithLabel } from '@/components/select/Select';
import { SkeletonReader } from '@/components/skeleton/Skeleton';
import AutoScrollButton from '@/components/popup/AutoScrollButton';
import SettingButton from '@/components/popup/SettingButton';
import { listKitabHadith } from '@/lib/const';
import { progressApi, streakApi } from '@/lib/api';
import { useLayoutMode } from '@/lib/useLayoutMode';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const InfiniteScrollHadithPage = ({ params, searchParams }) => {
	const { isWide } = useLayoutMode();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [themes, setThemes] = useState({});
	const [chapters, setChapters] = useState({});
	const [hadiths, setHadiths] = useState({});
	const [selectedTheme, setSelectedTheme] = useState(null);
	const [selectedChapter, setSelectedChapter] = useState(null);

	const [pageHadith, setPageHadith] = useState(0);
	const [isLoadingMoreHadith, setIsLoadingMoreHadith] = useState(false);
	const loadMoreHadith = useCallback(() => {
		setPageHadith((prev) => prev + 1);
	}, []);

	const fetchThemes = async () => {
		let res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/v1/themes/book/${params.slug}`
		);
		return await res.json();
	};
	const fetchChapters = async (themeId) => {
		if (themeId === undefined) {
			themeId = selectedTheme;
		}
		let res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chapters/book/${params.slug}/theme/${themeId}?size=10000`
		);
		return await res.json();
	};
	const fetchHadiths = async (themeId, chapterId, page) => {
		const hash = window.location.hash.split('#');
		let size = 10;
		if (hash.length > 1) {
			if (page === 0) {
				const hashNum = parseInt(hash[1], 10);
				size = hashNum + (hashNum % 10);
			} else {
				page = ((hadiths?.items?.length ?? 0) / 10).toFixed();
			}
		}
		if (themeId === undefined) {
			themeId = selectedTheme;
		}
		if (chapterId === undefined) {
			chapterId = selectedChapter;
		}
		let res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/v1/hadiths/book/${params.slug}/theme/${themeId}/chapter/${chapterId}?&page=${page}&size=${size}`
		);
		return await res.json();
	};

	useEffect(() => {
		fetchThemes()
			.then((res1) => {
				setThemes(res1);
				const requestedThemeId = searchParams?.theme ?? null;
				const requestedChapterId = searchParams?.chapter ?? null;
				const nextThemeId =
					requestedThemeId ??
					res1?.find((item) => item?.theme?.id !== undefined)?.theme?.id ??
					res1?.[0]?.theme?.id;
				setSelectedTheme(nextThemeId);
				fetchChapters(nextThemeId).then((res2) => {
					setChapters(res2);
					const nextChapter =
						res2?.items?.find(
							(item) => String(item?.id) === String(requestedChapterId)
						) ?? res2?.items?.[0];
					const firstChapter = nextChapter;
					if (firstChapter) {
						setSelectedChapter(firstChapter.id);
						fetchHadiths(nextThemeId, firstChapter.id, pageHadith).then(
							(res3) => {
								setHadiths(res3);
								setIsLoading(false);
								const firstHadith = res3?.items?.[0];
								if (firstHadith) {
									progressApi.saveHadith(params.slug, firstHadith.id).catch(() => {});
									streakApi.logActivity('hadith').catch(() => {});
								}
							}
						);
					} else {
						setIsLoading(false);
					}
				});
			})
			.catch(() => {
				setIsError(true);
				setIsLoading(false);
			});
	}, []);

	useEffect(() => {
		if (!isLoading) {
			fetchChapters().then((res) => {
				setChapters(res);
				if (res.items?.length > 0) setSelectedChapter(res.items[0].id);
			});
		}
	}, [selectedTheme]);

	useEffect(() => {
		if (!isLoading) {
			fetchHadiths().then((res) => {
				setHadiths(res);
			});
		}
	}, [selectedChapter]);

	useEffect(() => {
		const hash = window.location.hash.split('#')[1];
		setTimeout(() => {
			if (hash) {
				const element = document.getElementById(hash);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth' });
				}
			}
		}, 3000);
	}, []);

	useEffect(() => {
		if (pageHadith !== 0 && pageHadith * 10 <= (hadiths?.total ?? 0)) {
			setIsLoadingMoreHadith(true);
			fetchHadiths(selectedTheme, selectedChapter, pageHadith).then((res) => {
				setHadiths({ ...hadiths, items: [...(hadiths?.items ?? []), ...(res?.items ?? [])] });
				setIsLoadingMoreHadith(false);
			});
		}
	}, [pageHadith]);

	if (isLoading) return <SkeletonReader />;
	if (isError)
		return (
			<div className='flex flex-col items-center justify-center min-h-[40vh] text-center px-4'>
				<p className='text-4xl mb-3'>⚠️</p>
				<h2 className='text-lg font-bold text-emerald-900 dark:text-white mb-2'>
					Gagal Memuat Hadith
				</h2>
				<p className='text-sm text-gray-500 dark:text-gray-400'>
					Server API tidak dapat dijangkau. Pastikan server backend berjalan.
				</p>
			</div>
		);
	const book = listKitabHadith.find((x) => x.slug === params.slug);
	return (
		<div className={isWide ? 'w-full' : 'max-w-4xl mx-auto'}>
			{book && (
				<div className='text-center py-6 px-4 border-b border-emerald-100 dark:border-slate-700 mb-4'>
					<p
						className='text-2xl text-emerald-700 dark:text-emerald-400 mb-1'
						style={{ fontFamily: 'Amiri, serif' }}
					>
						الْحَدِيث
					</p>
					<h1 className='text-xl font-bold text-emerald-900 dark:text-white mb-0.5'>
						{book.label}
					</h1>
					<p className='text-sm text-gray-500 dark:text-gray-400'>
						Kumpulan hadith dari kitab {book.label}
					</p>
				</div>
			)}
			<div className='flex flex-col space-y-3 px-4'>
				<SelectOptionWithLabel
					id={'riwayat'}
					label={'Pilih Periwayat'}
					customClassName={''}
					callbackOnChange={(event) => {
						router.push(`/hadith/${event.target.value}`);
					}}
					defaultValue={params.slug}
				>
					{listKitabHadith.map((item) => {
						return (
							<Select.Option key={item.slug} value={item.slug}>
								{item.label}
							</Select.Option>
						);
					})}
				</SelectOptionWithLabel>
				<SelectOptionWithLabel
					id={'theme'}
					label={'Pilih Kitab'}
					customClassName={''}
					callbackOnChange={(event) => {
						setSelectedTheme(event.target.value);
					}}
				>
					{themes.map((item) => (
						<Select.Option key={item.theme.id} value={item.theme.id}>
							{item.theme.translation?.en ?? item.theme.translation?.idn ?? `Kitab ${item.theme.id}`}
						</Select.Option>
					))}
				</SelectOptionWithLabel>
				<SelectOptionWithLabel
					id={'chapter'}
					label={'Pilih Bab'}
					customClassName={''}
					callbackOnChange={(event) => {
						setSelectedChapter(event.target.value);
					}}
				>
					{(chapters?.items ?? []).map((item) => (
						<Select.Option key={item.id} value={item.id}>
							{item.translation?.en ?? item.translation?.idn ?? `Bab ${item.id}`}
						</Select.Option>
					))}
				</SelectOptionWithLabel>
			</div>
			<div className='flex flex-col pt-4'>
				{(hadiths?.items ?? []).map((hadith, index) => (
					<HadithPage
						params={params}
						book={book}
						hadith={hadith}
						key={hadith.id}
						newLimit={loadMoreHadith}
						isLast={index === (hadiths?.items?.length ?? 0) - 2}
					/>
				))}
			</div>
			{isLoadingMoreHadith ? <SkeletonReader /> : <></>}
			<AutoScrollButton />
			<SettingButton />
		</div>
	);
};

export default InfiniteScrollHadithPage;
