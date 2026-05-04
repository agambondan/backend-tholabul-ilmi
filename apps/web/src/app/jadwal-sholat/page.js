'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { BsGeoAlt } from 'react-icons/bs';
import { MdAccessTime } from 'react-icons/md';

const PRAYERS = [
    { key: 'Fajr', label: 'Subuh', arabic: 'الفجر' },
    { key: 'Sunrise', label: 'Syuruq', arabic: 'الشروق', info: true },
    { key: 'Dhuhr', label: 'Dzuhur', arabic: 'الظهر' },
    { key: 'Asr', label: 'Ashar', arabic: 'العصر' },
    { key: 'Maghrib', label: 'Maghrib', arabic: 'المغرب' },
    { key: 'Isha', label: 'Isya', arabic: 'العشاء' },
];

const WAJIB_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const CITIES = [
    { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
    { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
    { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
    { name: 'Medan', lat: 3.5952, lng: 98.6722 },
    { name: 'Makassar', lat: -5.1477, lng: 119.4327 },
    { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
    { name: 'Semarang', lat: -7.0051, lng: 110.4381 },
    { name: 'Malang', lat: -7.9797, lng: 112.6304 },
    { name: 'Palembang', lat: -2.9761, lng: 104.7754 },
    { name: 'Banjarmasin', lat: -3.3194, lng: 114.5942 },
    { name: 'Denpasar', lat: -8.6705, lng: 115.2126 },
    { name: 'Padang', lat: -0.9471, lng: 100.4172 },
    { name: 'Pekanbaru', lat: 0.5071, lng: 101.4478 },
    { name: 'Pontianak', lat: -0.0263, lng: 109.3425 },
    { name: 'Manado', lat: 1.4748, lng: 124.8421 },
];

const parseTimeStr = (str) => {
    if (!str) return null;
    const m = str.match(/(\d+):(\d+)/);
    if (!m) return null;
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), +m[1], +m[2]);
};

const cleanTime = (str) => (str ? str.replace(/ \(.*?\)$/, '') : '');

export default function JadwalSholatPage() {
    const [city, setCity] = useState(CITIES[0]);
    const [timings, setTimings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [now, setNow] = useState(new Date());
    const [geoLabel, setGeoLabel] = useState('');
    const [date, setDate] = useState(null);

    useEffect(() => {
        const iv = setInterval(() => setNow(new Date()), 15000);
        return () => clearInterval(iv);
    }, []);

    const fetchByCoords = (lat, lng, label) => {
        setLoading(true);
        setError('');
        const ts = Math.floor(Date.now() / 1000);
        fetch(
            `https://api.aladhan.com/v1/timings/${ts}?latitude=${lat}&longitude=${lng}&method=11`,
        )
            .then((r) => r.json())
            .then((d) => {
                if (d.code === 200) {
                    setTimings(d.data.timings);
                    setDate(d.data.date?.readable ?? '');
                    setGeoLabel(label);
                } else {
                    setError('Gagal mengambil jadwal sholat.');
                }
            })
            .catch(() =>
                setError('Gagal terhubung. Periksa koneksi internet kamu.'),
            )
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchByCoords(city.lat, city.lng, city.name);
    }, [city]);

    const handleGeo = () => {
        if (!navigator.geolocation) {
            setError('Browser tidak mendukung geolokasi.');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchByCoords(pos.coords.latitude, pos.coords.longitude, 'Lokasi Saya');
            },
            () => {
                setLoading(false);
                setError('Tidak dapat mengakses lokasi. Aktifkan izin lokasi di browser.');
            },
        );
    };

    const nextPrayer = (() => {
        if (!timings) return null;
        for (const p of PRAYERS.filter((p) => !p.info)) {
            const t = parseTimeStr(timings[p.key]);
            if (t && t > now) return p.key;
        }
        return 'Fajr';
    })();

    const todayStr = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <main className='min-h-screen flex flex-col bg-parchment-50 dark:bg-slate-900'>
            <NavbarTailwindCss />
            <div className='max-w-lg flex-1 w-full mx-auto px-4 pt-24 pb-8'>
                {/* Header */}
                <div className='mb-6 text-center'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl mb-4'>
                        <MdAccessTime className='text-3xl text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <h1 className='text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mb-1'>
                        Jadwal Sholat
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>{todayStr}</p>
                </div>

                {/* Location picker */}
                <div className='bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-slate-700'>
                    <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3'>
                        Pilih Kota
                    </p>
                    <div className='flex gap-2'>
                        <button
                            onClick={handleGeo}
                            className='flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap'
                        >
                            <BsGeoAlt />
                            Lokasi Saya
                        </button>
                        <select
                            value={city.name}
                            onChange={(e) => {
                                const found = CITIES.find((c) => c.name === e.target.value);
                                if (found) {
                                    setGeoLabel('');
                                    setCity(found);
                                }
                            }}
                            className='flex-1 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400'
                        >
                            {CITIES.map((c) => (
                                <option key={c.name} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {geoLabel && (
                        <p className='text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1'>
                            <BsGeoAlt /> {geoLabel}
                        </p>
                    )}
                </div>

                {/* Current time display */}
                <div className='text-center mb-4'>
                    <span className='text-4xl font-extrabold text-emerald-800 dark:text-emerald-200 tabular-nums'>
                        {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Timings */}
                {loading && (
                    <div className='text-center py-12'>
                        <div className='w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3' />
                        <p className='text-sm text-gray-500 dark:text-gray-400'>Memuat jadwal…</p>
                    </div>
                )}
                {error && !loading && (
                    <div className='text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-2xl'>
                        <p className='text-red-600 dark:text-red-400 text-sm'>{error}</p>
                    </div>
                )}
                {!loading && !error && timings && (
                    <div className='space-y-2'>
                        {PRAYERS.map((p) => {
                            const isNext = p.key === nextPrayer && !p.info;
                            const t = cleanTime(timings[p.key]);
                            return (
                                <div
                                    key={p.key}
                                    className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                                        isNext
                                            ? 'bg-emerald-600 dark:bg-emerald-700 border-emerald-500 shadow-lg scale-[1.01]'
                                            : p.info
                                              ? 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 opacity-70'
                                              : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'
                                    }`}
                                >
                                    <div className='flex items-center gap-3'>
                                        {isNext && (
                                            <span className='text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full'>
                                                berikutnya
                                            </span>
                                        )}
                                        <div>
                                            <p
                                                className={`font-bold text-sm ${isNext ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}
                                            >
                                                {p.label}
                                            </p>
                                            <p
                                                className={`text-xs ${isNext ? 'text-emerald-200' : 'text-gray-400 dark:text-gray-500'}`}
                                                style={{ fontFamily: 'Amiri, serif' }}
                                            >
                                                {p.arabic}
                                            </p>
                                        </div>
                                    </div>
                                    <p
                                        className={`text-xl font-extrabold tabular-nums ${
                                            isNext
                                                ? 'text-white'
                                                : 'text-emerald-700 dark:text-emerald-300'
                                        }`}
                                    >
                                        {t}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className='text-center text-xs text-gray-400 dark:text-gray-500 mt-6'>
                    Data dari Aladhan.com • Metode Kemenag RI
                </p>
            </div>
            <Footer />
        </main>
    );
}
