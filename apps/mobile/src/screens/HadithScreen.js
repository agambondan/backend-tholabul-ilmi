import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck, MoreVertical, X } from 'lucide-react-native';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getHadithBooks,
  getHadithDetail,
  getHadithPage,
  getRelatedHadiths,
  getHadithSanad,
  getHadithTakhrij,
  normalizeHadith,
  getPerawiDetail,
  getPerawiGuru,
  getPerawiJarhTadil,
  getPerawiMurid,
} from '../api/client';
import { addBookmark, deleteBookmark, getBookmarks, getNotesByType } from '../api/personal';
import { Card, CardTitle } from '../components/Card';
import { NotesPanel } from '../components/NotesPanel';
import { ActionPill, IconActionButton, PaperSearchInput } from '../components/Paper';
import { Screen } from '../components/Screen';
import { useFeedback } from '../context/FeedbackContext';
import { useSession } from '../context/SessionContext';
import { getOfflineItems, getOfflineOverview } from '../storage/offlineContent';
import { colors, radius, spacing } from '../theme';
import { hapticError, hapticSuccess } from '../utils/haptics';

const HADITH_LIST_PAGE_SIZE = 20;

const HADITH_DETAIL_TABS = [
  { key: 'text', label: 'Teks' },
  { key: 'sanad', label: 'Sanad' },
  { key: 'narrators', label: 'Perawi' },
  { key: 'takhrij', label: 'Takhrij' },
  { key: 'notes', label: 'Catatan' },
];

const normalizeSearchText = (value) => String(value ?? '').trim().toLowerCase();

export function HadithScreen({ deepLinkTarget, isActive, navigation }) {
  const { user } = useSession();
  const { showError, showInfo, showSuccess } = useFeedback();
  const handledDeepLinkId = useRef(null);
  const loadingMoreRef = useRef(false);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [hadiths, setHadiths] = useState([]);
  const [selectedHadith, setSelectedHadith] = useState(null);
  const [sanad, setSanad] = useState([]);
  const [takhrij, setTakhrij] = useState([]);
  const [relatedHadiths, setRelatedHadiths] = useState([]);
  const [selectedPerawi, setSelectedPerawi] = useState(null);
  const [perawiPanel, setPerawiPanel] = useState({ guru: [], jarhTadil: [], loading: false, murid: [] });
  const [expandedPerawiList, setExpandedPerawiList] = useState({ guru: false, murid: false });
  const [bookmarks, setBookmarks] = useState({});
  const [bookmarkItems, setBookmarkItems] = useState([]);
  const [noteCounts, setNoteCounts] = useState({});
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(HADITH_LIST_PAGE_SIZE);
  const [hadithSource, setHadithSource] = useState('backend');
  const [remotePage, setRemotePage] = useState(0);
  const [hasMoreRemote, setHasMoreRemote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('text');
  const [hadithActionSheet, setHadithActionSheet] = useState({ visible: false, hadith: null });
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadOfflineHadiths = useCallback(async (bookSlug = null) => {
    const overview = await getOfflineOverview();
    if (!overview.supported || !overview.hadiths) return null;

    const items = (await getOfflineItems('hadith'))
      .map(normalizeHadith)
      .filter((item) => item.id)
      .filter((item) => !bookSlug || item.bookSlug === bookSlug)
      .sort((a, b) => {
        if (a.bookSlug !== b.bookSlug) return String(a.bookSlug).localeCompare(String(b.bookSlug));
        return Number(a.number ?? a.id ?? 0) - Number(b.number ?? b.id ?? 0);
      });

    return items.length ? items : null;
  }, []);

  const load = useCallback(async ({ append = false, bookSlug = null, page = 0, preferOffline = true } = {}) => {
    if (append) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      loadingMoreRef.current = false;
      setLoading(true);
      setVisibleCount(HADITH_LIST_PAGE_SIZE);
      setMessage('');
    }

    try {
      if (preferOffline && !append) {
        const offlineItems = await loadOfflineHadiths(bookSlug);
        if (offlineItems) {
          setHadiths(offlineItems);
          setHadithSource('offline');
          setRemotePage(0);
          setHasMoreRemote(false);
          return;
        }
      }

      const result = await getHadithPage({ bookSlug, page, size: HADITH_LIST_PAGE_SIZE });
      setHadithSource('backend');
      setRemotePage(result.page);
      setHasMoreRemote(result.hasMore);
      setHadiths((current) => (append ? [...current, ...result.items] : result.items));
      setVisibleCount((current) => (append ? current + result.items.length : HADITH_LIST_PAGE_SIZE));
    } catch (error) {
      if (!append) {
        setHadiths([]);
        setHasMoreRemote(false);
      }
      setMessage(error?.message ?? 'Daftar hadis belum bisa dimuat.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      if (append) {
        loadingMoreRef.current = false;
      }
    }
  }, [loadOfflineHadiths]);

  const loadBooks = useCallback(async () => {
    try {
      const items = await getHadithBooks();
      setBooks(items);
    } catch {
      const overview = await getOfflineOverview();
      setBooks(Array.isArray(overview.hadithBooks) ? overview.hadithBooks : []);
    }
  }, []);

  const loadBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks({});
      setBookmarkItems([]);
      return;
    }

    try {
      const items = await getBookmarks();
      const mapped = items.reduce((acc, item) => {
        if (item.ref_type === 'hadith') {
          acc[item.ref_id] = item;
        }
        return acc;
      }, {});
      setBookmarks(mapped);
      setBookmarkItems(items.filter((item) => item.ref_type === 'hadith'));
    } catch {
      setBookmarks({});
      setBookmarkItems([]);
    }
  }, [user]);

  const loadNoteCounts = useCallback(async () => {
    if (!user) {
      setNoteCounts({});
      return;
    }

    try {
      const notes = await getNotesByType('hadith');
      const mapped = notes.reduce((acc, item) => {
        acc[item.ref_id] = (acc[item.ref_id] ?? 0) + 1;
        return acc;
      }, {});
      setNoteCounts(mapped);
    } catch {
      setNoteCounts({});
    }
  }, [user]);

  const refreshAll = useCallback(async () => {
    await load({ bookSlug: selectedBook, page: 0, preferOffline: true });
    await loadBooks();
    await loadBookmarks();
    await loadNoteCounts();
  }, [load, loadBooks, loadBookmarks, loadNoteCounts, selectedBook]);

  const selectBook = useCallback(
    (slug) => {
      const next = slug === selectedBook ? null : slug;
      setSelectedBook(next);
      setSelectedHadith(null);
    },
    [selectedBook],
  );

  const openHadith = async (hadith) => {
    setSelectedHadith(hadith);
    setDetailLoading(true);
    setMessage('');
    setSelectedPerawi(null);
    setPerawiPanel({ guru: [], jarhTadil: [], loading: false, murid: [] });
    setExpandedPerawiList({ guru: false, murid: false });
    setRelatedHadiths([]);
    setDetailTab('text');

    try {
      const [detail, sanadItems, takhrijItems] = await Promise.all([
        getHadithDetail(hadith.id).catch(() => hadith),
        getHadithSanad(hadith.id),
        getHadithTakhrij(hadith.id),
      ]);
      const nextHadith = { ...hadith, ...detail };
      setSelectedHadith(nextHadith);
      setSanad(sanadItems);
      setTakhrij(takhrijItems);
      setRelatedHadiths(await getRelatedHadiths(nextHadith));
      await loadBookmarks();
      await loadNoteCounts();
    } catch (err) {
      setMessage(err?.message ?? 'Detail hadis belum bisa dimuat.');
      setSanad([]);
      setTakhrij([]);
      setRelatedHadiths([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleBookmark = async (hadith) => {
    if (!user || !hadith.id) {
      showInfo('Masuk dari Profil untuk menyimpan bookmark.');
      return;
    }

    setSavingId(hadith.id);
    setMessage('');

    try {
      const existing = bookmarks[hadith.id];
      if (existing?.id) {
        await deleteBookmark(existing.id);
        const next = { ...bookmarks };
        delete next[hadith.id];
        setBookmarks(next);
        setMessage('Bookmark dihapus.');
        showSuccess('Bookmark dihapus.');
        await loadBookmarks();
      } else {
        const bookmark = await addBookmark({ refType: 'hadith', refId: hadith.id });
        setBookmarks({ ...bookmarks, [hadith.id]: bookmark });
        setMessage('Hadis disimpan ke bookmark.');
        showSuccess('Hadis disimpan ke bookmark.');
        await loadBookmarks();
      }
      hapticSuccess();
    } catch (err) {
      hapticError();
      const nextMessage = err?.message ?? 'Bookmark belum bisa diperbarui.';
      setMessage(nextMessage);
      showError(nextMessage);
    } finally {
      setSavingId(null);
    }
  };

  const openPerawi = async (perawi) => {
    if (!perawi?.id) return;

    setSelectedPerawi(perawi);
    setDetailTab('narrators');
    setPerawiPanel({ guru: [], jarhTadil: [], loading: true, murid: [] });
    setExpandedPerawiList({ guru: false, murid: false });

    try {
      const [detail, jarhTadil, guru, murid] = await Promise.all([
        getPerawiDetail(perawi.id),
        getPerawiJarhTadil(perawi.id),
        getPerawiGuru(perawi.id),
        getPerawiMurid(perawi.id),
      ]);
      setSelectedPerawi({ ...perawi, ...(detail ?? {}) });
      setPerawiPanel({ guru, jarhTadil, loading: false, murid });
    } catch (err) {
      setMessage(err?.message ?? 'Detail perawi belum bisa dimuat.');
      setPerawiPanel({ guru: [], jarhTadil: [], loading: false, murid: [] });
    }
  };

  const renderPerawiList = (items, listKey) => {
    if (!items.length) return <Text style={styles.emptyText}>Perawi terkait belum tersedia.</Text>;

    const expanded = !!expandedPerawiList[listKey];
    const visible = expanded ? items : items.slice(0, 6);
    const hiddenCount = Math.max(0, items.length - visible.length);

    return (
      <>
        {visible.map((item) => (
          <Pressable key={item.id} onPress={() => openPerawi(item)} style={styles.perawiChip}>
            <Text style={styles.perawiChipText}>{item.nama_latin || item.nama_lengkap || `Perawi ${item.id}`}</Text>
          </Pressable>
        ))}
        {items.length > 6 ? (
          <Pressable
            android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
            onPress={() =>
              setExpandedPerawiList((current) => ({
                ...current,
                [listKey]: !current[listKey],
              }))
            }
            style={styles.moreChip}
          >
            <Text style={styles.moreChipText}>{expanded ? 'Ringkas' : `Tampilkan semua (${hiddenCount} lagi)`}</Text>
          </Pressable>
        ) : null}
      </>
    );
  };

  const savedHadiths = bookmarkItems
    .map((item) => item.hadith ?? item.Hadith)
    .filter(Boolean)
    .map(normalizeHadith)
    .slice(0, 5);

  const selectedBookName = books.find((book) => book.slug === selectedBook)?.name ?? 'Semua kitab';
  const sourceLabel = hadithSource === 'offline' ? 'Perangkat' : 'Backend';

  const filteredHadiths = useMemo(() => {
    const term = normalizeSearchText(query);
    if (!term) return hadiths;

    return hadiths.filter((hadith) => {
      const fields = [
        hadith.title,
        hadith.translation,
        hadith.arabic,
        hadith.book,
        hadith.bookSlug,
        hadith.grade,
        hadith.themeName,
        hadith.chapterName,
        hadith.number,
      ];

      return fields.some((field) => normalizeSearchText(field).includes(term));
    });
  }, [hadiths, query]);

  const visibleHadiths = filteredHadiths.slice(0, visibleCount);
  const hasBufferedHadiths = visibleCount < filteredHadiths.length;
  const hasMoreHadiths = hasBufferedHadiths || (hadithSource === 'backend' && hasMoreRemote);

  const loadMoreHadiths = useCallback(() => {
    if (loading || loadingMore || loadingMoreRef.current || detailLoading) return;

    if (hasBufferedHadiths) {
      setVisibleCount((current) => current + HADITH_LIST_PAGE_SIZE);
      return;
    }

    if (hadithSource === 'backend' && hasMoreRemote) {
      load({
        append: true,
        bookSlug: selectedBook,
        page: remotePage + 1,
        preferOffline: false,
      });
    }
  }, [
    detailLoading,
    hadithSource,
    hasBufferedHadiths,
    hasMoreRemote,
    load,
    loading,
    loadingMore,
    remotePage,
    selectedBook,
  ]);

  const renderCompactHadithCard = (hadith, meta = '') => (
    <View key={`${meta}-${hadith.id}`} style={styles.compactHadithWrapper}>
      <Pressable onPress={() => openHadith(hadith)} style={styles.compactHadith}>
        <View style={styles.detailHeader}>
          <Text style={styles.compactTitle}>{hadith.title}</Text>
          <Text style={styles.detailMeta}>{hadith.grade || hadith.book}</Text>
        </View>
        <Text numberOfLines={3} style={styles.compactTranslation}>
          {hadith.translation || hadith.book}
        </Text>
        {noteCounts[hadith.id] ? <Text style={styles.compactMeta}>{noteCounts[hadith.id]} note</Text> : null}
      </Pressable>
      <View style={styles.itemHeaderActions}>
        <Pressable
          accessibilityLabel="Aksi hadis"
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: true }}
          onPress={() => setHadithActionSheet({ visible: true, hadith })}
          style={styles.itemMenuButton}
        >
          <MoreVertical color={colors.primary} size={18} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );

  const sanadPerawi = sanad
    .flatMap((path) => path.mata_sanad ?? [])
    .map((mata) => mata.perawi)
    .filter((perawi, index, all) => perawi?.id && all.findIndex((item) => item?.id === perawi.id) === index);

  const renderDetailTabs = () => (
    <View style={styles.detailTabs}>
      {HADITH_DETAIL_TABS.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => setDetailTab(tab.key)}
          style={[styles.detailTabButton, detailTab === tab.key ? styles.detailTabButtonActive : null]}
        >
          <Text style={[styles.detailTabText, detailTab === tab.key ? styles.detailTabTextActive : null]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    setVisibleCount(HADITH_LIST_PAGE_SIZE);
  }, [query, selectedBook]);

  useEffect(() => {
    const hadithId = deepLinkTarget?.params?.hadithId;
    if (handledDeepLinkId.current === deepLinkTarget?.id) return;
    if (!hadithId) return;

    handledDeepLinkId.current = deepLinkTarget.id;
    const fromList = hadiths.find((item) => String(item.id) === String(hadithId));
    openHadith(fromList ?? { id: hadithId, title: `Hadis ${hadithId}` });
  }, [deepLinkTarget?.id, hadiths]);

  useEffect(() => {
    if (!isActive) return;
    if (selectedHadith) {
      navigation?.setBack(() => {
        if (selectedPerawi) { setSelectedPerawi(null); return true; }
        setSelectedHadith(null);
        return true;
      });
    } else {
      navigation?.clearBack?.();
    }
  }, [isActive, selectedHadith, selectedPerawi, navigation]);

  const renderHadithActionSheet = () => {
    const { visible, hadith } = hadithActionSheet;
    if (!hadith) return null;

    const isBookmarked = Boolean(bookmarks[hadith.id]);

    return (
      <Modal
        animationType="slide"
        onRequestClose={() => setHadithActionSheet({ visible: false, hadith: null })}
        transparent
        visible={visible}
      >
        <Pressable
          onPress={() => setHadithActionSheet({ visible: false, hadith: null })}
          style={styles.modalOverlay}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderCopy}>
              <Text style={styles.modalTitle}>Aksi Hadis</Text>
              <Text style={styles.modalMeta} numberOfLines={1}>{hadith.title}</Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => setHadithActionSheet({ visible: false, hadith: null })}
              style={styles.modalClose}
            >
              <X color={colors.muted} size={18} strokeWidth={2.2} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
              onPress={() => {
                setHadithActionSheet({ visible: false, hadith: null });
                openHadith(hadith);
              }}
              style={styles.actionSheetRow}
            >
              <View style={styles.actionSheetIcon}>
                <BookOpen color={colors.primary} size={18} strokeWidth={2.3} />
              </View>
              <View style={styles.actionSheetCopy}>
                <Text style={styles.actionSheetTitle}>Detail</Text>
                <Text style={styles.actionSheetSubtitle}>Buka teks lengkap dan sanad</Text>
              </View>
            </Pressable>

            {user ? (
              <Pressable
                accessibilityRole="button"
                android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                disabled={savingId === hadith.id}
                onPress={() => {
                  setHadithActionSheet({ visible: false, hadith: null });
                  toggleBookmark(hadith);
                }}
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
                    {isBookmarked ? 'Hapus Bookmark' : 'Bookmark Hadis'}
                  </Text>
                  <Text style={[styles.actionSheetSubtitle, isBookmarked ? styles.actionSheetSubtitleActive : null]}>
                    {isBookmarked ? 'Hapus dari koleksi pribadi' : 'Simpan ke koleksi pribadi'}
                  </Text>
                </View>
              </Pressable>
            ) : null}
            <View style={styles.modalBottomPad} />
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (selectedHadith) {
    return (
      <Screen
        title="Detail Hadis"
        subtitle={`${selectedHadith.book || 'Hadis'}${selectedHadith.number ? ` · No. ${selectedHadith.number}` : ''}`}
        refreshing={detailLoading}
        onRefresh={() => openHadith(selectedHadith)}
        actions={<IconActionButton Icon={ArrowLeft} label="Kembali ke daftar hadis" onPress={() => setSelectedHadith(null)} />}
      >
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {renderDetailTabs()}

        {detailTab === 'text' ? (
          <>
            <Card>
              <CardTitle meta={selectedHadith.grade || selectedHadith.book}>{selectedHadith.title}</CardTitle>
              {selectedHadith.arabic ? <Text style={styles.arabic}>{selectedHadith.arabic}</Text> : null}
              <Text style={styles.translation}>{selectedHadith.translation || selectedHadith.book}</Text>
              {selectedHadith.gradeNotes ? <Text style={styles.detailNote}>{selectedHadith.gradeNotes}</Text> : null}
              {selectedHadith.sanad ? <Text style={styles.inlineSanad}>{selectedHadith.sanad}</Text> : null}
              {user ? (
                <ActionPill
                  disabled={savingId === selectedHadith.id}
                  Icon={bookmarks[selectedHadith.id] ? BookmarkCheck : Bookmark}
                  label={
                    savingId === selectedHadith.id
                      ? 'Menyimpan'
                      : bookmarks[selectedHadith.id]
                        ? 'Hapus bookmark'
                        : 'Bookmark hadis'
                  }
                  onPress={() => toggleBookmark(selectedHadith)}
                  active={Boolean(bookmarks[selectedHadith.id])}
                />
              ) : null}
            </Card>

            <Card>
              <CardTitle meta={`${relatedHadiths.length} item`}>Hadis Terkait</CardTitle>
              {detailLoading && relatedHadiths.length === 0 ? (
                <ActivityIndicator color={colors.primary} />
              ) : relatedHadiths.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada hadis terkait untuk tema ini.</Text>
              ) : (
                relatedHadiths.map((item) => renderCompactHadithCard(item, 'related'))
              )}
            </Card>
          </>
        ) : null}

        {detailTab === 'sanad' ? (
          <Card>
            <CardTitle meta={`${sanad.length} jalur`}>Sanad</CardTitle>
            {detailLoading && sanad.length === 0 ? (
              <ActivityIndicator color={colors.primary} />
            ) : sanad.length === 0 ? (
              <Text style={styles.emptyText}>Jalur sanad untuk hadis ini belum tersedia.</Text>
            ) : (
              sanad.map((path, index) => (
                <View key={`${path.id}-${index}`} style={styles.detailBlock}>
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>Jalur {path.nomor_jalur ?? index + 1}</Text>
                    <Text style={styles.detailMeta}>{path.status_sanad || path.jenis || 'sanad'}</Text>
                  </View>
                  {path.catatan ? <Text style={styles.detailNote}>{path.catatan}</Text> : null}
                  {(path.mata_sanad ?? []).map((mata, mataIndex) => (
                    <Pressable
                      key={`${mata.id}-${mataIndex}`}
                      onPress={() => openPerawi(mata.perawi)}
                      style={[styles.chainRow, selectedPerawi?.id === mata.perawi?.id ? styles.chainRowActive : null]}
                    >
                      <Text style={styles.chainIndex}>{mata.urutan ?? mataIndex + 1}</Text>
                      <View style={styles.chainBody}>
                        <Text style={styles.chainName}>
                          {mata.perawi?.nama_latin || mata.perawi?.nama_lengkap || `Perawi ${mata.perawi_id ?? ''}`}
                        </Text>
                        {mata.perawi?.nama_arab ? <Text style={styles.chainArabic}>{mata.perawi.nama_arab}</Text> : null}
                        <Text style={styles.chainMeta}>
                          {[mata.metode, mata.perawi?.status, mata.perawi?.tabaqah].filter(Boolean).join(' · ') ||
                            'Perawi'}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ))
            )}
            <Text style={styles.referenceMeta}>Ketuk perawi untuk membuka ringkasan biografi.</Text>
          </Card>
        ) : null}

        {detailTab === 'narrators' ? (
          <Card>
            <CardTitle meta={`${sanadPerawi.length} perawi`}>Perawi</CardTitle>
            {sanadPerawi.length ? (
              <View style={styles.chipWrap}>
                {sanadPerawi.map((perawi) => (
                  <Pressable key={perawi.id} onPress={() => openPerawi(perawi)} style={styles.perawiChip}>
                    <Text style={styles.perawiChipText}>
                      {perawi.nama_latin || perawi.nama_lengkap || `Perawi ${perawi.id}`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Data perawi untuk hadis ini belum tersedia.</Text>
            )}

            {selectedPerawi ? (
              <View style={styles.narratorPanel}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>
                    {selectedPerawi.nama_latin || selectedPerawi.nama_lengkap || `Perawi ${selectedPerawi.id}`}
                  </Text>
                  <Text style={styles.detailMeta}>{selectedPerawi.tabaqah || selectedPerawi.status || 'perawi'}</Text>
                </View>
                {selectedPerawi.nama_arab ? <Text style={styles.perawiArabic}>{selectedPerawi.nama_arab}</Text> : null}
                {selectedPerawi.nama_lengkap ? <Text style={styles.detailNote}>{selectedPerawi.nama_lengkap}</Text> : null}
                <Text style={styles.chainMeta}>
                  {[
                    selectedPerawi.kunyah,
                    selectedPerawi.nisbah,
                    selectedPerawi.tahun_wafat ? `w. ${selectedPerawi.tahun_wafat} H` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Profil perawi'}
                </Text>
                {selectedPerawi.biografis ? <Text style={styles.perawiBio}>{selectedPerawi.biografis}</Text> : null}

                {perawiPanel.loading ? <ActivityIndicator color={colors.primary} /> : null}

                <View style={styles.subSection}>
                  <Text style={styles.subTitle}>Jarh wa Ta'dil</Text>
                  {perawiPanel.jarhTadil.length === 0 ? (
                    <Text style={styles.emptyText}>Penilaian jarh-ta'dil belum tersedia.</Text>
                  ) : (
                    perawiPanel.jarhTadil.map((item) => (
                      <View key={item.id} style={styles.assessmentRow}>
                        <Text style={styles.assessmentTitle}>
                          {item.teks_nilai || item.jenis_nilai || 'Penilaian'}
                        </Text>
                        <Text style={styles.referenceMeta}>
                          {[item.penilai?.nama_latin, item.sumber, item.halaman].filter(Boolean).join(' · ') || 'Sumber'}
                        </Text>
                        {item.catatan ? <Text style={styles.detailNote}>{item.catatan}</Text> : null}
                      </View>
                    ))
                  )}
                </View>

                <View style={styles.subSection}>
                  <Text style={styles.subTitle}>Guru</Text>
                  <View style={styles.chipWrap}>{renderPerawiList(perawiPanel.guru, 'guru')}</View>
                </View>

                <View style={styles.subSection}>
                  <Text style={styles.subTitle}>Murid</Text>
                  <View style={styles.chipWrap}>{renderPerawiList(perawiPanel.murid, 'murid')}</View>
                </View>
              </View>
            ) : sanadPerawi.length ? (
              <Text style={styles.referenceMeta}>Pilih salah satu perawi untuk melihat ringkasan biografi.</Text>
            ) : null}
          </Card>
        ) : null}

        {detailTab === 'takhrij' ? (
          <Card>
            <CardTitle meta={`${takhrij.length} rujukan`}>Takhrij</CardTitle>
            {detailLoading && takhrij.length === 0 ? (
              <ActivityIndicator color={colors.primary} />
            ) : takhrij.length === 0 ? (
              <Text style={styles.emptyText}>Rujukan takhrij untuk hadis ini belum tersedia.</Text>
            ) : (
              takhrij.map((item, index) => (
                <View key={`${item.id}-${index}`} style={styles.referenceRow}>
                  <Text style={styles.referenceTitle}>
                    {item.book?.translation?.latin_en || item.book?.translation?.idn || item.book?.slug || 'Kitab hadis'}
                  </Text>
                  <Text style={styles.referenceMeta}>
                    {[item.nomor_hadis_kitab, item.jilid, item.halaman].filter(Boolean).join(' · ') || 'Rujukan'}
                  </Text>
                  {item.catatan ? <Text style={styles.detailNote}>{item.catatan}</Text> : null}
                </View>
              ))
            )}
          </Card>
        ) : null}

        {detailTab === 'notes' ? (
          <Card>
            <CardTitle meta={user ? 'Pribadi' : 'Masuk akun'}>Catatan</CardTitle>
            {user ? (
              <NotesPanel refType="hadith" refId={selectedHadith.id} />
            ) : (
              <Text style={styles.emptyText}>Buka Profil untuk masuk dan menulis catatan hadis.</Text>
            )}
          </Card>
        ) : null}
        {renderHadithActionSheet()}
      </Screen>
    );
  }

  return (
    <Screen
      title="Hadis"
      subtitle="Baca hadis beserta sanad, perawi, dan rujukan takhrij."
      refreshing={loading}
      onRefresh={refreshAll}
      onEndReached={loadMoreHadiths}
      searchSlot={
        <PaperSearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cari nomor, kitab, tema, atau teks hadis"
        />
      }
    >
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {!user ? <Text style={styles.notice}>Buka Profil untuk masuk dan menyimpan bookmark hadis.</Text> : null}

      {books.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bookFilterRow}
        >
          <Pressable
            onPress={() => selectBook(null)}
            style={[styles.bookChip, selectedBook === null ? styles.bookChipActive : null]}
          >
            <Text style={[styles.bookChipText, selectedBook === null ? styles.bookChipTextActive : null]}>
              Semua
            </Text>
          </Pressable>
          {books.map((book) => (
            <Pressable
              key={book.slug}
              onPress={() => selectBook(book.slug)}
              style={[styles.bookChip, selectedBook === book.slug ? styles.bookChipActive : null]}
            >
              <Text
                style={[
                  styles.bookChipText,
                  selectedBook === book.slug ? styles.bookChipTextActive : null,
                ]}
              >
                {book.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {user && savedHadiths.length > 0 ? (
        <Card>
          <CardTitle meta={`${savedHadiths.length} tersimpan`}>Hadis Tersimpan</CardTitle>
          {savedHadiths.map((item) => renderCompactHadithCard(item, 'saved'))}
        </Card>
      ) : null}

      <View style={styles.listSummary}>
        <View>
          <Text style={styles.listSummaryTitle}>{selectedBookName}</Text>
          <Text style={styles.listSummaryMeta}>
            {loading
              ? 'Memuat hadis...'
              : `${filteredHadiths.length} hadis ditampilkan · ${sourceLabel}`}
          </Text>
        </View>
        <View style={styles.summaryBadges}>
          <Text style={styles.queryBadge}>{sourceLabel}</Text>
          {query ? <Text style={styles.queryBadge}>Cari</Text> : null}
        </View>
      </View>

      {loading && hadiths.length === 0 ? (
        <ActivityIndicator color={colors.primary} />
      ) : filteredHadiths.length === 0 ? (
        <Card>
          <CardTitle meta={query ? 'Tidak cocok' : 'Kosong'}>Hadis belum ditemukan</CardTitle>
          <Text style={styles.emptyText}>
            {query
              ? 'Coba kata kunci lain, nomor hadis, nama kitab, atau tema yang lebih umum.'
              : 'Daftar hadis untuk filter ini belum tersedia.'}
          </Text>
        </Card>
      ) : (
        <>
          <Card>
            {visibleHadiths.map((hadith) => (
              <View key={`${hadith.id}-${hadith.title}`} style={styles.hadithListItem}>
                {renderCompactHadithCard(hadith, 'list')}
              </View>
            ))}
          </Card>
          {hasMoreHadiths ? (
            <Pressable
              android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
              disabled={loadingMore}
              onPress={loadMoreHadiths}
              style={styles.loadMoreButton}
            >
              <Text style={styles.loadMoreText}>
                {loadingMore
                  ? 'Memuat hadis berikutnya...'
                  : hasBufferedHadiths
                    ? `Muat lagi (${filteredHadiths.length - visibleCount} tersisa)`
                    : 'Muat hadis berikutnya'}
              </Text>
            </Pressable>
          ) : null}
        </>
      )}
      {renderHadithActionSheet()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  arabic: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  translation: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  bookFilterRow: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  bookChip: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  bookChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bookChipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  bookChipTextActive: {
    color: '#ffffff',
  },
  notice: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.primary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  message: {
    color: colors.primary,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  listSummary: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  summaryBadges: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'flex-end',
  },
  listSummaryTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  listSummaryMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  queryBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  detailTabs: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.md,
    padding: 4,
  },
  detailTabButton: {
    alignItems: 'center',
    borderRadius: radius.sm,
    flex: 1,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 28,
    paddingHorizontal: 4,
  },
  detailTabButtonActive: {
    backgroundColor: colors.primary,
  },
  detailTabText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  detailTabTextActive: {
    color: colors.onPrimary,
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
  inlineSanad: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  detailBlock: {
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    paddingVertical: spacing.md,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  detailMeta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  detailNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  chainRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  chainRowActive: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
  chainIndex: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
    minWidth: 28,
    overflow: 'hidden',
    paddingVertical: spacing.xs,
    textAlign: 'center',
  },
  chainBody: {
    flex: 1,
  },
  chainName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  chainArabic: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  chainMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  perawiArabic: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 30,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  perawiBio: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  narratorPanel: {
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  subSection: {
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  subTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  assessmentRow: {
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  assessmentTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  perawiChip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  perawiChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  moreChip: {
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  moreChipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  referenceRow: {
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    paddingVertical: spacing.md,
  },
  referenceTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  referenceMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  compactHadith: {
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  hadithListItem: {
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
  },
  compactTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    marginRight: spacing.md,
  },
  compactTranslation: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  compactMeta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  compactMeta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  compactHadithWrapper: {
    position: 'relative',
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
  loadMoreButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 42,
  },
  loadMoreText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
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
  button: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 42,
  },
  activeButton: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  activeButtonText: {
    color: colors.primaryDark,
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
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.38)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    elevation: 24,
    left: 0,
    maxHeight: '80%',
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalHandle: {
    alignSelf: 'center',
    backgroundColor: colors.faint,
    borderRadius: 2,
    height: 4,
    marginTop: spacing.md,
    width: 40,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  modalHeaderCopy: {
    flex: 1,
    paddingRight: spacing.md,
  },
  modalTitle: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: 19,
    fontWeight: '900',
  },
  modalMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  modalClose: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 99,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  modalBottomPad: {
    height: 40,
  },
});
