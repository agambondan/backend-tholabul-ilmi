'use client';

export const dynamic = 'force-dynamic';

import { Spinner3 } from '@/components/spinner/Spinner';
import { useLocale } from '@/context/Locale';
import { adminSirohApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import SirahForm from '../../_SirohForm';

const EditSirahPage = ({ params }) => {
    const { t } = useLocale();
    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        adminSirohApi
            .listContents()
            .then((r) => r.json())
            .then((data) => {
                const items = data?.items ?? data ?? [];
                const found = items.find((c) => String(c.id) === String(params.id));
                if (found) setItem(found);
                else setError(true);
            })
            .catch(() => setError(true))
            .finally(() => setIsLoading(false));
    }, [params.id]);

    if (isLoading) return <Spinner3 />;

    if (error) {
        return (
            <div className='p-8'>
                <p className='text-red-500 dark:text-red-400'>{t('admin.sirah.content_not_found')}</p>
            </div>
        );
    }

    return (
        <div className='p-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
                {t('admin.sirah.edit_content')}
            </h1>
            <SirahForm initialData={item} contentId={params.id} />
        </div>
    );
};

export default EditSirahPage;
