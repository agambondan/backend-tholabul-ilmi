import HadithPage from '@/app/hadith/[slug]/HadithPage';
import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { listKitabHadith } from '@/lib/const';

const Page = async ({ params }) => {
	const slugLowercase = (params.slug ?? '').replaceAll('-', ' ').toLowerCase();

	let hadiths = [];
	let isError = false;

	try {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/v1/hadiths/theme/slug/${slugLowercase}?size=1`
		);
		const tempHadiths = await res.json();
		const total = tempHadiths?.total ?? 0;

		let page = 0;
		while (hadiths.length < total) {
			const pageRes = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/v1/hadiths/theme/slug/${slugLowercase}?size=1000&page=${page}`
			);
			const data = await pageRes.json();
			hadiths = hadiths.concat(data?.items ?? []);
			page++;
			if (!data?.items?.length) break;
		}
	} catch {
		isError = true;
	}

	return (
		<main className='min-h-screen flex flex-col'>
			<NavbarTailwindCss />
			<Section>
				{isError ? (
					<div className='flex flex-col items-center justify-center min-h-[50vh] text-center px-4'>
						<p className='text-4xl mb-3'>⚠️</p>
						<h2 className='text-lg font-bold text-emerald-900 dark:text-white mb-2'>
							Gagal Memuat Hadith
						</h2>
						<p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
							Server API tidak dapat dijangkau. Pastikan backend berjalan lalu refresh halaman.
						</p>
					</div>
				) : (
				<div className='max-w-4xl mx-auto dark:text-white'>
					<div className='flex flex-col pt-4'>
						{hadiths.map((hadith) => {
							const book = listKitabHadith.find((x) => x.id === hadith.book_id);
							return (
								<HadithPage params={params} book={book} hadith={hadith} key={hadith.id} />
							);
						})}
					</div>
				</div>
				)}
			</Section>
			<Footer />
		</main>
	);
};

export default Page;
