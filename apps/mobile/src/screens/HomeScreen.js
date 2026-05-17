import {
  Bell,
  Book,
  Bookmark,
  BookOpen,
  BookOpenCheck,
  ChevronRight,
  Clock3,
  Compass,
  FileText,
  Globe,
  Grid,
  HelpCircle,
  ListChecks,
  MessageCircle,
  Moon,
  Scale,
  Search,
  Smile,
  Star,
  Sun,
  Sunset,
  Users,
  Video,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getDailyAyah, getDailyHadith, getHijriToday, getPrayerTimes } from '../api/client';
import { ContentCard } from '../components/ContentCard';
import { DetailHeader } from '../components/DetailHeader';
import { useSession } from '../context/SessionContext';
import { useTabActivity } from '../context/TabActivityContext';
import { GlobalSearchScreen } from './GlobalSearchScreen';
import { featureGroups } from '../data/mobileFeatures';
import { arabicTypography } from '../styles/arabicTypography';
import { readPinnedFeatures, readRecentFeatures } from '../storage/recentFeatures';
import { colors, radius, shadows, spacing } from '../theme';

const prayerKeyLabels = {
  asr: 'Ashar',
  dhuhr: 'Dzuhur',
  fajr: 'Subuh',
  isha: 'Isya',
  maghrib: 'Maghrib',
};

const prayerScheduleItems = [
  { Icon: Moon, key: 'fajr', label: 'Subuh' },
  { Icon: Sun, key: 'sunrise', label: 'Terbit' },
  { Icon: Sun, key: 'dhuhr', label: 'Dzuhur' },
  { Icon: Sunset, key: 'asr', label: 'Ashar' },
  { Icon: Sunset, key: 'maghrib', label: 'Maghrib' },
  { Icon: Moon, key: 'isha', label: 'Isya' },
];

const homeDateFormatOptions = {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
  year: 'numeric',
};

const formatGregorianHomeDate = (date) => {
  try {
    return new Intl.DateTimeFormat('id-ID', homeDateFormatOptions).format(date);
  } catch {
    return date.toLocaleDateString();
  }
};

const formatFallbackHijriHomeDate = (date) => {
  const locales = ['id-ID-u-ca-islamic-umalqura', 'id-ID-u-ca-islamic'];
  for (const locale of locales) {
    try {
      const formatter = new Intl.DateTimeFormat(locale, homeDateFormatOptions);
      if (formatter.resolvedOptions().calendar !== 'gregory') {
        return formatter.format(date);
      }
    } catch {
      // Some React Native runtimes do not ship non-Gregorian Intl calendars.
    }
  }
  return 'Tanggal Hijriah belum tersedia';
};

const formatHijriHomeDate = (hijri, fallbackDate) => {
  if (hijri?.dateStr) return hijri.dateStr;
  const parts = [
    hijri?.day,
    hijri?.monthName,
    hijri?.year ? `${hijri.year} H` : hijri?.yearStr,
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : formatFallbackHijriHomeDate(fallbackDate);
};

const menuItems = [
  { Icon: Compass, key: 'ibadah', label: 'Kiblat', params: { view: 'qibla' } },
  { Icon: BookOpenCheck, key: 'quran', label: 'Hafalan' },
  { Icon: Smile, featureKey: 'muhasabah', key: 'belajar', label: 'Jurnal' },
  { Icon: HelpCircle, featureKey: 'quiz', key: 'belajar', label: 'Kuis' },
  { Icon: Video, featureKey: 'kajian', key: 'belajar', label: 'Kajian' },
  { Icon: FileText, featureKey: 'tafsir', key: 'belajar', label: 'Tafsir' },
  { Icon: Book, key: 'hadith', label: 'Hadis' },
  { Icon: Grid, internalView: 'feature-directory', key: 'belajar', label: 'Lainnya' },
];
const featureDirectoryReturnTo = { tab: 'home', view: 'feature-directory' };

const scheduleOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const featureDirectoryIcons = {
  amalan: ListChecks,
  'asbabun-nuzul': BookOpen,
  'asmaul-husna': Star,
  blog: BookOpen,
  bookmarks: Bookmark,
  'community-feed': MessageCircle,
  doa: BookOpen,
  dzikir: ListChecks,
  faraidh: Users,
  fiqh: BookOpen,
  goals: Star,
  hafalan: BookOpenCheck,
  hijri: Star,
  imsakiyah: Clock3,
  'jarh-tadil': Scale,
  kajian: Video,
  kamus: Search,
  leaderboard: Users,
  manasik: BookOpen,
  muhasabah: Smile,
  murojaah: BookOpenCheck,
  notes: FileText,
  notifications: Bell,
  'panduan-sholat': BookOpen,
  perawi: Users,
  quiz: HelpCircle,
  sejarah: Globe,
  siroh: Users,
  stats: Globe,
  tafsir: FileText,
  tahlil: Book,
  tilawah: BookOpen,
  'sholat-tracker': Compass,
  tasbih: ListChecks,
  'user-wird': ListChecks,
  wirid: ListChecks,
  zakat: Scale,
};

const toSeconds = (timeValue) => {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(`${timeValue ?? ''}`);
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3] ?? 0);
};

const formatCountdown = (secondsDelta) => {
  const hours = `${Math.floor(secondsDelta / 3600)}`.padStart(2, '0');
  const minutes = `${Math.floor((secondsDelta % 3600) / 60)}`.padStart(2, '0');
  const seconds = `${secondsDelta % 60}`.padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const formatPrayerSummary = (nextPrayer, hasPrayerSchedule) => {
  if (!hasPrayerSchedule) return 'Jadwal adzan belum aktif untuk lokasimu.';

  const label = prayerKeyLabels[nextPrayer.key] || 'Sholat';
  const [hoursText, minutesText] = `${nextPrayer.countdown ?? ''}`.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return `Menuju ${label}`;
  }

  if (hours > 0) {
    return `${label} dalam ${hours} jam ${minutes} menit`;
  }

  return `${label} dalam ${minutes} menit`;
};

const formatHadisSource = (value = '') => {
  if (!value) return '';
  return value.replace(/\bHadith\b/g, 'Hadis');
};

const locationErrorLabels = new Set(['LOKASI NONAKTIF', 'LOKASI BELUM TERSEDIA']);

const getHomeLocationLabel = async (coords) => {
  try {
    const places = await Location.reverseGeocodeAsync(coords);
    const place = places?.[0];
    const city = place?.city || place?.subregion || place?.district || place?.region;
    return (city || 'Lokasi aktif').toUpperCase();
  } catch {
    return 'LOKASI AKTIF';
  }
};

const resolvePrayerState = (prayers, now = new Date()) => {
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const decorated = scheduleOrder
    .map((key) => ({
      key,
      label: prayerKeyLabels[key],
      seconds: toSeconds(prayers?.[key]),
      time: prayers?.[key] ?? '--:--',
    }))
    .filter((item) => item.seconds !== null);

  if (!decorated.length) {
    return { countdown: '--:--:--', key: 'asr', time: '--:--' };
  }

  let target = decorated.find((item) => item.seconds > currentSeconds);
  let delta = 0;

  if (target) {
    delta = target.seconds - currentSeconds;
  } else {
    target = decorated[0];
    delta = 86400 - currentSeconds + target.seconds;
  }

  return {
    countdown: formatCountdown(delta),
    key: target.key,
    time: target.time,
  };
};

export function HomeScreen({ isActive, navigation, onOpenTab }) {
  const { user } = useSession();
  const { notifyTabActivity } = useTabActivity();
  const mountedRef = useRef(true);
  const [dailyHadith, setDailyHadith] = useState(null);
  const [dailyAyah, setDailyAyah] = useState(null);
  const [dateSnapshot, setDateSnapshot] = useState(() => new Date());
  const [hijriDate, setHijriDate] = useState('Memuat tanggal Hijriah');
  const [locationLabel, setLocationLabel] = useState('Memuat lokasi');
  const [nextPrayer, setNextPrayer] = useState({ countdown: '--:--:--', key: 'asr', time: '--:--' });
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyMessage, setDailyMessage] = useState('');
  const [prayerMessage, setPrayerMessage] = useState('');
  const [pinnedFeatures, setPinnedFeatures] = useState([]);
  const [recentFeatures, setRecentFeatures] = useState([]);
  const handleScrollActivity = useCallback(() => {
    notifyTabActivity();
  }, [notifyTabActivity]);
  const contextualShortcuts = useMemo(() => {
    const hour = new Date().getHours();
    const items = [];

    if (hour >= 4 && hour < 12) {
      items.push({ Icon: Sun, featureKey: 'dzikir', label: 'Dzikir Pagi', sub: 'Pagi hari', tab: 'belajar' });
    } else if (hour >= 15 && hour < 20) {
      items.push({ Icon: Sunset, featureKey: 'dzikir', label: 'Dzikir Petang', sub: "Ba'da Ashar", tab: 'belajar' });
    }

    const locationActive =
      locationLabel !== 'LOKASI NONAKTIF' &&
      locationLabel !== 'Memuat lokasi' &&
      locationLabel !== 'LOKASI BELUM TERSEDIA';
    if (locationActive) {
      items.push({ Icon: Compass, label: 'Kiblat', params: { view: 'qibla' }, sub: locationLabel, tab: 'ibadah' });
    }

    if (recentFeatures.some((f) => f.key === 'quran')) {
      items.push({ Icon: FileText, featureKey: 'tafsir', label: 'Tafsir', sub: 'Setelah tilawah', tab: 'belajar' });
    }

    return items.slice(0, 3);
  }, [locationLabel, recentFeatures]);
  const directoryGroups = useMemo(() => {
    const primaryRows = [
      { Icon: Search, key: 'global-search', subtitle: 'Cari lintas Quran, Hadis, Doa, Kajian', title: 'Global Search', type: 'internal', view: 'global-search' },
      { Icon: BookOpen, key: 'quran', subtitle: 'Baca surah, hafalan, dan murojaah', title: "Al-Qur'an", type: 'tab', tab: 'quran' },
      { Icon: Book, key: 'hadith', subtitle: 'Baca hadis beserta sanad dan perawi', title: 'Hadis', type: 'tab', tab: 'hadith' },
      { Icon: Compass, key: 'qibla', subtitle: 'Arah kiblat, tracker, dan jadwal ibadah', title: 'Ibadah', type: 'tab', tab: 'ibadah', params: { view: 'qibla' } },
      { Icon: Bell, key: 'notifications', subtitle: 'Inbox, reminder, dan pengingat ibadah', title: 'Notifikasi', type: 'feature', featureKey: 'notifications' },
    ];

    const groupedFeatures = featureGroups.map((group) => ({
      key: group.key,
      label: group.label,
      rows: group.features.map((feature) => ({
        Icon: featureDirectoryIcons[feature.key] ?? Book,
        key: feature.key,
        subtitle: feature.subtitle || group.label,
        title: feature.title,
        type: 'feature',
        featureKey: feature.key,
      })),
    }));

    return [
      { key: 'utama', label: 'Utama', rows: primaryRows },
      ...groupedFeatures,
    ];
  }, []);

  const displayName = user?.name || 'Tamu';
  const hasPrayerSchedule = nextPrayer.time !== '--:--' && nextPrayer.countdown !== '--:--:--';
  const gregorianDate = useMemo(() => formatGregorianHomeDate(dateSnapshot), [dateSnapshot]);
  const prayerSummary = useMemo(
    () => formatPrayerSummary(nextPrayer, hasPrayerSchedule),
    [hasPrayerSchedule, nextPrayer],
  );
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const loadHomeData = useCallback(async ({ refresh = false } = {}) => {
    const currentDate = new Date();
    setDateSnapshot(currentDate);

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoadingDaily(true);
    }
    setDailyMessage('');
    setPrayerMessage('');
    let coords = null;

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === 'granted') {
        let position = null;
        try {
          position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        } catch {
          position = await Location.getLastKnownPositionAsync({
            maxAge: 10 * 60 * 1000,
            requiredAccuracy: 5000,
          });
        }

        if (position?.coords) {
          coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          const label = await getHomeLocationLabel(coords);
          if (mountedRef.current) setLocationLabel(label);
        } else if (mountedRef.current) {
          setLocationLabel('LOKASI BELUM TERSEDIA');
          setPrayerMessage('Lokasi belum terbaca. Tarik untuk memuat ulang jadwal sholat.');
        }
      } else if (mountedRef.current) {
        setLocationLabel('LOKASI NONAKTIF');
        setPrayerMessage('Aktifkan lokasi untuk melihat jadwal sholat di tempatmu.');
      }
    } catch {
      if (mountedRef.current) {
        setLocationLabel('LOKASI BELUM TERSEDIA');
        setPrayerMessage('Lokasi belum terbaca. Coba aktifkan GPS lalu tarik untuk memuat ulang.');
      }
    }

    const [hadithResult, ayahResult, hijriResult, prayersResult] = await Promise.allSettled([
      getDailyHadith(),
      getDailyAyah(),
      getHijriToday(),
      coords ? getPrayerTimes({ ...coords, madhab: 'shafi', method: 'kemenag' }) : Promise.resolve(null),
    ]);

    if (!mountedRef.current) return;

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

    if (hijriResult.status === 'fulfilled') {
      setHijriDate(formatHijriHomeDate(hijriResult.value, currentDate));
    } else {
      setHijriDate(formatFallbackHijriHomeDate(currentDate));
    }

    if (prayersResult.status === 'fulfilled' && prayersResult.value) {
      setPrayerTimes(prayersResult.value);
      setNextPrayer(resolvePrayerState(prayersResult.value));
    } else {
      setPrayerTimes(null);
      setNextPrayer({ countdown: '--:--:--', key: 'asr', time: '--:--' });
      if (coords) {
        setPrayerMessage('Jadwal sholat belum tersedia. Coba muat ulang beberapa saat lagi.');
      }
    }

    if (mountedRef.current) {
      setLoadingDaily(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadHomeData();

    return () => {
      mountedRef.current = false;
    };
  }, [loadHomeData]);

  useEffect(() => {
    if (!prayerTimes) return undefined;

    const updateCountdown = () => {
      setNextPrayer(resolvePrayerState(prayerTimes));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  useEffect(() => {
    if (!isActive) return;
    let mounted = true;

    if (locationErrorLabels.has(locationLabel)) {
      loadHomeData({ refresh: true });
    }

    Promise.all([readPinnedFeatures(), readRecentFeatures()]).then(([pinnedItems, recentItems]) => {
      if (!mounted) return;
      setPinnedFeatures(pinnedItems.slice(0, 4));
      setRecentFeatures(recentItems.slice(0, 3));
    });

    return () => {
      mounted = false;
    };
  }, [isActive, loadHomeData, locationLabel]);

  useEffect(() => {
    const activeView = navigation?.current?.view;
    if (!isActive || (activeView !== 'global-search' && activeView !== 'feature-directory')) {
      return undefined;
    }

    navigation?.setBack?.(() => {
      navigation?.close?.('home');
      return true;
    });

    return () => {
      navigation?.clearBack?.();
    };
  }, [isActive, navigation, navigation?.current?.view]);

  const openDirectoryRow = useCallback((row) => {
    if (row.type === 'internal' && row.view) {
      navigation?.open?.('home', row.view, { returnTo: featureDirectoryReturnTo, returnTab: null });
      return;
    }
    if (row.type === 'tab' && row.tab) {
      const params = {
        ...(row.params ?? {}),
        returnTo: featureDirectoryReturnTo,
      };
      if (navigation?.closeAndOpen) {
        navigation.closeAndOpen('home', row.tab, params);
      } else {
        navigation?.close?.('home');
        onOpenTab(row.tab, params);
      }
      return;
    }
    if (row.type === 'feature' && row.featureKey) {
      const params = {
        featureKey: row.featureKey,
        returnTo: featureDirectoryReturnTo,
      };
      if (navigation?.closeAndOpen) {
        navigation.closeAndOpen('home', 'belajar', params);
      } else {
        navigation?.close?.('home');
        onOpenTab('belajar', params);
      }
    }
  }, [navigation, onOpenTab]);

  if (navigation?.current?.view === 'global-search') {
    return (
      <GlobalSearchScreen
        initialFilter={navigation?.current?.params?.filter ?? 'all'}
        initialQuery={navigation?.current?.params?.query ?? ''}
        onBack={() => navigation?.close?.('home')}
        onOpenTab={(tab, params) => {
          if (navigation?.closeAndOpen) {
            navigation.closeAndOpen('home', tab, params);
          } else {
            navigation?.close?.('home');
            onOpenTab(tab, params);
          }
        }}
      />
    );
  }

  if (navigation?.current?.view === 'feature-directory') {
    return (
      <ScrollView
        contentContainerStyle={styles.directoryScreen}
        onMomentumScrollBegin={handleScrollActivity}
        onScroll={handleScrollActivity}
        onScrollBeginDrag={handleScrollActivity}
        scrollEventThrottle={250}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <DetailHeader
          onBack={() => navigation?.close?.('home')}
          subtitle="Pilih fitur berdasarkan kategori"
          title="Semua Fitur"
        />
        {directoryGroups.map((group) => (
          <View key={group.key} style={styles.directoryGroup}>
            <Text style={styles.directoryGroupTitle}>{group.label}</Text>
            {group.rows.map((row) => (
              <ContentCard
                Icon={row.Icon}
                iconSize={16}
                iconStyle={styles.directoryIcon}
                iconStrokeWidth={2.2}
                key={`${group.key}:${row.key}`}
                onPress={() => openDirectoryRow(row)}
                style={styles.directoryRow}
                subtitle={row.subtitle}
                subtitleStyle={styles.directoryRowSubtitle}
                title={row.title}
                titleStyle={styles.directoryRowTitle}
                trailing={<ChevronRight color={colors.muted} size={18} strokeWidth={2.3} />}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    );
  }
  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      onMomentumScrollBegin={handleScrollActivity}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={() => loadHomeData({ refresh: true })}
          refreshing={refreshing}
          tintColor={colors.primary}
        />
      }
      onScroll={handleScrollActivity}
      onScrollBeginDrag={handleScrollActivity}
      scrollEventThrottle={250}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
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
            onPress={() => {
              if (navigation?.open) {
                navigation.open('home', 'global-search');
              } else {
                onOpenTab('belajar', { featureKey: 'kamus', focusSearch: true });
              }
            }}
          >
            <Search color={colors.muted} size={18} strokeWidth={2.2} />
          </Pressable>
          <Pressable android_ripple={{ color: 'rgba(91, 110, 91, 0.16)', borderless: true }} onPress={() => onOpenTab('belajar', { featureKey: 'notifications' })}>
            <Bell color={colors.muted} size={18} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <View style={styles.prayerCard}>
        <View style={styles.prayerHeader}>
          <View style={styles.locationPill}>
            <Compass color={colors.primary} size={13} strokeWidth={2.4} />
            <Text style={styles.locationPillText}>{locationLabel}</Text>
          </View>
          <View style={styles.prayerDateStack}>
            <Text style={styles.gregorianDate}>{gregorianDate}</Text>
            <View style={styles.hijriRow}>
              <Moon color={colors.accent} size={13} strokeWidth={2.3} />
              <Text style={styles.hijriDate}>{hijriDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.prayerHero}>
          <Text style={styles.prayerKicker}>{`Menuju ${prayerKeyLabels[nextPrayer.key] || 'Sholat'}`}</Text>
          <Text style={styles.prayerTime}>{nextPrayer.time}</Text>
          <Text style={styles.prayerSummary}>{prayerMessage || prayerSummary}</Text>
          <View style={styles.countdown}>
            <Clock3 color={colors.primary} size={13} strokeWidth={2.4} />
            <Text style={styles.countdownText}>{hasPrayerSchedule ? nextPrayer.countdown : 'Belum aktif'}</Text>
          </View>
        </View>

        <View style={styles.prayerTimeline} />
        <View style={styles.prayerScheduleRow}>
          {prayerScheduleItems.map(({ Icon, key, label }) => {
            const isNext = key === nextPrayer.key && hasPrayerSchedule;
            return (
              <View key={key} style={styles.prayerScheduleItem}>
                <Text style={[styles.prayerScheduleLabel, isNext ? styles.prayerScheduleActive : null]}>{label}</Text>
                <Icon
                  color={isNext ? colors.accent : colors.primary}
                  size={16}
                  strokeWidth={2.2}
                />
                <Text style={[styles.prayerScheduleTime, isNext ? styles.prayerScheduleActive : null]}>
                  {prayerTimes?.[key] ?? '--:--'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map(({ Icon, featureKey, internalView, key, label, params }) => (
          <Pressable
            android_ripple={{ color: 'rgba(91, 110, 91, 0.14)', borderless: false }}
            key={label}
            onPress={() => {
              if (internalView && navigation?.open) {
                navigation.open('home', internalView);
                return;
              }
              onOpenTab(key, params ?? (featureKey ? { featureKey } : null));
            }}
            style={styles.menuItem}
          >
            <View style={styles.menuIcon}>
              <Icon color={colors.primary} size={18} strokeWidth={2.1} />
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.dailyCard}>
        <View style={styles.dailyHeader}>
          <Text style={styles.dailyTitle}>Bacaan Hari Ini</Text>
          <Text style={styles.dailyMeta}>Quran & Hadis</Text>
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
            <Text style={styles.dailyLabel}>Hadis Hari Ini</Text>
            {dailyHadith?.arabic ? <Text style={styles.dailyArabic}>{dailyHadith.arabic}</Text> : null}
            <Text style={styles.dailyText}>
              {loadingDaily
                ? 'Memuat hadis harian...'
                : dailyHadith?.translation || 'Hadis harian belum tersedia dari server.'}
            </Text>
            {dailyHadith?.book ? <Text style={styles.dailySource}>{formatHadisSource(dailyHadith.book)}</Text> : null}
          </View>
        </Pressable>
      </View>

      {contextualShortcuts.length ? (
        <View style={styles.contextCard}>
          <Text style={styles.contextLabel}>SARAN SEKARANG</Text>
          <View style={styles.contextRow}>
            {contextualShortcuts.map(({ Icon, featureKey, label, params, sub, tab }) => (
              <Pressable
                android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                key={label}
                onPress={() => onOpenTab(tab, params ?? (featureKey ? { featureKey } : null))}
                style={styles.contextItem}
              >
                <View style={styles.contextIcon}>
                  <Icon color={colors.primary} size={16} strokeWidth={2.2} />
                </View>
                <Text style={styles.contextItemLabel}>{label}</Text>
                <Text style={styles.contextItemSub}>{sub}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {pinnedFeatures.length ? (
        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <View>
              <Text style={styles.recentTitle}>Disematkan</Text>
              <Text style={styles.recentMeta}>Shortcut fitur pilihanmu</Text>
            </View>
            <Star color={colors.primary} size={18} strokeWidth={2.2} />
          </View>
          {pinnedFeatures.map((feature) => (
            <ContentCard
              Icon={Star}
              iconStyle={styles.recentIcon}
              key={feature.key}
              onPress={() => onOpenTab('belajar', { featureKey: feature.key })}
              style={styles.recentRow}
              subtitle={feature.subtitle || feature.group || 'Belajar'}
              subtitleStyle={styles.recentRowSubtitle}
              title={feature.title}
              titleStyle={styles.recentRowTitle}
              trailing={<ChevronRight color={colors.muted} size={18} strokeWidth={2.4} />}
            />
          ))}
        </View>
      ) : null}

      {recentFeatures.length ? (
        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <View>
              <Text style={styles.recentTitle}>Terakhir Dibuka</Text>
              <Text style={styles.recentMeta}>Lanjutkan fitur yang baru kamu pakai</Text>
            </View>
            <Clock3 color={colors.primary} size={18} strokeWidth={2.2} />
          </View>
          {recentFeatures.map((feature) => (
            <ContentCard
              Icon={Clock3}
              iconStyle={styles.recentIcon}
              key={feature.key}
              onPress={() => onOpenTab('belajar', { featureKey: feature.key })}
              style={styles.recentRow}
              subtitle={feature.subtitle || feature.group || 'Belajar'}
              subtitleStyle={styles.recentRowSubtitle}
              title={feature.title}
              titleStyle={styles.recentRowTitle}
              trailing={<ChevronRight color={colors.muted} size={18} strokeWidth={2.4} />}
            />
          ))}
        </View>
      ) : null}

      <ContentCard
        Icon={Smile}
        iconStyle={styles.journalIcon}
        onPress={() => onOpenTab('belajar', { featureKey: 'muhasabah' })}
        style={styles.journalCard}
        subtitle="Bagaimana imanmu hari ini?"
        subtitleStyle={styles.journalDesc}
        title="Jurnal Muhasabah"
        titleStyle={styles.journalTitle}
        trailing={<ChevronRight color={colors.muted} size={18} strokeWidth={2.4} />}
      />

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
  directoryScreen: {
    backgroundColor: colors.bg,
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  directoryGroup: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  directoryGroupTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    textTransform: 'uppercase',
  },
  directoryRow: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    borderWidth: 0,
    borderRadius: 0,
    marginTop: 0,
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  directoryIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  directoryRowTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  directoryRowSubtitle: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
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
  prayerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  locationPill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderWidth: 1,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    maxWidth: '48%',
  },
  locationPillText: {
    color: colors.primary,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  prayerDateStack: {
    alignItems: 'flex-end',
    flex: 1,
    gap: 5,
  },
  gregorianDate: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  hijriRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'flex-end',
  },
  hijriDate: {
    color: colors.accent,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  prayerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderWidth: 1,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    ...shadows.paper,
  },
  prayerKicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  prayerHero: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  prayerTime: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: 42,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  prayerSummary: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 2,
    textAlign: 'center',
  },
  countdown: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderWidth: 1,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 4,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  countdownText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  prayerTimeline: {
    backgroundColor: colors.faint,
    height: 1,
    marginBottom: spacing.sm,
    width: '100%',
  },
  prayerScheduleRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  prayerScheduleItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  prayerScheduleLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  prayerScheduleTime: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  prayerScheduleActive: {
    color: colors.accent,
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
  contextCard: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.paper,
  },
  contextLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  contextRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contextItem: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingVertical: spacing.md,
  },
  contextIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  contextItemLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  contextItemSub: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
  },
  recentCard: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.paper,
  },
  recentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  recentTitle: {
    color: colors.ink,
    fontFamily: 'serif',
    fontSize: 14,
    fontWeight: '900',
  },
  recentMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  recentRow: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.sm,
  },
  recentIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  recentRowTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  recentRowSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
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
  dailyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
    ...arabicTypography.small,
    color: colors.ink,
    marginTop: spacing.xs,
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
