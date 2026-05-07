import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, CheckCircle2, Circle, ExternalLink, Globe, HelpCircle, MoreVertical, Scale, Star, StickyNote, UserCircle, Users, Video, X } from 'lucide-react-native';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  getAllNotes,
  getBookmarkItems,
  getFeatureItems,
  getHijriOverview,
  getQuizQuestions,
  searchDictionary,
} from '../api/explore';
import { Card, CardTitle } from '../components/Card';
import { NotesPanel } from '../components/NotesPanel';
import { NotificationCenter } from '../components/NotificationCenter';
import { ActionPill, CompactRow, IconActionButton, PaperSearchInput, SectionHeader } from '../components/Paper';
import { Screen } from '../components/Screen';
import { useSession } from '../context/SessionContext';
import { allFeatures, belajarFeatureGroups } from '../data/mobileFeatures';
import { readPinnedFeatures, readRecentFeatures, rememberFeatureOpen, togglePinnedFeature } from '../storage/recentFeatures';
import { colors, radius, spacing } from '../theme';
import { addBookmark, deleteBookmark, getBookmarks, getTodayPrayerLog, savePrayerLog } from '../api/personal';
import { getAyahById, getSurahs } from '../api/client';

const quizOptions = ['A', 'B', 'C', 'D'];

const localTools = ['tasbih', 'zakat', 'faraidh', 'notifications', 'surah-content', 'sholat-tracker'];
const EXPLORE_PAGE_SIZE = 20;

const belajarFeatureIcons = {
  'asbabun-nuzul': BookOpen,
  'asmaul-husna': Star,
  blog: BookOpen,
  bookmarks: Bookmark,
  fiqh: BookOpen,
  goals: Star,
  'jarh-tadil': Scale,
  kajian: Video,
  kamus: Star,
  leaderboard: Users,
  manasik: BookOpen,
  notes: StickyNote,
  'panduan-sholat': BookOpen,
  perawi: Users,
  quiz: HelpCircle,
  sejarah: Globe,
  siroh: Users,
  stats: Globe,
  tafsir: BookOpen,
};

const belajarSections = belajarFeatureGroups.map((group) => ({
  key: group.key,
  title: group.label,
  meta: group.meta,
  rows: group.features.map((feature) => ({
    featureKey: feature.key,
    Icon: belajarFeatureIcons[feature.key] ?? BookOpen,
  })),
}));

const PRAYER_ITEMS = [
  { key: 'shubuh', label: 'Shubuh' },
  { key: 'dzuhur', label: 'Dzuhur' },
  { key: 'ashar', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isya', label: 'Isya' },
];

const hapticLight = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
const hapticMedium = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

const refKey = (refType, refId) => `${refType}:${refId}`;
const digitsOnly = (value = '') => `${value}`.replace(/[^\d]/g, '');
const parseNumericInput = (value = '') => Number(digitsOnly(value)) || 0;
const normalizeSearchText = (value = '') => `${value}`.trim().toLowerCase();
const formatNumericInput = (value = '') => {
  const normalized = digitsOnly(value);
  if (!normalized) return '';
  return Number(normalized).toLocaleString('id-ID');
};
const formatCurrency = (value = 0) => `Rp ${Math.round(Number(value) || 0).toLocaleString('id-ID')}`;
const formatDetailLabel = (key = '') =>
  `${key}`
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getItemRef = (feature, item) => ({
  refType: feature?.refType ?? feature?.key ?? 'explore',
  refId: String(item?.id ?? item?.raw?.id ?? item?.raw?.slug ?? item?.title),
});
const getExploreItemKey = (item) => String(item?.id ?? item?.raw?.id ?? item?.raw?.slug ?? item?.title ?? item?.body);
const isPaginatedFeature = (feature) => Boolean(feature?.endpoint) && ['list', 'protected-list'].includes(feature.type);
const findFeature = (featureKey) => allFeatures.find((feature) => feature.key === featureKey);
const getFeatureBadges = (feature, recentFeatureKeys = {}) => {
  const badges = [];

  if (recentFeatureKeys[feature?.key]) badges.push('Terakhir');
  if (Array.isArray(feature?.badges)) badges.push(...feature.badges);
  if (['protected-list', 'bookmarks', 'notes'].includes(feature?.type)) badges.push('Akun');
  if (localTools.includes(feature?.type)) badges.push('Lokal');

  return [...new Set(badges)].slice(0, 3);
};
const matchesCatalogQuery = (section, feature, query) => {
  const text = [section.title, section.meta, feature?.title, feature?.subtitle, feature?.group, feature?.key]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return text.includes(query);
};
const mergeUniqueItems = (currentItems, nextItems) => {
  const seen = new Set(currentItems.map(getExploreItemKey));
  const merged = [...currentItems];

  nextItems.forEach((item) => {
    const key = getExploreItemKey(item);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });

  return merged;
};

export function ExploreScreen({ deepLinkTarget, isActive, navigation, onOpenTab }) {
  const { session } = useSession();
  const handledDeepLinkId = useRef(null);
  const dictionaryInputRef = useRef(null);
  const [featureSearch, setFeatureSearch] = useState('');
  const [activeFeature, setActiveFeature] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingBookmark, setSavingBookmark] = useState('');
  const [itemActionSheet, setItemActionSheet] = useState({ visible: false, item: null });
  const [focusDictionaryInput, setFocusDictionaryInput] = useState(false);
  const [dictionaryQuery, setDictionaryQuery] = useState('');
  const [tasbih, setTasbih] = useState({ count: 0, target: 33 });
  const [zakat, setZakat] = useState({ assets: '', debts: '', nisab: '85000000' });
  const [faraidh, setFaraidh] = useState({ estate: '', debts: '', bequest: '', heirs: 'Suami/istri, orang tua, anak' });
  const [answers, setAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeNoteRef, setActiveNoteRef] = useState('');
  const [pinnedFeatureKeys, setPinnedFeatureKeys] = useState({});
  const [recentFeatureKeys, setRecentFeatureKeys] = useState({});
  const [surahs, setSurahs] = useState([]);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(null);
  const [sholatLog, setSholatLog] = useState({});
  const [pagination, setPagination] = useState({ page: 0, hasMore: false, loadingMore: false });

  const catalogSections = useMemo(() => {
    const query = normalizeSearchText(featureSearch);
    return belajarSections
      .map((section) => {
        const rows = section.rows
          .map((row) => ({ ...row, feature: findFeature(row.featureKey) }))
          .filter((row) => row.feature && (!query || matchesCatalogQuery(section, row.feature, query)));
        return { ...section, rows };
      })
      .filter((section) => section.rows.length > 0);
  }, [featureSearch]);

  const refreshDiscoveryState = useCallback(async () => {
    const [pinned, recent] = await Promise.all([readPinnedFeatures(), readRecentFeatures()]);
    setPinnedFeatureKeys(
      pinned.reduce((acc, feature) => {
        acc[feature.key] = true;
        return acc;
      }, {}),
    );
    setRecentFeatureKeys(
      recent.reduce((acc, feature) => {
        acc[feature.key] = true;
        return acc;
      }, {}),
    );
  }, []);

  const handleTogglePinnedFeature = useCallback(async (event, feature) => {
    event?.stopPropagation?.();
    hapticLight();
    try {
      const result = await togglePinnedFeature(feature);
      setPinnedFeatureKeys(
        result.items.reduce((acc, item) => {
          acc[item.key] = true;
          return acc;
        }, {}),
      );
    } catch {
      setError('Shortcut belum bisa diperbarui.');
    }
  }, []);

  const loadFeature = useCallback(
    async (feature, options = {}) => {
      rememberFeatureOpen(feature)
        .then((recent) => {
          setRecentFeatureKeys(
            recent.reduce((acc, item) => {
              acc[item.key] = true;
              return acc;
            }, {}),
          );
        })
        .catch(() => {});
      setActiveFeature(feature);
      setItems([]);
      setAnswers({});
      setSelectedItem(null);
      setActiveNoteRef('');
      setError('');
      setPagination({ page: 0, hasMore: false, loadingMore: false });
      setFocusDictionaryInput(Boolean(options.focusSearch && feature?.type === 'kamus'));
      if (feature?.type !== 'surah-content') {
        setSelectedSurahNumber(null);
      }

      if (localTools.includes(feature.type)) {
        if (feature.type === 'surah-content') {
          setLoading(true);
          try {
            setSurahs(await getSurahs());
          } catch (err) {
            setError(err?.message ?? 'Daftar surah belum bisa dimuat.');
          } finally {
            setLoading(false);
          }
        }

        if (feature.type === 'sholat-tracker') {
          if (!session?.token) {
            setError('Buka Profil untuk masuk dan melacak sholat.');
            return;
          }
          setLoading(true);
          try {
            const log = await getTodayPrayerLog();
            setSholatLog(log?.prayers ?? {});
          } catch {
            setSholatLog({});
          } finally {
            setLoading(false);
          }
        }

        return;
      }

      if (['protected-list', 'bookmarks', 'notes'].includes(feature.type) && !session?.token) {
        setError('Buka Profil untuk masuk dan membuka fitur personal ini.');
        return;
      }

      setLoading(true);
      try {
        let nextItems = [];
        if (feature.type === 'bookmarks') {
          nextItems = await getBookmarkItems();
        } else if (feature.type === 'notes') {
          nextItems = await getAllNotes();
        } else if (feature.type === 'quiz') {
          nextItems = await getQuizQuestions();
        } else if (feature.type === 'hijri') {
          nextItems = await getHijriOverview();
        } else if (feature.endpoint) {
          const paginated = isPaginatedFeature(feature);
          nextItems = await getFeatureItems(
            feature,
            paginated ? { page: 0, size: EXPLORE_PAGE_SIZE } : undefined,
          );
          setPagination({
            page: 0,
            hasMore: paginated && nextItems.length >= EXPLORE_PAGE_SIZE,
            loadingMore: false,
          });
        }
        setItems(nextItems);
      } catch (err) {
        setError(err?.message ?? 'Fitur ini belum bisa dimuat.');
      } finally {
        setLoading(false);
      }
    },
    [session?.token],
  );

  const loadMoreFeature = useCallback(async () => {
    if (!activeFeature || !isPaginatedFeature(activeFeature) || loading || pagination.loadingMore || !pagination.hasMore) {
      return;
    }

    const nextPage = pagination.page + 1;
    setPagination((current) => ({ ...current, loadingMore: true }));
    setError('');

    try {
      const nextItems = await getFeatureItems(activeFeature, { page: nextPage, size: EXPLORE_PAGE_SIZE });
      const merged = mergeUniqueItems(items, nextItems);
      const addedCount = merged.length - items.length;
      setItems(merged);
      setPagination({
        page: nextPage,
        hasMore: nextItems.length >= EXPLORE_PAGE_SIZE && addedCount > 0,
        loadingMore: false,
      });
    } catch (err) {
      setError(err?.message ?? 'Data lanjutan belum bisa dimuat.');
      setPagination((current) => ({ ...current, loadingMore: false }));
    }
  }, [activeFeature, items, loading, pagination.hasMore, pagination.loadingMore, pagination.page]);

  const loadBookmarks = useCallback(async () => {
    if (!session?.token) {
      setBookmarks({});
      return;
    }

    try {
      const items = await getBookmarks();
      setBookmarks(
        items.reduce((acc, item) => {
          acc[refKey(item.ref_type, item.ref_id)] = item;
          return acc;
        }, {}),
      );
    } catch {
      setBookmarks({});
    }
  }, [session?.token]);

  const toggleBookmark = async (item) => {
    if (!activeFeature || !session?.token) {
      setError('Buka Profil untuk masuk dan menyimpan bookmark.');
      return;
    }

    const ref = getItemRef(activeFeature, item);
    const key = refKey(ref.refType, ref.refId);
    setSavingBookmark(key);
    setError('');

    try {
      const existing = bookmarks[key];
      if (existing?.id) {
        await deleteBookmark(existing.id);
        setBookmarks((current) => {
          const next = { ...current };
          delete next[key];
          return next;
        });
      } else {
        const created = await addBookmark(ref);
        setBookmarks((current) => ({ ...current, [key]: created?.data ?? created }));
      }
    } catch (err) {
      setError(err?.message ?? 'Bookmark belum bisa diperbarui.');
    } finally {
      setSavingBookmark('');
    }
  };

  const openSource = useCallback(
    async (item) => {
      const raw = item?.raw ?? {};
      const refType = raw.ref_type;
      const refId = Number(raw.ref_id);
      if (!onOpenTab || !refType || !Number.isFinite(refId)) return;
      if (refType === 'hadith') {
        onOpenTab('hadith', { hadithId: refId });
        return;
      }
      if (refType === 'ayah') {
        try {
          const ayah = await getAyahById(refId);
          onOpenTab('quran', { surahNumber: ayah?.surahNumber ?? 1 });
        } catch (err) {
          setError(err?.message ?? 'Sumber asli belum bisa dibuka.');
        }
      }
    },
    [onOpenTab],
  );

  const runDictionarySearch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await searchDictionary(dictionaryQuery));
    } catch (err) {
      setError(err?.message ?? 'Pencarian kamus belum berhasil.');
    } finally {
      setLoading(false);
    }
  }, [dictionaryQuery]);

  const loadSurahContent = async (surahNumber) => {
    if (!activeFeature?.contentType || !surahNumber) return;

    setSelectedSurahNumber(surahNumber);
    setSelectedItem(null);
    setActiveNoteRef('');
    setError('');
    setLoading(true);
    setPagination({ page: 0, hasMore: false, loadingMore: false });

    try {
      const endpoint =
        activeFeature.contentType === 'tafsir'
          ? `/api/v1/tafsir/surah/${surahNumber}`
          : `/api/v1/asbabun-nuzul/surah/${surahNumber}`;
      const nextItems = await getFeatureItems(
        { ...activeFeature, endpoint, type: 'list' },
        { page: 0, size: EXPLORE_PAGE_SIZE },
      );
      setItems(nextItems);
      setPagination({
        page: 0,
        hasMore: nextItems.length >= EXPLORE_PAGE_SIZE,
        loadingMore: false,
      });
    } catch (err) {
      setItems([]);
      setError(err?.message ?? 'Konten surah belum bisa dimuat.');
    } finally {
      setLoading(false);
    }
  };

  const togglePrayer = useCallback(
    async (prayerKey) => {
      const nowDone = !sholatLog[prayerKey];
      if (nowDone) hapticMedium();
      setSholatLog((current) => ({ ...current, [prayerKey]: nowDone }));
      try {
        await savePrayerLog({
          date: new Date().toISOString().split('T')[0],
          prayer: prayerKey,
          status: nowDone ? 'done' : 'missed',
        });
      } catch {
        setSholatLog((current) => ({ ...current, [prayerKey]: !nowDone }));
      }
    },
    [sholatLog],
  );

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    if (!isActive) return;
    refreshDiscoveryState();
  }, [isActive, refreshDiscoveryState]);

  useEffect(() => {
    const featureKey = deepLinkTarget?.params?.featureKey;
    if (!featureKey || handledDeepLinkId.current === deepLinkTarget?.id) return;

    const feature = allFeatures.find((item) => item.key === featureKey);
    if (!feature) return;

    handledDeepLinkId.current = deepLinkTarget.id;
    loadFeature(feature, { focusSearch: Boolean(deepLinkTarget?.params?.focusSearch) });
  }, [deepLinkTarget?.id, loadFeature]);

  useEffect(() => {
    if (activeFeature?.type !== 'kamus' || !focusDictionaryInput) return;

    const timer = setTimeout(() => {
      dictionaryInputRef.current?.focus?.();
      setFocusDictionaryInput(false);
    }, 120);

    return () => clearTimeout(timer);
  }, [activeFeature?.type, focusDictionaryInput]);

  useEffect(() => {
    if (!isActive) return;
    if (selectedItem) {
      navigation?.setBack(() => { setSelectedItem(null); return true; });
    } else if (activeFeature) {
      navigation?.setBack(() => {
        setActiveFeature(null);
        setItems([]);
        setSelectedItem(null);
        setError('');
        return true;
      });
    } else {
      navigation?.clearBack?.();
    }
  }, [isActive, selectedItem, activeFeature, navigation]);

  const scoreQuiz = () => {
    if (!items.length) return 0;
    return items.reduce((total, item) => {
      const correct = item.raw?.correct_answer ?? item.raw?.answer_key ?? item.raw?.answer;
      const selected = answers[item.id];
      if (!correct || !selected) return total;
      const normalizedCorrect = `${correct}`.trim().toLowerCase();
      const selectedKey = `${selected.key ?? ''}`.trim().toLowerCase();
      const selectedLabel = `${selected.label ?? ''}`.trim().toLowerCase();
      return total + (selectedKey === normalizedCorrect || selectedLabel === normalizedCorrect ? 1 : 0);
    }, 0);
  };

  const renderCurrencyInput = ({ label, value, onChangeText, placeholder }) => (
    <View style={styles.currencyField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.currencyInputShell}>
        <Text style={styles.currencyPrefix}>Rp</Text>
        <TextInput
          keyboardType="numeric"
          onChangeText={(nextValue) => onChangeText(digitsOnly(nextValue))}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          style={styles.currencyInput}
          value={formatNumericInput(value)}
        />
      </View>
    </View>
  );

  const getQuizChoices = (item) => {
    const raw = item?.raw ?? {};
    let options = [];

    if (Array.isArray(raw.options)) {
      options = raw.options;
    } else if (typeof raw.options === 'string') {
      try {
        const parsed = JSON.parse(raw.options);
        if (Array.isArray(parsed)) options = parsed;
      } catch {
        options = [];
      }
    }

    if (!options.length) {
      options = [raw.option_a, raw.option_b, raw.option_c, raw.option_d].filter(Boolean);
    }

    if (!options.length) {
      return quizOptions.map((key) => ({ key, label: key }));
    }

    return options.slice(0, 4).map((label, index) => ({
      key: quizOptions[index] ?? `${index + 1}`,
      label: `${label}`,
    }));
  };

  const renderItem = (item, index) => (
    <Card key={`${item.id}-${index}`} style={styles.itemCard}>
      <View style={styles.itemTitleBlock}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.meta || activeFeature?.title ? (
          <Text style={styles.itemMeta}>{item.meta || activeFeature?.title}</Text>
        ) : null}
      </View>
      {item.arabic ? <Text style={styles.arabic}>{item.arabic}</Text> : null}
      {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
      {activeFeature?.type === 'quiz' ? (
        <View style={styles.answerRow}>
          {getQuizChoices(item).map((option) => (
            <Pressable
              android_ripple={{ color: 'rgba(91, 110, 91, 0.14)', borderless: false }}
              key={`${item.id}-${option.key}`}
              onPress={() => setAnswers((current) => ({ ...current, [item.id]: option }))}
              style={[styles.answerButton, answers[item.id]?.key === option.key && styles.answerButtonActive]}
            >
              <Text style={[styles.answerText, answers[item.id]?.key === option.key && styles.answerTextActive]}>
                {`${option.key}. ${option.label}`}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.itemHeaderActions}>
        <Pressable
          accessibilityLabel="Aksi item"
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: true }}
          onPress={() => setItemActionSheet({ visible: true, item })}
          style={styles.itemMenuButton}
        >
          <MoreVertical color={colors.primary} size={18} strokeWidth={2.4} />
        </Pressable>
      </View>
    </Card>
  );

  const renderItemActionSheet = () => {
    const { visible, item } = itemActionSheet;
    if (!item) return null;

    const ref = getItemRef(activeFeature, item);
    const key = refKey(ref.refType, ref.refId);
    const isBookmarked = Boolean(bookmarks[key]);

    return (
      <Modal
        animationType="slide"
        onRequestClose={() => setItemActionSheet({ visible: false, item: null })}
        transparent
        visible={visible}
      >
        <Pressable
          onPress={() => setItemActionSheet({ visible: false, item: null })}
          style={styles.modalOverlay}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderCopy}>
              <Text style={styles.modalTitle}>Aksi Konten</Text>
              <Text style={styles.modalMeta} numberOfLines={1}>{item.title}</Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => setItemActionSheet({ visible: false, item: null })}
              style={styles.modalClose}
            >
              <X color={colors.muted} size={18} strokeWidth={2.2} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {activeFeature?.type !== 'bookmarks' ? (
              <Pressable
                accessibilityRole="button"
                android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                onPress={() => {
                  setItemActionSheet({ visible: false, item: null });
                  setSelectedItem(item);
                  setActiveNoteRef('');
                }}
                style={styles.actionSheetRow}
              >
                <View style={styles.actionSheetIcon}>
                  <BookOpen color={colors.primary} size={18} strokeWidth={2.3} />
                </View>
                <View style={styles.actionSheetCopy}>
                  <Text style={styles.actionSheetTitle}>Detail</Text>
                  <Text style={styles.actionSheetSubtitle}>Buka detail konten</Text>
                </View>
              </Pressable>
            ) : null}

            {activeFeature?.type === 'bookmarks' || activeFeature?.type === 'notes' ? (
              <Pressable
                accessibilityRole="button"
                android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                onPress={() => {
                  setItemActionSheet({ visible: false, item: null });
                  openSource(item);
                }}
                style={styles.actionSheetRow}
              >
                <View style={styles.actionSheetIcon}>
                  <ExternalLink color={colors.primary} size={18} strokeWidth={2.3} />
                </View>
                <View style={styles.actionSheetCopy}>
                  <Text style={styles.actionSheetTitle}>Buka Sumber</Text>
                  <Text style={styles.actionSheetSubtitle}>Buka sumber asli konten ini</Text>
                </View>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
              disabled={savingBookmark === key}
              onPress={() => toggleBookmark(item)}
              style={[styles.actionSheetRow, isBookmarked ? styles.actionSheetRowActive : null]}
            >
              <View style={styles.actionSheetIcon}>
                {isBookmarked ? (
                  <BookmarkCheck color={colors.onPrimary} size={18} strokeWidth={2.3} />
                ) : (
                  <Bookmark color={colors.primary} size={18} strokeWidth={2.3} />
                )}
              </View>
              <View style={styles.actionSheetCopy}>
                <Text style={[styles.actionSheetTitle, isBookmarked ? styles.actionSheetTitleActive : null]}>
                  {isBookmarked ? 'Hapus Bookmark' : 'Bookmark'}
                </Text>
                <Text style={[styles.actionSheetSubtitle, isBookmarked ? styles.actionSheetSubtitleActive : null]}>
                  {isBookmarked ? 'Hapus dari koleksi' : 'Simpan ke koleksi pribadi'}
                </Text>
              </View>
            </Pressable>
            <View style={styles.modalBottomPad} />
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const closeDetailModal = () => {
    setSelectedItem(null);
    setActiveNoteRef('');
  };

  const renderDetailModal = () => {
    if (!selectedItem) return null;
    const ref = getItemRef(activeFeature, selectedItem);
    const noteKey = refKey(ref.refType, ref.refId);
    const rawEntries = Object.entries(selectedItem.raw ?? {})
      .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
      .slice(0, 12);

    return (
      <Modal
        animationType="slide"
        onRequestClose={closeDetailModal}
        transparent
        visible={Boolean(selectedItem)}
      >
        <Pressable onPress={closeDetailModal} style={styles.modalOverlay} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderCopy}>
              <Text style={styles.modalTitle}>{selectedItem.title}</Text>
              {selectedItem.meta || activeFeature?.title ? (
                <Text style={styles.modalMeta}>{selectedItem.meta || activeFeature?.title}</Text>
              ) : null}
            </View>
            <Pressable hitSlop={8} onPress={closeDetailModal} style={styles.modalClose}>
              <X color={colors.muted} size={18} strokeWidth={2.2} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedItem.arabic ? (
              <Text style={styles.arabic}>{selectedItem.arabic}</Text>
            ) : null}
            {selectedItem.body ? (
              <Text style={styles.body}>{selectedItem.body}</Text>
            ) : null}
            {rawEntries.length ? (
              <View style={styles.detailPanel}>
                <Text style={styles.detailTitle}>Detail</Text>
                {rawEntries.map(([key, value]) => (
                  <Text key={key} style={styles.detailLine}>
                    {formatDetailLabel(key)}: {String(value)}
                  </Text>
                ))}
              </View>
            ) : null}
            <View style={styles.modalActions}>
              <ActionPill
                Icon={StickyNote}
                label="Catatan"
                onPress={() => setActiveNoteRef(activeNoteRef === noteKey ? '' : noteKey)}
                active={activeNoteRef === noteKey}
              />
              <ActionPill
                Icon={ExternalLink}
                label="Buka sumber"
                onPress={() => openSource(selectedItem)}
              />
            </View>
            {activeNoteRef === noteKey ? (
              <NotesPanel refType={ref.refType} refId={ref.refId} />
            ) : null}
            <View style={styles.modalBottomPad} />
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderFeatureContent = () => {
    if (!activeFeature) {
      return null;
    }

    if (activeFeature.type === 'kamus') {
      return (
        <Card>
          <CardTitle meta="Cari Kata">{activeFeature.title}</CardTitle>
          <View style={styles.searchRow}>
            <TextInput
              ref={dictionaryInputRef}
              autoFocus={focusDictionaryInput}
              autoCapitalize="none"
              onChangeText={setDictionaryQuery}
              onSubmitEditing={runDictionarySearch}
              placeholder="Cari kata Arab atau Indonesia"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={dictionaryQuery}
            />
            <Pressable onPress={runDictionarySearch} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Cari</Text>
            </Pressable>
          </View>
        </Card>
      );
    }

    if (activeFeature.type === 'tasbih') {
      const progress = Math.min(100, Math.round((tasbih.count / tasbih.target) * 100));
      return (
        <Card>
          <CardTitle meta={`${progress}%`}>{activeFeature.title}</CardTitle>
          <Pressable
            onPress={() => {
                hapticLight();
                setTasbih((current) => ({ ...current, count: current.count + 1 }));
            }}
            style={styles.counter}
          >
            <Text style={styles.counterNumber}>{tasbih.count}</Text>
            <Text style={styles.counterLabel}>Target {tasbih.target}</Text>
          </Pressable>
          <View style={styles.answerRow}>
            {[33, 99, 100].map((target) => (
              <Pressable
                key={target}
                onPress={() => setTasbih({ count: 0, target })}
                style={[styles.answerButton, tasbih.target === target && styles.answerButtonActive]}
              >
                <Text style={[styles.answerText, tasbih.target === target && styles.answerTextActive]}>{target}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setTasbih((current) => ({ ...current, count: 0 }))} style={styles.answerButton}>
              <Text style={styles.answerText}>Reset</Text>
            </Pressable>
          </View>
        </Card>
      );
    }

    if (activeFeature.type === 'surah-content') {
      return (
        <Card>
          <CardTitle meta={selectedSurahNumber ? `Surah ${selectedSurahNumber}` : 'Pilih Surah'}>
            {activeFeature.title}
          </CardTitle>
          <Text style={styles.body}>Pilih surah untuk memuat konten dari backend.</Text>
          <View style={styles.surahSelector}>
            {surahs.slice(0, 12).map((surah) => (
              <Pressable
                android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                key={`${activeFeature.key}-${surah.number}`}
                onPress={() => loadSurahContent(surah.number)}
                style={[styles.surahChip, selectedSurahNumber === surah.number && styles.surahChipActive]}
              >
                <Text style={[styles.surahChipText, selectedSurahNumber === surah.number && styles.surahChipTextActive]}>
                  {surah.number}. {surah.name}
                </Text>
              </Pressable>
            ))}
          </View>
          {!loading && surahs.length === 0 ? <Text style={styles.empty}>Daftar surah belum tersedia.</Text> : null}
        </Card>
      );
    }

    if (activeFeature.type === 'zakat') {
      const assets = parseNumericInput(zakat.assets);
      const debts = parseNumericInput(zakat.debts);
      const nisab = parseNumericInput(zakat.nisab);
      const net = Math.max(0, assets - debts);
      const isZakatDue = nisab > 0 && net >= nisab;
      const due = isZakatDue ? net * 0.025 : 0;
      return (
        <Card>
          <CardTitle meta={isZakatDue ? 'Wajib Zakat' : 'Belum Mencapai Nisab'}>{activeFeature.title}</CardTitle>
          <Text style={styles.body}>Masukkan harta dan kewajiban yang jatuh tempo. Nilai zakat dihitung 2,5% dari harta bersih.</Text>
          {renderCurrencyInput({
            label: 'Total harta',
            value: zakat.assets,
            placeholder: '0',
            onChangeText: (assetsValue) => setZakat((current) => ({ ...current, assets: assetsValue })),
          })}
          {renderCurrencyInput({
            label: 'Utang jatuh tempo',
            value: zakat.debts,
            placeholder: '0',
            onChangeText: (debtsValue) => setZakat((current) => ({ ...current, debts: debtsValue })),
          })}
          {renderCurrencyInput({
            label: 'Nisab',
            value: zakat.nisab,
            placeholder: '85.000.000',
            onChangeText: (nisabValue) => setZakat((current) => ({ ...current, nisab: nisabValue })),
          })}
          <View style={styles.resultPanel}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Harta bersih</Text>
              <Text style={styles.resultValue}>{formatCurrency(net)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Nisab</Text>
              <Text style={styles.resultValue}>{formatCurrency(nisab)}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabelStrong}>Zakat maal 2,5%</Text>
              <Text style={styles.resultValueStrong}>{formatCurrency(due)}</Text>
            </View>
            <Text style={[styles.statusNote, isZakatDue && styles.statusNoteActive]}>
              {isZakatDue ? 'Harta bersih sudah mencapai nisab.' : 'Harta bersih belum mencapai nisab.'}
            </Text>
          </View>
        </Card>
      );
    }

    if (activeFeature.type === 'faraidh') {
      const estate = parseNumericInput(faraidh.estate);
      const debts = parseNumericInput(faraidh.debts);
      const requestedBequest = parseNumericInput(faraidh.bequest);
      const maxBequest = Math.floor(estate / 3);
      const bequest = Math.min(requestedBequest, maxBequest);
      const distributable = Math.max(0, estate - debts - bequest);
      const bequestCapped = estate > 0 && requestedBequest > maxBequest;
      return (
        <Card>
          <CardTitle meta="Perencana Waris">{activeFeature.title}</CardTitle>
          <Text style={styles.body}>Hitung harta bersih yang siap dibagikan setelah utang dan wasiat. Wasiat otomatis dibatasi maksimal 1/3 harta.</Text>
          {renderCurrencyInput({
            label: 'Harta warisan',
            value: faraidh.estate,
            placeholder: '0',
            onChangeText: (estateValue) => setFaraidh((current) => ({ ...current, estate: estateValue })),
          })}
          {renderCurrencyInput({
            label: 'Utang dan biaya',
            value: faraidh.debts,
            placeholder: '0',
            onChangeText: (debtValue) => setFaraidh((current) => ({ ...current, debts: debtValue })),
          })}
          {renderCurrencyInput({
            label: 'Wasiat',
            value: faraidh.bequest,
            placeholder: '0',
            onChangeText: (bequestValue) => setFaraidh((current) => ({ ...current, bequest: bequestValue })),
          })}
          <Text style={styles.inputLabel}>Ahli waris</Text>
          <TextInput
            onChangeText={(heirsValue) => setFaraidh((current) => ({ ...current, heirs: heirsValue }))}
            placeholder="Daftar ahli waris (cth: suami, ibu, anak)"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={faraidh.heirs}
          />
          <View style={styles.resultPanel}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Harta awal</Text>
              <Text style={styles.resultValue}>{formatCurrency(estate)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Wasiat dihitung</Text>
              <Text style={styles.resultValue}>{formatCurrency(bequest)}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLabelStrong}>Harta dibagikan</Text>
              <Text style={styles.resultValueStrong}>{formatCurrency(distributable)}</Text>
            </View>
            <Text style={[styles.statusNote, bequestCapped && styles.statusNoteWarning]}>
              {bequestCapped
                ? `Wasiat melebihi batas, dihitung maksimal ${formatCurrency(maxBequest)}.`
                : `Ahli waris: ${faraidh.heirs || '-'}`}
            </Text>
          </View>
        </Card>
      );
    }

    if (activeFeature.type === 'sholat-tracker') {
      const doneCount = PRAYER_ITEMS.filter((p) => sholatLog[p.key]).length;
      return (
        <Card>
          <CardTitle meta={`${doneCount}/5 sholat`}>Sholat Tracker</CardTitle>
          <Text style={styles.body}>Catat sholat yang telah kamu kerjakan hari ini.</Text>
          <View style={styles.trackerList}>
            {PRAYER_ITEMS.map((p) => (
              <Pressable
                android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                key={p.key}
                onPress={() => togglePrayer(p.key)}
                style={styles.trackerRow}
              >
                {sholatLog[p.key] ? (
                  <CheckCircle2 color={colors.primary} size={22} strokeWidth={2.5} />
                ) : (
                  <Circle color={colors.faint} size={22} strokeWidth={2} />
                )}
                <Text style={[styles.trackerLabel, sholatLog[p.key] && styles.trackerLabelDone]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      );
    }

    if (activeFeature.type === 'notifications') {
      return <NotificationCenter />;
    }

    return null;
  };

  const clearFeature = () => {
    setActiveFeature(null);
    setItems([]);
    setSelectedItem(null);
    setError('');
    setActiveNoteRef('');
  };

  const hasMoreItems = activeFeature && isPaginatedFeature(activeFeature) && items.length;

  return (
    <Screen
      title="Belajar"
      subtitle="Kajian, referensi Islam, dan fitur personal."
      actions={
        activeFeature ? (
          <IconActionButton
            Icon={ArrowLeft}
            label="Kembali ke Belajar"
            onPress={clearFeature}
          />
        ) : (
          <IconActionButton
            Icon={UserCircle}
            label="Buka Profil"
            onPress={() => onOpenTab?.('profile')}
          />
        )
      }
    >
      {!activeFeature && (
        <>
          <PaperSearchInput
            onChangeText={setFeatureSearch}
            placeholder="Cari kajian, tafsir, kamus, perawi, quiz..."
            value={featureSearch}
          />
          {catalogSections.length ? (
            catalogSections.map((section) => (
            <View key={section.key} style={styles.belajarSection}>
              <SectionHeader meta={section.meta} title={section.title} />
              <Card style={styles.belajarCard}>
                {section.rows.map((row) => {
                  const pinned = Boolean(pinnedFeatureKeys[row.feature.key]);
                  const badges = getFeatureBadges(row.feature, recentFeatureKeys);
                  return (
                    <CompactRow
                      badges={badges}
                      Icon={row.Icon}
                      key={row.feature.key}
                      onPress={() => loadFeature(row.feature)}
                      right={(
                        <Pressable
                          accessibilityLabel={pinned ? `Lepas ${row.feature.title} dari Beranda` : `Sematkan ${row.feature.title} ke Beranda`}
                          accessibilityRole="button"
                          accessibilityState={{ selected: pinned }}
                          android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: true }}
                          onPress={(event) => handleTogglePinnedFeature(event, row.feature)}
                          style={[styles.pinButton, pinned && styles.pinButtonActive]}
                        >
                          <Star
                            color={pinned ? colors.onPrimary : colors.primary}
                            fill={pinned ? colors.onPrimary : 'transparent'}
                            size={15}
                            strokeWidth={2.2}
                          />
                        </Pressable>
                      )}
                      subtitle={row.feature.subtitle}
                      title={row.feature.title}
                    />
                  );
                })}
              </Card>
            </View>
            ))
          ) : (
            <Card>
              <CardTitle meta="Kosong">Tidak ada hasil</CardTitle>
              <Text style={styles.body}>Coba kata lain seperti tafsir, kamus, siroh, atau quiz.</Text>
            </Card>
          )}
        </>
      )}

      {renderFeatureContent()}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {activeFeature?.type === 'quiz' && items.length ? (
        <Text style={styles.result}>
          Dijawab {Object.keys(answers).length}/{items.length}, skor {scoreQuiz()}
        </Text>
      ) : null}
      {!loading && activeFeature && !error && !items.length && !localTools.includes(activeFeature.type) ? (
        <Text style={styles.empty}>
          {activeFeature.type === 'bookmarks'
            ? 'Belum ada bookmark tersimpan. Buka suatu hadis atau ayat lalu simpan.'
            : activeFeature.type === 'notes'
              ? 'Belum ada catatan. Buka detail konten untuk menambahkan catatan.'
              : 'Belum ada data untuk fitur ini.'}
        </Text>
      ) : null}
      {!loading && activeFeature?.type === 'surah-content' && selectedSurahNumber && !error && !items.length ? (
        <Text style={styles.empty}>Belum ada data untuk surah ini.</Text>
      ) : null}
      {items.map(renderItem)}

      {hasMoreItems ? (
        <Pressable
          android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
          disabled={pagination.loadingMore}
          onPress={loadMoreFeature}
          style={styles.loadMoreButton}
        >
          <Text style={styles.loadMoreText}>
            {pagination.loadingMore ? 'Memuat data berikutnya...' : 'Muat lebih banyak'}
          </Text>
        </Pressable>
      ) : null}

      {renderDetailModal()}
      {renderItemActionSheet()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  belajarSection: {
    marginBottom: spacing.lg,
  },
  belajarCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pinButton: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexShrink: 0,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  pinButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  backToExplore: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 42,
  },
  backToExploreText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    marginBottom: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  currencyField: {
    marginTop: spacing.md,
  },
  currencyInputShell: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  currencyPrefix: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    marginRight: spacing.sm,
  },
  currencyInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    paddingVertical: spacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemTitleBlock: {
    marginBottom: spacing.sm,
    minWidth: 0,
    paddingRight: 44,
  },
  itemTitle: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  itemMeta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
    marginTop: 3,
  },
  itemActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  detailPanel: {
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  detailTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  detailLine: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.38)',
    flex: 1,
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
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
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalHeaderCopy: {
    flex: 1,
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
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalBottomPad: {
    height: spacing.xl * 2,
  },
  arabic: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 34,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  answerButton: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 40,
    minWidth: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  answerButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  answerText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  answerTextActive: {
    color: '#ffffff',
  },
  surahSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  surahChip: {
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  surahChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  surahChipText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  surahChipTextActive: {
    color: '#ffffff',
  },
  counter: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    justifyContent: 'center',
    minHeight: 180,
  },
  counterNumber: {
    color: colors.primaryDark,
    fontSize: 64,
    fontWeight: '900',
  },
  counterLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  result: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  resultPanel: {
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  resultLabel: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  resultLabelStrong: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  resultValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  resultValueStrong: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'right',
  },
  resultDivider: {
    backgroundColor: colors.faint,
    height: 1,
    marginBottom: spacing.sm,
  },
  statusNote: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  statusNoteActive: {
    color: colors.primary,
  },
  statusNoteWarning: {
    color: colors.accent,
  },
  trackerList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  trackerRow: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  trackerLabel: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  trackerLabelDone: {
    color: colors.primary,
    fontWeight: '800',
  },
  loader: {
    marginVertical: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  empty: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  loadMoreButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  loadMoreButtonDisabled: {
    borderColor: colors.faint,
    opacity: 0.75,
  },
  loadMoreText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  actionSheetRow: {
    alignItems: 'center',
    borderRadius: radius.md,
    flexDirection: 'row',
    padding: spacing.md,
  },
  actionSheetRowActive: {
    backgroundColor: colors.primary,
  },
  actionSheetIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
  actionSheetCopy: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionSheetTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  actionSheetTitleActive: {
    color: colors.onPrimary,
  },
  actionSheetSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  actionSheetSubtitleActive: {
    color: colors.onPrimary,
    opacity: 0.8,
  },
  itemHeaderActions: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
  itemMenuButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
