'use client';

import SirahForm from '../_SirohForm';
import { useLocale } from '@/context/Locale';

const NewSirahPage = () => {
    const { t } = useLocale();

    return (
        <div className='p-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
                {t('admin.sirah.new_content')}
            </h1>
            <SirahForm />
        </div>
    );
};

export default NewSirahPage;
