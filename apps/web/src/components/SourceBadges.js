'use client';

import Link from 'next/link';

// Maps regex-captured kitab name (lowercased, no spaces) → internal hadith book slug
const SLUG_MAP = {
    bukhari: 'bukhari',
    muslim: 'muslim',
    abudawud: 'abu-daud',
    tirmidzi: 'tirmidzi',
    ibnumajah: 'ibnu-majah',
    nasai: 'nasai',
};

function parseSource(source) {
    if (!source) return [];
    return source
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((part) => {
            const hrMatch = part.match(
                /HR\.\s*(Bukhari|Muslim|Abu Dawud|Tirmidzi|Ibnu Majah|Nasai|Ahmad)\s+No\.\s*(\d+)/i,
            );
            if (hrMatch) {
                const key = hrMatch[1].toLowerCase().replaceAll(' ', '');
                const no = hrMatch[2];
                const slug = SLUG_MAP[key];
                if (!slug) return { text: part, url: null };
                return { text: part, url: `/hadith/${slug}#${no}` };
            }
            const qsMatch = part.match(/QS\.\s*([^:]+):\s*(\d+)/i);
            if (qsMatch) {
                const surah = qsMatch[1].trim().toLowerCase().replaceAll(' ', '-');
                const ayat = qsMatch[2];
                return { text: part, url: `/quran/${surah}#${ayat}` };
            }
            return { text: part, url: null };
        });
}

export default function SourceBadges({ source }) {
    if (!source) return null;
    const refs = parseSource(source);
    if (refs.length === 0) return null;

    return (
        <div className='flex flex-wrap gap-x-2 gap-y-1 mt-1'>
            {refs.map((ref, i) =>
                ref.url ? (
                    <Link
                        key={i}
                        href={ref.url}
                        className='text-xs text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300'
                    >
                        {ref.text}
                    </Link>
                ) : (
                    <span key={i} className='text-xs text-gray-400 dark:text-gray-500'>
                        {ref.text}
                    </span>
                ),
            )}
        </div>
    );
}
