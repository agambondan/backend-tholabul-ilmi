'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import { useLocale } from '@/context/Locale';
import { useState } from 'react';
import { FaCalculator } from 'react-icons/fa';
import { MdInfo } from 'react-icons/md';

const TABS = ['zakat.maal', 'zakat.fitrah', 'zakat.profession'];
const NISAB_GRAM = 85;

export default function ZakatPage() {
    const { t, lang } = useLocale();
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
    const fmt = (n) =>
        new Intl.NumberFormat(lang === 'EN' ? 'en-US' : 'id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(n);

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
                        {t('zakat.title')}
                    </h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                        {t('zakat.subtitle')}
                    </p>
                </div>

                {/* Tabs */}
                <div className='flex bg-white dark:bg-slate-800 rounded-xl p-1 mb-6 shadow-sm border border-gray-100 dark:border-slate-700'>
                    {TABS.map((labelKey, i) => (
                        <button
                            key={labelKey}
                            onClick={() => setTab(i)}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                                tab === i
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                            }`}
                        >
                            {t(labelKey)}
                        </button>
                    ))}
                </div>

                {/* Zakat Maal */}
                {tab === 0 && (
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 space-y-5'>
                        <div className='flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-sm text-emerald-800 dark:text-emerald-300'>
                            <MdInfo className='text-lg flex-shrink-0 mt-0.5' />
                            <span>
                                {t('zakat.maal_info_prefix')}{' '}
                                <strong>2,5%</strong>.
                            </span>
                        </div>
                        <InputField
                            label={t('zakat.gold_price')}
                            value={goldPrice}
                            onChange={(v) => setGoldPrice(parseFloat(v) || 0)}
                            hint={`${t('zakat.current_nisab')}: ${fmt(nisab)}`}
                        />
                        <InputField
                            label={t('zakat.total_wealth')}
                            value={totalWealth}
                            onChange={setTotalWealth}
                            placeholder={t('zakat.total_wealth_placeholder')}
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
                                {t('zakat.haul_label')}
                            </label>
                        </div>
                        {wealth > 0 && wealth < nisab && (
                            <p className='text-sm text-center text-amber-600 dark:text-amber-400'>
                                {t('zakat.wealth_below_nisab')} ({fmt(nisab)})
                            </p>
                        )}
                        {wealth >= nisab && !haul && (
                            <p className='text-sm text-center text-amber-600 dark:text-amber-400'>
                                {t('zakat.haul_unmet')}
                            </p>
                        )}
                        <ResultCard
                            amount={zakatMaal}
                            label={t('zakat.maal_result')}
                        />
                    </div>
                )}

                {/* Zakat Fitrah */}
                {tab === 1 && (
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 space-y-5'>
                        <div className='flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-sm text-amber-800 dark:text-amber-300'>
                            <MdInfo className='text-lg flex-shrink-0 mt-0.5' />
                            <span>
                                {t('zakat.fitrah_info_prefix')}{' '}
                                <strong>1 sha&apos; (±2,5 kg)</strong>{' '}
                                {t('zakat.fitrah_info_suffix')}
                            </span>
                        </div>
                        <InputField
                            label={t('zakat.rice_price')}
                            value={ricePrice}
                            onChange={(v) => setRicePrice(parseFloat(v) || 0)}
                        />
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                {t('zakat.family_count')}
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
                                <span className='text-sm text-gray-500 dark:text-gray-400'>
                                    {t('zakat.person_unit')}
                                </span>
                            </div>
                        </div>
                        <ResultCard
                            amount={zakatFitrah}
                            color='amber'
                            label={t('zakat.fitrah_result')}
                            note={`${familyCount} ${t('zakat.person_unit')} × 2,5 kg × ${fmt(ricePrice)}/kg`}
                        />
                    </div>
                )}

                {/* Zakat Profesi */}
                {tab === 2 && (
                    <div className='bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 space-y-5'>
                        <div className='flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-800 dark:text-blue-300'>
                            <MdInfo className='text-lg flex-shrink-0 mt-0.5' />
                            <span>
                                {t('zakat.profession_info_prefix')}{' '}
                                <strong>2,5%</strong>{' '}
                                {t('zakat.profession_info_suffix')}
                            </span>
                        </div>
                        <InputField
                            label={t('zakat.gold_price')}
                            value={goldPrice}
                            onChange={(v) => setGoldPrice(parseFloat(v) || 0)}
                            hint={`${t('zakat.monthly_nisab')}: ${fmt(nisabMonthly)}`}
                        />
                        <InputField
                            label={t('zakat.monthly_income')}
                            value={monthlyIncome}
                            onChange={setMonthlyIncome}
                            placeholder={t('zakat.monthly_income_placeholder')}
                        />
                        {income > 0 && income < nisabMonthly && (
                            <p className='text-sm text-center text-blue-600 dark:text-blue-400'>
                                {t('zakat.income_below_nisab')} ({fmt(nisabMonthly)})
                            </p>
                        )}
                        <ResultCard
                            amount={zakatProfesi}
                            color='blue'
                            label={t('zakat.profession_result')}
                        />
                    </div>
                )}

                <p className='text-center text-xs text-gray-400 dark:text-gray-500 mt-6'>
                    {t('zakat.disclaimer')}
                </p>
            </div>
            <Footer />
        </main>
    );
}
