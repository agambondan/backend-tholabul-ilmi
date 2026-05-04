import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { BsEnvelope, BsGithub, BsInstagram, BsTwitter } from 'react-icons/bs';

export const metadata = {
    title: "Kontak — Thullaabul 'Ilmi",
    description: 'Hubungi tim Thullaabul Ilmi — saran, laporan bug, dan kolaborasi.',
};

const contacts = [
    {
        icon: BsEnvelope,
        label: 'Email',
        value: 'admin@tholabul-ilmi.com',
        href: 'mailto:admin@tholabul-ilmi.com',
        desc: 'Untuk pertanyaan, saran, atau laporan bug',
    },
    {
        icon: BsGithub,
        label: 'GitHub',
        value: 'github.com/tholabul-ilmi',
        href: 'https://github.com/tholabul-ilmi',
        desc: 'Source code, issue tracker, dan kontribusi',
    },
    {
        icon: BsInstagram,
        label: 'Instagram',
        value: '@tholabul.ilmi',
        href: 'https://instagram.com/tholabul.ilmi',
        desc: 'Update fitur dan konten islami harian',
    },
    {
        icon: BsTwitter,
        label: 'X / Twitter',
        value: '@tholabululmi',
        href: 'https://twitter.com/tholabululmi',
        desc: 'Diskusi dan pengumuman terbaru',
    },
];

const faqs = [
    {
        q: 'Apakah API bisa digunakan secara gratis?',
        a: 'Ya, API publik kami tersedia gratis untuk penggunaan non-komersial. Lihat halaman Developer untuk daftar endpoint yang tersedia.',
    },
    {
        q: 'Bagaimana cara melaporkan data yang salah?',
        a: 'Buka issue di GitHub kami atau kirim email dengan menyertakan surah/ayat/hadith yang dimaksud beserta koreksinya.',
    },
    {
        q: 'Apakah ada aplikasi mobile?',
        a: 'Aplikasi mobile sedang dalam pengembangan. Pantau terus update di Instagram dan GitHub kami.',
    },
    {
        q: 'Bagaimana cara berkontribusi konten?',
        a: 'Kami menerima kontribusi terjemahan, tafsir, dan konten islami lainnya. Hubungi kami via email untuk informasi lebih lanjut.',
    },
];

export default function ContactPage() {
    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='max-w-3xl mx-auto px-4 py-8'>
                    {/* Header */}
                    <div className='mb-10'>
                        <p
                            className='text-3xl text-emerald-700 dark:text-emerald-400 mb-2'
                            style={{ fontFamily: 'Amiri, serif' }}
                        >
                            تَوَاصَلْ مَعَنَا
                        </p>
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            Hubungi Kami
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            Ada saran, temuan bug, atau ingin berkolaborasi? Kami senang mendengar dari kamu.
                        </p>
                    </div>

                    {/* Contact cards */}
                    <div className='grid sm:grid-cols-2 gap-4 mb-10'>
                        {contacts.map(({ icon: Icon, label, value, href, desc }) => (
                            <a
                                key={label}
                                href={href}
                                target={href.startsWith('mailto') ? undefined : '_blank'}
                                rel='noopener noreferrer'
                                className='group flex items-start gap-4 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all'
                            >
                                <div className='w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/60 transition-colors'>
                                    <Icon className='text-emerald-700 dark:text-emerald-300' size={18} />
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5'>
                                        {label}
                                    </p>
                                    <p className='text-sm font-medium text-emerald-900 dark:text-white truncate'>
                                        {value}
                                    </p>
                                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug'>
                                        {desc}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* FAQ */}
                    <div>
                        <h2 className='text-base font-bold text-emerald-900 dark:text-white mb-4'>
                            Pertanyaan Umum
                        </h2>
                        <div className='flex flex-col gap-3'>
                            {faqs.map(({ q, a }) => (
                                <div
                                    key={q}
                                    className='border border-gray-100 dark:border-slate-700 rounded-2xl px-4 py-4'
                                >
                                    <p className='text-sm font-semibold text-emerald-900 dark:text-white mb-1'>
                                        {q}
                                    </p>
                                    <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed'>
                                        {a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className='mt-10 text-center text-xs text-gray-400 dark:text-gray-600'>
                        Kami berusaha membalas dalam 1–3 hari kerja.
                    </p>
                </div>
            </Section>
            <Footer />
        </main>
    );
}
