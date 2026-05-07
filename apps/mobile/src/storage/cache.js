import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'tholabul:cache:';

export const cacheKeys = {
  surahs: 'surahs',
  hadiths: 'hadiths',
  prayerTimes: 'prayer-times',
};

const cacheLabels = {
  hadiths: 'Hadis',
  prayerTimes: 'Jadwal sholat',
  surahs: 'Quran',
};

export const cachePolicy = {
  clearScope: 'Hanya data sementara yang dihapus; paket offline utama tetap aman.',
  refresh: 'Saat data online berhasil dimuat, salinan sementara ikut diperbarui untuk membantu ketika jaringan bermasalah.',
};

const keyFor = (key) => `${CACHE_PREFIX}${key}`;

const matchesCacheKey = (storedKey, key) => storedKey === keyFor(key) || storedKey.startsWith(keyFor(`${key}:`));

export const writeCache = async (key, data) => {
  const entry = {
    data,
    savedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(keyFor(key), JSON.stringify(entry));
  return entry;
};

export const readCache = async (key, fallback) => {
  try {
    const value = await AsyncStorage.getItem(keyFor(key));
    if (!value) return fallback;

    const entry = JSON.parse(value);
    return entry?.data ?? fallback;
  } catch {
    return fallback;
  }
};

export const getCacheOverview = async () => {
  const storedKeys = await AsyncStorage.getAllKeys();
  const entries = await Promise.all(
    Object.entries(cacheKeys).map(async ([label, key]) => {
      try {
        const matchingKeys = storedKeys.filter((storedKey) => matchesCacheKey(storedKey, key));
        const rawEntries = await AsyncStorage.multiGet(matchingKeys.length ? matchingKeys : [keyFor(key)]);
        const parsedEntries = rawEntries
          .map(([, raw]) => {
            try {
              return raw ? JSON.parse(raw) : null;
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .sort((a, b) => new Date(b.savedAt ?? 0).getTime() - new Date(a.savedAt ?? 0).getTime());

        const latest = parsedEntries[0];
        if (!latest) return { label: cacheLabels[label] ?? label, key, savedAt: null, size: 0 };

        const data = latest?.data;
        const size = parsedEntries.length > 1 ? parsedEntries.length : Array.isArray(data) ? data.length : data ? Object.keys(data).length : 0;
        return { label: cacheLabels[label] ?? label, key, savedAt: latest?.savedAt ?? null, size };
      } catch {
        return { label: cacheLabels[label] ?? label, key, savedAt: null, size: 0 };
      }
    }),
  );

  return entries;
};

export const clearContentCache = async () => {
  const storedKeys = await AsyncStorage.getAllKeys();
  const keys = Object.values(cacheKeys).flatMap((key) =>
    storedKeys.filter((storedKey) => matchesCacheKey(storedKey, key)),
  );
  if (!keys.length) return;
  await AsyncStorage.multiRemove(keys);
};
