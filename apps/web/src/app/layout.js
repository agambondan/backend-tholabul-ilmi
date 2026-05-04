import './globals.css';
import { AuthProvider } from '@/context/Auth';
import { LocaleProvider } from '@/context/Locale';

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tholabul-ilmi.com';

const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "Thullaabul 'Ilmi",
    url: SITE_URL,
    description:
        'Portal Ilmu Islam — Al-Quran, Hadith, Doa, Dzikir, Asmaul Husna, Siroh, dan 30+ fitur lainnya.',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
};

export const metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tholabul-ilmi.com',
    ),
    title: { default: "Thullaabul 'Ilmi", template: "%s — Thullaabul 'Ilmi" },
    description:
        "Thullaabul 'Ilmi — Portal Ilmu Islam lengkap: Al-Quran 30 Juz dengan Tajweed berwarna, Tafsir, Mufrodat, Audio Murotal, 9 Kitab Hadith Shahih, Doa Harian, Dzikir, Asmaul Husna, Siroh Nabawiyah, Hafalan Tracker, Tilawah Tracker, Amalan Harian, Kalender Hijriah, Leaderboard, Blog Islami, dan 30+ fitur lainnya.",
    keywords: [
        'Al-Quran online',
        'hadith shahih',
        'tafsir quran',
        'tajweed berwarna',
        'audio murotal',
        'mufrodat quran',
        'asbabun nuzul',
        'doa harian',
        'dzikir pagi petang',
        'asmaul husna',
        'siroh nabawiyah',
        'hafalan quran',
        'tilawah tracker',
        'amalan harian',
        'kalender hijriah',
        'leaderboard hafalan',
        'blog islami',
        'ilmu islam',
        'portal islam',
        'belajar quran',
    ],
    openGraph: {
        title: "Thullaabul 'Ilmi",
        description:
            "Portal Ilmu Islam — Al-Quran, Hadith, Doa, Dzikir, Asmaul Husna, Siroh, Hafalan Tracker, Tilawah, Amalan Harian, Kalender Hijriah, dan 30+ fitur lainnya.",
        type: 'website',
        locale: 'id_ID',
        images: [{ url: '/og', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: "Thullaabul 'Ilmi",
        description:
            "Portal Ilmu Islam — Al-Quran, Hadith, Doa, Dzikir, dan 30+ fitur lainnya.",
        images: ['/og'],
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang='id'>
            <body>
                <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(websiteJsonLd),
                    }}
                />
                <LocaleProvider>
                    <AuthProvider>{children}</AuthProvider>
                </LocaleProvider>
            </body>
        </html>
    );
}
