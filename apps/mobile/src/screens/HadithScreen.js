import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getHadithBooks,
  getHadithDetail,
  getHadithsByBook,
  getRelatedHadiths,
  getHadithSanad,
  getHadiths,
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
import { ActionPill, IconActionButton } from '../components/Paper';
import { Screen } from '../components/Screen';
import { useSession } from '../context/SessionContext';
import { colors, radius, spacing } from '../theme';

const HADITH_DETAIL_TABS = [
  { key: 'text', label: 'Teks' },
  { key: 'sanad', label: 'Sanad' },
  { key: 'narrators', label: 'Perawi' },
  { key: 'takhrij', label: 'Takhrij' },
  { key: 'notes', label: 'Catatan' },
];

export function HadithScreen({ deepLinkTarget, isActive, navigation }) {
  const { user } = useSession();
  const handledDeepLinkId = useRef(null);
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
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('text');
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async (bookSlug = null) => {
    setLoading(true);
    try {
      const items = bookSlug ? await getHadithsByBook(bookSlug) : await getHadiths();
      setHadiths(items);
    } catch {
      setHadiths([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBooks = useCallback(async () => {
    try {
      const items = await getHadithBooks();
      setBooks(items);
    } catch {
      setBooks([]);
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
    await load(selectedBook);
    await loadBooks();
    await loadBookmarks();
    await loadNoteCounts();
  }, [load, loadBooks, loadBookmarks, loadNoteCounts, selectedBook]);

  const selectBook = useCallback(
    (slug) => {
      const next = slug === selectedBook ? null : slug;
      setSelectedBook(next);
      setSelectedHadith(null);
      load(next);
    },
    [load, selectedBook],
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
    if (!user || !hadith.id) return;

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
        await loadBookmarks();
      } else {
        const bookmark = await addBookmark({ refType: 'hadith', refId: hadith.id });
        setBookmarks({ ...bookmarks, [hadith.id]: bookmark });
        setMessage('Hadis disimpan ke bookmark.');
        await loadBookmarks();
      }
    } catch (err) {
      setMessage(err?.message ?? 'Bookmark belum bisa diperbarui.');
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

  const renderCompactHadithCard = (hadith, meta = '') => (
    <Pressable key={`${meta}-${hadith.id}`} onPress={() => openHadith(hadith)} style={styles.compactHadith}>
      <View style={styles.detailHeader}>
        <Text style={styles.compactTitle}>{hadith.title}</Text>
        <Text style={styles.detailMeta}>{hadith.grade || hadith.book}</Text>
      </View>
      <Text numberOfLines={3} style={styles.compactTranslation}>
        {hadith.translation || hadith.book}
      </Text>
      {noteCounts[hadith.id] ? <Text style={styles.compactMeta}>{noteCounts[hadith.id]} note</Text> : null}
    </Pressable>
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
      </Screen>
    );
  }

  return (
    <Screen
      title="Hadis"
      subtitle="Baca hadis beserta sanad, perawi, dan rujukan takhrij."
      refreshing={loading}
      onRefresh={refreshAll}
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

      {loading && hadiths.length === 0 ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        hadiths.map((hadith) => (
          <Card key={`${hadith.id}-${hadith.title}`}>
            <CardTitle meta={hadith.grade || hadith.book}>{hadith.title}</CardTitle>
            {hadith.arabic ? <Text style={styles.arabic}>{hadith.arabic}</Text> : null}
            <Text style={styles.translation}>{hadith.translation || hadith.book}</Text>
            <ActionPill Icon={BookOpen} label="Buka detail" onPress={() => openHadith(hadith)} />
            {user ? (
              <ActionPill
                disabled={savingId === hadith.id}
                Icon={bookmarks[hadith.id] ? BookmarkCheck : Bookmark}
                label={
                  savingId === hadith.id
                    ? 'Menyimpan'
                    : bookmarks[hadith.id]
                      ? 'Hapus bookmark'
                      : 'Bookmark hadis'
                }
                onPress={() => toggleBookmark(hadith)}
                active={Boolean(bookmarks[hadith.id])}
              />
            ) : null}
          </Card>
        ))
      )}
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
});
