import {
  Bell,
  Book,
  BookOpenCheck,
  Compass,
  FileText,
  Grid,
  HelpCircle,
  Search,
  Smile,
  Video,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getDailyAyah, getDailyHadith, getPrayerTimes } from '../api/client';
import { useSession } from '../context/SessionContext';
import { getTodayPrayerLog } from '../api/personal';
import { colors, radius, shadows, spacing } from '../theme';

const prayerKeyLabels = {
  asr: 'Ashar',
  dhuhr: 'Dzuhur',
  fajr: 'Subuh',
  isha: 'Isya',
  maghrib: 'Maghrib',
};

const trackerTemplate = [
  { key: 'subuh', label: 'Subuh', short: 'S' },
  { key: 'dzuhur', label: 'Dzuhur', short: 'D' },
  { key: 'ashar', label: 'Ashar', short: 'A' },
  { key: 'maghrib', label: 'Maghrib', short: 'M' },
  { key: 'isya', label: 'Isya', short: 'I' },
];

const menuItems = [
  { Icon: Compass, key: 'ibadah', label: 'Kiblat', params: { view: 'qibla' } },
  { Icon: BookOpenCheck, key: 'quran', label: 'Hafalan' },
  { Icon: Smile, featureKey: 'muhasabah', key: 'belajar', label: 'Jurnal' },
  { Icon: HelpCircle, featureKey: 'quiz', key: 'belajar', label: 'Kuis' },
  { Icon: Video, featureKey: 'kajian', key: 'belajar', label: 'Kajian' },
  { Icon: FileText, featureKey: 'tafsir', key: 'belajar', label: 'Tafsir' },
  { Icon: Book, key: 'hadith', label: 'Hadis' },
  { Icon: Grid, key: 'belajar', label: 'Lainnya' },
];

const scheduleOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const toMinutes = (timeValue) => {
  const match = /^(\d{1,2}):(\d{2})/.exec(`${timeValue ?? ''}`);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const formatCountdown = (minutesDelta) => {
  const hours = `${Math.floor(minutesDelta / 60)}`.padStart(2, '0');
  const minutes = `${minutesDelta % 60}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

export function HomeScreen({ onOpenTab }) {
  const { user } = useSession();
  const [dailyHadith, setDailyHadith] = useState(null);
  const [dailyAyah, setDailyAyah] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Memuat lokasi');
  const [nextPrayer, setNextPrayer] = useState({ countdown: '--:--', key: 'asr', time: '--:--' });
  const [tracker, setTracker] = useState(trackerTemplate.map((item) => ({ ...item, done: false })));
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [dailyMessage, setDailyMessage] = useState('');
  const [prayerMessage, setPrayerMessage] = useState('');
  const displayName = user?.name || 'Tamu';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  useEffect(() => {
    let mounted = true;

    const resolvePrayerState = (prayers) => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const decorated = scheduleOrder
        .map((key) => ({
          key,
          label: prayerKeyLabels[key],
          minutes: toMinutes(prayers?.[key]),
          time: prayers?.[key] ?? '--:--',
        }))
        .filter((item) => item.minutes !== null);

      if (!decorated.length) {
        return { countdown: '--:--', key: 'asr', time: '--:--' };
      }

      let target = decorated.find((item) => item.minutes > currentMinutes);
      let delta = 0;

      if (target) {
        delta = target.minutes - currentMinutes;
      } else {
        target = decorated[0];
        delta = 1440 - currentMinutes + target.minutes;
      }

      return {
        countdown: formatCountdown(delta),
        key: target.key,
        time: target.time,
      };
    };

    const loadHomeData = async () => {
      setLoadingDaily(true);
      setDailyMessage('');
      setPrayerMessage('');
      let coords = null;

      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          const places = await Location.reverseGeocodeAsync(coords);
          const place = places?.[0];
          const city = place?.city || place?.subregion || place?.district || place?.region;
          if (mounted) setLocationLabel((city || 'Lokasi aktif').toUpperCase());
        } else if (mounted) {
          setLocationLabel('LOKASI NONAKTIF');
          setPrayerMessage('Aktifkan lokasi untuk melihat jadwal sholat di tempatmu.');
        }
      } catch {
        if (mounted) {
          setLocationLabel('LOKASI BELUM TERSEDIA');
          setPrayerMessage('Lokasi belum terbaca. Coba aktifkan GPS lalu tarik untuk memuat ulang.');
        }
      }

      const [hadithResult, ayahResult, prayersResult, prayerLogResult] = await Promise.allSettled([
        getDailyHadith(),
        getDailyAyah(),
        coords ? getPrayerTimes({ ...coords, madhab: 'shafi', method: 'kemenag' }) : Promise.resolve(null),
        user ? getTodayPrayerLog() : Promise.resolve(null),
      ]);

      if (!mounted) return;

      if (hadithResult.status === 'fulfilled') {
        setDailyHadith(hadithResult.value);
      } else {
        setDailyHadith(null);
      }

      if (ayahResult.status === 'fulfilled' && ayahResult.value?.id) {
        const chosen = ayahResult.value;
        setDailyAyah({
          arabic: chosen.arabic,
          ref: [chosen.surahName, chosen.number ? `Ayah ${chosen.number}` : null].filter(Boolean).join(' · '),
          translation: chosen.translation,
        });
      } else {
        setDailyAyah(null);
        setDailyMessage('Bacaan harian belum tersedia dari server.');
      }

      if (prayersResult.status === 'fulfilled' && prayersResult.value) {
        setNextPrayer(resolvePrayerState(prayersResult.value));
      } else if (coords) {
        setPrayerMessage('Jadwal sholat belum tersedia. Coba muat ulang beberapa saat lagi.');
        setNextPrayer({ countdown: '--:--', key: 'asr', time: '--:--' });
      }

      if (prayerLogResult.status === 'fulfilled' && prayerLogResult.value?.prayers) {
        const prayers = prayerLogResult.value.prayers;
        setTracker(
          trackerTemplate.map((item) => ({
            ...item,
            done: Boolean(prayers[item.key]),
          })),
        );
      } else {
        setTracker(trackerTemplate.map((item) => ({ ...item, done: false })));
      }

      setLoadingDaily(false);
    };

    loadHomeData();

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.header}>
        <Pressable android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }} onPress={() => onOpenTab('profile')} style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'TI'}</Text>
          </View>
          <View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.location}>{locationLabel}</Text>
          </View>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            android_ripple={{ color: 'rgba(91, 110, 91, 0.16)', borderless: true }}
            onPress={() => onOpenTab('belajar', { featureKey: 'kamus', focusSearch: true })}
          >
            <Search color={colors.muted} size={18} strokeWidth={2.2} />
          </Pressable>
          <Pressable android_ripple={{ color: 'rgba(91, 110, 91, 0.16)', borderless: true }} onPress={() => onOpenTab('belajar', { featureKey: 'notifications' })}>
            <Bell color={colors.muted} size={18} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <View style={styles.prayerCard}>
        <View style={styles.prayerTop}>
          <View>
            <Text style={styles.prayerKicker}>{`Menuju ${prayerKeyLabels[nextPrayer.key] || 'Sholat'}`}</Text>
            <Text style={styles.prayerTime}>{nextPrayer.time}</Text>
            {prayerMessage ? <Text style={styles.prayerMessage}>{prayerMessage}</Text> : null}
          </View>
          <View style={styles.countdown}>
            <Text style={styles.countdownText}>{`◷ -${nextPrayer.countdown}`}</Text>
          </View>
        </View>
        <View style={styles.prayerFooter}>
          <Text style={styles.trackerTitle}>Tracker hari ini</Text>
          <View style={styles.tracker}>
            {tracker.map((item) => (
              <View key={item.short} style={[styles.trackerDot, item.done ? styles.trackerDotDone : null]}>
                <Text style={[styles.trackerText, item.done ? styles.trackerTextDone : null]}>{item.short}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.trackerLegend}>S=Subuh · D=Dzuhur · A=Ashar · M=Maghrib · I=Isya</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map(({ Icon, featureKey, key, label, params }) => (
          <Pressable
            android_ripple={{ color: 'rgba(91, 110, 91, 0.14)', borderless: false }}
            key={label}
            onPress={() => onOpenTab(key, params ?? (featureKey ? { featureKey } : null))}
            style={styles.menuItem}
          >
            <View style={styles.menuIcon}>
              <Icon color={colors.primary} size={18} strokeWidth={2.1} />
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
        onPress={() => onOpenTab('belajar', { featureKey: 'muhasabah' })}
        style={styles.journalCard}
      >
        <View style={styles.journalIcon}>
          <Smile color={colors.primary} size={19} strokeWidth={2.1} />
        </View>
        <View style={styles.journalText}>
          <Text style={styles.journalTitle}>Jurnal Muhasabah</Text>
          <Text style={styles.journalDesc}>Bagaimana imanmu hari ini?</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <View style={styles.dailyCard}>
        <View style={styles.dailyHeader}>
          <Text style={styles.dailyTitle}>Bacaan Hari Ini</Text>
          <Text style={styles.dailyMeta}>Quran & Hadith</Text>
        </View>
        <Pressable
          android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
          onPress={() => onOpenTab('quran', { surahNumber: 1 })}
          style={styles.dailyItem}
        >
          <View style={styles.dailyAccent} />
          <View style={styles.dailyBody}>
            <Text style={styles.dailyLabel}>Ayat Hari Ini</Text>
            {dailyAyah?.arabic ? <Text style={styles.dailyArabic}>{dailyAyah.arabic}</Text> : null}
            <Text style={styles.dailyText}>
              {loadingDaily ? 'Memuat ayat harian...' : dailyAyah?.translation || dailyMessage || 'Ayat harian belum tersedia.'}
            </Text>
            {dailyAyah?.ref ? <Text style={styles.dailySource}>{dailyAyah.ref}</Text> : null}
          </View>
        </Pressable>
        <Pressable android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }} onPress={() => onOpenTab('hadith')} style={styles.dailyItem}>
          <View style={styles.dailyAccent} />
          <View style={styles.dailyBody}>
            <Text style={styles.dailyLabel}>Hadith Hari Ini</Text>
            {dailyHadith?.arabic ? <Text style={styles.dailyArabic}>{dailyHadith.arabic}</Text> : null}
            <Text style={styles.dailyText}>
              {loadingDaily
                ? 'Memuat hadith harian...'
                : dailyHadith?.translation || 'Hadith harian belum tersedia dari server.'}
            </Text>
            {dailyHadith?.book ? <Text style={styles.dailySource}>{dailyHadith.book}</Text> : null}
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  screen: {
    backgroundColor: colors.bg,
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: 16,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  avatarText: {
    color: colors.primary,
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '900',
  },
  name: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: 14,
    fontWeight: '900',
  },
  location: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  prayerCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.md,
    ...shadows.paper,
  },
  prayerTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  prayerKicker: {
    color: '#e6e2d6',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  prayerTime: {
    color: colors.onPrimary,
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  prayerMessage: {
    color: '#e6e2d6',
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
    maxWidth: 210,
  },
  countdown: {
    backgroundColor: 'rgba(44, 51, 44, 0.45)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  countdownText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  prayerFooter: {
    alignItems: 'center',
    borderTopColor: 'rgba(230, 226, 214, 0.25)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  trackerTitle: {
    color: '#e6e2d6',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  tracker: {
    flexDirection: 'row',
    gap: 4,
  },
  trackerDot: {
    alignItems: 'center',
    borderColor: 'rgba(230, 226, 214, 0.4)',
    borderRadius: 4,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  trackerDotDone: {
    backgroundColor: colors.onPrimary,
    borderColor: colors.onPrimary,
  },
  trackerText: {
    color: '#d8d2c4',
    fontSize: 12,
    fontWeight: '900',
  },
  trackerLegend: {
    color: '#e6e2d6',
    fontSize: 12,
    marginTop: spacing.sm,
  },
  trackerTextDone: {
    color: colors.primary,
  },
  menuGrid: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    ...shadows.paper,
  },
  menuItem: {
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '25%',
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 42,
  },
  menuLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  journalCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.paper,
  },
  journalIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  journalText: {
    flex: 1,
  },
  journalTitle: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: 14,
    fontWeight: '900',
  },
  journalDesc: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    color: colors.muted,
    fontSize: 24,
    fontWeight: '700',
  },
  dailyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    ...shadows.paper,
  },
  dailyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dailyTitle: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '900',
  },
  dailyMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  dailyItem: {
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  dailyAccent: {
    backgroundColor: colors.primary,
    width: 4,
  },
  dailyBody: {
    flex: 1,
    padding: spacing.md,
  },
  dailyLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  dailyArabic: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 30,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  dailyText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  dailySource: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
});
