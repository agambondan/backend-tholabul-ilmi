'use client';

export const dynamic = 'force-dynamic';

import { Spinner3 } from '@/components/spinner/Spinner';
import { adminSirohApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import SirohForm from '../../_SirohForm';

const EditSirohPage = ({ params }) => {
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
                <p className='text-red-500 dark:text-red-400'>Konten tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className='p-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
                Edit Konten Siroh
            </h1>
            <SirohForm initialData={item} contentId={params.id} />
        </div>
    );
};

export default EditSirohPage;
