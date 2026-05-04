import { listKitabHadith } from '@/lib/const';

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tholabul-ilmi.com';

export async function generateStaticParams() {
    return listKitabHadith.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }) {
    const book = listKitabHadith.find((k) => k.slug === params.slug);
    const title = book
        ? `${book.label} — Hadith`
        : `Hadith — Thullaabul 'Ilmi`;
    const description = book
        ? `Baca koleksi lengkap hadith dari kitab ${book.label}. Telusuri berdasarkan tema dan bab.`
        : `Baca dan pelajari hadith dari berbagai kitab utama: Bukhari, Muslim, Abu Daud, dan lainnya.`;
    const canonicalUrl = `${SITE_URL}/hadith/${params.slug}`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            images: [{ url: '/og', width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og'],
        },
    };
}

export default function HadithSlugLayout({ children }) {
    return children;
}
