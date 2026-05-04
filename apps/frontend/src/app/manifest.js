export default function manifest() {
    return {
        name: "Thullaabul 'Ilmi",
        short_name: 'TI',
        description:
            'Portal Ilmu Islam — Al-Quran, Hadith, Doa & Dzikir, Hafalan, dan lebih banyak lagi.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#065f46',
        theme_color: '#065f46',
        icons: [
            {
                src: '/icon',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/apple-icon',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
        categories: ['education', 'religion', 'lifestyle'],
    };
}
