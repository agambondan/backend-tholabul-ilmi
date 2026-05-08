import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, CheckCircle2, Circle, ExternalLink, Globe, Heart, HelpCircle, ListChecks, MessageCircle, MoreVertical, Pencil, Scale, Star, StickyNote, Trash2, UserCircle, Users, Video, X } from 'lucide-react-native';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  getAllNotes,
  getBookmarkItems,
  getFeatureItems,
  getHijriOverview,
  getQuizQuestions,
  searchDictionary,
} from '../api/explore';
import { createComment, getCommentsByRef, getFeedPosts, likeFeedPost } from '../api/social';
import { Card, CardTitle } from '../components/Card';
import { NotesPanel } from '../components/NotesPanel';
import { NotificationCenter } from '../components/NotificationCenter';
import { ActionPill, CompactRow, IconActionButton, PaperSearchInput, SectionHeader } from '../components/Paper';
import { Screen } from '../components/Screen';
import { useFeedback } from '../context/FeedbackContext';
import { useSession } from '../context/SessionContext';
import { allFeatures, belajarFeatureGroups } from '../data/mobileFeatures';
import { readPinnedFeatures, readRecentFeatures, rememberFeatureOpen, togglePinnedFeature } from '../storage/recentFeatures';
import { colors, radius, spacing } from '../theme';
import { addBookmark, createUserWird, deleteBookmark, deleteUserWird, getBookmarks, getTodayPrayerLog, getUserWirds, savePrayerLog, updateUserWird } from '../api/personal';
import { getAyahById, getSurahs } from '../api/client';
import { hapticMedium, hapticTap } from '../utils/haptics';

const quizOptions = ['A', 'B', 'C', 'D'];

const localTools = ['tasbih', 'zakat', 'faraidh', 'notifications', 'surah-content', 'sholat-tracker'];
const EXPLORE_PAGE_SIZE = 20;

const belajarFeatureIcons = {
  'asbabun-nuzul': BookOpen,
  'asmaul-husna': Star,
  blog: BookOpen,
  bookmarks: Bookmark,
  'community-feed': MessageCircle,
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
  'user-wird': ListChecks,
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

const emptyUserWirdForm = {
  arabic: '',
  count: '1',
  note: '',
  occasion: '',
  source: '',
  title: '',
  translation: '',
  transliteration: '',
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

const getItemRef = (feature, item) => {
  if (feature?.type === 'feed') {
    return {
      refId: String(item?.raw?.ref_id ?? item?.id ?? ''),
      refType: item?.raw?.ref_type ?? 'feed',
    };
  }
  return {
    refType: feature?.refType ?? feature?.key ?? 'explore',
    refId: String(item?.id ?? item?.raw?.id ?? item?.raw?.slug ?? item?.title),
  };
};
const getExploreItemKey = (item) => String(item?.id ?? item?.raw?.id ?? item?.raw?.slug ?? item?.title ?? item?.body);
const isPaginatedFeature = (feature) => feature?.type === 'feed' || (Boolean(feature?.endpoint) && ['list', 'protected-list'].includes(feature.type));
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

const normalizeUserWirdItem = (item, index = 0) => ({
  id: item?.id ?? `user-wird-${index}`,
  title: item?.title ?? `Wirid ${index + 1}`,
  arabic: item?.arabic ?? '',
  body: [item?.transliteration, item?.translation, item?.note].filter(Boolean).join('\n'),
  meta: [item?.occasion, item?.count ? `${item.count}x` : '', item?.source].filter(Boolean).join(' · '),
  raw: item,
});

export function ExploreScreen({ deepLinkTarget, isActive, navigation, onOpenTab }) {
  const { session } = useSession();
  const { showError, showInfo, showSuccess } = useFeedback();
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
  const [feedComments, setFeedComments] = useState([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);
  const [likingFeedId, setLikingFeedId] = useState('');
  const [editingUserWirdId, setEditingUserWirdId] = useState('');
  const [savingUserWird, setSavingUserWird] = useState(false);
  const [userWirdForm, setUserWirdForm] = useState(emptyUserWirdForm);
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
    hapticTap();
    try {
      const result = await togglePinnedFeature(feature);
      setPinnedFeatureKeys(
        result.items.reduce((acc, item) => {
          acc[item.key] = true;
          return acc;
        }, {}),
      );
      showSuccess(result.pinned ? `${feature.title} disematkan.` : `${feature.title} dilepas dari shortcut.`);
    } catch {
      setError('Shortcut belum bisa diperbarui.');
      showError('Shortcut belum bisa diperbarui.');
    }
  }, [showError, showSuccess]);

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
      setFeedComments([]);
      setCommentDraft('');
      setEditingUserWirdId('');
      setUserWirdForm(emptyUserWirdForm);
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

      if (['protected-list', 'bookmarks', 'notes', 'user-wird'].includes(feature.type) && !session?.token) {
        if (feature.type === 'user-wird') return;
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
        } else if (feature.type === 'feed') {
          nextItems = await getFeedPosts({ page: 0, size: EXPLORE_PAGE_SIZE });
          setPagination({
            page: 0,
            hasMore: nextItems.length >= EXPLORE_PAGE_SIZE,
            loadingMore: false,
          });
        } else if (feature.type === 'user-wird') {
          const wirds = await getUserWirds();
          nextItems = wirds.map(normalizeUserWirdItem);
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
      const nextItems =
        activeFeature.type === 'feed'
          ? await getFeedPosts({ page: nextPage, size: EXPLORE_PAGE_SIZE })
          : await getFeatureItems(activeFeature, { page: nextPage, size: EXPLORE_PAGE_SIZE });
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
      showInfo('Buka Profil untuk masuk dan menyimpan bookmark.');
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
        showSuccess('Bookmark dihapus.');
      } else {
        const created = await addBookmark(ref);
        setBookmarks((current) => ({ ...current, [key]: created?.data ?? created }));
        showSuccess('Item disimpan ke bookmark.');
      }
    } catch (err) {
      const nextMessage = err?.message ?? 'Bookmark belum bisa diperbarui.';
      setError(nextMessage);
      showError(nextMessage);
    } finally {
      setSavingBookmark('');
    }
  };

  const handleLikeFeedItem = async (item) => {
    if (!session?.token) {
      setError('Buka Profil untuk masuk dan menyukai post komunitas.');
      showInfo('Buka Profil untuk masuk dan menyukai post komunitas.');
      return;
    }

    setLikingFeedId(item.id);
    setError('');

    try {
      const updated = await likeFeedPost(item.raw?.id ?? item.id);
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      if (selectedItem?.id === item.id) {
        setSelectedItem(updated);
      }
      showSuccess('Post komunitas diperbarui.');
    } catch (err) {
      const nextMessage = err?.message ?? 'Post belum bisa disukai.';
      setError(nextMessage);
      showError(nextMessage);
    } finally {
      setLikingFeedId('');
    }
  };

  const loadFeedComments = useCallback(async (item) => {
    const ref = getItemRef({ type: 'feed' }, item);
    if (!ref.refType || !ref.refId) return;

    setCommentLoading(true);
    try {
      setFeedComments(await getCommentsByRef(ref));
    } catch {
      setFeedComments([]);
    } finally {
      setCommentLoading(false);
    }
  }, []);

  const submitFeedComment = async () => {
    const content = commentDraft.trim();
    if (!selectedItem || !content) return;
    if (!session?.token) {
      setError('Buka Profil untuk masuk dan menulis komentar.');
      showInfo('Buka Profil untuk masuk dan menulis komentar.');
      return;
    }

    const ref = getItemRef({ type: 'feed' }, selectedItem);
    setCommentSaving(true);
    setError('');

    try {
      const created = await createComment({ content, refId: ref.refId, refType: ref.refType });
      setFeedComments((current) => [...current, created]);
      setCommentDraft('');
      showSuccess('Komentar terkirim.');
    } catch (err) {
      const nextMessage = err?.message ?? 'Komentar belum bisa dikirim.';
      setError(nextMessage);
      showError(nextMessage);
    } finally {
      setCommentSaving(false);
    }
  };

  const resetUserWirdForm = () => {
    setEditingUserWirdId('');
    setUserWirdForm(emptyUserWirdForm);
  };

  const fillUserWirdForm = (item) => {
    const raw = item?.raw ?? {};
    setEditingUserWirdId(raw.id ?? item.id);
    setUserWirdForm({
      arabic: raw.arabic ?? '',
      count: `${raw.count ?? 1}`,
      note: raw.note ?? '',
      occasion: raw.occasion ?? '',
      source: raw.source ?? '',
      title: raw.title ?? item.title ?? '',
      translation: raw.translation ?? '',
      transliteration: raw.transliteration ?? '',
    });
  };

  const submitUserWird = async () => {
    const title = userWirdForm.title.trim();
    if (!title) {
      setError('Judul wirid wajib diisi.');
      showInfo('Judul wirid wajib diisi.');
      return;
    }
    if (!session?.token) {
      setError('Buka Profil untuk masuk dan menyimpan wirid.');
      showInfo('Buka Profil untuk masuk dan menyimpan wirid.');
      return;
    }

    const payload = {
      arabic: userWirdForm.arabic.trim(),
      count: Number(digitsOnly(userWirdForm.count)) || 1,
      note: userWirdForm.note.trim(),
      occasion: userWirdForm.occasion.trim(),
      source: userWirdForm.source.trim(),
      title,
      translation: userWirdForm.translation.trim(),
      transliteration: userWirdForm.transliteration.trim(),
    };

    setSavingUserWird(true);
    setError('');

    try {
      if (editingUserWirdId) {
        const updated = await updateUserWird(editingUserWirdId, payload);
        const normalized = normalizeUserWirdItem(updated?.data ?? updated);
        setItems((current) => current.map((item) => (item.id === normalized.id ? normalized : item)));
        showSuccess('Wirid diperbarui.');
      } else {
        const created = await createUserWird(payload);
        setItems((current) => [normalizeUserWirdItem(created?.data ?? created), ...current]);
        showSuccess('Wirid disimpan.');
      }
      resetUserWirdForm();
    } catch (err) {
      const nextMessage = err?.message ?? 'Wirid belum bisa disimpan.';
      setError(nextMessage);
      showError(nextMessage);
    } finally {
      setSavingUserWird(false);
    }
  };

  const removeUserWird = async (item) => {
    const id = item?.raw?.id ?? item?.id;
    if (!id) return;
    if (!session?.token) {
      setError('Buka Profil untuk masuk dan menghapus wirid.');
      showInfo('Buka Profil untuk masuk dan menghapus wirid.');
      return;
    }

    setError('');
    try {
      await deleteUserWird(id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingUserWirdId === id) resetUserWirdForm();
      showSuccess('Wirid dihapus.');
    } catch (err) {
      const nextMessage = err?.message ?? 'Wirid belum bisa dihapus.';
      setError(nextMessage);
      showError(nextMessage);
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
      showSuccess(`${prayerKey} ${nowDone ? 'ditandai selesai' : 'ditandai belum selesai'}.`);
    } catch {
      setSholatLog((current) => ({ ...current, [prayerKey]: !nowDone }));
      showError('Log sholat belum bisa disimpan.');
    }
  },
    [sholatLog, showError, showSuccess],
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
    if (activeFeature?.type !== 'feed' || !selectedItem) {
      setFeedComments([]);
      setCommentDraft('');
      return;
    }

    loadFeedComments(selectedItem);
  }, [activeFeature?.type, loadFeedComments, selectedItem]);

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

  const renderUserWirdField = ({ field, label, multiline = false, placeholder }) => (
    <View style={styles.wirdField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={(value) => setUserWirdForm((current) => ({ ...current, [field]: value }))}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, multiline && styles.textArea, field === 'arabic' && styles.arabicInput]}
        value={userWirdForm[field]}
      />
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

  const renderItem = (item, index) => {
    if (activeFeature?.type === 'user-wird') {
      return (
        <Card key={`${item.id}-${index}`} style={styles.itemCard}>
          <View style={styles.itemTitleBlock}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.meta ? <Text style={styles.itemMeta}>{item.meta}</Text> : null}
          </View>
          {item.arabic ? <Text style={styles.arabic}>{item.arabic}</Text> : null}
          {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
          <View style={styles.itemActions}>
            <ActionPill Icon={Pencil} label="Edit" onPress={() => fillUserWirdForm(item)} />
            <ActionPill Icon={Trash2} label="Hapus" onPress={() => removeUserWird(item)} />
          </View>
        </Card>
      );
    }

    if (activeFeature?.type === 'feed') {
      const ref = getItemRef({ type: 'feed' }, item);
      const isLiking = likingFeedId === item.id;

      return (
        <Card key={`${item.id}-${index}`} style={styles.itemCard}>
          <View style={styles.feedHeader}>
            <View style={styles.feedAvatar}>
              <Text style={styles.feedAvatarText}>{item.title?.[0]?.toUpperCase() ?? 'U'}</Text>
            </View>
            <View style={styles.feedTitleBlock}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemMeta}>{item.meta}</Text>
            </View>
          </View>
          <Text style={styles.body}>{item.body}</Text>
          <View style={styles.feedRefPanel}>
            <Text style={styles.feedRefLabel}>{ref.refType === 'ayah' ? 'Ayat Quran' : 'Hadis'}</Text>
            <Text style={styles.feedRefText}>{ref.refType} #{ref.refId}</Text>
          </View>
          <View style={styles.itemActions}>
            <ActionPill
              Icon={Heart}
              label={isLiking ? 'Menyukai...' : 'Suka'}
              disabled={isLiking}
              onPress={() => handleLikeFeedItem(item)}
            />
            <ActionPill
              Icon={MessageCircle}
              label="Komentar"
              onPress={() => {
                setSelectedItem(item);
                setActiveNoteRef('');
              }}
            />
            <ActionPill
              Icon={ExternalLink}
              label="Sumber"
              onPress={() => openSource(item)}
            />
          </View>
        </Card>
      );
    }

    return (
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
  };

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
    setFeedComments([]);
    setCommentDraft('');
  };

  const renderFeedCommentsPanel = () => {
    if (activeFeature?.type !== 'feed' || !selectedItem) return null;

    return (
      <View style={styles.commentsPanel}>
        <View style={styles.commentsHeader}>
          <Text style={styles.detailTitle}>Komentar</Text>
          {commentLoading ? <ActivityIndicator color={colors.primary} size="small" /> : null}
        </View>
        {!commentLoading && !feedComments.length ? (
          <Text style={styles.empty}>Belum ada komentar untuk rujukan ini.</Text>
        ) : null}
        {feedComments.map((comment) => (
          <View key={comment.id} style={styles.commentRow}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>{comment.author?.[0]?.toUpperCase() ?? 'U'}</Text>
            </View>
            <View style={styles.commentCopy}>
              <Text style={styles.commentAuthor}>{comment.author}</Text>
              <Text style={styles.commentText}>{comment.content}</Text>
            </View>
          </View>
        ))}
        <View style={styles.commentForm}>
          <TextInput
            multiline
            onChangeText={setCommentDraft}
            placeholder={session?.token ? 'Tulis komentar...' : 'Masuk untuk menulis komentar'}
            placeholderTextColor={colors.muted}
            style={styles.commentInput}
            value={commentDraft}
          />
          <Pressable
            accessibilityLabel="Kirim komentar"
            accessibilityRole="button"
            android_ripple={{ color: 'rgba(255,255,255,0.16)', borderless: false }}
            disabled={!commentDraft.trim() || commentSaving}
            onPress={submitFeedComment}
            style={[styles.commentSubmit, (!commentDraft.trim() || commentSaving) && styles.commentSubmitDisabled]}
          >
            <Text style={styles.commentSubmitText}>{commentSaving ? 'Mengirim...' : 'Kirim'}</Text>
          </Pressable>
        </View>
      </View>
    );
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
            {renderFeedCommentsPanel()}
            <View style={styles.modalActions}>
              {activeFeature?.type !== 'feed' ? (
                <ActionPill
                  Icon={StickyNote}
                  label="Catatan"
                  onPress={() => setActiveNoteRef(activeNoteRef === noteKey ? '' : noteKey)}
                  active={activeNoteRef === noteKey}
                />
              ) : null}
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

    if (activeFeature.type === 'user-wird') {
      if (!session?.token) {
        return (
          <Card>
            <CardTitle meta="Akun">Wirid Saya</CardTitle>
            <Text style={styles.body}>Masuk melalui Profil untuk membuat dan mengelola wirid pribadi.</Text>
            <Pressable
              accessibilityLabel="Buka Profil untuk masuk"
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(255,255,255,0.16)', borderless: false }}
              onPress={() => onOpenTab?.('profile')}
              style={[styles.primaryButton, styles.loginButton]}
            >
              <Text style={styles.primaryButtonText}>Buka Profil</Text>
            </Pressable>
          </Card>
        );
      }

      return (
        <Card>
          <CardTitle meta={editingUserWirdId ? 'Edit' : 'Baru'}>{activeFeature.title}</CardTitle>
          <Text style={styles.body}>Buat koleksi wirid pribadi dengan target jumlah bacaan.</Text>
          {renderUserWirdField({ field: 'title', label: 'Judul', placeholder: 'Contoh: Wirid pagi pribadi' })}
          {renderUserWirdField({ field: 'arabic', label: 'Teks Arab', multiline: true, placeholder: 'اكتب الذكر هنا' })}
          {renderUserWirdField({ field: 'transliteration', label: 'Transliterasi', multiline: true, placeholder: 'Tuliskan transliterasi jika ada' })}
          {renderUserWirdField({ field: 'translation', label: 'Terjemahan', multiline: true, placeholder: 'Makna bacaan' })}
          <View style={styles.wirdGrid}>
            <View style={styles.wirdGridItem}>
              <Text style={styles.inputLabel}>Jumlah</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={(value) => setUserWirdForm((current) => ({ ...current, count: digitsOnly(value) }))}
                placeholder="1"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={userWirdForm.count}
              />
            </View>
            <View style={styles.wirdGridItem}>
              {renderUserWirdField({ field: 'occasion', label: 'Waktu', placeholder: 'Pagi, petang...' })}
            </View>
          </View>
          {renderUserWirdField({ field: 'source', label: 'Sumber', placeholder: 'Kitab/ustadz/rujukan' })}
          {renderUserWirdField({ field: 'note', label: 'Catatan', multiline: true, placeholder: 'Catatan pribadi' })}
          <View style={styles.formActions}>
            <Pressable
              accessibilityLabel={editingUserWirdId ? 'Simpan perubahan wirid' : 'Tambah wirid'}
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(255,255,255,0.16)', borderless: false }}
              disabled={savingUserWird}
              onPress={submitUserWird}
              style={[styles.primaryButton, styles.formPrimaryButton, savingUserWird && styles.disabledButton]}
            >
              <Text style={styles.primaryButtonText}>{savingUserWird ? 'Menyimpan...' : editingUserWirdId ? 'Simpan' : 'Tambah'}</Text>
            </Pressable>
            {editingUserWirdId ? (
              <Pressable
                accessibilityLabel="Batal edit wirid"
                accessibilityRole="button"
                android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                onPress={resetUserWirdForm}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Batal</Text>
              </Pressable>
            ) : null}
          </View>
        </Card>
      );
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
                hapticTap();
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
      {!loading && activeFeature && !error && !items.length && !localTools.includes(activeFeature.type) && !(activeFeature.type === 'user-wird' && !session?.token) ? (
        <Text style={styles.empty}>
          {activeFeature.type === 'bookmarks'
            ? 'Belum ada bookmark tersimpan. Buka suatu hadis atau ayat lalu simpan.'
            : activeFeature.type === 'notes'
              ? 'Belum ada catatan. Buka detail konten untuk menambahkan catatan.'
              : activeFeature.type === 'feed'
                ? 'Belum ada post komunitas dari server.'
                : activeFeature.type === 'user-wird'
                  ? 'Belum ada wirid pribadi. Tambahkan bacaan pertamamu dari form di atas.'
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
  textArea: {
    minHeight: 86,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  arabicInput: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'right',
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  wirdField: {
    flex: 1,
  },
  wirdGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  wirdGridItem: {
    flex: 1,
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
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  formPrimaryButton: {
    flex: 1,
    minHeight: 42,
  },
  loginButton: {
    marginTop: spacing.md,
    minHeight: 42,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.6,
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
  feedHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  feedAvatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  feedAvatarText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  feedTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  feedRefPanel: {
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  feedRefLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 2,
  },
  feedRefText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
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
  commentsPanel: {
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  commentsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  commentAvatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  commentAvatarText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  commentCopy: {
    flex: 1,
    minWidth: 0,
  },
  commentAuthor: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  commentText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  commentForm: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  commentInput: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 13,
    minHeight: 70,
    padding: spacing.sm,
    textAlignVertical: 'top',
  },
  commentSubmit: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    minHeight: 38,
  },
  commentSubmitDisabled: {
    opacity: 0.55,
  },
  commentSubmitText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '900',
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
