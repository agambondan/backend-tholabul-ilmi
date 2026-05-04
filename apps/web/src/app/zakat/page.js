'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import { useState } from 'react';
import { FaCalculator } from 'react-icons/fa';
import { MdInfo } from 'react-icons/md';

const TABS = ['Zakat Maal', 'Zakat Fitrah', 'Zakat Profesi'];
const NISAB_GRAM = 85;

const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(n);

export default function ZakatPage() {
    const [tab, setTab] = useState(0);
    const [goldPrice, setGoldPrice] = useState(1050000);
    const [totalWealth, setTotalWealth] = useState('');
    const [haul, setHaul] = useState(true);
    const [ricePrice, setRicePrice] = useState(16000);
    const [familyCount, setFamilyCount] = useState(1);
    const [monthlyIncome, setMonthlyIncome] = useState('');

    const nisab = NISAB_GRAM * goldPrice;
    const nisabMonthly = nisab / 12;
    const wealth = parseFloat(totalWealth) || 0;
    const income = parseFloat(monthlyIncome) || 0;
    const zakatMaal = wealth >= nisab && haul ? wealth * 0.025 : 0;
    const zakatFitrah = 2.5 * ricePrice * familyCount;
    const zakatProfesi = income >= nisabMonthly ? income * 0.025 : 0;

    const InputField = ({ label, value, onChange, placeholder, hint }) => (
        <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {label}
            </label>
            <input
                type='number'
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className='w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400'
            />
            {hint && <p className='text-xs text-gray-400 mt-1'>{hint}</p>}
        </div>
    );

    const ResultCard = ({ amount, color = 'emerald', label, note }) => (
        <div
            className={`p-5 rounded-2xl text-center ${
                color === 'amber'
                    ? 'bg-amber-50 dark:bg-amber-900/20'
                    : color === 'blue'
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-emerald-50 dark:bg-emerald-900/20'
            }`}
        >
            <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>{label}</p>
            <p
                className={`text-3xl font-extrabold ${
                    color === 'amber'
                        ? 'text-amber-700 dark:text-amber-300'
                        : color === 'blue'
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-emerald-700 dark:text-emerald-300'
                }`}
            >
                {fmt(amount)}
            </p>
            {note && (
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{note}</p>
            )}
        </div>
    );

    return (
        <main className='min-h-screen flex flex-col bg-parchment-50 dark:bg-slate-900'>
            <NavbarTailwindCss />
            <div className='max-w-xl flex-1 w-full mx-auto px-4 pt-24 pb-8'>
                <div className='mb-8 text-center'>
                    <div className='inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl mb-4'>
                        <FaCalculator className='text-3xl text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <h1 className='text-3xl font-extrabold text-emerald-900 dark:text-emerald-100 mb-2'>
                        Kalkulator Zakat
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Hitung zakat maal, fitrah, dan profesi sesuai syariat
                    </p>
                </div>

                {/* Tabs */}
                <div className='flex bg-white dark:bg-slate-800 rounded-xl p-1 mb-6 shadow-sm border border-gray-100 dark:border-slate-700'>
                    {TABS.map((t, i) => (
                        <button
                            key={t}
                            onClick={() => setTab(i)}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                                tab === i
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Zakat Maal */}
                {tab === 0 && (
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 space-y-5'>
                        <div className='flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-sm text-emerald-800 dark:text-emerald-300'>
                            <MdInfo className='text-lg flex-shrink-0 mt-0.5' />
                            <span>
                                Wajib jika harta ≥ nisab (85g emas) dan sudah 1 tahun (haul).
                                Kadar: <strong>2,5%</strong>.
                            </span>
                        </div>
                        <InputField
                            label='Harga Emas per Gram (Rp)'
                            value={goldPrice}
                            onChange={(v) => setGoldPrice(parseFloat(v) || 0)}
                            hint={`Nisab saat ini: ${fmt(nisab)}`}
                        />
                        <InputField
                            label='Total Harta Dizakati (Rp)'
                            value={totalWealth}
                            onChange={setTotalWealth}
                            placeholder='Tabungan + emas + investasi − hutang'
                        />
                        <div className='flex items-center gap-3'>
                            <input
                                id='haul'
                                type='checkbox'
                                checked={haul}
                                onChange={(e) => setHaul(e.target.checked)}
                                className='w-4 h-4 accent-emerald-600'
                            />
                            <label
                                htmlFor='haul'
                                className='text-sm text-gray-700 dark:text-gray-300'
                            >
                                Harta sudah dimiliki 1 tahun penuh (haul)
                            </label>
                        </div>
                        {wealth > 0 && wealth < nisab && (
                            <p className='text-sm text-center text-amber-600 dark:text-amber-400'>
                                Harta belum mencapai nisab ({fmt(nisab)})
                            </p>
                        )}
                        {wealth >= nisab && !haul && (
                            <p className='text-sm text-center text-amber-600 dark:text-amber-400'>
                                Belum memenuhi haul (1 tahun)
                            </p>
                        )}
                        <ResultCard
                            amount={zakatMaal}
                            label='Zakat Maal yang Harus Dibayar'
                        />
                    </div>
                )}

                {/* Zakat Fitrah */}
                {tab === 1 && (
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 space-y-5'>
                        <div className='flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-sm text-amber-800 dark:text-amber-300'>
                            <MdInfo className='text-lg flex-shrink-0 mt-0.5' />
                            <span>
                                Wajib sebelum sholat Idul Fitri. Besarnya{' '}
                                <strong>1 sha&apos; (±2,5 kg)</strong> makanan pokok per jiwa.
                            </span>
                        </div>
                        <InputField
                            label='Harga Beras per Kg (Rp)'
                            value={ricePrice}
                            onChange={(v) => setRicePrice(parseFloat(v) || 0)}
                        />
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                Jumlah Jiwa yang Ditanggung
                            </label>
                            <div className='flex items-center gap-4'>
                                <button
                                    onClick={() => setFamilyCount(Math.max(1, familyCount - 1))}
                                    className='w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 font-bold text-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors text-gray-700 dark:text-gray-300'
                                >
                                    −
                                </button>
                                <span className='text-2xl font-extrabold text-amber-700 dark:text-amber-300 w-8 text-center'>
                                    {familyCount}
                                </span>
                                <button
                                    onClick={() => setFamilyCount(familyCount + 1)}
                                    className='w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 font-bold text-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors text-gray-700 dark:text-gray-300'
                                >
                                    +
                                </button>
                                <span className='text-sm text-gray-500 dark:text-gray-400'>jiwa</span>
                            </div>
                        </div>
                        <ResultCard
                            amount={zakatFitrah}
                            color='amber'
                            label='Total Zakat Fitrah'
                            note={`${familyCount} jiwa × 2,5 kg × ${fmt(ricePrice)}/kg`}
                        />
                    </div>
                )}

                {/* Zakat Profesi */}
                {tab === 2 && (
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 space-y-5'>
                        <div className='flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-800 dark:text-blue-300'>
                            <MdInfo className='text-lg flex-shrink-0 mt-0.5' />
                            <span>
                                Kadar <strong>2,5%</strong> dari penghasilan bersih per bulan
                                jika mencapai nisab bulanan (nisab tahunan ÷ 12).
                            </span>
                        </div>
                        <InputField
                            label='Harga Emas per Gram (Rp)'
                            value={goldPrice}
                            onChange={(v) => setGoldPrice(parseFloat(v) || 0)}
                            hint={`Nisab bulanan: ${fmt(nisabMonthly)}`}
                        />
                        <InputField
                            label='Penghasilan Bersih per Bulan (Rp)'
                            value={monthlyIncome}
                            onChange={setMonthlyIncome}
                            placeholder='Gaji setelah dikurangi kebutuhan pokok'
                        />
                        {income > 0 && income < nisabMonthly && (
                            <p className='text-sm text-center text-blue-600 dark:text-blue-400'>
                                Penghasilan belum mencapai nisab bulanan ({fmt(nisabMonthly)})
                            </p>
                        )}
                        <ResultCard
                            amount={zakatProfesi}
                            color='blue'
                            label='Zakat Profesi per Bulan'
                        />
                    </div>
                )}

                <p className='text-center text-xs text-gray-400 dark:text-gray-500 mt-6'>
                    Kalkulator bersifat estimasi. Konsultasikan dengan ulama atau lembaga
                    zakat terpercaya.
                </p>
            </div>
            <Footer />
        </main>
    );
}
