import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Database, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  buildOfflinePack,
  clearOfflinePack,
  getOfflineOverview,
} from '../storage/offlineContent';
import { colors, radius, spacing } from '../theme';
import { Card, CardTitle } from './Card';

const PACK_ESTIMATE = {
  ayahs: 6236,
  hadiths: 2000,
  size: '15-25 MB',
  surahs: 114,
};

const PACK_SCOPE = [
  { key: 'quran', label: 'Al-Quran', value: '114 surah' },
  { key: 'hadith', label: 'Hadis', value: 'maks. 2.000' },
  { key: 'excluded', label: 'Terpisah', value: 'cache & personal' },
];

const formatNumber = (value) => Number(value ?? 0).toLocaleString('en-US');

const formatDate = (value) => {
  if (!value) return 'Belum diunduh';

  try {
    return new Intl.DateTimeFormat('en', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
    }).format(new Date(value));
  } catch {
    return 'Sudah diunduh';
  }
};

const statsFor = (overview) => [
  { key: 'surahs', label: 'Surah', value: overview.quranSurahs },
  { key: 'ayahs', label: 'Ayat', value: overview.quranAyahs },
  { key: 'hadiths', label: 'Hadis', value: overview.hadiths },
];

export function OfflinePackCard() {
  const [overview, setOverview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Siap menyimpan Al-Qur\'an dan hadis untuk dibaca offline.');
  const [progress, setProgress] = useState(0);

  const load = useCallback(async () => {
    const data = await getOfflineOverview();
    setOverview(data);
    if (!data.supported) {
      setMessage(data.error ?? 'Mode offline belum tersedia di perangkat ini.');
      return;
    }
    if (data.savedAt) {
      setMessage(`Terakhir diunduh ${formatDate(data.savedAt)}.`);
    }
  }, []);

  const download = async () => {
    setBusy(true);
    setProgress(0);
    try {
      const data = await buildOfflinePack({
        onProgress: (event) => {
          setMessage(event.label);
          setProgress(event.value ?? 0);
        },
      });
      setOverview(data);
      setMessage(`Paket offline siap: ${data.quranAyahs} ayat dan ${data.hadiths} hadis.`);
      setProgress(100);
    } catch (error) {
      setMessage(error?.message ?? 'Paket offline belum bisa diunduh.');
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    setBusy(true);
    try {
      const data = await clearOfflinePack();
      setOverview(data);
      setMessage('Paket offline dihapus.');
      setProgress(0);
    } catch (error) {
      setMessage(error?.message ?? 'Paket offline belum bisa dihapus.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDownload = () => {
    Alert.alert(
      'Unduh paket offline?',
      `Paket utama menyimpan ${PACK_ESTIMATE.surahs} surah, sekitar ${formatNumber(PACK_ESTIMATE.ayahs)} ayat, dan maksimal ${formatNumber(PACK_ESTIMATE.hadiths)} hadis. Perkiraan ukuran ${PACK_ESTIMATE.size}. Cache harian, bookmark, dan jadwal sholat tidak ikut paket ini.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Unduh utama', onPress: download },
      ],
    );
  };

  const confirmClear = () => {
    Alert.alert(
      'Hapus paket offline?',
      'Data Al-Quran dan hadis offline akan dihapus dari perangkat. Cache otomatis, bookmark snapshot, dan jadwal sholat offline tetap memakai kontrolnya masing-masing.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', onPress: clear, style: 'destructive' },
      ],
    );
  };

  useEffect(() => {
    load();
  }, [load]);

  const isSupported = overview?.supported ?? true;
  const stats = statsFor(overview ?? {});

  return (
    <Card>
      <CardTitle meta="Penyimpanan perangkat">Paket Offline</CardTitle>
      <Text style={styles.muted}>
        Simpan paket utama Al-Quran dan hadis agar tetap bisa dibaca saat offline. Konten personal, cache harian, dan jadwal sholat dikelola terpisah.
      </Text>
      <View style={styles.scopeRow}>
        {PACK_SCOPE.map((item) => (
          <View key={item.key} style={styles.scopePill}>
            <Text style={styles.scopeLabel}>{item.label}</Text>
            <Text style={styles.scopeValue}>{item.value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.estimateBox}>
        <View style={styles.estimateTitleRow}>
          <Database color={colors.primary} size={16} strokeWidth={2.4} />
          <Text style={styles.estimateTitle}>Estimasi download</Text>
        </View>
        <Text style={styles.estimateText}>
          {PACK_ESTIMATE.surahs} surah · {formatNumber(PACK_ESTIMATE.ayahs)} ayat · maksimal{' '}
          {formatNumber(PACK_ESTIMATE.hadiths)} hadis · {PACK_ESTIMATE.size}
        </Text>
      </View>

      <View style={styles.stats}>
        {stats.map((item) => (
          <View key={item.key} style={styles.stat}>
            <Text style={styles.statValue}>{item.value ?? 0}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
      </View>
      <Text style={styles.meta}>{message}</Text>

      <View style={styles.actions}>
        <Pressable
          disabled={busy || !isSupported}
          onPress={confirmDownload}
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            (busy || !isSupported) && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <BookOpen color="#ffffff" size={16} strokeWidth={2.5} />
              <Text style={styles.primaryButtonText}>Unduh utama</Text>
            </View>
          )}
        </Pressable>
        <Pressable
          disabled={busy || !isSupported}
          onPress={confirmClear}
          style={({ pressed }) => [styles.button, (busy || !isSupported) && styles.disabled, pressed && styles.pressed]}
        >
          <View style={styles.buttonContent}>
            <Trash2 color={colors.primary} size={16} strokeWidth={2.5} />
            <Text style={styles.buttonText}>Hapus paket</Text>
          </View>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  scopeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  scopePill: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: 52,
    padding: spacing.sm,
  },
  scopeLabel: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  scopeValue: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 2,
  },
  estimateBox: {
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  estimateTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  estimateTitle: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  estimateText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  stat: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    flexBasis: '30%',
    flexGrow: 1,
    padding: spacing.md,
  },
  statValue: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  progressTrack: {
    backgroundColor: colors.faint,
    borderRadius: radius.sm,
    height: 7,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.8,
  },
});
