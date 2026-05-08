import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Book, BookOpen, Languages, Layers, Search, UserRound } from 'lucide-react-native';
import { searchGlobal } from '../api/client';
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
  { key: 'dictionary', label: 'Kamus', remoteType: 'dictionary' },
  { key: 'perawi', label: 'Perawi', remoteType: 'perawi' },
  { key: 'feature', label: 'Fitur', remoteType: 'all' },
];

const normalizeQuery = (value = '') => value.trim().toLowerCase();

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
  <Pressable
    android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
    onPress={onPress}
    style={styles.resultRow}
  >
    <View style={styles.resultIcon}>
      <Icon color={colors.primary} size={18} strokeWidth={2.2} />
    </View>
    <View style={styles.resultCopy}>
      <Text numberOfLines={2} style={styles.resultTitle}>{title}</Text>
      {subtitle ? <Text numberOfLines={2} style={styles.resultSubtitle}>{subtitle}</Text> : null}
    </View>
    {meta ? <Text style={styles.resultMeta}>{meta}</Text> : null}
  </Pressable>
);

export function GlobalSearchScreen({ initialQuery = '', onBack, onOpenTab }) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState([]);
  const [remoteResults, setRemoteResults] = useState({ ayahs: [], dictionaries: [], hadiths: [], perawis: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const featureResults = useMemo(() => findFeatureResults(query), [query]);
  const selectedFilter = searchFilters.find((item) => item.key === activeFilter) ?? searchFilters[0];
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const showAyahs = activeFilter === 'all' || activeFilter === 'quran';
  const showHadiths = activeFilter === 'all' || activeFilter === 'hadith';
  const showDictionaries = activeFilter === 'all' || activeFilter === 'dictionary';
  const showPerawis = activeFilter === 'all' || activeFilter === 'perawi';
  const showFeatures = activeFilter === 'all' || activeFilter === 'feature';
  const totalResults =
    (showAyahs ? remoteResults.ayahs.length : 0) +
    (showHadiths ? remoteResults.hadiths.length : 0) +
    (showDictionaries ? remoteResults.dictionaries.length : 0) +
    (showPerawis ? remoteResults.perawis.length : 0) +
    (showFeatures ? featureResults.length : 0);

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
      setRemoteResults({ ayahs: [], dictionaries: [], hadiths: [], perawis: [], total: 0 });
      setLoading(false);
      setMessage('');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setMessage('');

    const timer = setTimeout(async () => {
      const globalResult = await Promise.resolve(searchGlobal(trimmedQuery, { limit: 16, type: selectedFilter.remoteType })).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason }),
      );

      if (cancelled) return;

      if (globalResult.status === 'fulfilled') {
        setRemoteResults(globalResult.value);
        rememberRecentSearch(trimmedQuery).then((items) => {
          if (!cancelled) setRecentSearches(items);
        });
      } else {
        setRemoteResults({ ayahs: [], dictionaries: [], hadiths: [], perawis: [], total: 0 });
        setMessage(globalResult.reason?.message ?? 'Pencarian server belum bisa dimuat.');
      }

      setLoading(false);
    }, 320);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hasQuery, selectedFilter.remoteType, trimmedQuery]);

  const searchChips = recentSearches.length ? recentSearches : quickSuggestions;
  const chipLabel = recentSearches.length ? 'Terakhir dicari' : 'Cari cepat';

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
              return (
                <Pressable
                  android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                  key={filter.key}
                  onPress={() => setActiveFilter(filter.key)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter.label}</Text>
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

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Mencari...</Text>
        </View>
      ) : null}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {hasQuery && !loading && !totalResults ? (
        <View style={styles.hintCard}>
          <Text style={styles.hintTitle}>Belum ada hasil</Text>
          <Text style={styles.hintText}>Coba kata lain atau buka tab Belajar untuk melihat semua fitur.</Text>
        </View>
      ) : null}

      {showAyahs ? (
        <ResultSection count={remoteResults.ayahs.length} title="Al-Quran">
          {remoteResults.ayahs.map((item) => (
            <ResultRow
              Icon={BookOpen}
              key={`ayah-${item.id}`}
              meta={item.surahNumber ? `Surah ${item.surahNumber}` : 'Quran'}
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
              meta={item.book || 'Hadis'}
              onPress={() => onOpenTab('hadith', { hadithId: item.id })}
              subtitle={item.translation}
              title={item.title || `Hadis ${item.id}`}
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
              meta={feature.group}
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
              meta={item.category || 'Kamus'}
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
              meta={item.status || 'Perawi'}
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
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  resultCopy: {
    flex: 1,
  },
  resultIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  resultMeta: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: spacing.sm,
    maxWidth: 86,
    textAlign: 'right',
  },
  resultRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    minHeight: 66,
    padding: spacing.sm,
  },
  resultSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  resultTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
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
