import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Book, BookOpen, Languages, Layers, Search, UserRound } from 'lucide-react-native';
import { searchGlobal } from '../api/client';
import { ContentCard } from '../components/ContentCard';
import { IconActionButton, PaperSearchInput } from '../components/Paper';
import { Screen } from '../components/Screen';
import { allFeatures } from '../data/mobileFeatures';
import { readRecentSearches, rememberRecentSearch } from '../storage/recentSearches';
import { colors, radius, shadows, spacing } from '../theme';

const MIN_QUERY_LENGTH = 2;
const quickSuggestions = ['shalat', 'sabar', 'zakat', 'tafsir'];

const searchFilters = [
  { key: 'all', label: 'Semua', remoteType: 'all' },
  { key: 'quran', label: 'Quran', remoteType: 'ayah' },
  { key: 'hadith', label: 'Hadis', remoteType: 'hadith' },
  { key: 'doa', label: 'Doa', remoteType: 'doa' },
  { key: 'kajian', label: 'Kajian', remoteType: 'kajian' },
  { key: 'dictionary', label: 'Kamus', remoteType: 'dictionary' },
  { key: 'perawi', label: 'Perawi', remoteType: 'perawi' },
  { key: 'feature', label: 'Fitur', remoteType: 'all' },
];

const normalizeQuery = (value = '') => value.trim().toLowerCase();
const emptyGlobalResult = { ayahs: [], dictionaries: [], doas: [], hadiths: [], kajians: [], perawis: [], total: 0 };
const emptyRemoteResults = { ...emptyGlobalResult, doas: [], kajians: [] };
const emptyStateByFilter = {
  all: {
    title: 'Belum ada hasil',
    text: 'Coba kata lain, nama surah, nomor hadis, tema doa, atau buka Semua Fitur.',
  },
  dictionary: {
    title: 'Kata belum ditemukan',
    text: 'Coba akar kata Arab, transliterasi, atau istilah yang lebih pendek.',
  },
  doa: {
    title: 'Doa belum ditemukan',
    text: 'Coba cari dengan tema seperti pagi, malam, safar, atau perlindungan.',
  },
  feature: {
    title: 'Fitur belum ditemukan',
    text: 'Coba cari dengan nama fitur seperti kiblat, zakat, dzikir, atau kajian.',
  },
  hadith: {
    title: 'Hadis belum ditemukan',
    text: 'Coba kata kunci tema, nomor hadis, atau nama kitab hadis.',
  },
  kajian: {
    title: 'Kajian belum ditemukan',
    text: 'Coba nama tema, pembicara, atau istilah yang lebih umum.',
  },
  perawi: {
    title: 'Perawi belum ditemukan',
    text: 'Coba nama lengkap, kunyah, atau ejaan latin yang berbeda.',
  },
  quran: {
    title: 'Ayat belum ditemukan',
    text: 'Coba nama surah, nomor ayat, atau kata terjemahan yang lebih umum.',
  },
};

const cleanMeta = (value, fallback) => {
  const raw = `${value ?? ''}`.trim();
  if (!raw) return fallback;
  const normalized = raw.toLowerCase();
  if (['backend', 'server', 'storage', 'device', 'perangkat'].includes(normalized)) {
    return fallback;
  }
  return raw;
};

const findFeatureResults = (query) => {
  const normalized = normalizeQuery(query);
  if (normalized.length < MIN_QUERY_LENGTH) return [];

  return allFeatures
    .filter((feature) =>
      [feature.title, feature.subtitle, feature.group, feature.key]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
    .slice(0, 6);
};

const ResultSection = ({ children, count, title }) => {
  if (!count) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>
      {children}
    </View>
  );
};

const ResultRow = ({ Icon, meta, onPress, subtitle, title }) => (
  <ContentCard
    Icon={Icon}
    meta={meta}
    onPress={() => {
      Keyboard.dismiss();
      onPress?.();
    }}
    subtitle={subtitle}
    style={styles.resultRow}
    title={title}
  />
);

const LoadingSearchState = ({ label }) => (
  <View style={styles.loadingCard}>
    <View style={styles.loadingHeader}>
      <ActivityIndicator color={colors.primary} size="small" />
      <Text style={styles.loadingText}>Mencari {label.toLowerCase()}...</Text>
    </View>
    {[0, 1, 2].map((item) => (
      <View key={`search-loading-${item}`} style={styles.loadingSkeleton}>
        <View style={styles.loadingSkeletonIcon} />
        <View style={styles.loadingSkeletonCopy}>
          <View style={styles.loadingSkeletonTitle} />
          <View style={styles.loadingSkeletonLine} />
        </View>
      </View>
    ))}
  </View>
);

export function GlobalSearchScreen({ initialQuery = '', onBack, onOpenTab }) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState([]);
  const [remoteResults, setRemoteResults] = useState({
    ayahs: [],
    dictionaries: [],
    doas: [],
    hadiths: [],
    kajians: [],
    perawis: [],
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const featureResults = useMemo(() => findFeatureResults(query), [query]);
  const selectedFilter = searchFilters.find((item) => item.key === activeFilter) ?? searchFilters[0];
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const showAyahs = activeFilter === 'all' || activeFilter === 'quran';
  const showDoas = activeFilter === 'all' || activeFilter === 'doa';
  const showHadiths = activeFilter === 'all' || activeFilter === 'hadith';
  const showKajians = activeFilter === 'all' || activeFilter === 'kajian';
  const showDictionaries = activeFilter === 'all' || activeFilter === 'dictionary';
  const showPerawis = activeFilter === 'all' || activeFilter === 'perawi';
  const showFeatures = activeFilter === 'all' || activeFilter === 'feature';
  const totalResults =
    (showAyahs ? remoteResults.ayahs.length : 0) +
    (showDoas ? remoteResults.doas.length : 0) +
    (showHadiths ? remoteResults.hadiths.length : 0) +
    (showKajians ? remoteResults.kajians.length : 0) +
    (showDictionaries ? remoteResults.dictionaries.length : 0) +
    (showPerawis ? remoteResults.perawis.length : 0) +
    (showFeatures ? featureResults.length : 0);
  const filterCounts = {
    all:
      remoteResults.ayahs.length +
      remoteResults.doas.length +
      remoteResults.hadiths.length +
      remoteResults.kajians.length +
      remoteResults.dictionaries.length +
      remoteResults.perawis.length +
      featureResults.length,
    dictionary: remoteResults.dictionaries.length,
    doa: remoteResults.doas.length,
    feature: featureResults.length,
    hadith: remoteResults.hadiths.length,
    kajian: remoteResults.kajians.length,
    perawi: remoteResults.perawis.length,
    quran: remoteResults.ayahs.length,
  };

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let mounted = true;

    readRecentSearches().then((items) => {
      if (mounted) setRecentSearches(items);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasQuery) {
      setRemoteResults(emptyRemoteResults);
      setLoading(false);
      setMessage('');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setMessage('');

    const timer = setTimeout(async () => {
      const shouldSearchGlobal = activeFilter !== 'feature';
      const shouldHydrateAllCounts = activeFilter === 'all';

      const globalResult = await Promise.resolve(
        shouldSearchGlobal
          ? searchGlobal(trimmedQuery, { limit: 24, type: selectedFilter.remoteType })
          : emptyGlobalResult,
      ).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason }),
      );

      const quranResult = shouldHydrateAllCounts
        ? await Promise.resolve(searchGlobal(trimmedQuery, { limit: 24, type: 'ayah' })).then(
            (value) => ({ status: 'fulfilled', value }),
            (reason) => ({ status: 'rejected', reason }),
          )
        : null;

      if (cancelled) return;

      const nextGlobal = {
        ...(globalResult.status === 'fulfilled' ? globalResult.value : emptyGlobalResult),
        ...(quranResult?.status === 'fulfilled' ? { ayahs: quranResult.value.ayahs } : {}),
      };
      const failedModules = [
        globalResult.status === 'rejected' && shouldSearchGlobal ? selectedFilter.label : null,
        quranResult?.status === 'rejected' ? 'Quran' : null,
      ].filter(Boolean);

      setRemoteResults({
        ...nextGlobal,
      });

      if (failedModules.length) {
        setMessage(`Sebagian hasil belum bisa dimuat: ${failedModules.join(', ')}.`);
        if (nextGlobal.ayahs.length || nextGlobal.hadiths.length || nextGlobal.doas.length || nextGlobal.kajians.length || featureResults.length) {
          rememberRecentSearch(trimmedQuery).then((items) => {
            if (!cancelled) setRecentSearches(items);
          });
        }
      } else {
        setMessage('');
        rememberRecentSearch(trimmedQuery).then((items) => {
          if (!cancelled) setRecentSearches(items);
        });
      }

      setLoading(false);
    }, 320);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeFilter, featureResults.length, hasQuery, selectedFilter.remoteType, trimmedQuery]);

  const searchChips = recentSearches.length ? recentSearches : quickSuggestions;
  const chipLabel = recentSearches.length ? 'Terakhir dicari' : 'Cari cepat';
  const resultSummary = `${totalResults} hasil untuk "${trimmedQuery}"`;
  const emptyState = emptyStateByFilter[activeFilter] ?? emptyStateByFilter.all;

  return (
    <Screen
      actions={<IconActionButton Icon={ArrowLeft} label="Kembali ke Beranda" onPress={onBack} />}
      searchSlot={
        <PaperSearchInput
          autoFocus
          onChangeText={setQuery}
          placeholder="Cari Quran, hadis, fitur, kamus..."
          value={query}
        />
      }
      headerExtra={
        <>
          <ScrollView
            contentContainerStyle={styles.filterContent}
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >
            {searchFilters.map((filter) => {
              const active = filter.key === activeFilter;
              const count = filterCounts[filter.key] ?? 0;
              const label = hasQuery && count ? `${filter.label} ${count}` : filter.label;
              return (
                <Pressable
                  android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                  key={filter.key}
                  onPress={() => setActiveFilter(filter.key)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {!hasQuery ? (
            <View style={styles.quickWrap}>
              <Text style={styles.quickLabel}>{chipLabel}</Text>
              <View style={styles.quickChips}>
                {searchChips.slice(0, 6).map((item) => (
                  <Pressable
                    android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                    key={item}
                    onPress={() => setQuery(item)}
                    style={styles.quickChip}
                  >
                    <Text style={styles.quickText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </>
      }
      subtitle="Satu tempat untuk menemukan bacaan, hadis, referensi, dan fitur aplikasi."
      title="Cari"
    >
      {!hasQuery ? (
        <View style={styles.hintCard}>
          <View style={styles.hintIcon}>
            <Search color={colors.primary} size={22} strokeWidth={2.2} />
          </View>
          <Text style={styles.hintTitle}>Mulai dari dua huruf</Text>
          <Text style={styles.hintText}>Contoh: shalat, sabar, zakat, tafsir, atau nama fitur.</Text>
        </View>
      ) : null}

      {loading ? <LoadingSearchState label={selectedFilter.label} /> : null}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {hasQuery && !loading && totalResults ? (
        <View style={styles.resultSummary}>
          <Search color={colors.primary} size={15} strokeWidth={2.2} />
          <Text style={styles.resultSummaryText}>{resultSummary}</Text>
        </View>
      ) : null}

      {hasQuery && !loading && !totalResults ? (
        <View style={styles.hintCard}>
          <Text style={styles.hintTitle}>{emptyState.title}</Text>
          <Text style={styles.hintText}>{emptyState.text}</Text>
        </View>
      ) : null}

      {showAyahs ? (
        <ResultSection count={remoteResults.ayahs.length} title="Al-Quran">
          {remoteResults.ayahs.map((item) => (
            <ResultRow
              Icon={BookOpen}
              key={`ayah-${item.id}`}
              meta={item.surahNumber ? `Surah ${item.surahNumber}` : 'Al-Quran'}
              onPress={() =>
                onOpenTab('quran', {
                  ayahId: item.id,
                  ayahNumber: item.number,
                  surahNumber: item.surahNumber,
                })
              }
              subtitle={item.translation}
              title={[item.surahName, item.number ? `Ayah ${item.number}` : null].filter(Boolean).join(' · ') || 'Ayat Quran'}
            />
          ))}
        </ResultSection>
      ) : null}

      {showHadiths ? (
        <ResultSection count={remoteResults.hadiths.length} title="Hadis">
          {remoteResults.hadiths.map((item) => (
            <ResultRow
              Icon={Book}
              key={`hadith-${item.id}`}
              meta={cleanMeta(item.book, 'Hadis')}
              onPress={() => onOpenTab('hadith', { hadithId: item.id })}
              subtitle={item.translation}
              title={item.title || `Hadis ${item.id}`}
            />
          ))}
        </ResultSection>
      ) : null}

      {showDoas ? (
        <ResultSection count={remoteResults.doas.length} title="Doa">
          {remoteResults.doas.map((item) => (
            <ResultRow
              Icon={BookOpen}
              key={`doa-${item.id}`}
              meta={cleanMeta(item.meta, 'Doa')}
              onPress={() => onOpenTab('belajar', { featureKey: 'doa' })}
              subtitle={item.body}
              title={item.title}
            />
          ))}
        </ResultSection>
      ) : null}

      {showKajians ? (
        <ResultSection count={remoteResults.kajians.length} title="Kajian">
          {remoteResults.kajians.map((item) => (
            <ResultRow
              Icon={Book}
              key={`kajian-${item.id}`}
              meta={cleanMeta(item.meta, 'Kajian')}
              onPress={() => onOpenTab('belajar', { featureKey: 'kajian' })}
              subtitle={item.body}
              title={item.title}
            />
          ))}
        </ResultSection>
      ) : null}

      {showFeatures ? (
        <ResultSection count={featureResults.length} title="Fitur">
          {featureResults.map((feature) => (
            <ResultRow
              Icon={Layers}
              key={`feature-${feature.key}`}
              meta={cleanMeta(feature.group, 'Fitur')}
              onPress={() => onOpenTab('belajar', { featureKey: feature.key, focusSearch: feature.type === 'kamus' })}
              subtitle={feature.subtitle}
              title={feature.title}
            />
          ))}
        </ResultSection>
      ) : null}

      {showDictionaries ? (
        <ResultSection count={remoteResults.dictionaries.length} title="Kamus">
          {remoteResults.dictionaries.map((item) => (
            <ResultRow
              Icon={Languages}
              key={`dictionary-${item.id}`}
              meta={cleanMeta(item.category, 'Kamus')}
              onPress={() => onOpenTab('belajar', { featureKey: 'kamus', focusSearch: true })}
              subtitle={item.body}
              title={item.title}
            />
          ))}
        </ResultSection>
      ) : null}

      {showPerawis ? (
        <ResultSection count={remoteResults.perawis.length} title="Perawi">
          {remoteResults.perawis.map((item) => (
            <ResultRow
              Icon={UserRound}
              key={`perawi-${item.id}`}
              meta={cleanMeta(item.status, 'Perawi')}
              onPress={() => onOpenTab('belajar', { featureKey: 'perawi' })}
              subtitle={item.body}
              title={item.title}
            />
          ))}
        </ResultSection>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterContent: {
    paddingRight: spacing.lg,
  },
  filterText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  filterTextActive: {
    color: colors.onPrimary,
  },
  hintCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.paper,
  },
  hintIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 44,
  },
  hintText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  hintTitle: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: 17,
    fontWeight: '900',
  },
  loadingCard: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.paper,
  },
  loadingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  loadingSkeleton: {
    alignItems: 'center',
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingTop: spacing.sm,
  },
  loadingSkeletonCopy: {
    flex: 1,
    minWidth: 0,
  },
  loadingSkeletonIcon: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    height: 34,
    width: 34,
  },
  loadingSkeletonLine: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    height: 9,
    marginTop: spacing.xs,
    width: '58%',
  },
  loadingSkeletonTitle: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    height: 11,
    width: '78%',
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  message: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  quickChip: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  quickLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  quickText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  quickWrap: {
    marginTop: spacing.md,
  },
  resultSummary: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  resultSummaryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  resultRow: {
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionCount: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '900',
  },
});
