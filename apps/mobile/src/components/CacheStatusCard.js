import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { cachePolicy, clearContentCache, getCacheOverview } from '../storage/cache';
import { colors, radius, spacing } from '../theme';
import { Card, CardTitle } from './Card';

const formatDate = (value) => {
  if (!value) return 'Belum tersimpan';

  try {
    return new Intl.DateTimeFormat('en', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
    }).format(new Date(value));
  } catch {
    return 'Tersimpan';
  }
};

export function CacheStatusCard() {
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    setItems(await getCacheOverview());
  }, []);

  const clear = useCallback(async () => {
    await clearContentCache();
    await load();
  }, [load]);

  const confirmClear = () => {
    Alert.alert(
      'Hapus data sementara?',
      'Data sementara Quran, hadis, dan jadwal sholat akan dihapus. Paket offline utama tetap aman.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus data', onPress: clear, style: 'destructive' },
      ],
    );
  };

  useEffect(() => {
    load();
  }, [load]);

  const totalSize = items.reduce((total, item) => total + Number(item.size ?? 0), 0);

  return (
    <Card>
      <CardTitle meta="Cadangan online">Data Sementara</CardTitle>
      <Text style={styles.muted}>{cachePolicy.refresh}</Text>
      <Text style={styles.policy}>{cachePolicy.clearScope}</Text>
      <View style={styles.list}>
        {items.length ? (
          items.map((item) => (
            <View key={item.key} style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.meta}>{formatDate(item.savedAt)}</Text>
              </View>
              <Text style={styles.count}>{item.size}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyRow}>
            <Text style={styles.meta}>Belum ada data sementara tersimpan.</Text>
          </View>
        )}
      </View>
      <Pressable disabled={!totalSize} onPress={confirmClear} style={[styles.button, !totalSize && styles.disabled]}>
        <Text style={styles.buttonText}>Hapus Data</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  policy: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  list: {
    marginTop: spacing.md,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  emptyRow: {
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  count: {
    color: colors.primary,
    fontSize: 15,
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
  buttonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.55,
  },
});
