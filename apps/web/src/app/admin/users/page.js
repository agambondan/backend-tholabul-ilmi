'use client';

import { useEffect, useState } from 'react';
import { adminUserApi } from '@/lib/api';
import { useAuth } from '@/context/Auth';
import { BsTrash } from 'react-icons/bs';

const ROLES = [
    { value: 'user', label: 'User', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    { value: 'author', label: 'Author', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    { value: 'editor', label: 'Editor', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    { value: 'admin', label: 'Admin', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
];

const RoleBadge = ({ role }) => {
    const def = ROLES.find((r) => r.value === role) ?? ROLES[0];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${def.color}`}>
            {def.label}
        </span>
    );
};

const AdminUsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [changingId, setChangingId] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await adminUserApi.list();
                if (!res.ok) throw new Error('Gagal memuat daftar user');
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : data.data ?? []);
            } catch (err) {
                setError(err.message || 'Terjadi kesalahan saat memuat data');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleChangeRole = async (target, newRole) => {
        if (target.role === newRole) return;
        const prev = users;
        setUsers((u) =>
            u.map((x) => (x.id === target.id ? { ...x, role: newRole } : x)),
        );
        setActionError('');
        setChangingId(target.id);
        try {
            const res = await adminUserApi.update(target.id, { role: newRole });
            if (!res.ok) throw new Error('Gagal mengubah role');
        } catch (err) {
            setUsers(prev);
            setActionError(err.message || 'Gagal mengubah role user');
        } finally {
            setChangingId(null);
        }
    };

    const handleDelete = async (target) => {
        if (!confirm(`Hapus user "${target.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        const prev = users;
        setUsers((u) => u.filter((x) => x.id !== target.id));
        setActionError('');
        try {
            const res = await adminUserApi.delete(target.id);
            if (!res.ok) throw new Error('Gagal menghapus user');
        } catch (err) {
            setUsers(prev);
            setActionError(err.message || 'Gagal menghapus user');
        }
    };

    if (isLoading) {
        return (
            <div className='p-8 text-center text-gray-500 dark:text-gray-400'>
                Memuat...
            </div>
        );
    }

    return (
        <div className='p-6 max-w-5xl'>
            <div className='mb-6'>
                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                    Manajemen User
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                    Kelola role pengguna: user → author → editor → admin
                </p>
            </div>

            <div className='mb-5 grid grid-cols-4 gap-3'>
                {ROLES.map((r) => {
                    const count = users.filter((u) => u.role === r.value).length;
                    return (
                        <div
                            key={r.value}
                            className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 text-center'
                        >
                            <p className='text-xl font-bold text-gray-800 dark:text-white'>{count}</p>
                            <RoleBadge role={r.value} />
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className='mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm'>
                    {error}
                </div>
            )}

            {actionError && (
                <div className='mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm'>
                    {actionError}
                </div>
            )}

            <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
                <table className='w-full text-sm'>
                    <thead>
                        <tr className='border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'>
                            <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400'>
                                Nama
                            </th>
                            <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400'>
                                Email
                            </th>
                            <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400'>
                                Role
                            </th>
                            <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400'>
                                Ubah Role
                            </th>
                            <th className='text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400'>
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
                        {users.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className='px-4 py-8 text-center text-gray-400 dark:text-gray-600'
                                >
                                    Belum ada user terdaftar
                                </td>
                            </tr>
                        )}
                        {users.map((u) => {
                            const isSelf = u.id === currentUser?.id;
                            return (
                                <tr
                                    key={u.id}
                                    className='hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors'
                                >
                                    <td className='px-4 py-3 text-gray-900 dark:text-white font-medium'>
                                        {u.name}
                                        {isSelf && (
                                            <span className='ml-2 text-xs text-emerald-600 dark:text-emerald-400'>
                                                (Anda)
                                            </span>
                                        )}
                                    </td>
                                    <td className='px-4 py-3 text-gray-600 dark:text-gray-400'>
                                        {u.email}
                                    </td>
                                    <td className='px-4 py-3'>
                                        <RoleBadge role={u.role} />
                                    </td>
                                    <td className='px-4 py-3'>
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleChangeRole(u, e.target.value)}
                                            disabled={isSelf || changingId === u.id}
                                            className='text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed'
                                        >
                                            {ROLES.map((r) => (
                                                <option key={r.value} value={r.value}>
                                                    {r.label}
                                                </option>
                                            ))}
                                        </select>
                                        {changingId === u.id && (
                                            <span className='ml-2 text-xs text-gray-400'>Menyimpan...</span>
                                        )}
                                    </td>
                                    <td className='px-4 py-3'>
                                        <div className='flex justify-end'>
                                            <button
                                                onClick={() => handleDelete(u)}
                                                disabled={isSelf}
                                                title='Hapus user'
                                                className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                                            >
                                                <BsTrash className='text-sm' />
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className='mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs'>
                <strong>Keterangan role:</strong> User = pembaca biasa · Author = bisa buat/edit artikel blog milik sendiri · Editor = bisa approve/edit konten siroh, tafsir, asbabun nuzul · Admin = full access
            </div>
        </div>
    );
};

export default AdminUsersPage;
