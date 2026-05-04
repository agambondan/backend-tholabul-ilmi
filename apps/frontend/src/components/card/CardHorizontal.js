'use client';

const CardHorizontal = ({ surat }) => {
    const arabicName = surat.translation.ar.replace('سُورَةُ', '').trim();

    return (
        <div className='sm:m-1.5 mx-2 my-1.5'>
            <div className='bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-xl p-3 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group cursor-pointer'>
                <div className='flex items-center gap-3'>
                    {/* Surah number badge */}
                    <div className='w-9 h-9 flex-shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors'>
                        <span className='text-xs font-bold text-emerald-800 dark:text-emerald-300'>
                            {surat.number}
                        </span>
                    </div>

                    {/* Name + detail */}
                    <div className='flex-1 min-w-0'>
                        <p className='font-semibold text-emerald-900 dark:text-white text-sm truncate'>
                            {surat.translation.latin_en}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate'>
                            {surat.revelation_type} &middot; {surat.translation.idn} &middot;{' '}
                            {surat.number_of_ayahs} Ayat
                        </p>
                    </div>

                    {/* Arabic name */}
                    <span
                        className='flex-shrink-0 text-xl text-emerald-700 dark:text-emerald-300'
                        style={{ fontFamily: 'Uthmani, serif', direction: 'rtl' }}
                    >
                        {arabicName}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CardHorizontal;
