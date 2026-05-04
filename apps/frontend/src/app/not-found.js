import Link from 'next/link';

export const metadata = {
    title: 'Halaman Tidak Ditemukan',
    robots: { index: false, follow: false },
};

const QUICK_LINKS = [
    { href: '/quran', label: 'Al-Quran' },
    { href: '/hadith', label: 'Hadith' },
    { href: '/doa', label: 'Doa' },
    { href: '/dzikir', label: 'Dzikir' },
    { href: '/blog', label: 'Blog' },
];

export default function NotFound() {
    return (
        <div className='min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center px-4'>
            <div className='text-center max-w-md'>
                <div className='text-8xl font-black text-emerald-100 dark:text-emerald-900/40 leading-none mb-2 select-none'>
                    404
                </div>
                <h1 className='text-xl font-bold text-emerald-900 dark:text-white mb-2'>
                    Halaman Tidak Ditemukan
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed'>
                    Halaman yang kamu cari tidak ada atau sudah dipindahkan.
                </p>

                <div className='flex flex-wrap gap-2 justify-center mb-8'>
                    {QUICK_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className='text-xs px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors'
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <Link
                    href='/'
                    className='inline-block bg-emerald-700 hover:bg-emerald-600 text-white text-sm px-6 py-2.5 rounded-full transition-colors font-medium'
                >
                    Ke Beranda
                </Link>
            </div>
        </div>
    );
}
