import {
    Activity,
    Award,
    Bell,
    Book,
    BookOpen,
    BookOpenCheck,
    Calculator,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock,
    Compass,
    FileText,
    Globe,
    Grid,
    Heart,
    HelpCircle,
    Home,
    LogOut,
    MapPin,
    Moon,
    PlayCircle,
    RotateCcw,
    Search,
    Settings,
    Smile,
    Sun,
    Target,
    Trophy,
    User,
    Video,
} from "lucide-react";
import { useEffect, useState } from "react";

const i18n = {
    id: {
        home: "Beranda",
        quran: "Al-Qur'an",
        ibadah: "Ibadah",
        ilmu: "Ilmu",
        profil: "Profil",
        search: "Cari...",
        nextPrayer: "Menuju Ashar",
        ashar: "Ashar",
        tracker: "Tracker Hari Ini",
        qibla: "Kiblat",
        memorize: "Hafalan",
        journal: "Jurnal",
        quiz: "Kuis",
        lecture: "Kajian",
        tafsir: "Tafsir",
        hadith: "Hadith",
        others: "Lainnya",
        zakat: "Zakat",
        narrator: "Perawi",
        journalTitle: "Jurnal Muhasabah",
        journalDesc: "Bagaimana imanmu hari ini?",
        surah: "Surah",
        murojaah: "Murojaah",
        tasbih: "Tasbih",
        dailyDeeds: "Amalan",
        tahajud: "Tahajud",
        dhuha: "Dhuha",
        charity: "Sedekah",
        calTitle: "Kalender & Imsakiyah",
        calDesc: "Cek jadwal puasa sunnah",
        latestLec: "Kajian Terbaru",
        featArt: "Artikel Pilihan",
        points: "Total Poin",
        streak: "Streak Aktif",
        badges: "Pencapaian",
        leaderboard: "Leaderboard Komunitas",
        target: "Target Belajar",
        logout: "Keluar",
    },
    en: {
        home: "Home",
        quran: "Quran",
        ibadah: "Worship",
        ilmu: "Learn",
        profil: "Profile",
        search: "Search...",
        nextPrayer: "Next: Asr",
        ashar: "Asr",
        tracker: "Today's Tracker",
        qibla: "Qibla",
        memorize: "Memory",
        journal: "Journal",
        quiz: "Quiz",
        lecture: "Lectures",
        tafsir: "Tafsir",
        hadith: "Hadith",
        others: "More",
        zakat: "Zakah",
        narrator: "Narrators",
        journalTitle: "Daily Reflection",
        journalDesc: "How is your faith today?",
        surah: "Surah",
        murojaah: "Review",
        tasbih: "Tasbih",
        dailyDeeds: "Daily Deeds",
        tahajud: "Tahajud",
        dhuha: "Duha",
        charity: "Charity",
        calTitle: "Calendar & Imsak",
        calDesc: "Check fasting schedules",
        latestLec: "Latest Lectures",
        featArt: "Featured Articles",
        points: "Total Points",
        streak: "Active Streak",
        badges: "Achievements",
        leaderboard: "Community Leaderboard",
        target: "Study Goals",
        logout: "Log Out",
    },
};

export default function App() {
    const [theme, setTheme] = useState("earth"); // Default ke Earth (Paper)
    const [isDark, setIsDark] = useState(false);
    const [lang, setLang] = useState("id");
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const t = (key) => i18n[lang][key] || key;

    const frameBg = () => {
        switch (theme) {
            case "clean":
                return isDark
                    ? "bg-slate-950 border-slate-900"
                    : "bg-slate-50 border-gray-900";
            case "dark":
                return isDark
                    ? "bg-slate-950 border-slate-900"
                    : "bg-slate-100 border-slate-300";
            case "earth":
                return isDark
                    ? "bg-[#252825] border-[#1a1c1a]"
                    : "bg-[#f5f2eb] border-[#3c3a35]";
            case "indigo":
                return isDark
                    ? "bg-indigo-950 border-indigo-900"
                    : "bg-slate-100 border-gray-800";
            case "oled":
                return isDark
                    ? "bg-black border-gray-900"
                    : "bg-gray-100 border-gray-300";
            case "aurora":
                return isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-50 border-gray-300";
            case "mosaic":
                return isDark
                    ? "bg-[#0f172a] border-blue-950"
                    : "bg-[#fdfbf7] border-blue-950";
            default:
                return "bg-white border-black";
        }
    };

    return (
        <div className='min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4 font-sans'>
            {/* Controls */}
            <div className='w-full max-w-[400px] flex justify-between items-center mb-3'>
                <button
                    onClick={() => setLang(lang === "id" ? "en" : "id")}
                    className='bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow flex items-center gap-1.5 text-gray-700 hover:bg-gray-50'
                >
                    <Globe size={14} /> {lang.toUpperCase()}
                </button>
                <button
                    onClick={() => setIsDark(!isDark)}
                    className='bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow flex items-center gap-1.5 text-gray-700 hover:bg-gray-50'
                >
                    {isDark ? (
                        <Sun size={14} className='text-amber-500' />
                    ) : (
                        <Moon size={14} className='text-indigo-500' />
                    )}
                    {isDark ? "Light" : "Dark"}
                </button>
            </div>

            {/* Theme Switcher */}
            <div className='mb-4 flex flex-col items-center bg-white p-2 rounded-xl shadow-md gap-1 z-50 max-w-[400px] w-full border border-gray-300'>
                <div className='flex flex-wrap gap-1 justify-center w-full'>
                    <ThemeBtn
                        current={theme}
                        val='clean'
                        label='1. Teal'
                        color='bg-teal-600 text-white'
                        setTheme={setTheme}
                    />
                    <ThemeBtn
                        current={theme}
                        val='dark'
                        label='2. Midnight'
                        color='bg-slate-800 text-amber-400'
                        setTheme={setTheme}
                    />
                    <ThemeBtn
                        current={theme}
                        val='earth'
                        label='3. Paper'
                        color='bg-[#5b6e5b] text-stone-100'
                        setTheme={setTheme}
                    />
                    <ThemeBtn
                        current={theme}
                        val='indigo'
                        label='4. Indigo'
                        color='bg-indigo-600 text-white'
                        setTheme={setTheme}
                    />
                    <ThemeBtn
                        current={theme}
                        val='oled'
                        label='5. OLED'
                        color='bg-black text-emerald-400'
                        setTheme={setTheme}
                    />
                    <ThemeBtn
                        current={theme}
                        val='aurora'
                        label='6. Aurora'
                        color='bg-fuchsia-600 text-white'
                        setTheme={setTheme}
                    />
                    <ThemeBtn
                        current={theme}
                        val='mosaic'
                        label='7. Mosaic'
                        color='bg-blue-900 text-orange-200'
                        setTheme={setTheme}
                    />
                </div>
            </div>

            {/* Phone Frame */}
            <div
                className={`w-full max-w-[400px] h-[800px] rounded-[2.5rem] shadow-2xl relative overflow-hidden border-[10px] flex flex-col transition-colors duration-500 ${frameBg()}`}
            >
                {theme === "clean" && (
                    <CleanTheme
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {theme === "dark" && (
                    <DarkTheme
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {theme === "earth" && (
                    <EarthTheme
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {theme === "indigo" && (
                    <IndigoCompactTheme
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {theme === "oled" && (
                    <OledBentoTheme
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {theme === "aurora" && (
                    <AuroraTheme
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {theme === "mosaic" && (
                    <MosaicTheme
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
            </div>
            <style
                dangerouslySetInnerHTML={{
                    __html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`,
                }}
            />
        </div>
    );
}

const ThemeBtn = ({ current, val, label, color, setTheme }) => (
    <button
        onClick={() => setTheme(val)}
        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${current === val ? color + " shadow-sm scale-105" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
    >
        {label}
    </button>
);

// Shared Mock Data
const mockSholat = [
    { id: "S", done: true },
    { id: "D", done: true },
    { id: "A", done: false },
    { id: "M", done: false },
    { id: "I", done: false },
];
const mockKajian = [
    {
        id: 1,
        title: "Tafsir Surat Al-Baqarah",
        ustadz: "Ust. Nuzul Dzikri",
        dur: "45:00",
    },
    {
        id: 2,
        title: "Siroh Nabawiyah - Perang Badar",
        ustadz: "Ust. Khalid Basalamah",
        dur: "50:20",
    },
];
const mockArtikel = [
    {
        id: 1,
        title: "Keutamaan Puasa Ayyamul Bidh",
        cat: "Fiqh",
        date: "Hari ini",
    },
    {
        id: 2,
        title: "Adab Berdoa Agar Terkabul",
        cat: "Akhlak",
        date: "Kemarin",
    },
];
const mockBadges = [
    { id: 1, name: "Pejuang", icon: "🌅", locked: false },
    { id: 2, name: "Khatam", icon: "📖", locked: false },
    { id: 3, name: "Streak", icon: "🔥", locked: true },
    { id: 4, name: "Ahli", icon: "📚", locked: true },
];
const mockSurah = [
    { n: 1, s: "Al-Fatihah", a: "الفاتحة", h: true },
    { n: 2, s: "Al-Baqarah", a: "البقرة", h: false },
    { n: 3, s: "Ali 'Imran", a: "آل عمران", h: false },
];

/* ==========================================================================
   1. CLEAN TEAL
   ========================================================================== */
function CleanTheme({ currentTime, isDark, t }) {
    const [activeTab, setActiveTab] = useState("home");
    const bg = isDark
        ? "bg-slate-950 text-slate-100"
        : "bg-slate-50 text-gray-800";
    const navBg = isDark
        ? "bg-slate-900 border-slate-800"
        : "bg-white border-gray-200";

    return (
        <div className={`flex flex-col h-full ${bg}`}>
            <div className='flex-1 overflow-y-auto pb-16 hide-scrollbar'>
                {activeTab === "home" && (
                    <CleanHomeTab
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {activeTab === "quran" && (
                    <CleanQuranTab isDark={isDark} t={t} />
                )}
                {activeTab === "ibadah" && (
                    <CleanIbadahTab isDark={isDark} t={t} />
                )}
                {activeTab === "ilmu" && <CleanIlmuTab isDark={isDark} t={t} />}
                {activeTab === "profil" && (
                    <CleanProfilTab isDark={isDark} t={t} />
                )}
            </div>
            <div
                className={`absolute bottom-0 w-full border-t flex justify-between items-center px-4 py-2 z-50 ${navBg}`}
            >
                <CleanNavItem
                    icon={<Home size={20} />}
                    label={t("home")}
                    active={activeTab === "home"}
                    onClick={() => setActiveTab("home")}
                    isDark={isDark}
                />
                <CleanNavItem
                    icon={<BookOpen size={20} />}
                    label={t("quran")}
                    active={activeTab === "quran"}
                    onClick={() => setActiveTab("quran")}
                    isDark={isDark}
                />
                <CleanNavItem
                    icon={<Heart size={20} />}
                    label={t("ibadah")}
                    active={activeTab === "ibadah"}
                    onClick={() => setActiveTab("ibadah")}
                    isDark={isDark}
                />
                <CleanNavItem
                    icon={<Book size={20} />}
                    label={t("ilmu")}
                    active={activeTab === "ilmu"}
                    onClick={() => setActiveTab("ilmu")}
                    isDark={isDark}
                />
                <CleanNavItem
                    icon={<User size={20} />}
                    label={t("profil")}
                    active={activeTab === "profil"}
                    onClick={() => setActiveTab("profil")}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}
const CleanNavItem = ({ icon, label, active, onClick, isDark }) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center gap-0.5 cursor-pointer p-1 w-14 transition-colors ${active ? "text-teal-500" : isDark ? "text-slate-500" : "text-gray-400"}`}
    >
        <div
            className={`${active ? (isDark ? "bg-teal-900/50" : "bg-teal-50") + " p-1.5 rounded-xl" : "p-1.5"}`}
        >
            {icon}
        </div>
        <span className='text-[9px] font-bold'>{label}</span>
    </div>
);
const CleanHomeTab = ({ currentTime, isDark, t }) => {
    const cardBg = isDark
        ? "bg-slate-900 border-slate-800"
        : "bg-white border-gray-100";
    const textMain = isDark ? "text-white" : "text-gray-800";
    const textMut = isDark ? "text-slate-400" : "text-gray-500";

    return (
        <div className='flex flex-col gap-3 p-4'>
            <div className='flex justify-between items-center mt-4'>
                <div className='flex items-center gap-2'>
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isDark ? "bg-teal-900 text-teal-400" : "bg-teal-100 text-teal-700"}`}
                    >
                        AF
                    </div>
                    <div>
                        <h1
                            className={`text-sm font-bold leading-tight ${textMain}`}
                        >
                            Ahmad Fulan
                        </h1>
                        <p className={`text-[9px] font-medium ${textMut}`}>
                            Jakarta, ID
                        </p>
                    </div>
                </div>
                <div className={`flex gap-2 ${textMut}`}>
                    <Search size={18} />
                    <Bell size={18} />
                </div>
            </div>

            <div className='bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-3 text-white shadow-sm flex flex-col relative overflow-hidden'>
                <div className='absolute -right-4 -top-4 opacity-10'>
                    <Moon size={80} />
                </div>
                <div className='flex justify-between items-center mb-3'>
                    <div>
                        <p className='text-[10px] text-teal-100 font-medium mb-0.5 uppercase tracking-wider'>
                            {t("nextPrayer")}
                        </p>
                        <h2 className='text-2xl font-bold'>15:14</h2>
                    </div>
                    <div className='text-right'>
                        <div className='bg-white/20 px-2 py-0.5 rounded text-[10px] mb-1 inline-flex items-center gap-1'>
                            <Clock size={10} /> -01:20
                        </div>
                        <p className='text-[9px] text-teal-100 font-medium'>
                            18 Dzulqo'dah
                        </p>
                    </div>
                </div>
                <div className='flex justify-between items-center border-t border-teal-500/50 pt-2'>
                    <span className='text-[9px] font-bold uppercase tracking-widest text-teal-100'>
                        {t("tracker")}
                    </span>
                    <div className='flex gap-1'>
                        {mockSholat.map((s) => (
                            <div
                                key={s.id}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${s.done ? "bg-white text-teal-700" : "bg-teal-900/50 text-teal-300"}`}
                            >
                                {s.id}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                className={`${cardBg} rounded-2xl p-3 shadow-sm border grid grid-cols-4 gap-y-4 gap-x-2`}
            >
                <CleanMenuIcon
                    icon={<Compass size={18} />}
                    label={t("qibla")}
                    color={
                        isDark
                            ? "text-blue-400 bg-blue-900/50"
                            : "text-blue-600 bg-blue-50"
                    }
                    isDark={isDark}
                />
                <CleanMenuIcon
                    icon={<BookOpenCheck size={18} />}
                    label={t("memorize")}
                    color={
                        isDark
                            ? "text-emerald-400 bg-emerald-900/50"
                            : "text-emerald-600 bg-emerald-50"
                    }
                    isDark={isDark}
                />
                <CleanMenuIcon
                    icon={<Smile size={18} />}
                    label={t("journal")}
                    color={
                        isDark
                            ? "text-rose-400 bg-rose-900/50"
                            : "text-rose-600 bg-rose-50"
                    }
                    isDark={isDark}
                />
                <CleanMenuIcon
                    icon={<HelpCircle size={18} />}
                    label={t("quiz")}
                    color={
                        isDark
                            ? "text-amber-400 bg-amber-900/50"
                            : "text-amber-600 bg-amber-50"
                    }
                    isDark={isDark}
                />
                <CleanMenuIcon
                    icon={<Video size={18} />}
                    label={t("lecture")}
                    color={
                        isDark
                            ? "text-purple-400 bg-purple-900/50"
                            : "text-purple-600 bg-purple-50"
                    }
                    isDark={isDark}
                />
                <CleanMenuIcon
                    icon={<FileText size={18} />}
                    label={t("tafsir")}
                    color={
                        isDark
                            ? "text-cyan-400 bg-cyan-900/50"
                            : "text-cyan-600 bg-cyan-50"
                    }
                    isDark={isDark}
                />
                <CleanMenuIcon
                    icon={<Book size={18} />}
                    label={t("hadith")}
                    color={
                        isDark
                            ? "text-yellow-400 bg-yellow-900/50"
                            : "text-yellow-600 bg-yellow-50"
                    }
                    isDark={isDark}
                />
                <CleanMenuIcon
                    icon={<Grid size={18} />}
                    label={t("others")}
                    color={
                        isDark
                            ? "text-slate-400 bg-slate-800"
                            : "text-gray-600 bg-gray-100"
                    }
                    isDark={isDark}
                />
            </div>

            <div
                className={`${cardBg} rounded-2xl p-3 shadow-sm border flex gap-3 items-center cursor-pointer`}
            >
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-50 text-indigo-500"}`}
                >
                    <Smile size={20} />
                </div>
                <div className='flex-1'>
                    <h3 className={`text-xs font-bold ${textMain}`}>
                        {t("journalTitle")}
                    </h3>
                    <p className={`text-[10px] line-clamp-1 mt-0.5 ${textMut}`}>
                        {t("journalDesc")}
                    </p>
                </div>
                <ChevronRight size={16} className={textMut} />
            </div>
        </div>
    );
};
const CleanMenuIcon = ({ icon, label, color, isDark }) => (
    <div className='flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform'>
        <div
            className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}
        >
            {icon}
        </div>
        <span
            className={`text-[9px] font-bold ${isDark ? "text-slate-400" : "text-gray-600"}`}
        >
            {label}
        </span>
    </div>
);
const CleanQuranTab = ({ isDark, t }) => {
    const cardBg = isDark
        ? "bg-slate-900 border-slate-800"
        : "bg-white border-gray-100";
    const textMain = isDark ? "text-white" : "text-gray-800";
    const textMut = isDark ? "text-slate-400" : "text-gray-400";

    return (
        <div className='flex flex-col h-full'>
            <div
                className={`px-4 pt-8 pb-2 sticky top-0 z-10 border-b ${isDark ? "bg-slate-950 border-slate-800" : "bg-white border-gray-100"}`}
            >
                <h1 className={`text-lg font-bold mb-2 ${textMain}`}>
                    {t("quran")}
                </h1>
                <div
                    className={`${isDark ? "bg-slate-900" : "bg-gray-100"} rounded-lg flex items-center px-3 py-1.5 mb-2`}
                >
                    <Search size={14} className={`${textMut} mr-2`} />
                    <input
                        type='text'
                        placeholder={t("search")}
                        className={`bg-transparent border-none outline-none w-full text-xs ${textMain}`}
                    />
                </div>
                <div
                    className={`flex gap-4 text-[10px] font-bold uppercase tracking-widest mt-2 ${textMut}`}
                >
                    <span className='text-teal-500 border-b-2 border-teal-500 pb-1'>
                        {t("surah")}
                    </span>
                    <span>{t("memorize")}</span>
                    <span>{t("murojaah")}</span>
                </div>
            </div>
            <div className='flex-1 px-4 py-2 flex flex-col gap-2'>
                {mockSurah.map((i) => (
                    <div
                        key={i.n}
                        className={`${cardBg} p-2.5 rounded-xl flex items-center justify-between shadow-sm border`}
                    >
                        <div className='flex items-center gap-3'>
                            <div
                                className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-[10px] ${isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-50 text-teal-700"}`}
                            >
                                {i.n}
                            </div>
                            <div>
                                <h3
                                    className={`font-bold text-xs flex items-center gap-1 ${textMain}`}
                                >
                                    {i.s}{" "}
                                    {i.h && (
                                        <CheckCircle2
                                            size={12}
                                            className='text-emerald-500'
                                        />
                                    )}
                                </h3>
                                <p className={`text-[9px] ${textMut}`}>
                                    Makkiyah
                                </p>
                            </div>
                        </div>
                        <div
                            className={`text-sm font-serif ${isDark ? "text-teal-400" : "text-teal-700"}`}
                            dir='rtl'
                        >
                            {i.a}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const CleanIbadahTab = ({ isDark, t }) => {
    const [count, setCount] = useState(0);
    const cardBg = isDark
        ? "bg-slate-900 border-slate-800"
        : "bg-white border-gray-100";
    const textMain = isDark ? "text-white" : "text-gray-800";
    const textMut = isDark ? "text-slate-400" : "text-gray-400";

    return (
        <div className='flex flex-col h-full items-center px-4 pt-8'>
            <div className='w-full flex justify-between items-center mb-4'>
                <h1 className={`text-sm font-bold ${textMain}`}>
                    {t("ibadah")}
                </h1>
                <span
                    className={`text-[9px] font-bold px-2 py-1 rounded-full ${isDark ? "bg-teal-900 text-teal-300" : "text-teal-600 bg-teal-50"}`}
                >
                    Level: Pejuang
                </span>
            </div>
            <div className='flex gap-3 w-full mb-4'>
                <div
                    className={`flex-1 rounded-2xl p-3 shadow-sm border flex flex-col items-center ${cardBg}`}
                >
                    <h2
                        className={`text-xl font-serif mb-1 ${isDark ? "text-teal-400" : "text-teal-800"}`}
                        dir='rtl'
                    >
                        سُبْحَانَ اللَّهِ
                    </h2>
                    <button
                        onClick={() => setCount((c) => c + 1)}
                        className={`w-16 h-16 rounded-full shadow-md flex items-center justify-center active:scale-95 border-2 mt-2 mb-2 ${isDark ? "bg-teal-600 border-teal-800" : "bg-teal-600 border-teal-50"}`}
                    >
                        <span className='text-white text-xl font-bold'>
                            {count}
                        </span>
                    </button>
                    <button
                        onClick={() => setCount(0)}
                        className={`text-[8px] font-bold uppercase ${textMut}`}
                    >
                        <RotateCcw size={10} className='inline mr-1' />
                        Reset
                    </button>
                </div>
                <div
                    className={`flex-1 rounded-2xl p-3 shadow-sm border flex flex-col ${cardBg}`}
                >
                    <h3
                        className={`text-[9px] font-bold uppercase tracking-widest mb-2 border-b pb-1 ${isDark ? "text-slate-500 border-slate-800" : "text-gray-400 border-gray-100"}`}
                    >
                        {t("dailyDeeds")}
                    </h3>
                    <div className='flex items-center gap-2 mb-2'>
                        <input
                            type='checkbox'
                            className='accent-teal-500 w-3 h-3'
                        />
                        <span className={`text-[10px] font-bold ${textMain}`}>
                            {t("dhuha")}
                        </span>
                    </div>
                    <div className='flex items-center gap-2 mb-2'>
                        <input
                            type='checkbox'
                            className='accent-teal-500 w-3 h-3'
                        />
                        <span className={`text-[10px] font-bold ${textMain}`}>
                            {t("charity")}
                        </span>
                    </div>
                </div>
            </div>
            <div
                className={`w-full rounded-2xl p-3 shadow-sm border flex items-center gap-3 ${cardBg}`}
            >
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-amber-900/50 text-amber-500" : "bg-amber-50 text-amber-500"}`}
                >
                    <Calendar size={20} />
                </div>
                <div>
                    <h4 className={`text-xs font-bold ${textMain}`}>
                        {t("calTitle")}
                    </h4>
                    <p className={`text-[9px] ${textMut}`}>{t("calDesc")}</p>
                </div>
            </div>
        </div>
    );
};
const CleanIlmuTab = ({ isDark, t }) => {
    const cardBg = isDark
        ? "bg-slate-900 border-slate-800"
        : "bg-white border-gray-100";
    const textMain = isDark ? "text-white" : "text-gray-800";
    const textMut = isDark ? "text-slate-400" : "text-gray-500";

    return (
        <div className='flex flex-col h-full px-4 pt-8'>
            <h1 className={`text-lg font-bold mb-4 ${textMain}`}>
                {t("ilmu")}
            </h1>
            <div
                className={`rounded-lg flex items-center px-3 py-2 shadow-sm border mb-4 ${cardBg}`}
            >
                <Search size={14} className={`${textMut} mr-2`} />
                <input
                    type='text'
                    placeholder={t("search")}
                    className={`bg-transparent border-none outline-none w-full text-xs ${textMain}`}
                />
            </div>
            <div className='flex overflow-x-auto gap-2 pb-2 hide-scrollbar mb-2'>
                {["Hadith", "Siroh", "Fiqh", "Doa/Dzikir"].map((cat) => (
                    <span
                        key={cat}
                        className={`px-3 py-1 border rounded-full text-[10px] font-bold whitespace-nowrap ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-gray-200 text-gray-600"}`}
                    >
                        {cat}
                    </span>
                ))}
            </div>
            <h2 className='text-[10px] font-bold uppercase tracking-widest text-teal-500 mt-2 mb-2'>
                {t("latestLec")}
            </h2>
            <div className='flex flex-col gap-2 mb-4'>
                {mockKajian.map((k) => (
                    <div
                        key={k.id}
                        className={`${cardBg} p-2 rounded-xl shadow-sm border flex gap-2 items-center`}
                    >
                        <div
                            className={`w-16 h-12 rounded-lg flex items-center justify-center text-white relative ${isDark ? "bg-slate-800" : "bg-slate-200"}`}
                        >
                            <PlayCircle size={20} />
                            <span className='absolute bottom-1 right-1 bg-black/60 text-[6px] px-1 rounded'>
                                {k.dur}
                            </span>
                        </div>
                        <div className='flex-1'>
                            <h3
                                className={`text-xs font-bold line-clamp-1 ${textMain}`}
                            >
                                {k.title}
                            </h3>
                            <p className={`text-[9px] ${textMut}`}>
                                {k.ustadz}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const CleanProfilTab = ({ isDark, t }) => {
    const cardBg = isDark
        ? "bg-slate-900 border-slate-800"
        : "bg-white border-gray-100";
    const textMain = isDark ? "text-white" : "text-gray-800";
    const textMut = isDark ? "text-slate-400" : "text-gray-500";

    return (
        <div className='flex flex-col h-full px-4 pt-8'>
            <div
                className={`flex items-center gap-3 mb-6 p-4 rounded-2xl shadow-sm border ${cardBg}`}
            >
                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isDark ? "bg-teal-900 text-teal-400" : "bg-teal-100 text-teal-700"}`}
                >
                    AF
                </div>
                <div className='flex-1'>
                    <h1 className={`text-sm font-bold ${textMain}`}>
                        Ahmad Fulan
                    </h1>
                    <p className={`text-[10px] ${textMut}`}>ahmad@fulan.com</p>
                </div>
                <Settings size={18} className={textMut} />
            </div>
            <div className='flex gap-2 mb-4'>
                <div
                    className={`flex-1 p-3 rounded-2xl shadow-sm border flex flex-col items-center ${cardBg}`}
                >
                    <Award size={20} className='text-amber-500 mb-1' />
                    <span className={`text-lg font-bold ${textMain}`}>
                        1,250
                    </span>
                    <span
                        className={`text-[8px] font-bold uppercase tracking-widest ${textMut}`}
                    >
                        {t("points")}
                    </span>
                </div>
                <div
                    className={`flex-1 p-3 rounded-2xl shadow-sm border flex flex-col items-center ${cardBg}`}
                >
                    <Activity size={20} className='text-orange-500 mb-1' />
                    <span className={`text-lg font-bold ${textMain}`}>
                        7 Hari
                    </span>
                    <span
                        className={`text-[8px] font-bold uppercase tracking-widest ${textMut}`}
                    >
                        {t("streak")}
                    </span>
                </div>
            </div>
            <h2 className='text-[10px] font-bold uppercase tracking-widest text-teal-500 mb-2'>
                {t("badges")}
            </h2>
            <div
                className={`${cardBg} p-3 rounded-2xl shadow-sm border grid grid-cols-4 gap-2 mb-4`}
            >
                {mockBadges.map((b) => (
                    <div
                        key={b.id}
                        className={`flex flex-col items-center gap-1 ${b.locked ? "opacity-40 grayscale" : ""}`}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${b.locked ? (isDark ? "bg-slate-800" : "bg-gray-100") : isDark ? "bg-amber-900/30 border border-amber-800" : "bg-amber-50 border border-amber-100"}`}
                        >
                            {b.icon}
                        </div>
                        <span
                            className={`text-[7px] font-bold text-center leading-tight ${textMain}`}
                        >
                            {b.name}
                        </span>
                    </div>
                ))}
            </div>
            <div
                className={`${cardBg} rounded-2xl shadow-sm border overflow-hidden`}
            >
                <div
                    className={`p-3 border-b flex items-center gap-2 ${isDark ? "border-slate-800" : "border-gray-50"}`}
                >
                    <Trophy size={14} className='text-teal-500' />
                    <span className={`text-xs font-bold ${textMain}`}>
                        {t("leaderboard")}
                    </span>
                </div>
                <div
                    className={`p-3 border-b flex items-center gap-2 ${isDark ? "border-slate-800" : "border-gray-50"}`}
                >
                    <Target size={14} className='text-teal-500' />
                    <span className={`text-xs font-bold ${textMain}`}>
                        {t("target")}
                    </span>
                </div>
                <div className='p-3 flex items-center gap-2 text-red-500'>
                    <LogOut size={14} />
                    <span className='text-xs font-bold'>{t("logout")}</span>
                </div>
            </div>
        </div>
    );
};

/* ==========================================================================
   2. MIDNIGHT GOLD
   ========================================================================== */
function DarkTheme({ currentTime, isDark, t }) {
    const [activeTab, setActiveTab] = useState("home");
    const bg = isDark
        ? "bg-slate-950 text-slate-100"
        : "bg-slate-100 text-slate-800";
    const navBg = isDark
        ? "bg-slate-900/95 border-slate-800"
        : "bg-white/95 border-slate-300";

    return (
        <div className={`flex flex-col h-full ${bg}`}>
            <div className='flex-1 overflow-y-auto pb-16 hide-scrollbar'>
                {activeTab === "home" && (
                    <DarkHomeTab
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {activeTab === "quran" && (
                    <DarkQuranTab isDark={isDark} t={t} />
                )}
                {activeTab === "ibadah" && (
                    <DarkIbadahTab isDark={isDark} t={t} />
                )}
                {activeTab === "ilmu" && <DarkIlmuTab isDark={isDark} t={t} />}
                {activeTab === "profil" && (
                    <DarkProfilTab isDark={isDark} t={t} />
                )}
            </div>
            <div
                className={`absolute bottom-0 w-full backdrop-blur-md border-t flex justify-between items-center px-4 py-2 z-50 ${navBg}`}
            >
                <DarkNavItem
                    icon={<Home size={18} />}
                    label={t("home")}
                    active={activeTab === "home"}
                    onClick={() => setActiveTab("home")}
                    isDark={isDark}
                />
                <DarkNavItem
                    icon={<BookOpen size={18} />}
                    label={t("quran")}
                    active={activeTab === "quran"}
                    onClick={() => setActiveTab("quran")}
                    isDark={isDark}
                />
                <DarkNavItem
                    icon={<Heart size={18} />}
                    label={t("ibadah")}
                    active={activeTab === "ibadah"}
                    onClick={() => setActiveTab("ibadah")}
                    isDark={isDark}
                />
                <DarkNavItem
                    icon={<Book size={18} />}
                    label={t("ilmu")}
                    active={activeTab === "ilmu"}
                    onClick={() => setActiveTab("ilmu")}
                    isDark={isDark}
                />
                <DarkNavItem
                    icon={<User size={18} />}
                    label={t("profil")}
                    active={activeTab === "profil"}
                    onClick={() => setActiveTab("profil")}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}
const DarkNavItem = ({ icon, label, active, onClick, isDark }) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center gap-1 cursor-pointer w-14 transition-all ${active ? (isDark ? "text-amber-400" : "text-amber-600") : "text-slate-500"}`}
    >
        {icon}
        <span
            className={`text-[9px] font-semibold tracking-wide ${active ? "opacity-100" : "opacity-0"}`}
        >
            {label}
        </span>
    </div>
);
const DarkHomeTab = ({ currentTime, isDark, t }) => {
    const cardBg = isDark
        ? "bg-slate-900/50 border-slate-800/50"
        : "bg-white border-slate-200";
    const textMain = isDark ? "text-white" : "text-slate-800";
    const textMut = isDark ? "text-slate-400" : "text-slate-500";
    const amberTxt = isDark ? "text-amber-400" : "text-amber-600";

    return (
        <div className='flex flex-col gap-3 p-4'>
            <div className='flex justify-between items-center mt-4'>
                <div>
                    <h1
                        className={`text-sm font-bold tracking-tight ${textMain}`}
                    >
                        Ahmad Fulan
                    </h1>
                    <div
                        className={`flex items-center gap-1 text-[9px] font-bold uppercase ${amberTxt}`}
                    >
                        <MapPin size={10} />
                        Jakarta
                    </div>
                </div>
                <div className={`flex gap-2 ${textMut}`}>
                    <Search size={18} />
                    <Bell size={18} />
                </div>
            </div>

            <div
                className={`rounded-2xl p-3 border flex flex-col shadow-lg relative overflow-hidden ${isDark ? "bg-gradient-to-r from-slate-800 to-slate-900 border-slate-800" : "bg-gradient-to-r from-slate-100 to-amber-50 border-slate-200"}`}
            >
                <div className='absolute -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-[30px]'></div>
                <div className='flex justify-between items-center mb-3'>
                    <div className='relative z-10'>
                        <span
                            className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${amberTxt}`}
                        >
                            <Moon size={10} /> {t("ashar")}
                        </span>
                        <h2 className={`text-3xl font-light ${textMain}`}>
                            15:14
                        </h2>
                    </div>
                    <div className='relative z-10 text-right'>
                        <div
                            className={`text-[10px] font-mono px-2 py-0.5 rounded mb-1 ${isDark ? "bg-slate-950/50 text-slate-300" : "bg-slate-200 text-slate-700"}`}
                        >
                            -01:20
                        </div>
                    </div>
                </div>
                <div
                    className={`flex justify-between items-center border-t pt-2 relative z-10 ${isDark ? "border-slate-700" : "border-slate-300"}`}
                >
                    <span
                        className={`text-[9px] font-bold uppercase tracking-widest ${textMut}`}
                    >
                        {t("tracker")}
                    </span>
                    <div className='flex gap-1'>
                        {mockSholat.map((s) => (
                            <div
                                key={s.id}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${s.done ? (isDark ? "bg-amber-400 text-slate-900" : "bg-amber-500 text-white") : isDark ? "bg-slate-800 text-slate-500" : "bg-slate-200 text-slate-400"}`}
                            >
                                {s.id}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                className={`grid grid-cols-4 gap-y-4 gap-x-2 p-3 rounded-2xl border ${cardBg}`}
            >
                <DarkMenuIcon
                    icon={<BookOpenCheck size={18} />}
                    label={t("memorize")}
                    isDark={isDark}
                />
                <DarkMenuIcon
                    icon={<Heart size={18} />}
                    label={t("ibadah")}
                    isDark={isDark}
                />
                <DarkMenuIcon
                    icon={<Smile size={18} />}
                    label={t("journal")}
                    isDark={isDark}
                />
                <DarkMenuIcon
                    icon={<HelpCircle size={18} />}
                    label={t("quiz")}
                    isDark={isDark}
                />
                <DarkMenuIcon
                    icon={<Calculator size={18} />}
                    label={t("zakat")}
                    isDark={isDark}
                />
                <DarkMenuIcon
                    icon={<FileText size={18} />}
                    label={t("tafsir")}
                    isDark={isDark}
                />
                <DarkMenuIcon
                    icon={<Book size={18} />}
                    label={t("hadith")}
                    isDark={isDark}
                />
                <DarkMenuIcon
                    icon={<Grid size={18} />}
                    label={t("others")}
                    isDark={isDark}
                />
            </div>
        </div>
    );
};
const DarkMenuIcon = ({ icon, label, isDark }) => (
    <div className='flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform'>
        <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-slate-900 border border-slate-800 text-slate-300" : "bg-slate-100 border border-slate-200 text-slate-600"}`}
        >
            {icon}
        </div>
        <span
            className={`text-[9px] font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
            {label}
        </span>
    </div>
);
const DarkQuranTab = ({ isDark, t }) => {
    const cardBg = isDark ? "border-slate-800/50" : "border-slate-200";
    return (
        <div className='flex flex-col h-full'>
            <div
                className={`px-4 pt-8 pb-3 sticky top-0 z-10 border-b ${isDark ? "bg-slate-950/90 border-slate-900" : "bg-slate-100/90 border-slate-300"}`}
            >
                <h1
                    className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-slate-800"}`}
                >
                    {t("quran")}
                </h1>
                <div
                    className={`rounded-lg flex items-center px-3 py-1.5 mb-2 ${isDark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"}`}
                >
                    <Search size={14} className='text-slate-500 mr-2' />
                    <input
                        type='text'
                        placeholder={t("search")}
                        className={`bg-transparent border-none outline-none w-full text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}
                    />
                </div>
                <div
                    className={`flex gap-4 text-[9px] font-bold uppercase tracking-widest mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                    <span
                        className={`${isDark ? "text-amber-400 border-amber-400" : "text-amber-600 border-amber-600"} border-b-2 pb-1`}
                    >
                        {t("surah")}
                    </span>
                    <span>{t("memorize")}</span>
                </div>
            </div>
            <div className='flex-1 px-4 py-2 flex flex-col'>
                {mockSurah.map((i) => (
                    <div
                        key={i.n}
                        className={`py-2.5 border-b flex items-center justify-between ${cardBg}`}
                    >
                        <div className='flex items-center gap-3'>
                            <span
                                className={`font-bold text-[10px] w-4 ${isDark ? "text-amber-400" : "text-amber-600"}`}
                            >
                                {i.n}.
                            </span>
                            <div>
                                <h3
                                    className={`font-semibold text-xs ${isDark ? "text-slate-300" : "text-slate-800"}`}
                                >
                                    {i.s}
                                </h3>
                            </div>
                        </div>
                        <div
                            className={`text-base font-serif ${isDark ? "text-slate-400" : "text-slate-600"}`}
                            dir='rtl'
                        >
                            {i.a}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const DarkIbadahTab = ({ isDark, t }) => {
    const [count, setCount] = useState(0);
    const cardBg = isDark
        ? "bg-slate-900/50 border-slate-800"
        : "bg-white border-slate-200";
    const textMain = isDark ? "text-white" : "text-slate-800";
    return (
        <div className='flex flex-col h-full items-center px-4 pt-8'>
            <h1
                className={`text-sm font-bold uppercase tracking-widest mb-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}
            >
                {t("ibadah")}
            </h1>
            <div className='flex gap-2 w-full mb-6'>
                <div
                    className={`flex-1 flex flex-col items-center rounded-xl p-3 border ${cardBg}`}
                >
                    <div className='relative w-20 h-20 flex items-center justify-center mb-2'>
                        <svg className='absolute w-full h-full -rotate-90'>
                            <circle
                                cx='40'
                                cy='40'
                                r='36'
                                fill='transparent'
                                stroke={isDark ? "#1e293b" : "#e2e8f0"}
                                strokeWidth='4'
                            />
                            <circle
                                cx='40'
                                cy='40'
                                r='36'
                                fill='transparent'
                                stroke={isDark ? "#fbbf24" : "#d97706"}
                                strokeWidth='4'
                                strokeDasharray={2 * Math.PI * 36}
                                strokeDashoffset={
                                    2 * Math.PI * 36 -
                                    (count / 33) * 2 * Math.PI * 36
                                }
                                className='transition-all duration-300'
                            />
                        </svg>
                        <button
                            onClick={() => setCount((c) => c + 1)}
                            className='absolute inset-0 w-full h-full z-10 rounded-full'
                        />
                        <div className='flex flex-col items-center pointer-events-none'>
                            <span className={`text-2xl font-light ${textMain}`}>
                                {count}
                            </span>
                        </div>
                    </div>
                    <p
                        className={`text-[8px] uppercase font-bold tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    >
                        {t("tasbih")}
                    </p>
                </div>
                <div
                    className={`flex-1 rounded-xl p-3 flex flex-col border ${cardBg}`}
                >
                    <span
                        className={`text-[9px] font-bold uppercase tracking-widest mb-2 border-b pb-1 ${isDark ? "text-amber-400 border-slate-800" : "text-amber-600 border-slate-100"}`}
                    >
                        {t("dailyDeeds")}
                    </span>
                    <div className='flex items-center gap-2 mb-2'>
                        <div
                            className={`w-3 h-3 rounded border ${isDark ? "bg-amber-400/20 border-amber-400/50" : "bg-amber-100 border-amber-400"}`}
                        ></div>
                        <span className={`text-[9px] font-bold ${textMain}`}>
                            {t("tahajud")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
const DarkIlmuTab = ({ isDark, t }) => (
    <div className='flex flex-col h-full px-4 pt-8'>
        <h1
            className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-800"}`}
        >
            {t("ilmu")}
        </h1>
        <h2
            className={`text-[10px] font-bold uppercase tracking-widest mt-2 mb-2 ${isDark ? "text-amber-500" : "text-amber-600"}`}
        >
            {t("latestLec")}
        </h2>
        <div className='flex flex-col gap-2 mb-4'>
            {mockKajian.map((k) => (
                <div
                    key={k.id}
                    className={`p-2 rounded-xl border flex gap-2 items-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
                >
                    <div
                        className={`w-16 h-12 rounded-lg flex items-center justify-center relative ${isDark ? "bg-slate-800 text-slate-600" : "bg-slate-100 text-slate-400"}`}
                    >
                        <PlayCircle size={20} />
                    </div>
                    <div className='flex-1'>
                        <h3
                            className={`text-xs font-bold line-clamp-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}
                        >
                            {k.title}
                        </h3>
                        <p
                            className={`text-[9px] ${isDark ? "text-slate-500" : "text-slate-400"}`}
                        >
                            {k.ustadz}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
const DarkProfilTab = ({ isDark, t }) => {
    const cardBg = isDark
        ? "bg-slate-900/50 border-slate-800"
        : "bg-white border-slate-200";
    const textMain = isDark ? "text-white" : "text-slate-800";

    return (
        <div className='flex flex-col h-full px-4 pt-8'>
            <div
                className={`flex items-center gap-3 mb-6 p-4 rounded-2xl border ${cardBg}`}
            >
                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isDark ? "bg-amber-500/20 text-amber-500" : "bg-amber-100 text-amber-600"}`}
                >
                    AF
                </div>
                <div className='flex-1'>
                    <h1 className={`text-sm font-bold ${textMain}`}>
                        Ahmad Fulan
                    </h1>
                </div>
            </div>

            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                <div
                    className={`p-3 border-b flex items-center gap-2 ${isDark ? "border-slate-800/50" : "border-slate-100"}`}
                >
                    <Trophy
                        size={14}
                        className={isDark ? "text-amber-500" : "text-amber-600"}
                    />
                    <span className={`text-xs font-bold ${textMain}`}>
                        {t("leaderboard")}
                    </span>
                </div>
                <div
                    className={`p-3 border-b flex items-center gap-2 ${isDark ? "border-slate-800/50" : "border-slate-100"}`}
                >
                    <Target
                        size={14}
                        className={isDark ? "text-amber-500" : "text-amber-600"}
                    />
                    <span className={`text-xs font-bold ${textMain}`}>
                        {t("target")}
                    </span>
                </div>
                <div className='p-3 flex items-center gap-2 text-red-500'>
                    <LogOut size={14} />
                    <span className='text-xs font-bold'>{t("logout")}</span>
                </div>
            </div>
        </div>
    );
};

/* ==========================================================================
   3. PAPER & SAGE (Compact Earthy - USER FAVORITE)
   ========================================================================== */
function EarthTheme({ currentTime, isDark, t }) {
    const [activeTab, setActiveTab] = useState("home");
    const bg = isDark
        ? "bg-[#252825] text-[#e6e2d6]"
        : "bg-[#fefdf9] text-stone-800";
    const navBg = isDark
        ? "bg-[#1a1c1a] border-[#2c332c]"
        : "bg-[#2c332c] border-[#3c3a35]";

    return (
        <div className={`flex flex-col h-full ${bg}`}>
            <div className='flex-1 overflow-y-auto pb-20 hide-scrollbar'>
                {activeTab === "home" && (
                    <EarthHomeTab
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {activeTab === "quran" && (
                    <EarthQuranTab isDark={isDark} t={t} />
                )}
                {activeTab === "ibadah" && (
                    <EarthIbadahTab isDark={isDark} t={t} />
                )}
                {activeTab === "ilmu" && <EarthIlmuTab isDark={isDark} t={t} />}
                {activeTab === "profil" && (
                    <EarthProfilTab isDark={isDark} t={t} />
                )}
            </div>
            <div
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] rounded-[1.5rem] flex justify-between items-center px-3 py-2 z-50 shadow-xl border ${navBg}`}
            >
                <EarthNavItem
                    icon={<Home size={18} />}
                    label={t("home")}
                    active={activeTab === "home"}
                    onClick={() => setActiveTab("home")}
                    isDark={isDark}
                />
                <EarthNavItem
                    icon={<BookOpen size={18} />}
                    label={t("quran")}
                    active={activeTab === "quran"}
                    onClick={() => setActiveTab("quran")}
                    isDark={isDark}
                />
                <EarthNavItem
                    icon={<Heart size={18} />}
                    label={t("ibadah")}
                    active={activeTab === "ibadah"}
                    onClick={() => setActiveTab("ibadah")}
                    isDark={isDark}
                />
                <EarthNavItem
                    icon={<Book size={18} />}
                    label={t("ilmu")}
                    active={activeTab === "ilmu"}
                    onClick={() => setActiveTab("ilmu")}
                    isDark={isDark}
                />
                <EarthNavItem
                    icon={<User size={18} />}
                    label={t("profil")}
                    active={activeTab === "profil"}
                    onClick={() => setActiveTab("profil")}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}
const EarthNavItem = ({ icon, label, active, onClick, isDark }) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center gap-0.5 cursor-pointer p-1 w-14 transition-colors ${active ? (isDark ? "text-[#e6e2d6]" : "text-stone-100") : "text-stone-400"}`}
    >
        <div
            className={`${active ? (isDark ? "bg-[#3e453e]" : "bg-[#5b6e5b]") + " p-1.5 rounded-xl" : "p-1.5"}`}
        >
            {icon}
        </div>
        <span className={`text-[8px] font-bold ${active ? "" : "hidden"}`}>
            {label}
        </span>
    </div>
);
const EarthHomeTab = ({ currentTime, isDark, t }) => {
    const cardBg = isDark
        ? "bg-[#2c332c] border-[#3e453e]"
        : "bg-[#f5f2eb] border-[#e6e2d6]";
    const textMain = isDark ? "text-[#e6e2d6]" : "text-[#3c3a35]";
    const textMut = isDark ? "text-[#8c8577]" : "text-[#8c8577]";

    return (
        <div className='flex flex-col gap-3 p-4'>
            <div
                className={`flex justify-between items-center mt-4 mb-2 border-b pb-3 ${isDark ? "border-[#3e453e]" : "border-[#e6e2d6]"}`}
            >
                <div className='flex items-center gap-2'>
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs border ${isDark ? "bg-[#1a1c1a] border-[#3e453e] text-[#8c8577]" : "bg-[#f0ece1] border-[#e6e2d6] text-[#5b6e5b]"}`}
                    >
                        AF
                    </div>
                    <div>
                        <h1
                            className={`text-sm font-serif font-bold leading-tight ${textMain}`}
                        >
                            Ahmad Fulan
                        </h1>
                        <p
                            className={`text-[9px] uppercase tracking-widest font-bold ${textMut}`}
                        >
                            Jakarta
                        </p>
                    </div>
                </div>
                <div className={`flex gap-2 ${textMut}`}>
                    <Search size={18} />
                    <Bell size={18} />
                </div>
            </div>

            <div
                className={`rounded-2xl p-3 shadow-sm flex flex-col relative overflow-hidden ${isDark ? "bg-[#3e453e] text-[#e6e2d6]" : "bg-[#5b6e5b] text-stone-100"}`}
            >
                <div className='absolute -bottom-10 -right-10 w-24 h-24 bg-[#4a5a4a] rounded-full mix-blend-multiply'></div>
                <div className='flex justify-between items-center relative z-10 mb-2'>
                    <div>
                        <span className='text-[10px] font-bold tracking-widest uppercase opacity-80'>
                            {t("nextPrayer")}
                        </span>
                        <h2 className='text-2xl font-serif mt-0.5'>15:14</h2>
                    </div>
                    <div className='text-right'>
                        <div className='bg-black/20 px-2 py-0.5 rounded text-[10px] mb-1 inline-flex items-center gap-1 font-mono'>
                            <Clock size={10} /> -01:20
                        </div>
                    </div>
                </div>
                <div
                    className={`flex justify-between items-center border-t pt-2 relative z-10 ${isDark ? "border-[#2c332c]" : "border-[#6d826d]"}`}
                >
                    <span className='text-[9px] font-bold uppercase tracking-widest opacity-90'>
                        {t("tracker")}
                    </span>
                    <div className='flex gap-1'>
                        {mockSholat.map((s) => (
                            <div
                                key={s.id}
                                className={`w-4 h-4 flex items-center justify-center text-[8px] font-bold rounded-sm border ${s.done ? (isDark ? "bg-[#e6e2d6] text-[#3e453e] border-[#e6e2d6]" : "bg-stone-100 text-[#5b6e5b] border-stone-100") : isDark ? "border-[#8c8577] text-[#8c8577]" : "border-[#8c8577]/50 text-[#8c8577]"}`}
                            >
                                {s.id}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                className={`grid grid-cols-4 gap-y-4 gap-x-2 p-3 rounded-2xl border ${cardBg}`}
            >
                <EarthMenuIcon
                    icon={<Compass size={18} />}
                    label={t("qibla")}
                    isDark={isDark}
                />
                <EarthMenuIcon
                    icon={<BookOpenCheck size={18} />}
                    label={t("memorize")}
                    isDark={isDark}
                />
                <EarthMenuIcon
                    icon={<Smile size={18} />}
                    label={t("journal")}
                    isDark={isDark}
                />
                <EarthMenuIcon
                    icon={<HelpCircle size={18} />}
                    label={t("quiz")}
                    isDark={isDark}
                />
                <EarthMenuIcon
                    icon={<Video size={18} />}
                    label={t("lecture")}
                    isDark={isDark}
                />
                <EarthMenuIcon
                    icon={<FileText size={18} />}
                    label={t("tafsir")}
                    isDark={isDark}
                />
                <EarthMenuIcon
                    icon={<Book size={18} />}
                    label={t("hadith")}
                    isDark={isDark}
                />
                <EarthMenuIcon
                    icon={<Grid size={18} />}
                    label={t("others")}
                    isDark={isDark}
                />
            </div>

            <div
                className={`rounded-2xl p-3 border flex gap-3 items-center cursor-pointer ${cardBg}`}
            >
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${isDark ? "bg-[#1a1c1a] border-[#3e453e] text-[#8c8577]" : "bg-[#f0ece1] border-[#e6e2d6] text-[#5b6e5b]"}`}
                >
                    <Smile size={20} />
                </div>
                <div className='flex-1'>
                    <h3 className={`text-xs font-serif font-bold ${textMain}`}>
                        {t("journalTitle")}
                    </h3>
                    <p className={`text-[10px] line-clamp-1 mt-0.5 ${textMut}`}>
                        {t("journalDesc")}
                    </p>
                </div>
                <ChevronRight size={16} className={textMut} />
            </div>
        </div>
    );
};
const EarthMenuIcon = ({ icon, label, isDark }) => (
    <div className='flex flex-col items-center gap-1.5'>
        <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${isDark ? "bg-[#1a1c1a] border-[#3e453e] text-[#8c8577]" : "bg-[#f0ece1] border-[#e6e2d6] text-[#5b6e5b]"}`}
        >
            {icon}
        </div>
        <span
            className={`font-bold text-[8px] uppercase tracking-widest ${isDark ? "text-[#e6e2d6]" : "text-[#3c3a35]"}`}
        >
            {label}
        </span>
    </div>
);
const EarthQuranTab = ({ isDark, t }) => {
    const cardBg = isDark
        ? "bg-[#2c332c] border-[#3e453e]"
        : "bg-[#f5f2eb] border-[#e6e2d6]";
    const textMain = isDark ? "text-[#e6e2d6]" : "text-[#3c3a35]";
    const textMut = isDark ? "text-[#8c8577]" : "text-[#8c8577]";

    return (
        <div className='flex flex-col h-full'>
            <div
                className={`px-4 pt-8 pb-2 sticky top-0 z-10 border-b ${isDark ? "bg-[#252825] border-[#3e453e]" : "bg-[#fefdf9] border-[#e6e2d6]"}`}
            >
                <h1 className={`text-lg font-serif font-bold mb-2 ${textMain}`}>
                    {t("quran")}
                </h1>
                <div
                    className={`rounded-lg flex items-center px-3 py-1.5 mb-2 border ${cardBg}`}
                >
                    <Search size={14} className={`${textMut} mr-2`} />
                    <input
                        type='text'
                        placeholder={t("search")}
                        className={`bg-transparent border-none outline-none w-full text-xs font-serif ${textMain}`}
                    />
                </div>
                <div
                    className={`flex gap-4 text-[10px] font-bold uppercase tracking-widest mt-2 ${textMut}`}
                >
                    <span
                        className={`${isDark ? "text-[#e6e2d6] border-[#e6e2d6]" : "text-[#5b6e5b] border-[#5b6e5b]"} border-b-2 pb-1`}
                    >
                        {t("surah")}
                    </span>
                    <span>{t("memorize")}</span>
                    <span>{t("murojaah")}</span>
                </div>
            </div>
            <div className='flex-1 px-4 py-2 flex flex-col gap-2'>
                {mockSurah.map((i) => (
                    <div
                        key={i.n}
                        className={`p-2.5 border flex items-center justify-between rounded-xl ${cardBg}`}
                    >
                        <div className='flex items-center gap-3'>
                            <div
                                className={`w-7 h-7 border rounded flex items-center justify-center rotate-45 ${isDark ? "border-[#8c8577]" : "border-[#8c8577]"}`}
                            >
                                <span
                                    className={`font-serif font-bold text-[10px] -rotate-45 ${isDark ? "text-[#8c8577]" : "text-[#5b6e5b]"}`}
                                >
                                    {i.n}
                                </span>
                            </div>
                            <div>
                                <h3
                                    className={`font-bold font-serif text-xs flex items-center gap-1 ${textMain}`}
                                >
                                    {i.s}{" "}
                                    {i.h && (
                                        <CheckCircle2
                                            size={12}
                                            className={
                                                isDark
                                                    ? "text-[#e6e2d6]"
                                                    : "text-[#5b6e5b]"
                                            }
                                        />
                                    )}
                                </h3>
                            </div>
                        </div>
                        <div
                            className={`text-sm font-serif ${textMain}`}
                            dir='rtl'
                        >
                            {i.a}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const EarthIbadahTab = ({ isDark, t }) => {
    const [count, setCount] = useState(0);
    const cardBg = isDark
        ? "bg-[#2c332c] border-[#3e453e]"
        : "bg-[#f5f2eb] border-[#e6e2d6]";
    const textMain = isDark ? "text-[#e6e2d6]" : "text-[#3c3a35]";
    const textMut = isDark ? "text-[#8c8577]" : "text-[#8c8577]";

    return (
        <div className='flex flex-col h-full items-center px-4 pt-8'>
            <div className='w-full flex justify-between items-center mb-4'>
                <h1 className={`text-sm font-serif font-bold ${textMain}`}>
                    {t("ibadah")}
                </h1>
                <span
                    className={`text-[9px] font-bold px-2 py-1 rounded border ${isDark ? "bg-[#1a1c1a] border-[#3e453e] text-[#8c8577]" : "bg-[#f0ece1] border-[#e6e2d6] text-[#5b6e5b]"}`}
                >
                    Level: Pejuang
                </span>
            </div>
            <div className='w-full flex gap-3 mb-4'>
                <div
                    className={`flex-1 border rounded-2xl p-3 flex flex-col items-center ${cardBg}`}
                >
                    <h2
                        className={`text-xl font-serif mb-1 ${textMain}`}
                        dir='rtl'
                    >
                        سُبْحَانَ اللَّهِ
                    </h2>
                    <button
                        onClick={() => setCount((c) => c + 1)}
                        className={`w-16 h-16 rounded-[1rem] rotate-45 flex items-center justify-center shadow-md active:scale-95 mt-2 mb-3 border ${isDark ? "bg-[#3e453e] border-[#8c8577]/30" : "bg-[#5b6e5b] border-[#e6e2d6]"}`}
                    >
                        <div
                            className={`-rotate-45 font-serif text-xl font-bold ${isDark ? "text-[#e6e2d6]" : "text-stone-100"}`}
                        >
                            {count}
                        </div>
                    </button>
                    <button
                        onClick={() => setCount(0)}
                        className={`text-[8px] font-bold uppercase ${textMut}`}
                    >
                        <RotateCcw size={10} className='inline mr-1' />
                        Reset
                    </button>
                </div>
                <div
                    className={`flex-1 border rounded-2xl p-3 flex flex-col ${cardBg}`}
                >
                    <h3
                        className={`text-[9px] font-bold uppercase tracking-widest mb-2 border-b pb-1 ${isDark ? "border-[#3e453e] text-[#8c8577]" : "border-[#e6e2d6] text-[#8c8577]"}`}
                    >
                        {t("dailyDeeds")}
                    </h3>
                    <div className='flex items-center gap-2 mb-2'>
                        <input
                            type='checkbox'
                            className='accent-[#5b6e5b] w-3 h-3'
                        />
                        <span
                            className={`text-[10px] font-bold font-serif ${textMain}`}
                        >
                            {t("dhuha")}
                        </span>
                    </div>
                    <div className='flex items-center gap-2 mb-2'>
                        <input
                            type='checkbox'
                            className='accent-[#5b6e5b] w-3 h-3'
                        />
                        <span
                            className={`text-[10px] font-bold font-serif ${textMain}`}
                        >
                            {t("charity")}
                        </span>
                    </div>
                </div>
            </div>
            <div
                className={`w-full rounded-2xl p-3 shadow-sm border flex items-center gap-3 ${cardBg}`}
            >
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${isDark ? "bg-[#1a1c1a] border-[#3e453e] text-[#8c8577]" : "bg-[#f0ece1] border-[#e6e2d6] text-[#5b6e5b]"}`}
                >
                    <Calendar size={20} />
                </div>
                <div>
                    <h4 className={`text-xs font-serif font-bold ${textMain}`}>
                        {t("calTitle")}
                    </h4>
                    <p className={`text-[9px] font-serif ${textMut}`}>
                        {t("calDesc")}
                    </p>
                </div>
            </div>
        </div>
    );
};
const EarthIlmuTab = ({ isDark, t }) => {
    const cardBg = isDark
        ? "bg-[#2c332c] border-[#3e453e]"
        : "bg-[#f5f2eb] border-[#e6e2d6]";
    const textMain = isDark ? "text-[#e6e2d6]" : "text-[#3c3a35]";
    const textMut = isDark ? "text-[#8c8577]" : "text-[#8c8577]";

    return (
        <div className='flex flex-col h-full px-4 pt-8'>
            <h1 className={`text-lg font-serif font-bold mb-4 ${textMain}`}>
                {t("ilmu")}
            </h1>
            <div
                className={`rounded-lg flex items-center px-3 py-2 shadow-sm border mb-4 ${cardBg}`}
            >
                <Search size={14} className={`${textMut} mr-2`} />
                <input
                    type='text'
                    placeholder={t("search")}
                    className={`bg-transparent border-none outline-none w-full text-xs font-serif ${textMain}`}
                />
            </div>
            <h2
                className={`text-[10px] font-bold uppercase tracking-widest mt-2 mb-2 ${isDark ? "text-[#e6e2d6]" : "text-[#5b6e5b]"}`}
            >
                {t("latestLec")}
            </h2>
            <div className='flex flex-col gap-2 mb-4'>
                {mockKajian.map((k) => (
                    <div
                        key={k.id}
                        className={`p-2 rounded-xl border flex gap-2 items-center ${cardBg}`}
                    >
                        <div
                            className={`w-16 h-12 rounded-lg flex items-center justify-center text-white relative ${isDark ? "bg-[#1a1c1a] border border-[#3e453e] text-[#8c8577]" : "bg-[#8c8577]"}`}
                        >
                            <PlayCircle size={20} />
                            <span className='absolute bottom-1 right-1 bg-black/60 text-[6px] px-1 rounded font-mono'>
                                {k.dur}
                            </span>
                        </div>
                        <div className='flex-1'>
                            <h3
                                className={`text-xs font-serif font-bold line-clamp-1 ${textMain}`}
                            >
                                {k.title}
                            </h3>
                            <p className={`text-[9px] font-serif ${textMut}`}>
                                {k.ustadz}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const EarthProfilTab = ({ isDark, t }) => {
    const cardBg = isDark
        ? "bg-[#2c332c] border-[#3e453e]"
        : "bg-[#f5f2eb] border-[#e6e2d6]";
    const textMain = isDark ? "text-[#e6e2d6]" : "text-[#3c3a35]";

    return (
        <div className='flex flex-col h-full px-4 pt-8'>
            <div
                className={`flex items-center gap-3 mb-6 p-4 rounded-2xl border ${cardBg}`}
            >
                <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-lg border ${isDark ? "bg-[#1a1c1a] border-[#3e453e] text-[#8c8577]" : "bg-[#5b6e5b] text-white"}`}
                >
                    AF
                </div>
                <div className='flex-1'>
                    <h1 className={`text-sm font-serif font-bold ${textMain}`}>
                        Ahmad Fulan
                    </h1>
                </div>
            </div>

            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                <div
                    className={`p-3 border-b flex items-center gap-2 ${isDark ? "border-[#3e453e]" : "border-[#e6e2d6]"}`}
                >
                    <Trophy size={14} className='text-[#8c8577]' />
                    <span
                        className={`text-xs font-serif font-bold ${textMain}`}
                    >
                        {t("leaderboard")}
                    </span>
                </div>
                <div
                    className={`p-3 border-b flex items-center gap-2 ${isDark ? "border-[#3e453e]" : "border-[#e6e2d6]"}`}
                >
                    <Target size={14} className='text-[#8c8577]' />
                    <span
                        className={`text-xs font-serif font-bold ${textMain}`}
                    >
                        {t("target")}
                    </span>
                </div>
                <div className='p-3 flex items-center gap-2 text-red-500'>
                    <LogOut size={14} />
                    <span className='text-xs font-serif font-bold'>
                        {t("logout")}
                    </span>
                </div>
            </div>
        </div>
    );
};

/* ==========================================================================
   4. INDIGO DASHBOARD
   ========================================================================== */
function IndigoCompactTheme({ currentTime, isDark, t }) {
    const [activeTab, setActiveTab] = useState("home");
    const bg = isDark
        ? "bg-slate-950 text-indigo-100"
        : "bg-slate-50 text-slate-800";
    const navBg = isDark
        ? "bg-indigo-950 border-indigo-900"
        : "bg-white border-slate-200";

    return (
        <div className={`flex flex-col h-full ${bg}`}>
            <div className='flex-1 overflow-y-auto pb-16 hide-scrollbar'>
                {activeTab === "home" && (
                    <IndigoHomeTab
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {activeTab === "quran" && (
                    <CleanQuranTab isDark={isDark} t={t} />
                )}
                {activeTab === "ibadah" && (
                    <CleanIbadahTab isDark={isDark} t={t} />
                )}
                {activeTab === "ilmu" && <CleanIlmuTab isDark={isDark} t={t} />}
                {activeTab === "profil" && (
                    <CleanProfilTab isDark={isDark} t={t} />
                )}
            </div>
            <div
                className={`absolute bottom-0 w-full border-t flex justify-between items-center px-4 py-2 z-50 ${navBg}`}
            >
                <IndigoNavItem
                    icon={<Home size={18} />}
                    label={t("home")}
                    active={activeTab === "home"}
                    onClick={() => setActiveTab("home")}
                    isDark={isDark}
                />
                <IndigoNavItem
                    icon={<BookOpen size={18} />}
                    label={t("quran")}
                    active={activeTab === "quran"}
                    onClick={() => setActiveTab("quran")}
                    isDark={isDark}
                />
                <IndigoNavItem
                    icon={<Heart size={18} />}
                    label={t("ibadah")}
                    active={activeTab === "ibadah"}
                    onClick={() => setActiveTab("ibadah")}
                    isDark={isDark}
                />
                <IndigoNavItem
                    icon={<Book size={18} />}
                    label={t("ilmu")}
                    active={activeTab === "ilmu"}
                    onClick={() => setActiveTab("ilmu")}
                    isDark={isDark}
                />
                <IndigoNavItem
                    icon={<User size={18} />}
                    label={t("profil")}
                    active={activeTab === "profil"}
                    onClick={() => setActiveTab("profil")}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}
const IndigoNavItem = ({ icon, label, active, onClick, isDark }) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center gap-0.5 cursor-pointer w-12 transition-colors ${active ? (isDark ? "text-indigo-400" : "text-indigo-600") : "text-slate-500"}`}
    >
        {icon}
        <span className='text-[8px] font-bold tracking-wide uppercase mt-0.5'>
            {label}
        </span>
    </div>
);
const IndigoHomeTab = ({ currentTime, isDark, t }) => {
    const cardBg = isDark
        ? "bg-indigo-900/50 border-indigo-800"
        : "bg-white border-slate-200";
    const textMain = isDark ? "text-white" : "text-slate-800";

    return (
        <div className='flex flex-col gap-2 p-3'>
            <div className='flex justify-between items-center mt-3 mb-1'>
                <div className='flex items-center gap-2'>
                    <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${isDark ? "bg-indigo-800 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}
                    >
                        AF
                    </div>
                    <div>
                        <h1
                            className={`text-xs font-bold leading-tight ${textMain}`}
                        >
                            Ahmad Fulan
                        </h1>
                    </div>
                </div>
            </div>
            <div
                className={`bg-indigo-600 rounded-xl p-3 text-white flex flex-col gap-2`}
            >
                <div className='flex justify-between items-center'>
                    <div>
                        <p className='text-[8px] font-bold tracking-widest uppercase opacity-80 mb-0.5'>
                            {t("nextPrayer")}
                        </p>
                        <h2 className='text-2xl font-bold leading-none'>
                            15:14
                        </h2>
                    </div>
                </div>
                <div className='flex justify-between items-center bg-indigo-800/50 rounded-lg p-1.5 px-2'>
                    <span className='text-[8px] font-bold uppercase tracking-widest text-indigo-200'>
                        {t("tracker")}
                    </span>
                    <div className='flex gap-1'>
                        {mockSholat.map((s) => (
                            <div
                                key={s.id}
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${s.done ? "bg-emerald-400 text-indigo-900" : "bg-indigo-900 text-indigo-400"}`}
                            >
                                {s.id}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div
                className={`rounded-xl p-3 shadow-sm border grid grid-cols-4 gap-y-3 gap-x-1 ${cardBg}`}
            >
                <CompactIcon
                    icon={<BookOpenCheck size={16} />}
                    label={t("memorize")}
                    color={
                        isDark
                            ? "text-emerald-400 bg-emerald-900/50"
                            : "text-emerald-600 bg-emerald-50"
                    }
                    isDark={isDark}
                />
                <CompactIcon
                    icon={<Smile size={16} />}
                    label={t("journal")}
                    color={
                        isDark
                            ? "text-rose-400 bg-rose-900/50"
                            : "text-rose-600 bg-rose-50"
                    }
                    isDark={isDark}
                />
                <CompactIcon
                    icon={<Heart size={16} />}
                    label={t("ibadah")}
                    color={
                        isDark
                            ? "text-indigo-400 bg-indigo-900/50"
                            : "text-indigo-600 bg-indigo-50"
                    }
                    isDark={isDark}
                />
                <CompactIcon
                    icon={<FileText size={16} />}
                    label={t("tafsir")}
                    color={
                        isDark
                            ? "text-cyan-400 bg-cyan-900/50"
                            : "text-cyan-600 bg-cyan-50"
                    }
                    isDark={isDark}
                />
            </div>
        </div>
    );
};
const CompactIcon = ({ icon, label, color, isDark }) => (
    <div className='flex flex-col items-center gap-1 cursor-pointer'>
        <div
            className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}
        >
            {icon}
        </div>
        <span
            className={`text-[8px] font-bold uppercase ${isDark ? "text-indigo-200" : "text-slate-600"}`}
        >
            {label}
        </span>
    </div>
);

/* ==========================================================================
   5. OLED BENTO
   ========================================================================== */
function OledBentoTheme({ currentTime, isDark, t }) {
    const [activeTab, setActiveTab] = useState("home");
    const bg = isDark ? "bg-black text-gray-300" : "bg-gray-100 text-gray-800";
    const navBg = isDark
        ? "bg-black/95 border-gray-900"
        : "bg-white/95 border-gray-300";
    return (
        <div className={`flex flex-col h-full ${bg}`}>
            <div className='flex-1 overflow-y-auto pb-14 hide-scrollbar'>
                {activeTab === "home" && (
                    <OledHomeTab
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {activeTab === "quran" && (
                    <CleanQuranTab isDark={isDark} t={t} />
                )}
                {activeTab === "ibadah" && (
                    <CleanIbadahTab isDark={isDark} t={t} />
                )}
                {activeTab === "ilmu" && <CleanIlmuTab isDark={isDark} t={t} />}
                {activeTab === "profil" && (
                    <CleanProfilTab isDark={isDark} t={t} />
                )}
            </div>
            <div
                className={`absolute bottom-0 w-full backdrop-blur-md border-t flex justify-around items-center px-1 py-1.5 z-50 ${navBg}`}
            >
                <OledNavItem
                    icon={<Home size={18} />}
                    active={activeTab === "home"}
                    onClick={() => setActiveTab("home")}
                    isDark={isDark}
                />
                <OledNavItem
                    icon={<BookOpen size={18} />}
                    active={activeTab === "quran"}
                    onClick={() => setActiveTab("quran")}
                    isDark={isDark}
                />
                <div className='relative -top-3'>
                    <button
                        onClick={() => setActiveTab("ibadah")}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border ${activeTab === "ibadah" ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)] border-transparent" : isDark ? "bg-gray-900 border-gray-800 text-gray-400" : "bg-white border-gray-300 text-gray-400"}`}
                    >
                        <Heart
                            size={18}
                            className={
                                activeTab === "ibadah" ? "fill-black" : ""
                            }
                        />
                    </button>
                </div>
                <OledNavItem
                    icon={<Book size={18} />}
                    active={activeTab === "ilmu"}
                    onClick={() => setActiveTab("ilmu")}
                    isDark={isDark}
                />
                <OledNavItem
                    icon={<User size={18} />}
                    active={activeTab === "profil"}
                    onClick={() => setActiveTab("profil")}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}
const OledNavItem = ({ icon, active, onClick, isDark }) => (
    <div
        onClick={onClick}
        className={`p-1.5 rounded-lg cursor-pointer transition-colors ${active ? (isDark ? "text-emerald-400 bg-gray-900" : "text-emerald-600 bg-gray-200") : "text-gray-500"}`}
    >
        {icon}
    </div>
);
const OledHomeTab = ({ currentTime, isDark, t }) => {
    const cardBg = isDark
        ? "bg-gray-900/50 border-gray-800"
        : "bg-white border-gray-300 shadow-sm";
    const textMain = isDark ? "text-white" : "text-gray-900";
    return (
        <div className='p-2 pt-6'>
            <div className='flex justify-between items-center mb-3 px-1'>
                <h1 className={`text-sm font-bold tracking-tight ${textMain}`}>
                    Tholabul Ilmi
                </h1>
            </div>
            <div className='grid grid-cols-2 gap-1.5 auto-rows-[75px]'>
                <div
                    className={`col-span-2 rounded-xl p-2.5 flex flex-col justify-between relative overflow-hidden border ${cardBg}`}
                >
                    <div className='absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl'></div>
                    <div className='flex justify-between items-center relative z-10'>
                        <div className='flex items-center gap-2'>
                            <p className='text-[8px] text-emerald-500 font-mono uppercase tracking-widest'>
                                {t("ashar")}
                            </p>
                        </div>
                        <h2
                            className={`text-2xl font-bold mb-0.5 leading-none ${textMain}`}
                        >
                            15:14
                        </h2>
                    </div>
                    <div className='flex justify-between items-center relative z-10 mt-auto pt-2 border-t border-gray-800/50'>
                        <span className='text-[8px] font-mono text-gray-500'>
                            {t("tracker")}
                        </span>
                        <div className='flex gap-0.5'>
                            {mockSholat.map((s) => (
                                <div
                                    key={s.id}
                                    className={`w-3 h-3 rounded-full text-[6px] font-bold flex items-center justify-center ${s.done ? "bg-emerald-500 text-black" : isDark ? "bg-gray-800 text-gray-600" : "bg-gray-200 text-gray-400"}`}
                                >
                                    {s.id}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div
                    className={`col-span-2 row-span-2 rounded-xl p-2 border ${cardBg}`}
                >
                    <div className='grid grid-cols-4 gap-1 h-full'>
                        <OledMenuIcon
                            icon={<BookOpenCheck size={16} />}
                            label={t("memorize")}
                            isDark={isDark}
                        />
                        <OledMenuIcon
                            icon={<Smile size={16} />}
                            label={t("journal")}
                            isDark={isDark}
                        />
                        <OledMenuIcon
                            icon={<HelpCircle size={16} />}
                            label={t("quiz")}
                            isDark={isDark}
                        />
                        <OledMenuIcon
                            icon={<Video size={16} />}
                            label={t("lecture")}
                            isDark={isDark}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
const OledMenuIcon = ({ icon, label, isDark }) => (
    <div
        className={`flex flex-col items-center justify-center gap-1 cursor-pointer rounded-lg ${isDark ? "bg-gray-900/40 hover:bg-gray-800" : "bg-gray-50 hover:bg-gray-100"}`}
    >
        <div className={isDark ? "text-emerald-400" : "text-emerald-600"}>
            {icon}
        </div>
        <span
            className={`text-[7px] font-mono uppercase ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
            {label}
        </span>
    </div>
);

/* ==========================================================================
   6. GLASS AURORA
   ========================================================================== */
function AuroraTheme({ currentTime, isDark, t }) {
    const [activeTab, setActiveTab] = useState("home");
    const bg = isDark
        ? "bg-slate-900 text-white"
        : "bg-slate-50 text-slate-800";
    const navBg = isDark
        ? "bg-white/10 border-white/20"
        : "bg-white/80 border-slate-200 shadow-xl";

    return (
        <div className={`flex flex-col h-full relative overflow-hidden ${bg}`}>
            <div
                className={`absolute -top-10 -left-10 w-64 h-64 rounded-full blur-[60px] pointer-events-none ${isDark ? "bg-fuchsia-600/40" : "bg-fuchsia-400/30"}`}
            ></div>
            <div
                className={`absolute -bottom-20 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none ${isDark ? "bg-blue-600/30" : "bg-blue-400/20"}`}
            ></div>
            <div className='flex-1 overflow-y-auto pb-20 hide-scrollbar relative z-10'>
                {activeTab === "home" && (
                    <AuroraHomeTab
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {activeTab === "quran" && (
                    <CleanQuranTab isDark={isDark} t={t} />
                )}
                {activeTab === "ibadah" && (
                    <CleanIbadahTab isDark={isDark} t={t} />
                )}
                {activeTab === "ilmu" && <CleanIlmuTab isDark={isDark} t={t} />}
                {activeTab === "profil" && (
                    <CleanProfilTab isDark={isDark} t={t} />
                )}
            </div>
            <div
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] backdrop-blur-xl rounded-[2rem] flex justify-between items-center px-3 py-2 z-50 border ${navBg}`}
            >
                <AuroraNavItem
                    icon={<Home size={18} />}
                    active={activeTab === "home"}
                    onClick={() => setActiveTab("home")}
                    isDark={isDark}
                />
                <AuroraNavItem
                    icon={<BookOpen size={18} />}
                    active={activeTab === "quran"}
                    onClick={() => setActiveTab("quran")}
                    isDark={isDark}
                />
                <AuroraNavItem
                    icon={<Heart size={18} />}
                    active={activeTab === "ibadah"}
                    onClick={() => setActiveTab("ibadah")}
                    isDark={isDark}
                />
                <AuroraNavItem
                    icon={<Book size={18} />}
                    active={activeTab === "ilmu"}
                    onClick={() => setActiveTab("ilmu")}
                    isDark={isDark}
                />
                <AuroraNavItem
                    icon={<User size={18} />}
                    active={activeTab === "profil"}
                    onClick={() => setActiveTab("profil")}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}
const AuroraNavItem = ({ icon, active, onClick, isDark }) => (
    <div
        onClick={onClick}
        className={`p-2 rounded-2xl cursor-pointer transition-all ${active ? "bg-gradient-to-br from-fuchsia-500/80 to-blue-500/80 shadow-md text-white" : isDark ? "text-slate-400" : "text-slate-500"}`}
    >
        {icon}
    </div>
);
const AuroraHomeTab = ({ currentTime, isDark, t }) => {
    const cardBg = isDark
        ? "bg-white/10 border-white/20 text-white"
        : "bg-white/60 border-white/40 text-slate-800";
    return (
        <div className='p-4'>
            <div className='flex justify-between items-center mt-2 mb-4'>
                <div>
                    <h1 className='text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-blue-500'>
                        Hi, Ahmad
                    </h1>
                </div>
            </div>
            <div
                className={`backdrop-blur-lg border rounded-2xl p-4 mb-4 relative overflow-hidden flex flex-col justify-between ${cardBg}`}
            >
                <div className='absolute top-0 right-0 p-2 opacity-20'>
                    <Moon size={40} />
                </div>
                <div className='flex justify-between items-center mb-4'>
                    <div className='relative z-10'>
                        <p
                            className={`text-[10px] font-medium mb-0.5 uppercase tracking-widest ${isDark ? "text-fuchsia-200" : "text-fuchsia-700"}`}
                        >
                            {t("ashar")}
                        </p>
                        <h2 className='text-3xl font-light tracking-tighter'>
                            15:14
                        </h2>
                    </div>
                </div>
                <div className='border-t border-white/10 pt-2 flex justify-between items-center'>
                    <span className='text-[9px] uppercase tracking-widest font-bold text-fuchsia-200/70'>
                        {t("tracker")}
                    </span>
                    <div className='flex gap-1.5'>
                        {mockSholat.map((s) => (
                            <div
                                key={s.id}
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${s.done ? "bg-fuchsia-400 text-slate-900" : "bg-white/10 text-white/50"}`}
                            >
                                {s.id}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='grid grid-cols-4 gap-2 mb-4'>
                <AuroraMenuIcon
                    icon={<BookOpenCheck size={16} />}
                    label={t("memorize")}
                    isDark={isDark}
                />
                <AuroraMenuIcon
                    icon={<Smile size={16} />}
                    label={t("journal")}
                    isDark={isDark}
                />
                <AuroraMenuIcon
                    icon={<HelpCircle size={16} />}
                    label={t("quiz")}
                    isDark={isDark}
                />
                <AuroraMenuIcon
                    icon={<Video size={16} />}
                    label={t("lecture")}
                    isDark={isDark}
                />
            </div>
        </div>
    );
};
const AuroraMenuIcon = ({ icon, label, isDark }) => (
    <div className='flex flex-col items-center gap-1 cursor-pointer'>
        <div
            className={`w-10 h-10 backdrop-blur-sm border rounded-xl flex items-center justify-center ${isDark ? "bg-white/5 border-white/10 text-fuchsia-100" : "bg-white/60 border-white/40 text-fuchsia-600"}`}
        >
            {icon}
        </div>
        <span
            className={`text-[8px] font-bold tracking-widest uppercase ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
            {label}
        </span>
    </div>
);

/* ==========================================================================
   7. MOSAIC ARCH
   ========================================================================== */
function MosaicTheme({ currentTime, isDark, t }) {
    const [activeTab, setActiveTab] = useState("home");
    const bg = isDark
        ? "bg-[#0f172a] text-[#fdfbf7]"
        : "bg-[#fdfbf7] text-slate-800";
    const navBg = "bg-blue-950 border border-blue-800";

    return (
        <div className={`flex flex-col h-full font-serif ${bg}`}>
            <div className='flex-1 overflow-y-auto pb-20 hide-scrollbar'>
                {activeTab === "home" && (
                    <MosaicHomeTab
                        currentTime={currentTime}
                        isDark={isDark}
                        t={t}
                    />
                )}
                {activeTab === "quran" && (
                    <CleanQuranTab isDark={isDark} t={t} />
                )}
                {activeTab === "ibadah" && (
                    <CleanIbadahTab isDark={isDark} t={t} />
                )}
                {activeTab === "ilmu" && <CleanIlmuTab isDark={isDark} t={t} />}
                {activeTab === "profil" && (
                    <CleanProfilTab isDark={isDark} t={t} />
                )}
            </div>
            <div
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] rounded-full flex justify-between items-center px-2 py-2 z-50 shadow-[0_10px_30px_rgba(23,37,84,0.4)] ${navBg}`}
            >
                <MosaicNavItem
                    icon={<Home size={20} />}
                    active={activeTab === "home"}
                    onClick={() => setActiveTab("home")}
                />
                <MosaicNavItem
                    icon={<BookOpen size={20} />}
                    active={activeTab === "quran"}
                    onClick={() => setActiveTab("quran")}
                />
                <MosaicNavItem
                    icon={<Heart size={20} />}
                    active={activeTab === "ibadah"}
                    onClick={() => setActiveTab("ibadah")}
                />
                <MosaicNavItem
                    icon={<Book size={20} />}
                    active={activeTab === "ilmu"}
                    onClick={() => setActiveTab("ilmu")}
                />
                <MosaicNavItem
                    icon={<User size={20} />}
                    active={activeTab === "profil"}
                    onClick={() => setActiveTab("profil")}
                />
            </div>
        </div>
    );
}
const MosaicNavItem = ({ icon, active, onClick }) => (
    <div
        onClick={onClick}
        className={`p-2 rounded-full cursor-pointer transition-all duration-300 ${active ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "text-blue-200/60 hover:text-orange-200"}`}
    >
        {icon}
    </div>
);
const MosaicHomeTab = ({ currentTime, isDark, t }) => {
    return (
        <div className='flex flex-col'>
            <div className='bg-blue-950 rounded-b-[3rem] p-6 pb-14 text-white relative overflow-hidden shadow-md'>
                <div className='absolute -right-10 -top-10 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl'></div>
                <div className='flex justify-between items-center relative z-10'>
                    <div>
                        <h1 className='text-2xl font-bold font-sans'>
                            Ahmad Fulan
                        </h1>
                    </div>
                </div>
            </div>
            <div className='px-4 -mt-10 relative z-20 flex flex-col gap-4'>
                <div className='bg-gradient-to-br from-orange-600 to-orange-800 rounded-[2rem] rounded-tl-none p-4 text-white shadow-lg flex flex-col border border-orange-500/50'>
                    <div className='flex justify-between items-center mb-3'>
                        <div>
                            <p className='text-[10px] text-orange-200 font-bold uppercase tracking-widest mb-1 flex items-center gap-1'>
                                <Compass size={12} /> {t("ashar")}
                            </p>
                            <h2 className='text-3xl font-bold font-sans tracking-tight'>
                                15:14
                            </h2>
                        </div>
                    </div>
                    <div className='border-t border-orange-500/50 pt-2 flex justify-between items-center'>
                        <span className='text-[9px] font-sans font-bold uppercase tracking-widest text-orange-200'>
                            {t("tracker")}
                        </span>
                        <div className='flex gap-1.5'>
                            {mockSholat.map((s) => (
                                <div
                                    key={s.id}
                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold font-sans ${s.done ? "bg-white text-orange-700" : "bg-orange-900/50 text-orange-300"}`}
                                >
                                    {s.id}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='grid grid-cols-4 gap-2'>
                    <MosaicMenuCard
                        icon={<BookOpenCheck size={18} />}
                        label={t("memorize")}
                        isDark={isDark}
                    />
                    <MosaicMenuCard
                        icon={<Smile size={18} />}
                        label={t("journal")}
                        isDark={isDark}
                    />
                    <MosaicMenuCard
                        icon={<HelpCircle size={18} />}
                        label={t("quiz")}
                        isDark={isDark}
                    />
                    <MosaicMenuCard
                        icon={<Video size={18} />}
                        label={t("lecture")}
                        isDark={isDark}
                    />
                </div>
            </div>
        </div>
    );
};
const MosaicMenuCard = ({ icon, label, isDark }) => (
    <div
        className={`flex flex-col items-center border rounded-t-full rounded-b-xl p-2 pb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer hover:-translate-y-1 transition-transform ${isDark ? "bg-slate-900 border-blue-900/50" : "bg-white border-amber-100/50"}`}
    >
        <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDark ? "bg-orange-900/50 text-orange-400" : "bg-orange-50 text-orange-600"}`}
        >
            {icon}
        </div>
        <span
            className={`text-[8px] font-bold font-sans uppercase tracking-widest ${isDark ? "text-orange-100" : "text-blue-950"}`}
        >
            {label}
        </span>
    </div>
);
