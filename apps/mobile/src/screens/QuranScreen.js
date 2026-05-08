import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ArrowLeft,
    BookOpen,
    Bookmark,
    BookmarkCheck,
    CheckCircle2,
    Info,
    Minus,
    MoreVertical,
    Pause,
    Plus,
    Save,
    Search,
    SlidersHorizontal,
    StickyNote,
    Volume2,
    X,
} from 'lucide-react-native';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {
    getAsbabForAyah,
    getAyahAudio,
    getAyahsForHizb,
    getAyahsForPage,
    getAyahsForSurah,
    getFirstAyahForSurah,
    getSurahs,
    getTafsirForAyah,
} from '../api/client';
import {
    addBookmark,
    deleteBookmark,
    getBookmarks,
    getHafalanList,
    getHafalanSummary,
    getMurojaahSession,
    getQuranProgress,
    saveMurojaahResult,
    saveQuranProgress,
    updateHafalanStatus,
} from '../api/personal';
import { Card, CardTitle } from '../components/Card';
import { NotesPanel } from '../components/NotesPanel';
import { EmptyState, IconActionButton } from '../components/Paper';
import { useFeedback } from '../context/FeedbackContext';
import { useSession } from '../context/SessionContext';
import { useTabActivity } from '../context/TabActivityContext';
import { preferenceKeys, readPreference, writePreference } from '../storage/preferences';
import { colors, radius, spacing } from '../theme';
import { playAudioUrl, stopAudio } from '../utils/audioPlayer';

const MEMORIZATION_MODES = [
    { key: 'off', label: 'Normal' },
    { key: 'hide_arabic', label: 'Sembunyikan Arab' },
    { key: 'hide_translation', label: 'Sembunyikan Terjemah' },
    { key: 'hide_all', label: 'Latihan Penuh' },
];

const DISPLAY_MODES = [
    {
        key: 'line',
        label: 'Garis',
        title: 'Rapi per baris',
        description: 'Tanpa kartu, cocok untuk baca cepat dengan terjemah.',
    },
    {
        key: 'card',
        label: 'Card',
        title: 'Kartu ayat',
        description: 'Arab, latin, terjemah, dan aksi ayat tampil lengkap.',
    },
    {
        key: 'focus',
        label: 'Fokus',
        title: 'Arab dominan',
        description: 'Terjemah disembunyikan agar layar lebih tenang.',
    },
    {
        key: 'mushaf',
        label: 'Mushaf',
        title: 'Halaman mushaf',
        description: 'Arab kontinu dalam satu halaman, tanpa kartu per ayat.',
    },
];

const ARABIC_FONTS = [
    { key: 'default', label: 'Naskh', fontFamily: null },
    { key: 'uthmani', label: 'Uthmani', fontFamily: 'KFGQPC HAFS Uthmanic Script' },
    { key: 'indopak', label: 'Indopak', fontFamily: 'Noore Hidayat' },
    { key: 'amiri', label: 'Amiri', fontFamily: 'Amiri' },
];

const QURAN_TABS = [
    { key: 'surah', label: 'Surah' },
    { key: 'hafalan', label: 'Hafalan' },
    { key: 'murojaah', label: 'Murojaah' },
];

const TAJWEED_GROUPS = [
    {
        key: 'idgham',
        color: '#16a34a',
        title: 'Idgham',
        description: 'Memasukkan nun sukun/tanwin ke huruf berikutnya hingga menjadi satu',
        rules: [
            {
                key: 'idgham-bighunnah',
                color: '#22c55e',
                title: 'Bighunnah',
                description: 'Dengan dengung (2 harakat) — huruf: ي ن م و',
                example: 'مِن يَّقُولُ',
            },
            {
                key: 'idgham-bilaghunnah',
                color: '#86efac',
                title: 'Bila Ghunnah',
                description: 'Tanpa dengung — huruf: ل ر',
                example: 'مِن لَّدُنْهُ',
            },
        ],
    },
    {
        key: 'idzhar',
        color: '#2563eb',
        title: 'Idzhar',
        description: 'Membaca nun sukun/tanwin dengan jelas tanpa dengung',
        rules: [
            {
                key: 'idzhar-halqi',
                color: '#3b82f6',
                title: 'Halqi',
                description: 'Huruf halq: ء ه ع ح غ خ',
                example: 'مِنْ خَيْرٍ',
            },
            {
                key: 'idzhar-syafawi',
                color: '#93c5fd',
                title: 'Syafawi',
                description: 'Mim sukun diikuti huruf selain م dan ب',
                example: 'لَهُمْ فِيهَا',
            },
        ],
    },
    {
        key: 'iqlab',
        color: '#d97706',
        title: 'Iqlab',
        description: 'Menukar nun sukun/tanwin menjadi mim dengan dengung',
        rules: [
            {
                key: 'iqlab',
                color: '#f59e0b',
                title: 'Iqlab',
                description: 'Nun sukun/tanwin bertemu ب',
                example: 'مِنْ بَعْدِ',
            },
        ],
    },
    {
        key: 'ikhfa',
        color: '#db2777',
        title: 'Ikhfa',
        description: 'Menyembunyikan nun sukun/tanwin antara jelas dan melebur',
        rules: [
            {
                key: 'ikhfa-haqiqi',
                color: '#ec4899',
                title: 'Haqiqi',
                description: '15 huruf ikhfa (selain ب dan huruf idgham/idzhar)',
                example: 'مِن تَحْتِهَا',
            },
            {
                key: 'ikhfa-syafawi',
                color: '#f9a8d4',
                title: 'Syafawi',
                description: 'Mim sukun bertemu ب',
                example: 'رَبَّهُم بِٱلْغَيْبِ',
            },
        ],
    },
    {
        key: 'ghunnah',
        color: '#7c3aed',
        title: 'Ghunnah',
        description: 'Dengung pada nun atau mim bertasydid (2 harakat)',
        rules: [
            {
                key: 'ghunnah',
                color: '#8b5cf6',
                title: 'Ghunnah Musyaddadah',
                description: 'Nun atau mim yang mendapat tasydid',
                example: 'إِنَّ ٱلَّذِينَ',
            },
        ],
    },
    {
        key: 'mad',
        color: '#0d9488',
        title: 'Mad',
        description: 'Memanjangkan bacaan lebih dari 2 harakat',
        rules: [
            {
                key: 'mad-thabii',
                color: '#14b8a6',
                title: "Thabi'i (2 harakat)",
                description: "Mad asli — huruf mad (ا و ي) tanpa hamzah atau sukun sesudahnya",
                example: 'قَالَ',
            },
            {
                key: 'mad-wajib',
                color: '#2dd4bf',
                title: 'Wajib Muttashil (4–5)',
                description: 'Huruf mad bertemu hamzah dalam satu kata',
                example: 'جَاءَ',
            },
            {
                key: 'mad-jaiz',
                color: '#99f6e4',
                title: 'Jaiz Munfashil (2–5)',
                description: 'Huruf mad bertemu hamzah di awal kata berikutnya',
                example: 'إِنَّا أَعْطَيْنَٰكَ',
            },
            {
                key: 'mad-aridh',
                color: '#5eead4',
                title: "'Aridh Lissukun (2–6)",
                description: 'Mad thabi\'i diikuti huruf yang dibaca waqf/sukun',
                example: 'نَسْتَعِينُ',
            },
            {
                key: 'mad-lazim',
                color: '#0f766e',
                title: 'Lazim (6 harakat)',
                description: 'Huruf mad diikuti sukun lazim (asli) atau tasydid',
                example: 'وَلَا ٱلضَّآلِّينَ',
            },
        ],
    },
    {
        key: 'qalqalah',
        color: '#ea580c',
        title: 'Qalqalah',
        description: 'Memantulkan suara — huruf: ق ط ب ج د',
        rules: [
            {
                key: 'qalqalah-sughra',
                color: '#f97316',
                title: 'Sughra',
                description: 'Huruf qalqalah sukun di tengah kata (pantulan ringan)',
                example: 'يَقْتُلُونَ',
            },
            {
                key: 'qalqalah-kubra',
                color: '#fed7aa',
                title: 'Kubra',
                description: 'Huruf qalqalah di akhir kata saat waqf (pantulan kuat)',
                example: 'أَحَدٌ',
            },
        ],
    },
];

export function QuranScreen({ deepLinkTarget, isActive, navigation }) {
    const { user } = useSession();
    const { showError, showInfo, showSuccess } = useFeedback();
    const { notifyTabActivity } = useTabActivity();
    const handledDeepLinkId = useRef(null);
    const readerListRef = useRef(null);
    const [surahs, setSurahs] = useState([]);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [ayahs, setAyahs] = useState([]);
    const [targetAyah, setTargetAyah] = useState(null);
    const [bookmarks, setBookmarks] = useState({});
    const [loading, setLoading] = useState(true);
    const [readerLoading, setReaderLoading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [savingSurah, setSavingSurah] = useState(null);
    const [savingAyah, setSavingAyah] = useState(null);
    const [fontSize, setFontSize] = useState(28);
    const [arabicFont, setArabicFont] = useState('default');
    const [displayMode, setDisplayMode] = useState('card');
    const [activeNoteAyah, setActiveNoteAyah] = useState(null);
    const [referenceState, setReferenceState] = useState({});
    const [message, setMessage] = useState('');
    const [navigatorMode, setNavigatorMode] = useState('page');
    const [pageInput, setPageInput] = useState('1');
    const [hizbInput, setHizbInput] = useState('1');
    const [quranTab, setQuranTab] = useState('surah');
    const [surahQuery, setSurahQuery] = useState('');
    const [memorizationMode, setMemorizationMode] = useState('off');
    const [revealedAyahs, setRevealedAyahs] = useState({});
    const [audioState, setAudioState] = useState({
        activeAyahId: null,
        loadingAyahId: null,
        playingAyahId: null,
        qariSlug: 'Alafasy_64kbps',
        sourcesByAyah: {},
    });
    const [hafalanList, setHafalanList] = useState([]);
    const [hafalanSummary, setHafalanSummary] = useState(null);
    const [hafalanLoading, setHafalanLoading] = useState(false);
    const [murojaahSessions, setMurojaahSessions] = useState([]);
    const [murojaahLoading, setMurojaahLoading] = useState(false);
    const [murojaahForm, setMurojaahForm] = useState({ surahId: null, score: 100, note: '' });
    const [murojaahMessage, setMurojaahMessage] = useState('');
    const [savingMurojaah, setSavingMurojaah] = useState(false);

    // Modal state
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [tajweedVisible, setTajweedVisible] = useState(false);
    const [referenceModal, setReferenceModal] = useState({ visible: false, type: null, ayah: null });
    const [ayahActionSheet, setAyahActionSheet] = useState({ visible: false, ayah: null });

    const handleScrollActivity = useCallback(() => {
        notifyTabActivity();
    }, [notifyTabActivity]);

    const updateFontSize = async (nextSize) => {
        const normalized = Math.max(22, Math.min(42, nextSize));
        setFontSize(normalized);
        await writePreference(preferenceKeys.quranFontSize, normalized);
    };

    const updateArabicFont = async (key) => {
        setArabicFont(key);
        await writePreference(preferenceKeys.quranArabicFont, key);
    };

    const updateDisplayMode = async (key) => {
        setDisplayMode(key);
        await writePreference(preferenceKeys.quranDisplayMode, key);
    };

    const updateMemorizationMode = async (mode) => {
        setMemorizationMode(mode);
        setRevealedAyahs({});
        await writePreference(preferenceKeys.quranMemorizationMode, mode);
    };

    const openReferenceModal = async (ayah, type) => {
        setReferenceModal({ visible: true, type, ayah });
        const key = `${type}:${ayah.id}`;
        if (referenceState[key]?.items || referenceState[key]?.loading) return;

        setReferenceState((current) => ({
            ...current,
            [key]: { items: [], loading: true, error: '' },
        }));

        try {
            const items =
                type === 'tafsir' ? await getTafsirForAyah(ayah.id) : await getAsbabForAyah(ayah.id);
            setReferenceState((current) => ({
                ...current,
                [key]: {
                    items,
                    loading: false,
                    error: items.length
                        ? ''
                        : `${type === 'tafsir' ? 'Tafsir' : 'Asbabun Nuzul'} belum tersedia.`,
                },
            }));
        } catch (err) {
            setReferenceState((current) => ({
                ...current,
                [key]: { items: [], loading: false, error: err?.message ?? 'Rujukan belum bisa dimuat.' },
            }));
        }
    };

    const load = useCallback(async () => {
        setLoading(true);
        const items = await getSurahs();
        setSurahs(items);
        setLoading(false);
    }, []);

    const loadProgress = useCallback(async () => {
        if (!user) {
            setProgress(null);
            return;
        }
        try {
            setProgress(await getQuranProgress());
        } catch {
            setProgress(null);
        }
    }, [user]);

    const loadBookmarks = useCallback(async () => {
        if (!user) {
            setBookmarks({});
            return;
        }
        try {
            const items = await getBookmarks();
            const mapped = items.reduce((acc, item) => {
                if (item.ref_type === 'ayah') acc[item.ref_id] = item;
                return acc;
            }, {});
            setBookmarks(mapped);
        } catch {
            setBookmarks({});
        }
    }, [user]);

    const loadHafalan = useCallback(async () => {
        if (!user) {
            setHafalanList([]);
            setHafalanSummary(null);
            return;
        }
        setHafalanLoading(true);
        try {
            const [list, summary] = await Promise.allSettled([getHafalanList(), getHafalanSummary()]);
            setHafalanList(list.status === 'fulfilled' ? list.value : []);
            setHafalanSummary(summary.status === 'fulfilled' ? summary.value : null);
        } catch {
            setHafalanList([]);
        } finally {
            setHafalanLoading(false);
        }
    }, [user]);

    const loadMurojaah = useCallback(async () => {
        if (!user) {
            setMurojaahSessions([]);
            return;
        }
        setMurojaahLoading(true);
        setMurojaahMessage('');
        try {
            setMurojaahSessions(await getMurojaahSession());
        } catch {
            setMurojaahSessions([]);
        } finally {
            setMurojaahLoading(false);
        }
    }, [user]);

    const cycleHafalanStatus = useCallback(
        async (surah) => {
            const cycle = {
                not_started: 'in_progress',
                in_progress: 'memorized',
                memorized: 'not_started',
            };
            const current = hafalanList.find((item) => Number(item.surah_id) === Number(surah.number));
            const currentStatus = current?.status ?? 'not_started';
            const nextStatus = cycle[currentStatus] ?? 'in_progress';

            setHafalanList((prev) => {
                const exists = prev.some((item) => Number(item.surah_id) === Number(surah.number));
                if (exists) {
                    return prev.map((item) =>
                        Number(item.surah_id) === Number(surah.number)
                            ? { ...item, status: nextStatus }
                            : item,
                    );
                }
                return [...prev, { surah_id: surah.number, status: nextStatus }];
            });

            try {
                await updateHafalanStatus(surah.number, nextStatus);
                await loadHafalan();
                showSuccess(`${surah.name} ditandai ${nextStatus === 'memorized' ? 'hafal' : nextStatus === 'in_progress' ? 'sedang dihafal' : 'belum dihafal'}.`);
            } catch {
                setHafalanList((prev) =>
                    prev.map((item) =>
                        Number(item.surah_id) === Number(surah.number)
                            ? { ...item, status: currentStatus }
                            : item,
                    ),
                );
                showError('Status hafalan belum bisa disimpan.');
            }
        },
        [hafalanList, loadHafalan, showError, showSuccess],
    );

    const submitMurojaah = useCallback(async () => {
        if (!murojaahForm.surahId) {
            setMurojaahMessage('Pilih surah terlebih dahulu.');
            showInfo('Pilih surah terlebih dahulu.');
            return;
        }
        setSavingMurojaah(true);
        setMurojaahMessage('');
        try {
            await saveMurojaahResult({
                surahId: murojaahForm.surahId,
                fromAyah: 1,
                toAyah: 999,
                score: murojaahForm.score,
                durationSeconds: 0,
                note: murojaahForm.note,
            });
            setMurojaahMessage('Sesi murojaah berhasil disimpan.');
            showSuccess('Sesi murojaah berhasil disimpan.');
            setMurojaahForm((prev) => ({ ...prev, surahId: null, note: '' }));
            await loadMurojaah();
        } catch (err) {
            const nextMessage = err?.message ?? 'Murojaah belum bisa disimpan.';
            setMurojaahMessage(nextMessage);
            showError(nextMessage);
        } finally {
            setSavingMurojaah(false);
        }
    }, [loadMurojaah, murojaahForm, showError, showInfo, showSuccess]);

    const refreshAll = useCallback(async () => {
        await load();
        await loadProgress();
        await loadBookmarks();
    }, [load, loadBookmarks, loadProgress]);

    const resetReaderState = () => {
        stopAudio();
        setAudioState((current) => ({
            ...current,
            activeAyahId: null,
            loadingAyahId: null,
            playingAyahId: null,
        }));
        setActiveNoteAyah(null);
        setReferenceModal({ visible: false, type: null, ayah: null });
        setAyahActionSheet({ visible: false, ayah: null });
        setRevealedAyahs({});
        setTargetAyah(null);
        setMessage('');
    };

    const openSurah = async (surah, options = {}) => {
        resetReaderState();
        setSelectedSurah({ ...surah, key: `surah:${surah.number}`, type: 'surah' });
        const nextTargetAyah = options.ayahNumber || options.ayahId
            ? {
                id: options.ayahId ?? null,
                number: options.ayahNumber ?? null,
              }
            : null;
        setTargetAyah(nextTargetAyah);
        setReaderLoading(true);
        try {
            setAyahs(await getAyahsForSurah(surah.number));
            await loadBookmarks();
            if (nextTargetAyah?.number) {
                setMessage(`Dibuka dari pencarian ke ayat ${nextTargetAyah.number}.`);
            }
        } catch (err) {
            setAyahs([]);
            setMessage(err?.message ?? 'Ayat belum bisa dimuat.');
        } finally {
            setReaderLoading(false);
        }
    };

    const normalizeRangeInput = (value, min, max) => {
        const numeric = Number.parseInt(`${value}`, 10);
        if (!Number.isFinite(numeric)) return min;
        return Math.max(min, Math.min(max, numeric));
    };

    const openPage = async (value = pageInput) => {
        const page = normalizeRangeInput(value, 1, 604);
        setPageInput(`${page}`);
        resetReaderState();
        setSelectedSurah({
            ayahs: 'Halaman mushaf',
            key: `page:${page}`,
            meaning: 'Navigasi halaman mushaf',
            name: `Halaman ${page}`,
            page,
            type: 'page',
        });
        setReaderLoading(true);
        try {
            setAyahs(await getAyahsForPage(page));
            await loadBookmarks();
        } catch (err) {
            setAyahs([]);
            setMessage(err?.message ?? 'Halaman mushaf belum bisa dimuat.');
        } finally {
            setReaderLoading(false);
        }
    };

    const openHizb = async (value = hizbInput) => {
        const hizb = normalizeRangeInput(value, 1, 240);
        setHizbInput(`${hizb}`);
        resetReaderState();
        setSelectedSurah({
            ayahs: 'Hizb',
            hizb,
            key: `hizb:${hizb}`,
            meaning: 'Navigasi hizb',
            name: `Hizb ${hizb}`,
            type: 'hizb',
        });
        setReaderLoading(true);
        try {
            setAyahs(await getAyahsForHizb(hizb));
            await loadBookmarks();
        } catch (err) {
            setAyahs([]);
            setMessage(err?.message ?? 'Hizb belum bisa dimuat.');
        } finally {
            setReaderLoading(false);
        }
    };

    const refreshReader = () => {
        if (!selectedSurah) return refreshAll();
        if (selectedSurah.type === 'page') return openPage(selectedSurah.page);
        if (selectedSurah.type === 'hizb') return openHizb(selectedSurah.hizb);
        return openSurah(selectedSurah);
    };

    const closeReader = () => {
        stopAudio();
        setSelectedSurah(null);
    };

    const markStarted = async (surah) => {
        if (!user) {
            showInfo("Masuk dari Profil untuk menyimpan progres Al-Qur'an.");
            return;
        }
        setSavingSurah(surah.number);
        setMessage('');
        try {
            const firstAyah = await getFirstAyahForSurah(surah.number);
            const next = await saveQuranProgress({
                surahNumber: surah.number,
                ayahNumber: firstAyah?.number ?? 1,
                ayahId: firstAyah?.id ?? surah.number,
            });
            setProgress(next);
            setMessage(`Progres disimpan untuk ${surah.name}.`);
            showSuccess(`Progres disimpan untuk ${surah.name}.`);
        } catch (err) {
            const nextMessage = err?.message ?? "Progres Al-Qur'an belum bisa disimpan.";
            setMessage(nextMessage);
            showError(nextMessage);
        } finally {
            setSavingSurah(null);
        }
    };

    const markAyahProgress = async (ayah) => {
        if (!user || !selectedSurah) {
            showInfo("Masuk dari Profil untuk menyimpan progres Al-Qur'an.");
            return;
        }
        const surahNumber = selectedSurah.number ?? ayah.surahNumber;
        if (!surahNumber) {
            setMessage("Buka bacaan surah untuk menyimpan progres Al-Qur'an.");
            showInfo("Buka bacaan surah untuk menyimpan progres Al-Qur'an.");
            return;
        }
        setSavingAyah(`progress:${ayah.id}`);
        setMessage('');
        try {
            const next = await saveQuranProgress({
                surahNumber,
                ayahNumber: ayah.number,
                ayahId: ayah.id,
            });
            setProgress(next);
            setMessage(`Progres disimpan di ayat ${ayah.number}.`);
            showSuccess(`Progres disimpan di ayat ${ayah.number}.`);
        } catch (err) {
            const nextMessage = err?.message ?? 'Progres ayat belum bisa disimpan.';
            setMessage(nextMessage);
            showError(nextMessage);
        } finally {
            setSavingAyah(null);
        }
    };

    const toggleAyahBookmark = async (ayah) => {
        if (!user || !ayah.id) {
            showInfo('Masuk dari Profil untuk menyimpan bookmark.');
            return;
        }
        setSavingAyah(`bookmark:${ayah.id}`);
        setMessage('');
        try {
            const existing = bookmarks[ayah.id];
            if (existing?.id) {
                await deleteBookmark(existing.id);
                const next = { ...bookmarks };
                delete next[ayah.id];
                setBookmarks(next);
                setMessage(`Bookmark ayat ${ayah.number} dihapus.`);
                showSuccess(`Bookmark ayat ${ayah.number} dihapus.`);
            } else {
                const bookmark = await addBookmark({ refType: 'ayah', refId: ayah.id });
                setBookmarks({ ...bookmarks, [ayah.id]: bookmark });
                setMessage(`Ayat ${ayah.number} disimpan ke bookmark.`);
                showSuccess(`Ayat ${ayah.number} disimpan ke bookmark.`);
            }
        } catch (err) {
            const nextMessage = err?.message ?? 'Bookmark ayat belum bisa diperbarui.';
            setMessage(nextMessage);
            showError(nextMessage);
        } finally {
            setSavingAyah(null);
        }
    };

    const pickAudioSource = (sources) =>
        sources.find((source) => source.qari_slug === audioState.qariSlug) ?? sources[0] ?? null;

    const playAyahAudio = async (ayah) => {
        if (!selectedSurah) return;
        const surahNumber = selectedSurah.number ?? ayah.surahNumber;
        if (audioState.playingAyahId === ayah.id) {
            stopAudio();
            setAudioState((current) => ({ ...current, playingAyahId: null }));
            return;
        }
        setMessage('');
        setAudioState((current) => ({
            ...current,
            activeAyahId: ayah.id,
            loadingAyahId: ayah.id,
        }));
        try {
            const storedSources = audioState.sourcesByAyah[ayah.id];
            const sources =
                storedSources ??
                (await getAyahAudio({ ayahId: ayah.id, ayahNumber: ayah.number, surahNumber }));
            const source = pickAudioSource(sources);
            setAudioState((current) => ({
                ...current,
                activeAyahId: ayah.id,
                loadingAyahId: null,
                sourcesByAyah: { ...current.sourcesByAyah, [ayah.id]: sources },
            }));
            if (!source?.audio_url) {
                setMessage(`Audio belum tersedia untuk ayat ${ayah.number}.`);
                return;
            }
            await playAudioUrl(source.audio_url, {
                onEnded: () => setAudioState((current) => ({ ...current, playingAyahId: null })),
            });
            setAudioState((current) => ({
                ...current,
                activeAyahId: ayah.id,
                loadingAyahId: null,
                playingAyahId: ayah.id,
            }));
        } catch (err) {
            setAudioState((current) => ({
                ...current,
                loadingAyahId: null,
                playingAyahId: null,
            }));
            setMessage(err?.message ?? 'Audio ayat belum bisa diputar.');
        }
    };

    const selectQari = async (ayahId, qariSlug) => {
        stopAudio();
        setAudioState((current) => ({
            ...current,
            activeAyahId: ayahId,
            playingAyahId: null,
            qariSlug,
        }));
        await writePreference(preferenceKeys.quranAudioQari, qariSlug);
    };

    const getArabicFontFamily = () => {
        const font = ARABIC_FONTS.find((f) => f.key === arabicFont);
        return font?.fontFamily ?? undefined;
    };

    const renderAudioSources = (ayah) => {
        const sources = audioState.sourcesByAyah[ayah.id] ?? [];
        if (sources.length <= 1) return null;
        return (
            <View style={styles.qariGrid}>
                {sources.map((source) => (
                    <Pressable
                        key={`${ayah.id}-${source.qari_slug}`}
                        onPress={() => selectQari(ayah.id, source.qari_slug)}
                        style={[
                            styles.qariButton,
                            audioState.qariSlug === source.qari_slug ? styles.qariButtonActive : null,
                        ]}
                    >
                        <Text
                            style={[
                                styles.qariText,
                                audioState.qariSlug === source.qari_slug ? styles.qariTextActive : null,
                            ]}
                        >
                            {source.qari_name}
                        </Text>
                    </Pressable>
                ))}
            </View>
        );
    };

    const renderAyahText = (ayah) => {
        const isRevealed = Boolean(revealedAyahs[ayah.id]);
        const hideArabic = !isRevealed && ['hide_arabic', 'hide_all'].includes(memorizationMode);
        const isMushaf = displayMode === 'mushaf';
        const isLine = displayMode === 'line';
        const isFocus = displayMode === 'focus' || isMushaf;
        const hideTranslation =
            isFocus || (!isRevealed && ['hide_translation', 'hide_all'].includes(memorizationMode));
        const hasHiddenContent = hideArabic || (!isFocus && hideTranslation);
        const fontFamily = getArabicFontFamily();
        const arabicBaseStyle = isMushaf ? styles.mushafArabic : isLine ? styles.lineArabic : styles.ayahArabic;
        const resolvedFontSize = isMushaf ? fontSize + 2 : fontSize;
        const arabicStyle = fontFamily
            ? [arabicBaseStyle, { fontSize: resolvedFontSize, fontFamily }]
            : [arabicBaseStyle, { fontSize: resolvedFontSize }];

        return (
            <>
                {ayah.arabic && !hideArabic ? (
                    <Text style={arabicStyle}>{ayah.arabic}</Text>
                ) : null}
                {hideArabic ? (
                    <View style={styles.hiddenBlock}>
                        <Text style={styles.hiddenTitle}>Arab disembunyikan untuk hafalan</Text>
                    </View>
                ) : null}
                {ayah.latin && !hideTranslation ? (
                    <Text style={styles.ayahLatin}>{ayah.latin}</Text>
                ) : null}
                {ayah.translation && !hideTranslation ? (
                    <Text style={styles.ayahTranslation}>{ayah.translation}</Text>
                ) : null}
                {!isFocus && hideTranslation && !isRevealed ? (
                    <View style={styles.hiddenBlock}>
                        <Text style={styles.hiddenTitle}>Terjemahan disembunyikan untuk latihan</Text>
                    </View>
                ) : null}
                {hasHiddenContent ? (
                    <Pressable
                        onPress={() => setRevealedAyahs((current) => ({ ...current, [ayah.id]: true }))}
                        style={styles.revealButton}
                    >
                        <Text style={styles.revealButtonText}>Tampilkan Ayat</Text>
                    </Pressable>
                ) : null}
            </>
        );
    };

    const renderAyahHeader = (ayah) => {
        const meta = ayah.surahName ? `${ayah.surahName} · Ayah ${ayah.number}` : `Ayah ${ayah.number}`;
        return (
            <View style={styles.ayahHeader}>
                <View style={styles.ayahHeaderCopy}>
                    <Text style={styles.ayahHeaderTitle}>{selectedSurah.name}</Text>
                    <Text style={styles.ayahHeaderMeta}>{meta}</Text>
                </View>
                <Pressable
                    accessibilityLabel={`Aksi ayat ${ayah.number}`}
                    accessibilityRole="button"
                    android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: true }}
                    onPress={() => setAyahActionSheet({ visible: true, ayah })}
                    style={styles.ayahMenuButton}
                >
                    <MoreVertical color={colors.primary} size={18} strokeWidth={2.4} />
                </Pressable>
            </View>
        );
    };

    const renderLineAyah = (ayah, isTargetAyah) => {
        const meta = ayah.surahName ? `${ayah.surahName} · ${ayah.number}` : `Ayah ${ayah.number}`;
        return (
            <View style={[styles.lineAyahRow, isTargetAyah ? styles.targetAyahCard : null]}>
                <View style={styles.lineAyahHeader}>
                    <View style={styles.lineAyahNumber}>
                        <Text style={styles.lineAyahNumberText}>{ayah.number}</Text>
                    </View>
                    <Text style={styles.lineAyahMeta}>{meta}</Text>
                    <Pressable
                        accessibilityLabel={`Aksi ayat ${ayah.number}`}
                        accessibilityRole="button"
                        android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: true }}
                        onPress={() => setAyahActionSheet({ visible: true, ayah })}
                        style={styles.lineAyahMenuButton}
                    >
                        <MoreVertical color={colors.primary} size={18} strokeWidth={2.4} />
                    </Pressable>
                </View>
                {renderAyahText(ayah)}
                {renderAudioSources(ayah)}
            </View>
        );
    };

    const renderAyahCard = ({ item: ayah }) => {
        const isTargetAyah =
            (targetAyah?.id && Number(targetAyah.id) === Number(ayah.id)) ||
            (targetAyah?.number && Number(targetAyah.number) === Number(ayah.number));

        if (displayMode === 'line') return renderLineAyah(ayah, isTargetAyah);

        return (
            <Card style={[
                displayMode === 'focus' ? styles.focusAyahCard : null,
                isTargetAyah ? styles.targetAyahCard : null,
            ]}>
                {renderAyahHeader(ayah)}
                {renderAyahText(ayah)}
                {renderAudioSources(ayah)}
            </Card>
        );
    };

    const renderMushafPage = () => {
        const fontFamily = getArabicFontFamily();
        const continuousArabicStyle = fontFamily
            ? [styles.mushafContinuousArabic, { fontFamily, fontSize: fontSize + 4 }]
            : [styles.mushafContinuousArabic, { fontSize: fontSize + 4 }];
        const mushafPages = ayahs.reduce((pages, ayah, index) => {
            const pageNumber = ayah.pageNumber ?? selectedSurah.page ?? `surah-${selectedSurah.number ?? 0}`;
            const previous = pages[pages.length - 1];

            if (previous && previous.pageNumber === pageNumber) {
                previous.ayahs.push(ayah);
                return pages;
            }

            pages.push({
                ayahs: [ayah],
                id: `${pageNumber}-${index}`,
                pageNumber,
            });
            return pages;
        }, []);

        if (readerLoading) {
            return (
                <View style={styles.mushafPageShell}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            );
        }

        if (!ayahs.length) {
            return (
                <EmptyState
                    title="Ayat belum tersedia"
                    description="Data ayat untuk pilihan ini belum tersedia dari server."
                />
            );
        }

        return (
            <View style={styles.mushafPagesStack}>
                {mushafPages.map((page) => {
                    const firstAyah = page.ayahs[0];
                    const lastAyah = page.ayahs[page.ayahs.length - 1];
                    const pageLabel = Number.isFinite(Number(page.pageNumber))
                        ? `Halaman ${page.pageNumber}`
                        : selectedSurah.name;
                    const rangeLabel = firstAyah && lastAyah
                        ? `${firstAyah.surahName || selectedSurah.name} ${firstAyah.number}-${lastAyah.number}`
                        : selectedSurah.meaning || "Al-Qur'an";

                    return (
                        <View key={page.id} style={styles.mushafPageShell}>
                            <View style={styles.mushafFrame}>
                                <View style={styles.mushafFrameTop}>
                                    <Text style={styles.mushafFrameChip}>{selectedSurah.name}</Text>
                                    <Text style={styles.mushafFrameNumber}>{pageLabel}</Text>
                                    <Text style={styles.mushafFrameChip}>{rangeLabel}</Text>
                                </View>
                                <View style={styles.mushafSurahNamePlate}>
                                    <Text style={styles.mushafSurahTitle}>
                                        {firstAyah?.surahName || selectedSurah.name}
                                    </Text>
                                    <Text style={styles.mushafSurahMeta}>
                                        {selectedSurah.type === 'surah'
                                            ? `${page.ayahs.length} ayat pada halaman ini`
                                            : selectedSurah.meaning || 'Tilawah'}
                                    </Text>
                                </View>
                                <Text style={continuousArabicStyle}>
                                    {page.ayahs.map((ayah) => {
                                        const isTargetAyah =
                                            (targetAyah?.id && Number(targetAyah.id) === Number(ayah.id)) ||
                                            (targetAyah?.number && Number(targetAyah.number) === Number(ayah.number));
                                        return (
                                            <Text
                                                key={`${ayah.id}-${ayah.number}`}
                                                onPress={() => setAyahActionSheet({ visible: true, ayah })}
                                                style={isTargetAyah ? styles.mushafTargetText : null}
                                            >
                                                {ayah.arabic}{' '}
                                                <Text style={styles.mushafVerseMark}>۝{ayah.number}</Text>{' '}
                                            </Text>
                                        );
                                    })}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderReaderHeader = () => {
        const previewAyah = targetAyah
            ? ayahs.find((ayah) =>
                  (targetAyah.id && Number(targetAyah.id) === Number(ayah.id)) ||
                  (targetAyah.number && Number(targetAyah.number) === Number(ayah.number)),
              )
            : null;

        return (
        <>
            <View style={styles.readerHeader}>
                <View style={styles.readerHeaderTop}>
                    <View style={styles.readerHeaderCopy}>
                        <Text style={styles.readerTitle}>{selectedSurah.name}</Text>
                        <Text style={styles.readerSubtitle}>
                            {selectedSurah.type === 'surah'
                                ? `${selectedSurah.meaning || "Bacaan Al-Qur'an"} · ${selectedSurah.ayahs} ayah`
                                : selectedSurah.meaning || "Bacaan Al-Qur'an"}
                        </Text>
                    </View>
                    <View style={styles.readerHeaderActions}>
                        <IconActionButton
                            Icon={SlidersHorizontal}
                            label="Pengaturan tampilan"
                            onPress={() => setSettingsVisible(true)}
                        />
                        <IconActionButton
                            Icon={ArrowLeft}
                            label="Kembali ke daftar surah"
                            onPress={closeReader}
                        />
                    </View>
                </View>
            </View>
            {displayMode === 'mushaf' ? (
                <View style={styles.mushafPageHeader}>
                    <Text style={styles.mushafPageChip}>
                        {selectedSurah.type === 'page' ? `Hal. ${selectedSurah.page}` : selectedSurah.name}
                    </Text>
                    <Text style={styles.mushafPageCenter}>
                        {selectedSurah.type === 'surah' ? `${selectedSurah.ayahs} ayah` : 'Mode Mushaf'}
                    </Text>
                    <Text style={styles.mushafPageChip}>
                        {selectedSurah.type === 'hizb' ? `Hizb ${selectedSurah.hizb}` : 'Tilawah'}
                    </Text>
                </View>
            ) : null}
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {previewAyah ? (
                <View style={styles.targetPreview}>
                    <Text style={styles.targetPreviewKicker}>Hasil pencarian</Text>
                    <Text style={styles.targetPreviewTitle}>
                        {selectedSurah.name} · Ayat {previewAyah.number}
                    </Text>
                    {renderAyahText(previewAyah)}
                    {displayMode === 'mushaf' ? null : (
                        <Pressable
                            android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                            onPress={() => {
                                if (targetAyahIndex < 0) return;
                                readerListRef.current?.scrollToIndex?.({
                                    animated: true,
                                    index: targetAyahIndex,
                                    viewPosition: 0.18,
                                });
                            }}
                            style={styles.targetPreviewButton}
                        >
                            <Text style={styles.targetPreviewButtonText}>Lihat posisi dalam surah</Text>
                        </Pressable>
                    )}
                </View>
            ) : null}
        </>
        );
    };

    const renderSettingsModal = () => (
        <Modal
            animationType="slide"
            onRequestClose={() => setSettingsVisible(false)}
            transparent
            visible={settingsVisible}
        >
            <Pressable onPress={() => setSettingsVisible(false)} style={styles.modalOverlay} />
            <View style={styles.modalSheet}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Pengaturan Tampilan</Text>
                    <Pressable
                        hitSlop={8}
                        onPress={() => setSettingsVisible(false)}
                        style={styles.modalClose}
                    >
                        <X color={colors.muted} size={18} strokeWidth={2.2} />
                    </Pressable>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Font size */}
                    <Text style={styles.settingLabel}>Ukuran Teks Arab</Text>
                    <View style={styles.fontSizeRow}>
                        <Pressable
                            onPress={() => updateFontSize(fontSize - 2)}
                            style={styles.fontSizeButton}
                        >
                            <Minus color={colors.ink} size={16} strokeWidth={2.4} />
                        </Pressable>
                        <Text style={styles.fontSizeValue}>{fontSize}px</Text>
                        <Pressable
                            onPress={() => updateFontSize(fontSize + 2)}
                            style={styles.fontSizeButton}
                        >
                            <Plus color={colors.ink} size={16} strokeWidth={2.4} />
                        </Pressable>
                    </View>

                    {/* Arabic font */}
                    <Text style={styles.settingLabel}>Font Arabic</Text>
                    <View style={styles.settingChips}>
                        {ARABIC_FONTS.map((font) => (
                            <Pressable
                                key={font.key}
                                onPress={() => updateArabicFont(font.key)}
                                style={[
                                    styles.settingChip,
                                    arabicFont === font.key ? styles.settingChipActive : null,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.settingChipText,
                                        arabicFont === font.key ? styles.settingChipTextActive : null,
                                    ]}
                                >
                                    {font.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Display mode */}
                    <Text style={styles.settingLabel}>Model Tampilan Baca</Text>
                    <View style={styles.displayModeStack}>
                        {DISPLAY_MODES.map((mode) => (
                            <Pressable
                                key={mode.key}
                                onPress={() => updateDisplayMode(mode.key)}
                                style={[
                                    styles.displayModeCard,
                                    displayMode === mode.key ? styles.displayModeCardActive : null,
                                ]}
                            >
                                <View style={styles.displayModePreview}>
                                    <View style={styles.displayModePreviewTop} />
                                    <View
                                        style={[
                                            styles.displayModePreviewLine,
                                            mode.key === 'mushaf' ? styles.displayModePreviewLineFull : null,
                                        ]}
                                    />
                                    {mode.key === 'card' || mode.key === 'line' ? (
                                        <View style={styles.displayModePreviewSmall} />
                                    ) : null}
                                </View>
                                <View style={styles.displayModeCopy}>
                                    <Text
                                        style={[
                                            styles.displayModeLabel,
                                            displayMode === mode.key ? styles.displayModeLabelActive : null,
                                        ]}
                                    >
                                        {mode.label}
                                    </Text>
                                    <Text style={styles.displayModeTitle}>{mode.title}</Text>
                                    <Text style={styles.displayModeDescription}>{mode.description}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                    <Text style={styles.settingHint}>
                        Mode Fokus dan Mushaf menyembunyikan latin/terjemah supaya layar utama fokus tilawah.
                    </Text>

                    {/* Memorization mode */}
                    <Text style={styles.settingLabel}>Mode Hafalan</Text>
                    <View style={styles.settingChips}>
                        {MEMORIZATION_MODES.map((mode) => (
                            <Pressable
                                key={mode.key}
                                onPress={() => updateMemorizationMode(mode.key)}
                                style={[
                                    styles.settingChip,
                                    memorizationMode === mode.key ? styles.settingChipActive : null,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.settingChipText,
                                        memorizationMode === mode.key
                                            ? styles.settingChipTextActive
                                            : null,
                                    ]}
                                >
                                    {mode.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Tajweed legend button */}
                    <Pressable
                        onPress={() => {
                            setSettingsVisible(false);
                            setTajweedVisible(true);
                        }}
                        style={styles.tajweedButton}
                    >
                        <Info color={colors.primary} size={16} strokeWidth={2.2} />
                        <Text style={styles.tajweedButtonText}>Panduan Warna Tajwid</Text>
                    </Pressable>

                    <View style={styles.modalBottomPad} />
                </ScrollView>
            </View>
        </Modal>
    );

    const renderReferenceModal = () => {
        const { visible, type, ayah } = referenceModal;
        const key = ayah ? `${type}:${ayah.id}` : null;
        const state = key ? referenceState[key] : null;
        const title = type === 'tafsir' ? 'Tafsir' : 'Asbabun Nuzul';

        return (
            <Modal
                animationType="slide"
                onRequestClose={() => setReferenceModal((m) => ({ ...m, visible: false }))}
                transparent
                visible={visible}
            >
                <Pressable
                    onPress={() => setReferenceModal((m) => ({ ...m, visible: false }))}
                    style={styles.modalOverlay}
                />
                <View style={[styles.modalSheet, styles.modalSheetTall]}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>{title}</Text>
                            {ayah ? (
                                <Text style={styles.modalMeta}>
                                    {selectedSurah?.name} · Ayat {ayah.number}
                                </Text>
                            ) : null}
                        </View>
                        <Pressable
                            hitSlop={8}
                            onPress={() => setReferenceModal((m) => ({ ...m, visible: false }))}
                            style={styles.modalClose}
                        >
                            <X color={colors.muted} size={18} strokeWidth={2.2} />
                        </Pressable>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {state?.loading ? (
                            <ActivityIndicator
                                color={colors.primary}
                                style={styles.modalLoader}
                            />
                        ) : null}
                        {state?.error ? (
                            <Text style={styles.referenceEmpty}>{state.error}</Text>
                        ) : null}
                        {state?.items?.map((item) => (
                            <View key={item.id} style={styles.referenceItem}>
                                <Text style={styles.referenceTitle}>{item.title}</Text>
                                {item.meta ? (
                                    <Text style={styles.referenceMeta}>{item.meta}</Text>
                                ) : null}
                                <Text style={styles.referenceBody}>{item.body}</Text>
                            </View>
                        ))}
                        <View style={styles.modalBottomPad} />
                    </ScrollView>
                </View>
            </Modal>
        );
    };

    const renderActionSheetRow = ({ Icon, title, subtitle, onPress, active = false, disabled = false }) => (
        <Pressable
            accessibilityLabel={title}
            accessibilityRole="button"
            accessibilityState={{ disabled, selected: active }}
            android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
            disabled={disabled}
            onPress={() => {
                if (disabled) return;
                setAyahActionSheet({ visible: false, ayah: null });
                onPress?.();
            }}
            style={[styles.actionSheetRow, active ? styles.actionSheetRowActive : null, disabled ? styles.disabled : null]}
        >
            <View style={styles.actionSheetIcon}>
                <Icon color={active ? colors.onPrimary : colors.primary} size={18} strokeWidth={2.3} />
            </View>
            <View style={styles.actionSheetCopy}>
                <Text style={[styles.actionSheetTitle, active ? styles.actionSheetTitleActive : null]}>{title}</Text>
                {subtitle ? (
                    <Text style={[styles.actionSheetSubtitle, active ? styles.actionSheetSubtitleActive : null]}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );

    const renderAyahActionSheet = () => {
        const { visible, ayah } = ayahActionSheet;
        if (!ayah) return null;

        const isAudioLoading = audioState.loadingAyahId === ayah.id;
        const isAudioPlaying = audioState.playingAyahId === ayah.id;
        const isBookmarked = Boolean(bookmarks[ayah.id]);

        return (
            <Modal
                animationType="slide"
                onRequestClose={() => setAyahActionSheet({ visible: false, ayah: null })}
                transparent
                visible={visible}
            >
                <Pressable
                    onPress={() => setAyahActionSheet({ visible: false, ayah: null })}
                    style={styles.modalOverlay}
                />
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>Aksi Ayat</Text>
                            <Text style={styles.modalMeta}>
                                {selectedSurah?.name} · Ayat {ayah.number}
                            </Text>
                        </View>
                        <Pressable
                            hitSlop={8}
                            onPress={() => setAyahActionSheet({ visible: false, ayah: null })}
                            style={styles.modalClose}
                        >
                            <X color={colors.muted} size={18} strokeWidth={2.2} />
                        </Pressable>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {renderActionSheetRow({
                            Icon: isAudioPlaying ? Pause : Volume2,
                            title: isAudioLoading ? 'Memuat audio' : isAudioPlaying ? 'Jeda audio' : 'Putar audio',
                            subtitle: 'Murottal ayat ini',
                            disabled: isAudioLoading,
                            active: isAudioPlaying,
                            onPress: () => playAyahAudio(ayah),
                        })}
                        {renderActionSheetRow({
                            Icon: BookOpen,
                            title: 'Tafsir',
                            subtitle: 'Buka penjelasan ayat',
                            onPress: () => openReferenceModal(ayah, 'tafsir'),
                        })}
                        {renderActionSheetRow({
                            Icon: BookOpen,
                            title: 'Asbabun Nuzul',
                            subtitle: 'Riwayat sebab turun jika tersedia',
                            onPress: () => openReferenceModal(ayah, 'asbab'),
                        })}
                        {user ? (
                            <>
                                {renderActionSheetRow({
                                    Icon: Save,
                                    title: savingAyah === `progress:${ayah.id}` ? 'Menyimpan progres' : 'Simpan progres',
                                    subtitle: 'Jadikan ayat ini posisi terakhir baca',
                                    disabled: savingAyah === `progress:${ayah.id}`,
                                    onPress: () => markAyahProgress(ayah),
                                })}
                                {renderActionSheetRow({
                                    Icon: isBookmarked ? BookmarkCheck : Bookmark,
                                    title:
                                        savingAyah === `bookmark:${ayah.id}`
                                            ? 'Menyimpan bookmark'
                                            : isBookmarked
                                              ? 'Hapus bookmark'
                                              : 'Bookmark',
                                    subtitle: 'Simpan ayat ke koleksi pribadi',
                                    disabled: savingAyah === `bookmark:${ayah.id}`,
                                    active: isBookmarked,
                                    onPress: () => toggleAyahBookmark(ayah),
                                })}
                                {renderActionSheetRow({
                                    Icon: StickyNote,
                                    title: 'Catatan',
                                    subtitle: 'Tulis catatan pribadi untuk ayat ini',
                                    active: activeNoteAyah === ayah.id,
                                    onPress: () =>
                                        setActiveNoteAyah(activeNoteAyah === ayah.id ? null : ayah.id),
                                })}
                            </>
                        ) : null}
                        {!user ? (
                            <Text style={styles.actionSheetNotice}>
                                Masuk dari Profil untuk menyimpan progres, bookmark, dan catatan.
                            </Text>
                        ) : null}
                        <View style={styles.modalBottomPad} />
                    </ScrollView>
                </View>
            </Modal>
        );
    };

    const renderAyahNotesModal = () => {
        const ayah = activeNoteAyah ? ayahs.find((item) => item.id === activeNoteAyah) : null;
        return (
            <Modal
                animationType="slide"
                onRequestClose={() => setActiveNoteAyah(null)}
                transparent
                visible={Boolean(activeNoteAyah)}
            >
                <Pressable onPress={() => setActiveNoteAyah(null)} style={styles.modalOverlay} />
                <View style={[styles.modalSheet, styles.modalSheetTall]}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>Catatan Ayat</Text>
                            {ayah ? (
                                <Text style={styles.modalMeta}>
                                    {selectedSurah?.name} · Ayat {ayah.number}
                                </Text>
                            ) : null}
                        </View>
                        <Pressable hitSlop={8} onPress={() => setActiveNoteAyah(null)} style={styles.modalClose}>
                            <X color={colors.muted} size={18} strokeWidth={2.2} />
                        </Pressable>
                    </View>
                    {activeNoteAyah ? <NotesPanel refType="ayah" refId={activeNoteAyah} /> : null}
                    <View style={styles.modalBottomPad} />
                </View>
            </Modal>
        );
    };

    const renderTajweedModal = () => (
        <Modal
            animationType="slide"
            onRequestClose={() => setTajweedVisible(false)}
            transparent
            visible={tajweedVisible}
        >
            <Pressable onPress={() => setTajweedVisible(false)} style={styles.modalOverlay} />
            <View style={[styles.modalSheet, styles.modalSheetTall]}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Panduan Warna Tajwid</Text>
                    <Pressable
                        hitSlop={8}
                        onPress={() => setTajweedVisible(false)}
                        style={styles.modalClose}
                    >
                        <X color={colors.muted} size={18} strokeWidth={2.2} />
                    </Pressable>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.tajweedIntro}>
                        Setiap hukum tajwid ditandai dengan warna berbeda. Ketuk grup untuk melihat
                        sub-aturan dan contoh bacaannya.
                    </Text>
                    {TAJWEED_GROUPS.map((group) => (
                        <View key={group.key} style={styles.tajweedGroup}>
                            <View style={styles.tajweedGroupHeader}>
                                <View
                                    style={[
                                        styles.tajweedDot,
                                        { backgroundColor: group.color },
                                    ]}
                                />
                                <Text style={styles.tajweedGroupTitle}>{group.title}</Text>
                            </View>
                            <Text style={styles.tajweedGroupDesc}>{group.description}</Text>
                            {group.rules.map((rule) => (
                                <View key={rule.key} style={styles.tajweedRule}>
                                    <View style={styles.tajweedRuleLeft}>
                                        <View
                                            style={[
                                                styles.tajweedRuleDot,
                                                { backgroundColor: rule.color },
                                            ]}
                                        />
                                        <View style={styles.tajweedRuleInfo}>
                                            <Text style={styles.tajweedRuleTitle}>{rule.title}</Text>
                                            <Text style={styles.tajweedRuleDesc}>
                                                {rule.description}
                                            </Text>
                                        </View>
                                    </View>
                                    {rule.example ? (
                                        <Text style={styles.tajweedRuleExample}>
                                            {rule.example}
                                        </Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    ))}
                    <View style={styles.modalBottomPad} />
                </ScrollView>
            </View>
        </Modal>
    );

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    useEffect(() => {
        if (quranTab === 'hafalan') loadHafalan();
    }, [quranTab, loadHafalan]);

    useEffect(() => {
        if (quranTab === 'murojaah') loadMurojaah();
    }, [quranTab, loadMurojaah]);

    useEffect(() => {
        const target = deepLinkTarget?.params;
        if (!target || handledDeepLinkId.current === deepLinkTarget?.id) return;

        if (target.pageNumber) {
            handledDeepLinkId.current = deepLinkTarget.id;
            openPage(target.pageNumber);
            return;
        }
        if (target.hizbNumber) {
            handledDeepLinkId.current = deepLinkTarget.id;
            openHizb(target.hizbNumber);
            return;
        }
        if (!surahs.length) return;

        const nextSurah = surahs.find((item) => {
            const slugMatch =
                target.surahSlug &&
                `${item.name}`.toLowerCase() === `${target.surahSlug}`.toLowerCase();
            const numberMatch =
                target.surahNumber && Number(item.number) === Number(target.surahNumber);
            return slugMatch || numberMatch;
        });

        if (nextSurah) {
            handledDeepLinkId.current = deepLinkTarget.id;
            openSurah(nextSurah, {
                ayahId: target.ayahId,
                ayahNumber: target.ayahNumber,
            });
        }
    }, [deepLinkTarget?.id, surahs]);

    useEffect(() => {
        if (!selectedSurah || !targetAyah || readerLoading || !ayahs.length) return;

        const index = ayahs.findIndex((ayah) =>
            (targetAyah.id && Number(targetAyah.id) === Number(ayah.id)) ||
            (targetAyah.number && Number(targetAyah.number) === Number(ayah.number)),
        );

        if (index < 0) return;

        const timer = setTimeout(() => {
            readerListRef.current?.scrollToIndex?.({
                animated: true,
                index,
                viewPosition: 0.18,
            });
        }, 180);

        return () => clearTimeout(timer);
    }, [ayahs, readerLoading, selectedSurah, targetAyah]);

    useEffect(() => {
        if (!isActive) return;
        if (selectedSurah) {
            navigation?.setBack(() => {
                setSelectedSurah(null);
                return true;
            });
        } else {
            navigation?.clearBack?.();
        }
    }, [isActive, selectedSurah, navigation]);

    useEffect(() => {
        let mounted = true;
        readPreference(preferenceKeys.quranFontSize, 28).then((value) => {
            if (mounted && typeof value === 'number') setFontSize(Math.max(22, Math.min(42, value)));
        });
        readPreference(preferenceKeys.quranAudioQari, 'Alafasy_64kbps').then((value) => {
            if (mounted && typeof value === 'string')
                setAudioState((current) => ({ ...current, qariSlug: value }));
        });
        readPreference(preferenceKeys.quranMemorizationMode, 'off').then((value) => {
            if (mounted && MEMORIZATION_MODES.some((m) => m.key === value)) setMemorizationMode(value);
        });
        readPreference(preferenceKeys.quranArabicFont, 'default').then((value) => {
            if (mounted && ARABIC_FONTS.some((f) => f.key === value)) setArabicFont(value);
        });
        readPreference(preferenceKeys.quranDisplayMode, 'card').then((value) => {
            const normalizedValue = value === 'normal' ? 'card' : value;
            if (mounted && DISPLAY_MODES.some((m) => m.key === normalizedValue)) setDisplayMode(normalizedValue);
        });
        return () => {
            mounted = false;
            stopAudio();
        };
    }, []);

    const query = surahQuery.trim().toLowerCase();
    const filteredSurahs = query
        ? surahs.filter((surah) =>
              [surah.number, surah.name, surah.meaning, surah.arabic]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase()
                  .includes(query),
          )
        : surahs;
    const progressSurahNumber = progress?.surah_number ? Number(progress.surah_number) : null;
    const targetAyahIndex = targetAyah
        ? ayahs.findIndex((ayah) =>
              (targetAyah.id && Number(targetAyah.id) === Number(ayah.id)) ||
              (targetAyah.number && Number(targetAyah.number) === Number(ayah.number)),
          )
        : -1;
    const estimatedAyahHeight = displayMode === 'line' ? 184 : displayMode === 'focus' ? 196 : 236;

    const renderSurahRow = ({ item: surah }) => {
        const isProgressSurah = progressSurahNumber === Number(surah.number);
        return (
            <Pressable onPress={() => openSurah(surah)} style={styles.surahRow}>
                <View style={styles.surahLeft}>
                    <View style={styles.surahNumberWrap}>
                        <View style={styles.surahNumberDiamond}>
                            <Text style={styles.surahNumberText}>{surah.number}</Text>
                        </View>
                    </View>
                    <View style={styles.surahInfo}>
                        <View style={styles.surahNameRow}>
                            <Text style={styles.surahName}>{surah.name}</Text>
                            {isProgressSurah ? (
                                <CheckCircle2
                                    color={colors.primary}
                                    size={13}
                                    strokeWidth={2.2}
                                />
                            ) : null}
                        </View>
                        <Text style={styles.surahMeta}>
                            {surah.meaning} · {surah.ayahs} ayah
                        </Text>
                    </View>
                </View>
                <Text style={styles.surahArabic}>{surah.arabic}</Text>
            </Pressable>
        );
    };

    const renderQuranListHeader = () => (
        <>
            <Text style={styles.quranTitle}>Al-Qur'an</Text>
            <View style={styles.quranSearch}>
                <Search color={colors.muted} size={16} strokeWidth={2.1} />
                <TextInput
                    onChangeText={setSurahQuery}
                    placeholder="Cari..."
                    placeholderTextColor={colors.muted}
                    style={styles.quranSearchInput}
                    value={surahQuery}
                />
            </View>
            <View style={styles.quranTabs}>
                {QURAN_TABS.map((tab) => (
                    <Pressable
                        key={tab.key}
                        onPress={() => setQuranTab(tab.key)}
                        style={[
                            styles.quranTabButton,
                            quranTab === tab.key ? styles.quranTabButtonActive : null,
                        ]}
                    >
                        <Text
                            style={[
                                styles.quranTabText,
                                quranTab === tab.key ? styles.quranTabTextActive : null,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </>
    );

    const renderNavigatorPanel = () => (
        <Card>
            <CardTitle>Navigasi</CardTitle>
            <View style={styles.navigatorTabs}>
                {['page', 'hizb'].map((mode) => (
                    <Pressable
                        key={mode}
                        onPress={() => setNavigatorMode(mode)}
                        style={[
                            styles.navigatorTab,
                            navigatorMode === mode ? styles.navigatorTabActive : null,
                        ]}
                    >
                        <Text
                            style={[
                                styles.navigatorTabText,
                                navigatorMode === mode ? styles.navigatorTabTextActive : null,
                            ]}
                        >
                            {mode === 'page' ? 'Halaman' : 'Hizb'}
                        </Text>
                    </Pressable>
                ))}
            </View>
            {navigatorMode === 'hizb' ? (
                <View style={styles.inputRow}>
                    <TextInput
                        keyboardType="number-pad"
                        onChangeText={setHizbInput}
                        placeholder="1-240"
                        placeholderTextColor={colors.muted}
                        style={styles.numberInput}
                        value={hizbInput}
                    />
                    <Pressable onPress={() => openHizb()} style={styles.compactPrimaryButton}>
                        <Text style={styles.primaryButtonText}>Buka Hizb</Text>
                    </Pressable>
                </View>
            ) : (
                <View style={styles.inputRow}>
                    <TextInput
                        keyboardType="number-pad"
                        onChangeText={setPageInput}
                        placeholder="1-604"
                        placeholderTextColor={colors.muted}
                        style={styles.numberInput}
                        value={pageInput}
                    />
                    <Pressable onPress={() => openPage()} style={styles.compactPrimaryButton}>
                        <Text style={styles.primaryButtonText}>Buka Halaman</Text>
                    </Pressable>
                </View>
            )}
        </Card>
    );

    const renderQuranListFooter = () => {
        if (quranTab === 'surah') {
            return (
                <>
                    {renderNavigatorPanel()}
                    {message ? <Text style={styles.message}>{message}</Text> : null}
                </>
            );
        }

        if (quranTab === 'hafalan') {
            if (!user) {
                return (
                    <Card>
                        <CardTitle>Hafalan</CardTitle>
                        <Text style={styles.modePanelText}>
                            Buka Profil untuk masuk dan melacak progress hafalan.
                        </Text>
                    </Card>
                );
            }

            const statusLabel = { not_started: 'Belum', in_progress: 'Sedang', memorized: 'Hafal' };
            const statusStyle = {
                not_started: null,
                in_progress: styles.statusInProgress,
                memorized: styles.statusMemorized,
            };

            return (
                <>
                    <Card>
                        <CardTitle>Hafalan</CardTitle>
                        {hafalanSummary ? (
                            <View style={styles.hafalanSummary}>
                                <View style={styles.hafalanStat}>
                                    <Text style={styles.hafalanStatValue}>
                                        {hafalanSummary.memorized ?? 0}
                                    </Text>
                                    <Text style={styles.hafalanStatLabel}>Hafal</Text>
                                </View>
                                <View style={styles.hafalanStat}>
                                    <Text style={styles.hafalanStatValue}>
                                        {hafalanSummary.in_progress ?? 0}
                                    </Text>
                                    <Text style={styles.hafalanStatLabel}>Sedang</Text>
                                </View>
                                <View style={styles.hafalanStat}>
                                    <Text style={styles.hafalanStatValue}>
                                        {hafalanSummary.not_started ??
                                            hafalanSummary.not_memorized ??
                                            0}
                                    </Text>
                                    <Text style={styles.hafalanStatLabel}>Belum</Text>
                                </View>
                            </View>
                        ) : null}
                        <Text style={styles.modePanelText}>
                            Ketuk status di bawah untuk mengubah: Belum → Sedang → Hafal.
                        </Text>
                        {hafalanLoading ? (
                            <ActivityIndicator color={colors.primary} style={styles.loader} />
                        ) : null}
                        {!hafalanLoading && surahs.length === 0 ? (
                            <Text style={styles.modePanelMeta}>Daftar surah belum dimuat.</Text>
                        ) : null}
                    </Card>
                    {surahs.map((surah) => {
                        const entry = hafalanList.find(
                            (item) => Number(item.surah_id) === Number(surah.number),
                        );
                        const status = entry?.status ?? 'not_started';
                        return (
                            <Pressable
                                android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                                key={`hafalan-${surah.number}`}
                                onPress={() => cycleHafalanStatus(surah)}
                                style={styles.hafalanRow}
                            >
                                <View style={styles.surahNumberWrap}>
                                    <View style={styles.surahNumberDiamond}>
                                        <Text style={styles.surahNumberText}>{surah.number}</Text>
                                    </View>
                                </View>
                                <View style={styles.hafalanInfo}>
                                    <Text style={styles.surahName}>{surah.name}</Text>
                                    <Text style={styles.surahMeta}>{surah.ayahs} ayah</Text>
                                </View>
                                <View style={[styles.statusBadge, statusStyle[status]]}>
                                    <Text
                                        style={[
                                            styles.statusText,
                                            statusStyle[status] ? styles.statusTextColored : null,
                                        ]}
                                    >
                                        {statusLabel[status] ?? 'Belum'}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </>
            );
        }

        if (!user) {
            return (
                <Card>
                    <CardTitle>Murojaah</CardTitle>
                    <Text style={styles.modePanelText}>
                        Buka Profil untuk masuk dan mencatat sesi murojaah.
                    </Text>
                </Card>
            );
        }

        const memorizedSurahs = surahs.filter((surah) => {
            const entry = hafalanList.find(
                (item) => Number(item.surah_id) === Number(surah.number),
            );
            return entry?.status === 'memorized';
        });

        return (
            <>
                <Card>
                    <CardTitle>Murojaah</CardTitle>
                    <Text style={styles.modePanelText}>
                        Pilih surah yang sudah hafal, lalu catat sesi murojaah dengan skor dan
                        catatan.
                    </Text>
                    {murojaahLoading ? (
                        <ActivityIndicator color={colors.primary} style={styles.loader} />
                    ) : null}
                    {!murojaahLoading && memorizedSurahs.length === 0 ? (
                        <Text style={styles.modePanelMeta}>
                            Belum ada surah yang ditandai Hafal. Tandai status di tab Hafalan
                            terlebih dahulu.
                        </Text>
                    ) : null}
                    {memorizedSurahs.length > 0 ? (
                        <>
                            <Text style={styles.modePanelMeta}>Pilih surah untuk dimurojaah:</Text>
                            <View style={styles.murojaahSurahGrid}>
                                {memorizedSurahs.map((surah) => (
                                    <Pressable
                                        android_ripple={{
                                            color: 'rgba(91, 110, 91, 0.12)',
                                            borderless: false,
                                        }}
                                        key={`murojaah-pick-${surah.number}`}
                                        onPress={() =>
                                            setMurojaahForm((prev) => ({
                                                ...prev,
                                                surahId: surah.number,
                                            }))
                                        }
                                        style={[
                                            styles.murojaahChip,
                                            murojaahForm.surahId === surah.number
                                                ? styles.murojaahChipActive
                                                : null,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.murojaahChipText,
                                                murojaahForm.surahId === surah.number
                                                    ? styles.murojaahChipTextActive
                                                    : null,
                                            ]}
                                        >
                                            {surah.number}. {surah.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <Text style={[styles.modePanelMeta, styles.labelGap]}>Skor (0–100):</Text>
                            <View style={styles.scoreRow}>
                                {[60, 70, 80, 90, 100].map((score) => (
                                    <Pressable
                                        android_ripple={{
                                            color: 'rgba(91, 110, 91, 0.12)',
                                            borderless: false,
                                        }}
                                        key={`score-${score}`}
                                        onPress={() =>
                                            setMurojaahForm((prev) => ({ ...prev, score }))
                                        }
                                        style={[
                                            styles.murojaahChip,
                                            murojaahForm.score === score
                                                ? styles.murojaahChipActive
                                                : null,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.murojaahChipText,
                                                murojaahForm.score === score
                                                    ? styles.murojaahChipTextActive
                                                    : null,
                                            ]}
                                        >
                                            {score}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            <Text style={[styles.modePanelMeta, styles.labelGap]}>
                                Catatan (opsional):
                            </Text>
                            <TextInput
                                multiline
                                onChangeText={(note) =>
                                    setMurojaahForm((prev) => ({ ...prev, note }))
                                }
                                placeholder="Bagian yang perlu diperkuat, dll."
                                placeholderTextColor={colors.muted}
                                style={styles.murojaahNoteInput}
                                value={murojaahForm.note}
                            />
                            <Pressable
                                android_ripple={{
                                    color: 'rgba(255, 255, 255, 0.12)',
                                    borderless: false,
                                }}
                                disabled={savingMurojaah || !murojaahForm.surahId}
                                onPress={submitMurojaah}
                                style={[
                                    styles.modePanelAction,
                                    savingMurojaah || !murojaahForm.surahId
                                        ? styles.disabled
                                        : null,
                                ]}
                            >
                                {savingMurojaah ? (
                                    <ActivityIndicator color={colors.onPrimary} size="small" />
                                ) : (
                                    <Text style={styles.modePanelActionText}>
                                        Simpan Sesi Murojaah
                                    </Text>
                                )}
                            </Pressable>
                        </>
                    ) : null}
                    {murojaahMessage ? (
                        <Text style={styles.message}>{murojaahMessage}</Text>
                    ) : null}
                </Card>
            </>
        );
    };

    if (selectedSurah) {
        if (displayMode === 'mushaf') {
            return (
                <>
                    {renderSettingsModal()}
                    {renderReferenceModal()}
                    {renderAyahActionSheet()}
                    {renderAyahNotesModal()}
                    {renderTajweedModal()}
                    <ScrollView
                        contentContainerStyle={styles.mushafScrollContent}
                        keyboardShouldPersistTaps="handled"
                        onMomentumScrollBegin={handleScrollActivity}
                        onScroll={handleScrollActivity}
                        onScrollBeginDrag={handleScrollActivity}
                        refreshControl={
                            <RefreshControl
                                refreshing={readerLoading}
                                onRefresh={refreshReader}
                                tintColor={colors.primary}
                            />
                        }
                        scrollEventThrottle={250}
                        showsVerticalScrollIndicator={false}
                        style={styles.readerList}
                    >
                        {renderReaderHeader()}
                        {renderMushafPage()}
                    </ScrollView>
                </>
            );
        }

        return (
            <>
                {renderSettingsModal()}
                {renderReferenceModal()}
                {renderAyahActionSheet()}
                {renderAyahNotesModal()}
                {renderTajweedModal()}
                <FlatList
                    key={`${selectedSurah.key ?? selectedSurah.number}:${targetAyah?.id ?? targetAyah?.number ?? 'top'}:${ayahs.length ? 'ready' : 'loading'}`}
                    ref={readerListRef}
                    contentContainerStyle={[
                        styles.readerListContent,
                        displayMode === 'mushaf' ? styles.mushafListContent : null,
                    ]}
                    data={ayahs}
                    keyExtractor={(ayah) =>
                        `${selectedSurah.key ?? selectedSurah.number}-${ayah.number}-${ayah.id}`
                    }
                    keyboardShouldPersistTaps="handled"
                    getItemLayout={(_, index) => ({
                        index,
                        length: estimatedAyahHeight,
                        offset: estimatedAyahHeight * index,
                    })}
                    initialScrollIndex={targetAyahIndex > 0 ? targetAyahIndex : undefined}
                    ListEmptyComponent={
                        readerLoading ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : (
                            <EmptyState
                                title="Ayat belum tersedia"
                                description="Data ayat untuk pilihan ini belum tersedia dari server."
                            />
                        )
                    }
                    ListHeaderComponent={renderReaderHeader}
                    onMomentumScrollBegin={handleScrollActivity}
                    onScroll={handleScrollActivity}
                    onScrollBeginDrag={handleScrollActivity}
                    refreshControl={
                        <RefreshControl
                            refreshing={readerLoading}
                            onRefresh={refreshReader}
                            tintColor={colors.primary}
                        />
                    }
                    renderItem={renderAyahCard}
                    onScrollToIndexFailed={(info) => {
                        readerListRef.current?.scrollToOffset?.({
                            animated: false,
                            offset: Math.max(0, (info.averageItemLength || estimatedAyahHeight) * info.index),
                        });
                        setTimeout(() => {
                            readerListRef.current?.scrollToIndex?.({
                                animated: true,
                                index: info.index,
                                viewPosition: 0.18,
                            });
                        }, 220);
                    }}
                    scrollEventThrottle={250}
                    showsVerticalScrollIndicator={false}
                    style={styles.readerList}
                />
            </>
        );
    }

    return (
        <FlatList
            contentContainerStyle={styles.quranListContent}
            data={quranTab === 'surah' ? filteredSurahs : []}
            keyExtractor={(surah) => `${surah.number}-${surah.name}`}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
                quranTab === 'surah' ? (
                    loading && surahs.length === 0 ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : (
                        <EmptyState title="Surah tidak ditemukan" description="Coba kata kunci lain." />
                    )
                ) : null
            }
            ListFooterComponent={renderQuranListFooter}
            ListHeaderComponent={renderQuranListHeader}
            onMomentumScrollBegin={handleScrollActivity}
            onScroll={handleScrollActivity}
            onScrollBeginDrag={handleScrollActivity}
            refreshControl={
                <RefreshControl
                    onRefresh={refreshAll}
                    refreshing={loading}
                    tintColor={colors.primary}
                />
            }
            renderItem={renderSurahRow}
            scrollEventThrottle={250}
            showsVerticalScrollIndicator={false}
            style={styles.quranScroll}
        />
    );
}

const styles = StyleSheet.create({
    quranScroll: {
        backgroundColor: colors.bg,
        flex: 1,
    },
    quranListContent: {
        backgroundColor: colors.bg,
        flexGrow: 1,
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        paddingTop: spacing.xl,
    },
    readerList: {
        backgroundColor: colors.bg,
        flex: 1,
    },
    readerListContent: {
        backgroundColor: colors.bg,
        flexGrow: 1,
        gap: spacing.md,
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    mushafScrollContent: {
        backgroundColor: colors.bg,
        flexGrow: 1,
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    mushafListContent: {
        gap: 0,
        paddingHorizontal: spacing.md,
    },
    readerHeader: {
        borderBottomColor: colors.faint,
        borderBottomWidth: 1,
        marginBottom: spacing.sm,
        paddingBottom: spacing.md,
        paddingTop: spacing.md,
    },
    readerHeaderTop: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'space-between',
    },
    readerHeaderCopy: {
        flex: 1,
    },
    readerHeaderActions: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    readerTitle: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 20,
        fontWeight: '900',
    },
    readerSubtitle: {
        color: colors.muted,
        fontSize: 14,
        lineHeight: 20,
        marginTop: spacing.sm,
    },
    mushafPageHeader: {
        alignItems: 'center',
        backgroundColor: '#fff8dc',
        borderColor: '#c9b675',
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        padding: spacing.sm,
    },
    mushafPageChip: {
        backgroundColor: colors.surface,
        borderColor: '#c9b675',
        borderRadius: 999,
        borderWidth: 1,
        color: colors.ink,
        flex: 1,
        fontSize: 11,
        fontWeight: '900',
        overflow: 'hidden',
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        textAlign: 'center',
    },
    mushafPageCenter: {
        color: colors.primaryDark,
        flex: 1,
        fontSize: 12,
        fontWeight: '900',
        textAlign: 'center',
    },
    quranTitle: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 22,
        fontWeight: '900',
        marginBottom: spacing.sm,
    },
    quranSearch: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: radius.sm,
        borderWidth: 1,
        flexDirection: 'row',
        gap: spacing.sm,
        minHeight: 34,
        paddingHorizontal: spacing.md,
    },
    quranSearchInput: {
        color: colors.ink,
        flex: 1,
        fontSize: 13,
        minHeight: 32,
        padding: 0,
    },
    quranTabs: {
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 4,
        marginBottom: spacing.md,
        marginTop: spacing.sm,
        padding: 4,
    },
    quranTabButton: {
        alignItems: 'center',
        borderRadius: radius.sm,
        flex: 1,
        justifyContent: 'center',
        minHeight: 32,
    },
    quranTabButtonActive: {
        backgroundColor: colors.primary,
    },
    quranTabText: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: '900',
        textAlign: 'center',
    },
    quranTabTextActive: {
        color: colors.onPrimary,
    },
    surahRow: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: radius.sm,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
        minHeight: 58,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    surahLeft: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        minWidth: 0,
    },
    surahNumberWrap: {
        height: 38,
        justifyContent: 'center',
        marginRight: spacing.md,
        width: 38,
    },
    surahNumberDiamond: {
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderColor: colors.faint,
        borderRadius: 6,
        borderWidth: 1,
        height: 34,
        justifyContent: 'center',
        transform: [{ rotate: '45deg' }],
        width: 34,
    },
    surahNumberText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '900',
        transform: [{ rotate: '-45deg' }],
    },
    surahInfo: {
        flex: 1,
        minWidth: 0,
    },
    surahNameRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
    },
    surahName: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 14,
        fontWeight: '900',
    },
    surahMeta: {
        color: colors.muted,
        fontSize: 12,
        marginTop: 2,
    },
    surahArabic: {
        color: colors.ink,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: spacing.sm,
        maxWidth: '38%',
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    modePanelText: {
        color: colors.text,
        fontSize: 13,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    modePanelMeta: {
        color: colors.muted,
        fontSize: 12,
        fontWeight: '800',
    },
    modePanelAction: {
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        justifyContent: 'center',
        minHeight: 42,
        paddingHorizontal: spacing.md,
    },
    modePanelActionText: {
        color: colors.onPrimary,
        fontSize: 13,
        fontWeight: '900',
    },
    message: {
        color: colors.primary,
        fontSize: 12,
        marginTop: spacing.sm,
    },
    targetPreview: {
        backgroundColor: colors.surface,
        borderColor: colors.primary,
        borderRadius: radius.lg,
        borderWidth: 2,
        marginTop: spacing.md,
        padding: spacing.lg,
    },
    targetPreviewKicker: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: '900',
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
    },
    targetPreviewTitle: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 16,
        fontWeight: '900',
        marginBottom: spacing.md,
    },
    targetPreviewButton: {
        alignItems: 'center',
        borderColor: colors.primary,
        borderRadius: radius.md,
        borderWidth: 1,
        justifyContent: 'center',
        marginTop: spacing.md,
        minHeight: 38,
    },
    targetPreviewButtonText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '900',
    },
    navigatorTabs: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    navigatorTab: {
        alignItems: 'center',
        borderColor: colors.faint,
        borderRadius: radius.sm,
        borderWidth: 1,
        flex: 1,
        justifyContent: 'center',
        minHeight: 32,
    },
    navigatorTabActive: {
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.primary,
    },
    navigatorTabText: {
        color: colors.text,
        fontSize: 11,
        fontWeight: '800',
    },
    navigatorTabTextActive: {
        color: colors.primaryDark,
    },
    inputRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
    },
    numberInput: {
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        color: colors.ink,
        flex: 1,
        fontSize: 16,
        fontWeight: '800',
        minHeight: 42,
        paddingHorizontal: spacing.md,
    },
    loader: {
        marginVertical: spacing.md,
    },
    focusAyahCard: {
        paddingBottom: spacing.lg,
    },
    targetAyahCard: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    ayahHeader: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    ayahHeaderCopy: {
        flex: 1,
        minWidth: 0,
    },
    ayahHeaderTitle: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 16,
        fontWeight: '900',
    },
    ayahHeaderMeta: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '900',
        marginTop: 2,
    },
    ayahMenuButton: {
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderColor: colors.faint,
        borderRadius: radius.sm,
        borderWidth: 1,
        height: 34,
        justifyContent: 'center',
        marginLeft: spacing.sm,
        width: 34,
    },
    lineAyahRow: {
        borderBottomColor: colors.faint,
        borderBottomWidth: 1,
        paddingBottom: spacing.lg,
        paddingTop: spacing.md,
    },
    lineAyahHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    lineAyahNumber: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: 999,
        borderWidth: 1,
        height: 28,
        justifyContent: 'center',
        width: 28,
    },
    lineAyahNumberText: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: '900',
    },
    lineAyahMeta: {
        color: colors.muted,
        flex: 1,
        fontSize: 12,
        fontWeight: '800',
        minWidth: 0,
    },
    lineAyahMenuButton: {
        alignItems: 'center',
        borderRadius: radius.sm,
        height: 32,
        justifyContent: 'center',
        width: 32,
    },
    ayahArabic: {
        color: colors.ink,
        fontWeight: '800',
        lineHeight: 48,
        marginBottom: spacing.md,
        textAlign: 'right',
    },
    lineArabic: {
        color: colors.ink,
        fontWeight: '800',
        lineHeight: 46,
        marginBottom: spacing.sm,
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    mushafPagesStack: {
        gap: spacing.lg,
    },
    mushafPageShell: {
        backgroundColor: '#fbf6df',
        borderColor: '#d2bf77',
        borderRadius: radius.md,
        borderWidth: 1,
        padding: spacing.sm,
    },
    mushafFrame: {
        backgroundColor: '#fffbe8',
        borderColor: '#2f8f83',
        borderRadius: radius.sm,
        borderWidth: 2,
        padding: spacing.md,
    },
    mushafFrameTop: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.xs,
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    mushafFrameChip: {
        backgroundColor: colors.surface,
        borderColor: '#d2bf77',
        borderRadius: 999,
        borderWidth: 1,
        color: colors.ink,
        flex: 1,
        fontSize: 10,
        fontWeight: '900',
        overflow: 'hidden',
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        textAlign: 'center',
    },
    mushafFrameNumber: {
        backgroundColor: '#fffdf2',
        borderColor: '#2f8f83',
        borderRadius: 999,
        borderWidth: 1,
        color: colors.primaryDark,
        flex: 0.8,
        fontSize: 11,
        fontWeight: '900',
        overflow: 'hidden',
        paddingHorizontal: spacing.sm,
        paddingVertical: 5,
        textAlign: 'center',
    },
    mushafSurahNamePlate: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: '#d2bf77',
        borderRadius: radius.sm,
        borderWidth: 1,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    mushafSurahTitle: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 18,
        fontWeight: '900',
    },
    mushafSurahMeta: {
        color: colors.muted,
        fontSize: 11,
        fontWeight: '800',
        marginTop: 2,
    },
    mushafContinuousArabic: {
        color: colors.ink,
        fontWeight: '800',
        lineHeight: 58,
        textAlign: 'justify',
        writingDirection: 'rtl',
    },
    mushafTargetText: {
        backgroundColor: '#e9f7ef',
        color: colors.primaryDark,
    },
    mushafVerseMark: {
        color: colors.primaryDark,
        fontSize: 16,
        fontWeight: '900',
    },
    mushafAyahBlock: {
        backgroundColor: '#fffdf2',
        borderColor: '#d8c897',
        borderLeftWidth: 2,
        borderRightWidth: 2,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
    },
    mushafArabic: {
        color: colors.ink,
        fontWeight: '800',
        lineHeight: 52,
        marginBottom: spacing.sm,
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    mushafAyahNumber: {
        alignSelf: 'center',
        backgroundColor: colors.surface,
        borderColor: '#c9b675',
        borderRadius: 999,
        borderWidth: 1,
        color: colors.primaryDark,
        fontSize: 12,
        fontWeight: '900',
        marginBottom: spacing.md,
        minWidth: 28,
        overflow: 'hidden',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        textAlign: 'center',
    },
    ayahLatin: {
        color: colors.muted,
        fontSize: 13,
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    ayahTranslation: {
        color: colors.text,
        fontSize: 14,
        lineHeight: 22,
    },
    hiddenBlock: {
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    hiddenTitle: {
        color: colors.primaryDark,
        fontSize: 13,
        fontWeight: '900',
        textAlign: 'center',
    },
    revealButton: {
        alignItems: 'center',
        borderColor: colors.primary,
        borderRadius: radius.md,
        borderWidth: 1,
        justifyContent: 'center',
        marginTop: spacing.sm,
        minHeight: 38,
    },
    revealButtonText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '900',
    },
    referenceItem: {
        backgroundColor: colors.bg,
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        marginTop: spacing.sm,
        padding: spacing.md,
    },
    referenceTitle: {
        color: colors.ink,
        fontSize: 14,
        fontWeight: '900',
        marginBottom: spacing.xs,
    },
    referenceMeta: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    referenceBody: {
        color: colors.text,
        fontSize: 13,
        lineHeight: 20,
    },
    referenceEmpty: {
        color: colors.muted,
        fontSize: 13,
        lineHeight: 19,
        marginTop: spacing.sm,
    },
    qariGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    qariButton: {
        alignItems: 'center',
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 34,
        paddingHorizontal: spacing.md,
    },
    qariButtonActive: {
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.primary,
    },
    qariText: {
        color: colors.text,
        fontSize: 11,
        fontWeight: '800',
    },
    qariTextActive: {
        color: colors.primaryDark,
    },
    hafalanSummary: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    hafalanStat: {
        alignItems: 'center',
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.faint,
        borderRadius: 8,
        borderWidth: 1,
        flex: 1,
        paddingVertical: spacing.sm,
    },
    hafalanStatValue: {
        color: colors.primaryDark,
        fontFamily: 'serif',
        fontSize: 20,
        fontWeight: '900',
    },
    hafalanStatLabel: {
        color: colors.muted,
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    hafalanRow: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.sm,
        minHeight: 52,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    hafalanInfo: {
        flex: 1,
    },
    statusBadge: {
        alignItems: 'center',
        borderColor: colors.faint,
        borderRadius: 6,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 28,
        paddingHorizontal: spacing.sm,
    },
    statusInProgress: {
        backgroundColor: '#fffbeb',
        borderColor: '#fde68a',
    },
    statusMemorized: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
    },
    statusText: {
        color: colors.muted,
        fontSize: 11,
        fontWeight: '900',
    },
    statusTextColored: {
        color: colors.ink,
    },
    murojaahSurahGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    murojaahChip: {
        alignItems: 'center',
        borderColor: colors.faint,
        borderRadius: 6,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    murojaahChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    murojaahChipText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: '800',
    },
    murojaahChipTextActive: {
        color: '#ffffff',
    },
    scoreRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: spacing.sm,
    },
    murojaahNoteInput: {
        backgroundColor: colors.bg,
        borderColor: colors.faint,
        borderRadius: 8,
        borderWidth: 1,
        color: colors.ink,
        fontSize: 13,
        lineHeight: 19,
        marginTop: spacing.sm,
        minHeight: 72,
        padding: spacing.md,
        textAlignVertical: 'top',
    },
    labelGap: {
        marginTop: spacing.md,
    },
    disabled: {
        opacity: 0.55,
    },
    compactPrimaryButton: {
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        justifyContent: 'center',
        minHeight: 42,
        paddingHorizontal: spacing.md,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '900',
    },
    // Modal shared
    modalOverlay: {
        backgroundColor: 'rgba(0,0,0,0.38)',
        flex: 1,
    },
    modalSheet: {
        backgroundColor: colors.bg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '65%',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
    },
    modalSheetTall: {
        maxHeight: '80%',
    },
    modalHandle: {
        alignSelf: 'center',
        backgroundColor: colors.faint,
        borderRadius: 3,
        height: 4,
        marginBottom: spacing.md,
        width: 40,
    },
    modalHeader: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    modalTitle: {
        color: colors.ink,
        fontFamily: 'serif',
        fontSize: 17,
        fontWeight: '900',
    },
    modalMeta: {
        color: colors.muted,
        fontSize: 12,
        marginTop: 2,
    },
    modalClose: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.sm,
        height: 30,
        justifyContent: 'center',
        width: 30,
    },
    modalLoader: {
        marginVertical: spacing.lg,
    },
    modalBottomPad: {
        height: spacing.xl * 2,
    },
    actionSheetRow: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.sm,
        minHeight: 58,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    actionSheetRowActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    actionSheetIcon: {
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderRadius: radius.sm,
        height: 34,
        justifyContent: 'center',
        width: 34,
    },
    actionSheetCopy: {
        flex: 1,
        minWidth: 0,
    },
    actionSheetTitle: {
        color: colors.ink,
        fontSize: 13,
        fontWeight: '900',
    },
    actionSheetTitleActive: {
        color: colors.onPrimary,
    },
    actionSheetSubtitle: {
        color: colors.muted,
        fontSize: 12,
        lineHeight: 16,
        marginTop: 2,
    },
    actionSheetSubtitleActive: {
        color: 'rgba(255,255,255,0.82)',
    },
    actionSheetNotice: {
        color: colors.muted,
        fontSize: 12,
        lineHeight: 18,
        marginTop: spacing.sm,
    },
    // Settings modal
    settingLabel: {
        color: colors.ink,
        fontSize: 13,
        fontWeight: '900',
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    settingHint: {
        color: colors.muted,
        fontSize: 11,
        lineHeight: 16,
        marginTop: 4,
    },
    displayModeStack: {
        gap: spacing.sm,
    },
    displayModeCard: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.md,
    },
    displayModeCardActive: {
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.primary,
    },
    displayModePreview: {
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderColor: colors.faint,
        borderRadius: radius.sm,
        borderWidth: 1,
        height: 54,
        justifyContent: 'center',
        width: 46,
    },
    displayModePreviewTop: {
        backgroundColor: colors.primary,
        borderRadius: 2,
        height: 4,
        marginBottom: 7,
        width: 22,
    },
    displayModePreviewLine: {
        backgroundColor: colors.ink,
        borderRadius: 2,
        height: 5,
        marginBottom: 6,
        width: 28,
    },
    displayModePreviewLineFull: {
        height: 6,
        width: 34,
    },
    displayModePreviewSmall: {
        backgroundColor: colors.muted,
        borderRadius: 2,
        height: 3,
        width: 24,
    },
    displayModeCopy: {
        flex: 1,
        minWidth: 0,
    },
    displayModeLabel: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    displayModeLabelActive: {
        color: colors.primaryDark,
    },
    displayModeTitle: {
        color: colors.ink,
        fontSize: 14,
        fontWeight: '900',
        marginTop: 2,
    },
    displayModeDescription: {
        color: colors.muted,
        fontSize: 12,
        lineHeight: 17,
        marginTop: 2,
    },
    settingChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    settingChip: {
        alignItems: 'center',
        borderColor: colors.faint,
        borderRadius: radius.sm,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 34,
        paddingHorizontal: spacing.md,
    },
    settingChipActive: {
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.primary,
    },
    settingChipText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: '800',
    },
    settingChipTextActive: {
        color: colors.primaryDark,
    },
    fontSizeRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.md,
    },
    fontSizeButton: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: radius.sm,
        borderWidth: 1,
        height: 36,
        justifyContent: 'center',
        width: 36,
    },
    fontSizeValue: {
        color: colors.text,
        fontSize: 13,
        fontWeight: '800',
        minWidth: 44,
        textAlign: 'center',
    },
    tajweedButton: {
        alignItems: 'center',
        borderColor: colors.primary,
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'center',
        marginTop: spacing.lg,
        minHeight: 42,
    },
    tajweedButtonText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '900',
    },
    // Tajweed modal
    tajweedIntro: {
        color: colors.text,
        fontSize: 13,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    tajweedGroup: {
        backgroundColor: colors.surface,
        borderColor: colors.faint,
        borderRadius: radius.md,
        borderWidth: 1,
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    tajweedGroupHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    tajweedDot: {
        borderRadius: 6,
        height: 12,
        width: 12,
    },
    tajweedGroupTitle: {
        color: colors.ink,
        fontSize: 15,
        fontWeight: '900',
    },
    tajweedGroupDesc: {
        color: colors.muted,
        fontSize: 12,
        lineHeight: 17,
        marginBottom: spacing.sm,
        paddingLeft: 20,
    },
    tajweedRule: {
        alignItems: 'flex-start',
        borderTopColor: colors.faint,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacing.sm,
        marginTop: spacing.sm,
        gap: spacing.sm,
    },
    tajweedRuleLeft: {
        alignItems: 'flex-start',
        flex: 1,
        flexDirection: 'row',
        gap: spacing.sm,
    },
    tajweedRuleDot: {
        borderRadius: 5,
        height: 10,
        marginTop: 3,
        width: 10,
    },
    tajweedRuleInfo: {
        flex: 1,
    },
    tajweedRuleTitle: {
        color: colors.ink,
        fontSize: 13,
        fontWeight: '900',
    },
    tajweedRuleDesc: {
        color: colors.muted,
        fontSize: 11,
        lineHeight: 16,
        marginTop: 2,
    },
    tajweedRuleExample: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'right',
        writingDirection: 'rtl',
    },
});
