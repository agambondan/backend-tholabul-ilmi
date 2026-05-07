import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, CheckCircle2, Minus, Pause, Plus, Save, Search, StickyNote, Volume2 } from 'lucide-react-native';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { ActionPill, EmptyState, IconActionButton } from '../components/Paper';
import { useSession } from '../context/SessionContext';
import { preferenceKeys, readPreference, writePreference } from '../storage/preferences';
import { colors, radius, spacing } from '../theme';
import { playAudioUrl, stopAudio } from '../utils/audioPlayer';

const MEMORIZATION_MODES = [
  { key: 'off', label: 'Normal' },
  { key: 'hide_arabic', label: 'Sembunyikan Arab' },
  { key: 'hide_translation', label: 'Sembunyikan Terjemah' },
  { key: 'hide_all', label: 'Latihan Penuh' },
];

const QURAN_TABS = [
  { key: 'surah', label: 'Surah' },
  { key: 'hafalan', label: 'Hafalan' },
  { key: 'murojaah', label: 'Murojaah' },
];

export function QuranScreen({ deepLinkTarget, isActive, navigation }) {
  const { user } = useSession();
  const handledDeepLinkId = useRef(null);
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [ayahs, setAyahs] = useState([]);
  const [bookmarks, setBookmarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [readerLoading, setReaderLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [savingSurah, setSavingSurah] = useState(null);
  const [savingAyah, setSavingAyah] = useState(null);
  const [fontSize, setFontSize] = useState(28);
  const [activeNoteAyah, setActiveNoteAyah] = useState(null);
  const [activeReference, setActiveReference] = useState(null);
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

  const updateFontSize = async (nextSize) => {
    const normalized = Math.max(22, Math.min(42, nextSize));
    setFontSize(normalized);
    await writePreference(preferenceKeys.quranFontSize, normalized);
  };

  const updateMemorizationMode = async (mode) => {
    setMemorizationMode(mode);
    setRevealedAyahs({});
    await writePreference(preferenceKeys.quranMemorizationMode, mode);
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
        if (item.ref_type === 'ayah') {
          acc[item.ref_id] = item;
        }
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

  const cycleHafalanStatus = useCallback(async (surah) => {
    const cycle = { not_started: 'in_progress', in_progress: 'memorized', memorized: 'not_started' };
    const current = hafalanList.find((item) => Number(item.surah_id) === Number(surah.number));
    const currentStatus = current?.status ?? 'not_started';
    const nextStatus = cycle[currentStatus] ?? 'in_progress';

    setHafalanList((prev) => {
      const exists = prev.some((item) => Number(item.surah_id) === Number(surah.number));
      if (exists) {
        return prev.map((item) =>
          Number(item.surah_id) === Number(surah.number) ? { ...item, status: nextStatus } : item,
        );
      }
      return [...prev, { surah_id: surah.number, status: nextStatus }];
    });

    try {
      await updateHafalanStatus(surah.number, nextStatus);
      await loadHafalan();
    } catch {
      setHafalanList((prev) =>
        prev.map((item) =>
          Number(item.surah_id) === Number(surah.number) ? { ...item, status: currentStatus } : item,
        ),
      );
    }
  }, [hafalanList, loadHafalan]);

  const submitMurojaah = useCallback(async () => {
    if (!murojaahForm.surahId) {
      setMurojaahMessage('Pilih surah terlebih dahulu.');
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
      setMurojaahForm((prev) => ({ ...prev, surahId: null, note: '' }));
      await loadMurojaah();
    } catch (err) {
      setMurojaahMessage(err?.message ?? 'Murojaah belum bisa disimpan.');
    } finally {
      setSavingMurojaah(false);
    }
  }, [loadMurojaah, murojaahForm]);

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
    setActiveReference(null);
    setRevealedAyahs({});
    setMessage('');
  };

  const openSurah = async (surah) => {
    resetReaderState();
    setSelectedSurah({ ...surah, key: `surah:${surah.number}`, type: 'surah' });
    setReaderLoading(true);

    try {
      setAyahs(await getAyahsForSurah(surah.number));
      await loadBookmarks();
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
    if (!user) return;

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
    } catch (err) {
      setMessage(err?.message ?? 'Progres Al-Qur\'an belum bisa disimpan.');
    } finally {
      setSavingSurah(null);
    }
  };

  const markAyahProgress = async (ayah) => {
    if (!user || !selectedSurah) return;

    const surahNumber = selectedSurah.number ?? ayah.surahNumber;
    if (!surahNumber) {
      setMessage('Buka bacaan surah untuk menyimpan progres Al-Qur\'an.');
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
    } catch (err) {
      setMessage(err?.message ?? 'Progres ayat belum bisa disimpan.');
    } finally {
      setSavingAyah(null);
    }
  };

  const toggleAyahBookmark = async (ayah) => {
    if (!user || !ayah.id) return;

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
      } else {
        const bookmark = await addBookmark({ refType: 'ayah', refId: ayah.id });
        setBookmarks({ ...bookmarks, [ayah.id]: bookmark });
        setMessage(`Ayat ${ayah.number} disimpan ke bookmark.`);
      }
    } catch (err) {
      setMessage(err?.message ?? 'Bookmark ayat belum bisa diperbarui.');
    } finally {
      setSavingAyah(null);
    }
  };

  const toggleReference = async (ayah, type) => {
    const key = `${type}:${ayah.id}`;
    setActiveReference((current) => (current === key ? null : key));
    if (referenceState[key]?.items || referenceState[key]?.loading) return;

    setReferenceState((current) => ({
      ...current,
      [key]: { items: [], loading: true, error: '' },
    }));

    try {
      const items = type === 'tafsir' ? await getTafsirForAyah(ayah.id) : await getAsbabForAyah(ayah.id);
      setReferenceState((current) => ({
        ...current,
        [key]: {
          items,
          loading: false,
          error: items.length ? '' : `${type === 'tafsir' ? 'Tafsir' : 'Asbabun Nuzul'} belum tersedia.`,
        },
      }));
    } catch (err) {
      setReferenceState((current) => ({
        ...current,
        [key]: {
          items: [],
          loading: false,
          error: err?.message ?? 'Rujukan belum bisa dimuat.',
        },
      }));
    }
  };

  const renderReferencePanel = (ayah, type) => {
    const key = `${type}:${ayah.id}`;
    if (activeReference !== key) return null;

    const state = referenceState[key];
    const title = type === 'tafsir' ? 'Tafsir' : 'Asbabun Nuzul';

    return (
      <View style={styles.referencePanel}>
        <CardTitle meta={`Ayat ${ayah.number}`}>{title}</CardTitle>
        {state?.loading ? <ActivityIndicator color={colors.primary} /> : null}
        {state?.error ? <Text style={styles.referenceEmpty}>{state.error}</Text> : null}
        {state?.items?.map((item) => (
          <View key={`${key}-${item.id}`} style={styles.referenceItem}>
            <Text style={styles.referenceTitle}>{item.title}</Text>
            {item.meta ? <Text style={styles.referenceMeta}>{item.meta}</Text> : null}
            <Text style={styles.referenceBody}>{item.body}</Text>
          </View>
        ))}
      </View>
    );
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
    setAudioState((current) => ({ ...current, activeAyahId: ayah.id, loadingAyahId: ayah.id }));

    try {
      const cachedSources = audioState.sourcesByAyah[ayah.id];
      const sources =
        cachedSources ??
        (await getAyahAudio({
          ayahId: ayah.id,
          ayahNumber: ayah.number,
          surahNumber,
        }));
      const source = pickAudioSource(sources);

      setAudioState((current) => ({
        ...current,
        activeAyahId: ayah.id,
        loadingAyahId: null,
        sourcesByAyah: {
          ...current.sourcesByAyah,
          [ayah.id]: sources,
        },
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
      setAudioState((current) => ({ ...current, loadingAyahId: null, playingAyahId: null }));
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

  const renderAudioSources = (ayah) => {
    const sources = audioState.sourcesByAyah[ayah.id] ?? [];
    if (sources.length <= 1) return null;

    return (
      <View style={styles.qariGrid}>
        {sources.map((source) => (
          <Pressable
            key={`${ayah.id}-${source.qari_slug}`}
            onPress={() => selectQari(ayah.id, source.qari_slug)}
            style={[styles.qariButton, audioState.qariSlug === source.qari_slug ? styles.qariButtonActive : null]}
          >
            <Text style={[styles.qariText, audioState.qariSlug === source.qari_slug ? styles.qariTextActive : null]}>
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
    const hideTranslation = !isRevealed && ['hide_translation', 'hide_all'].includes(memorizationMode);
    const hasHiddenContent = hideArabic || hideTranslation;

    return (
      <>
        {ayah.arabic && !hideArabic ? <Text style={[styles.ayahArabic, { fontSize }]}>{ayah.arabic}</Text> : null}
        {hideArabic ? (
          <View style={styles.hiddenBlock}>
            <Text style={styles.hiddenTitle}>Arab disembunyikan untuk hafalan</Text>
          </View>
        ) : null}
        {ayah.latin && !hideTranslation ? <Text style={styles.ayahLatin}>{ayah.latin}</Text> : null}
        {ayah.translation && !hideTranslation ? <Text style={styles.ayahTranslation}>{ayah.translation}</Text> : null}
        {hideTranslation ? (
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

  const renderAyahCard = ({ item: ayah }) => (
    <Card>
      <CardTitle meta={ayah.surahName ? `${ayah.surahName} · Ayah ${ayah.number}` : `Ayah ${ayah.number}`}>
        {selectedSurah.name}
      </CardTitle>
      {renderAyahText(ayah)}
      <View style={styles.readerActions}>
        <ActionPill
          disabled={audioState.loadingAyahId === ayah.id}
          Icon={audioState.playingAyahId === ayah.id ? Pause : Volume2}
          label={audioState.loadingAyahId === ayah.id ? 'Memuat audio' : audioState.playingAyahId === ayah.id ? 'Jeda audio' : 'Putar audio'}
          onPress={() => playAyahAudio(ayah)}
          active={audioState.playingAyahId === ayah.id}
        />
        <ActionPill
          Icon={BookOpen}
          label="Tafsir"
          onPress={() => toggleReference(ayah, 'tafsir')}
          active={activeReference === `tafsir:${ayah.id}`}
        />
        <ActionPill
          Icon={BookOpen}
          label="Asbab"
          onPress={() => toggleReference(ayah, 'asbab')}
          active={activeReference === `asbab:${ayah.id}`}
        />
      </View>
      {renderAudioSources(ayah)}
      {renderReferencePanel(ayah, 'tafsir')}
      {renderReferencePanel(ayah, 'asbab')}
      {user ? (
        <View style={styles.readerActions}>
          <ActionPill
            disabled={savingAyah === `progress:${ayah.id}`}
            Icon={Save}
            label={savingAyah === `progress:${ayah.id}` ? 'Menyimpan' : 'Simpan progres'}
            onPress={() => markAyahProgress(ayah)}
          />
          <ActionPill
            disabled={savingAyah === `bookmark:${ayah.id}`}
            Icon={bookmarks[ayah.id] ? BookmarkCheck : Bookmark}
            label={
              savingAyah === `bookmark:${ayah.id}`
                ? 'Menyimpan'
                : bookmarks[ayah.id]
                  ? 'Hapus bookmark'
                  : 'Bookmark'
            }
            onPress={() => toggleAyahBookmark(ayah)}
            active={Boolean(bookmarks[ayah.id])}
          />
          <ActionPill
            Icon={StickyNote}
            label="Catatan"
            onPress={() => setActiveNoteAyah(activeNoteAyah === ayah.id ? null : ayah.id)}
            active={activeNoteAyah === ayah.id}
          />
        </View>
      ) : null}
      {activeNoteAyah === ayah.id ? <NotesPanel refType="ayah" refId={ayah.id} /> : null}
    </Card>
  );

  const renderReaderHeader = () => (
    <>
      <View style={styles.readerHeader}>
        <View style={styles.readerHeaderTop}>
          <View style={styles.readerHeaderCopy}>
            <Text style={styles.readerTitle}>{selectedSurah.name}</Text>
            <Text style={styles.readerSubtitle}>
              {selectedSurah.type === 'surah'
                ? `${selectedSurah.meaning || 'Bacaan Al-Qur\'an'} · ${selectedSurah.ayahs} ayah`
                : selectedSurah.meaning || 'Bacaan Al-Qur\'an'}
            </Text>
          </View>
          <IconActionButton Icon={ArrowLeft} label="Kembali ke daftar surah" onPress={closeReader} />
        </View>
      </View>
      <Card>
        <CardTitle meta="Bacaan">Tampilan</CardTitle>
        <View style={styles.readerTools}>
          <IconActionButton Icon={Minus} label="Kecilkan teks" onPress={() => updateFontSize(fontSize - 2)} />
          <Text style={styles.fontSizeText}>{fontSize}px</Text>
          <IconActionButton Icon={Plus} label="Besarkan teks" onPress={() => updateFontSize(fontSize + 2)} />
        </View>
        <View style={styles.modeGrid}>
          {MEMORIZATION_MODES.map((mode) => (
            <Pressable
              key={mode.key}
              onPress={() => updateMemorizationMode(mode.key)}
              style={[styles.modeButton, memorizationMode === mode.key ? styles.modeButtonActive : null]}
            >
              <Text style={[styles.modeButtonText, memorizationMode === mode.key ? styles.modeButtonTextActive : null]}>
                {mode.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </Card>
    </>
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
      const slugMatch = target.surahSlug && `${item.name}`.toLowerCase() === `${target.surahSlug}`.toLowerCase();
      const numberMatch = target.surahNumber && Number(item.number) === Number(target.surahNumber);
      return slugMatch || numberMatch;
    });

    if (nextSurah) {
      handledDeepLinkId.current = deepLinkTarget.id;
      openSurah(nextSurah);
    }
  }, [deepLinkTarget?.id, surahs]);

  useEffect(() => {
    if (!isActive) return;
    if (selectedSurah) {
      navigation?.setBack(() => { setSelectedSurah(null); return true; });
    } else {
      navigation?.clearBack?.();
    }
  }, [isActive, selectedSurah, navigation]);

  useEffect(() => {
    let mounted = true;
    readPreference(preferenceKeys.quranFontSize, 28).then((value) => {
      if (mounted && typeof value === 'number') {
        setFontSize(Math.max(22, Math.min(42, value)));
      }
    });
    readPreference(preferenceKeys.quranAudioQari, 'Alafasy_64kbps').then((value) => {
      if (mounted && typeof value === 'string') {
        setAudioState((current) => ({ ...current, qariSlug: value }));
      }
    });
    readPreference(preferenceKeys.quranMemorizationMode, 'off').then((value) => {
      if (mounted && MEMORIZATION_MODES.some((mode) => mode.key === value)) {
        setMemorizationMode(value);
      }
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
              {isProgressSurah ? <CheckCircle2 color={colors.primary} size={13} strokeWidth={2.2} /> : null}
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
            style={[styles.quranTabButton, quranTab === tab.key ? styles.quranTabButtonActive : null]}
          >
            <Text style={[styles.quranTabText, quranTab === tab.key ? styles.quranTabTextActive : null]}>
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
            style={[styles.navigatorTab, navigatorMode === mode ? styles.navigatorTabActive : null]}
          >
            <Text style={[styles.navigatorTabText, navigatorMode === mode ? styles.navigatorTabTextActive : null]}>
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
            <Text style={styles.modePanelText}>Buka Profil untuk masuk dan melacak progress hafalan.</Text>
          </Card>
        );
      }

      const statusLabel = { not_started: 'Belum', in_progress: 'Sedang', memorized: 'Hafal' };
      const statusStyle = { not_started: null, in_progress: styles.statusInProgress, memorized: styles.statusMemorized };

      return (
        <>
          <Card>
            <CardTitle>Hafalan</CardTitle>
            {hafalanSummary ? (
              <View style={styles.hafalanSummary}>
                <View style={styles.hafalanStat}>
                  <Text style={styles.hafalanStatValue}>{hafalanSummary.memorized ?? 0}</Text>
                  <Text style={styles.hafalanStatLabel}>Hafal</Text>
                </View>
                <View style={styles.hafalanStat}>
                  <Text style={styles.hafalanStatValue}>{hafalanSummary.in_progress ?? 0}</Text>
                  <Text style={styles.hafalanStatLabel}>Sedang</Text>
                </View>
                <View style={styles.hafalanStat}>
                  <Text style={styles.hafalanStatValue}>{hafalanSummary.not_started ?? hafalanSummary.not_memorized ?? 0}</Text>
                  <Text style={styles.hafalanStatLabel}>Belum</Text>
                </View>
              </View>
            ) : null}
            <Text style={styles.modePanelText}>
              Ketuk status di bawah untuk mengubah: Belum → Sedang → Hafal.
            </Text>
            {hafalanLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
            {!hafalanLoading && surahs.length === 0 ? (
              <Text style={styles.modePanelMeta}>Daftar surah belum dimuat.</Text>
            ) : null}
          </Card>
          {surahs.map((surah) => {
            const entry = hafalanList.find((item) => Number(item.surah_id) === Number(surah.number));
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
                  <Text style={[styles.statusText, statusStyle[status] ? styles.statusTextColored : null]}>
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
          <Text style={styles.modePanelText}>Buka Profil untuk masuk dan mencatat sesi murojaah.</Text>
        </Card>
      );
    }

    const memorizedSurahs = surahs.filter((surah) => {
      const entry = hafalanList.find((item) => Number(item.surah_id) === Number(surah.number));
      return entry?.status === 'memorized';
    });

    return (
      <>
        <Card>
          <CardTitle>Murojaah</CardTitle>
          <Text style={styles.modePanelText}>
            Pilih surah yang sudah hafal, lalu catat sesi murojaah dengan skor dan catatan.
          </Text>

          {murojaahLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}

          {!murojaahLoading && memorizedSurahs.length === 0 ? (
            <Text style={styles.modePanelMeta}>
              Belum ada surah yang ditandai Hafal. Tandai status di tab Hafalan terlebih dahulu.
            </Text>
          ) : null}

          {memorizedSurahs.length > 0 ? (
            <>
              <Text style={styles.modePanelMeta}>Pilih surah untuk dimurojaah:</Text>
              <View style={styles.murojaahSurahGrid}>
                {memorizedSurahs.map((surah) => (
                  <Pressable
                    android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                    key={`murojaah-pick-${surah.number}`}
                    onPress={() => setMurojaahForm((prev) => ({ ...prev, surahId: surah.number }))}
                    style={[styles.murojaahChip, murojaahForm.surahId === surah.number ? styles.murojaahChipActive : null]}
                  >
                    <Text style={[styles.murojaahChipText, murojaahForm.surahId === surah.number ? styles.murojaahChipTextActive : null]}>
                      {surah.number}. {surah.name}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.modePanelMeta, styles.labelGap]}>Skor (0–100):</Text>
              <View style={styles.scoreRow}>
                {[60, 70, 80, 90, 100].map((score) => (
                  <Pressable
                    android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                    key={`score-${score}`}
                    onPress={() => setMurojaahForm((prev) => ({ ...prev, score }))}
                    style={[styles.murojaahChip, murojaahForm.score === score ? styles.murojaahChipActive : null]}
                  >
                    <Text style={[styles.murojaahChipText, murojaahForm.score === score ? styles.murojaahChipTextActive : null]}>
                      {score}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.modePanelMeta, styles.labelGap]}>Catatan (opsional):</Text>
              <TextInput
                multiline
                onChangeText={(note) => setMurojaahForm((prev) => ({ ...prev, note }))}
                placeholder="Bagian yang perlu diperkuat, dll."
                placeholderTextColor={colors.muted}
                style={styles.murojaahNoteInput}
                value={murojaahForm.note}
              />

              <Pressable
                android_ripple={{ color: 'rgba(255, 255, 255, 0.12)', borderless: false }}
                disabled={savingMurojaah || !murojaahForm.surahId}
                onPress={submitMurojaah}
                style={[styles.modePanelAction, (savingMurojaah || !murojaahForm.surahId) ? styles.disabled : null]}
              >
                {savingMurojaah ? (
                  <ActivityIndicator color={colors.onPrimary} size="small" />
                ) : (
                  <Text style={styles.modePanelActionText}>Simpan Sesi Murojaah</Text>
                )}
              </Pressable>
            </>
          ) : null}

          {murojaahMessage ? <Text style={styles.message}>{murojaahMessage}</Text> : null}
        </Card>
      </>
    );
  };

  if (selectedSurah) {
    return (
      <FlatList
        contentContainerStyle={styles.readerListContent}
        data={ayahs}
        keyExtractor={(ayah) => `${selectedSurah.key ?? selectedSurah.number}-${ayah.number}-${ayah.id}`}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          readerLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <EmptyState title="Ayat belum tersedia" description="Data ayat untuk pilihan ini belum tersedia dari server." />
          )
        }
        ListHeaderComponent={renderReaderHeader}
        refreshControl={<RefreshControl refreshing={readerLoading} onRefresh={refreshReader} tintColor={colors.primary} />}
        renderItem={renderAyahCard}
        showsVerticalScrollIndicator={false}
        style={styles.readerList}
      />
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
      refreshControl={<RefreshControl onRefresh={refreshAll} refreshing={loading} tintColor={colors.primary} />}
      renderItem={renderSurahRow}
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  meaning: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  arabic: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'right',
  },
  progressText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  message: {
    color: colors.primary,
    fontSize: 12,
    marginTop: spacing.sm,
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
  navigatorText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
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
  backButton: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 42,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  readerTools: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  modeButton: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: spacing.sm,
  },
  modeButtonActive: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
  },
  modeButtonText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  modeButtonTextActive: {
    color: colors.primaryDark,
  },
  toolButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 38,
    width: 52,
  },
  toolButtonText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '900',
  },
  fontSizeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  ayahArabic: {
    color: colors.ink,
    fontWeight: '800',
    lineHeight: 48,
    marginBottom: spacing.md,
    textAlign: 'right',
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
  referencePanel: {
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
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
  readerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  loader: {
    marginVertical: spacing.md,
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
  actionButton: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 132,
  },
  actionButtonActive: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  actionButtonTextActive: {
    color: colors.primaryDark,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 42,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  compactPrimaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  button: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    minHeight: 42,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});
