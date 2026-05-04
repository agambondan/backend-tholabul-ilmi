const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tholabul-ilmi.com';

async function getSirohContent(id) {
    try {
        const res = await fetch(`${API_URL}/api/v1/siroh/contents/${id}`, {
            next: { revalidate: 86400 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const content = await getSirohContent(params.id);

    const title = content?.title
        ? `${content.title} — Siroh Nabawiyah`
        : `Siroh Nabawiyah — Thullaabul 'Ilmi`;
    const description =
        content?.summary ??
        content?.excerpt ??
        `Baca Siroh Nabawiyah — biografi Nabi Muhammad ﷺ dalam format bab-bab yang mudah dipahami.`;

    const canonicalUrl = `${SITE_URL}/siroh/${params.id}`;

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

export default function SirohDetailLayout({ children }) {
    return children;
}
