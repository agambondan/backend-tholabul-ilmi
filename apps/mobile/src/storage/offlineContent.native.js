import { normalizeAyah, normalizeHadith, normalizeSurah, pickItems, requestJson } from '../api/client';
import { getBookmarks } from '../api/personal';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'tholabul_offline.db';
const DAILY_TYPES = ['doa', 'dzikir', 'wirid', 'tahlil'];
const MAIN_PACK_TYPES = ['quran_surah', 'quran_ayah', 'hadith'];
const HADITH_PAGE_SIZE = 100;
const HADITH_MAX_PAGES = 20;
const PRAYER_PACK_DAYS = 30;

let dbPromise;

const emptyOverview = (extra = {}) => ({
  supported: false,
  bookmarkSnapshots: 0,
  dailyItems: 0,
  quranSurahs: 0,
  quranAyahs: 0,
  hadiths: 0,
  prayerDays: 0,
  savedAt: null,
  ...extra,
});

const openDb = async () => {
  if (!dbPromise) {
    dbPromise = (async () => {
      if (!SQLite?.openDatabaseAsync) {
        throw new Error('Mode offline belum tersedia di perangkat ini.');
      }

      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS offline_items (
          key TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL,
          payload TEXT NOT NULL,
          saved_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_offline_items_type ON offline_items(type);
        CREATE TABLE IF NOT EXISTS offline_meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          saved_at TEXT NOT NULL
        );
      `);
      return db;
    })();
  }

  return dbPromise;
};

const countByType = async (db, type) => {
  const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM offline_items WHERE type = ?', [type]);
  return Number(row?.count ?? 0);
};

const getMeta = async (db, key) => {
  const row = await db.getFirstAsync('SELECT value, saved_at FROM offline_meta WHERE key = ?', [key]);
  if (!row) return null;

  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
};

const setMeta = async (db, key, value, savedAt) => {
  await db.runAsync(
    'INSERT OR REPLACE INTO offline_meta (key, value, saved_at) VALUES (?, ?, ?)',
    [key, JSON.stringify(value), savedAt],
  );
};

const upsertItem = async (db, type, key, payload, savedAt) => {
  await db.runAsync(
    'INSERT OR REPLACE INTO offline_items (key, type, payload, saved_at) VALUES (?, ?, ?, ?)',
    [key, type, JSON.stringify(payload), savedAt],
  );
};

const deleteItemTypes = async (db, types) => {
  if (!types.length) return;

  await db.runAsync(
    `DELETE FROM offline_items WHERE type IN (${types.map(() => '?').join(',')})`,
    types,
  );
};

export const getOfflineOverview = async () => {
  try {
    const db = await openDb();
    const [quranSurahs, quranAyahs, hadiths, prayerDays, bookmarkSnapshots, meta, ...dailyCounts] = await Promise.all([
      countByType(db, 'quran_surah'),
      countByType(db, 'quran_ayah'),
      countByType(db, 'hadith'),
      countByType(db, 'prayer_day'),
      countByType(db, 'bookmark_snapshot'),
      getMeta(db, 'offline_pack'),
      ...DAILY_TYPES.map((type) => countByType(db, type)),
    ]);

    return {
      supported: true,
      bookmarkSnapshots,
      dailyItems: dailyCounts.reduce((total, count) => total + count, 0),
      quranSurahs,
      quranAyahs,
      hadiths,
      prayerDays,
      savedAt: meta?.savedAt ?? null,
    };
  } catch (error) {
    return emptyOverview({ error: error?.message ?? 'Mode offline belum tersedia di perangkat ini.' });
  }
};

export const getPrayerOfflineOverview = async ({ lat, lng, method = 'kemenag', madhab = 'shafi' } = {}) => {
  try {
    const db = await openDb();
    const locationKey = prayerLocationKey({ lat, lng, method, madhab });
    const [row, meta] = await Promise.all([
      db.getFirstAsync(
        'SELECT COUNT(*) AS count FROM offline_items WHERE type = ? AND key LIKE ?',
        ['prayer_day', `prayer:${locationKey}:%`],
      ),
      getMeta(db, `prayer_pack:${locationKey}`),
    ]);

    return {
      days: Number(row?.count ?? 0),
      locationKey,
      savedAt: meta?.savedAt ?? null,
      supported: true,
    };
  } catch (error) {
    return {
      days: 0,
      error: error?.message ?? 'Mode offline belum tersedia di perangkat ini.',
      locationKey: null,
      savedAt: null,
      supported: false,
    };
  }
};

export const clearOfflinePack = async () => {
  const db = await openDb();
  await deleteItemTypes(db, MAIN_PACK_TYPES);
  await db.runAsync('DELETE FROM offline_meta WHERE key = ?', ['offline_pack']);
  return getOfflineOverview();
};

export const clearPrayerOfflinePack = async ({ lat, lng, method = 'kemenag', madhab = 'shafi' } = {}) => {
  const db = await openDb();
  const locationKey = prayerLocationKey({ lat, lng, method, madhab });
  await db.runAsync(
    'DELETE FROM offline_items WHERE type = ? AND key LIKE ?',
    ['prayer_day', `prayer:${locationKey}:%`],
  );
  await db.runAsync('DELETE FROM offline_meta WHERE key = ?', [`prayer_pack:${locationKey}`]);
  return getPrayerOfflineOverview({ lat, lng, method, madhab });
};

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const roundedCoord = (value) => Number(value ?? 0).toFixed(3);

const prayerLocationKey = ({ lat, lng, method = 'kemenag', madhab = 'shafi' }) =>
  `${method}:${madhab}:${roundedCoord(lat)}:${roundedCoord(lng)}`;

const normalizePrayerDay = (payload, fallbackDate) => {
  const data = payload?.data ?? payload;
  return {
    date: data?.date ?? fallbackDate,
    lat: data?.lat,
    lng: data?.lng,
    madhab: data?.madhab,
    method: data?.method,
    prayers: data?.prayers ?? data,
  };
};

const pickText = (...values) => values.find((value) => typeof value === 'string' && value.trim()) ?? '';

const normalizeDailyItem = (item, type, index = 0) => {
  const translation = item?.translation ?? {};
  return {
    arabic: pickText(translation.arab, translation.ar, item?.arabic, item?.arab, item?.text_arab),
    body: pickText(
      translation.text_en,
      translation.text_idn,
      translation.en,
      translation.idn,
      translation.text,
      item?.content,
      item?.description,
      item?.meaning,
      item?.answer,
      item?.text,
      item?.body,
    ),
    id: item?.id ?? item?.number ?? item?.slug ?? `${type}-${index + 1}`,
    meta: pickText(item?.category, item?.occasion, item?.source, item?.type),
    raw: item,
    title:
      pickText(
        translation.title_en,
        translation.title_idn,
        translation.latin_en,
        translation.latin_idn,
        translation.name_en,
        translation.name_idn,
        item?.title,
        item?.name,
        item?.latin,
        item?.slug,
      ) || `${type} ${index + 1}`,
    type,
  };
};

const dailySources = [
  { endpoint: '/api/v1/doa?page=0&size=200', type: 'doa' },
  { endpoint: '/api/v1/dzikir?page=0&size=200', type: 'dzikir' },
  { endpoint: '/api/v1/wirid', type: 'wirid' },
  { endpoint: '/api/v1/tahlil', type: 'tahlil' },
];

export const buildDailyOfflinePack = async ({ onProgress } = {}) => {
  const db = await openDb();
  const savedAt = new Date().toISOString();
  let total = 0;

  for (let index = 0; index < dailySources.length; index += 1) {
    const source = dailySources[index];
    onProgress?.({
      label: `Mengunduh ${source.type}`,
      value: Math.round((index / dailySources.length) * 100),
    });
    const payload = await requestJson(source.endpoint);
    const items = pickItems(payload).map((item, itemIndex) => normalizeDailyItem(item, source.type, itemIndex));
    await db.runAsync('DELETE FROM offline_items WHERE type = ?', [source.type]);
    for (const item of items) {
      await upsertItem(db, source.type, `${source.type}:${item.id}`, item, savedAt);
    }
    total += items.length;
  }

  await setMeta(db, 'daily_pack', { savedAt, total }, savedAt);
  onProgress?.({ label: 'Paket harian offline siap', value: 100 });
  return getOfflineOverview();
};

export const saveBookmarkSnapshot = async () => {
  const db = await openDb();
  const savedAt = new Date().toISOString();
  const bookmarks = await getBookmarks();
  await db.runAsync('DELETE FROM offline_items WHERE type = ?', ['bookmark_snapshot']);
  for (const bookmark of bookmarks) {
    await upsertItem(db, 'bookmark_snapshot', `bookmark:${bookmark.id ?? `${bookmark.ref_type}:${bookmark.ref_id}`}`, bookmark, savedAt);
  }
  await setMeta(db, 'bookmark_snapshot', { count: bookmarks.length, savedAt }, savedAt);
  return getOfflineOverview();
};

export const buildPrayerOfflinePack = async ({
  days = PRAYER_PACK_DAYS,
  lat,
  lng,
  madhab = 'shafi',
  method = 'kemenag',
  onProgress,
} = {}) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('Lokasi dibutuhkan sebelum menyimpan jadwal sholat.');
  }

  const db = await openDb();
  const savedAt = new Date().toISOString();
  const locationKey = prayerLocationKey({ lat, lng, method, madhab });
  const totalDays = Math.max(1, days);

  for (let index = 0; index < totalDays; index += 1) {
    const date = dateKey(new Date(Date.now() + index * 24 * 60 * 60 * 1000));
    onProgress?.({
      label: `Mengunduh jadwal sholat ${index + 1}/${totalDays}`,
      value: Math.round((index / totalDays) * 100),
    });
    const payload = await requestJson(
      `/api/v1/sholat-times?lat=${lat}&lng=${lng}&method=${method}&madhab=${madhab}&date=${date}`,
    );
    await upsertItem(
      db,
      'prayer_day',
      `prayer:${locationKey}:${date}`,
      normalizePrayerDay(payload, date),
      savedAt,
    );
  }

  await setMeta(db, `prayer_pack:${locationKey}`, { days: totalDays, locationKey, savedAt }, savedAt);
  onProgress?.({ label: 'Jadwal sholat 30 hari siap', value: 100 });
  return getPrayerOfflineOverview({ lat, lng, method, madhab });
};

export const getOfflinePrayerForDate = async ({
  date = dateKey(new Date()),
  lat,
  lng,
  madhab = 'shafi',
  method = 'kemenag',
} = {}) => {
  const db = await openDb();
  const locationKey = prayerLocationKey({ lat, lng, method, madhab });
  const row = await db.getFirstAsync('SELECT payload FROM offline_items WHERE type = ? AND key = ?', [
    'prayer_day',
    `prayer:${locationKey}:${date}`,
  ]);
  if (!row?.payload) return null;

  try {
    return JSON.parse(row.payload)?.prayers ?? null;
  } catch {
    return null;
  }
};

const saveQuranPack = async ({ db, onProgress, savedAt }) => {
  onProgress?.({ label: 'Mengunduh daftar surah', phase: 'quran', value: 0 });
  const surahPayload = await requestJson('/api/v1/surah?size=114&sort=number');
  const surahs = pickItems(surahPayload).map(normalizeSurah).filter((item) => item.number);
  let ayahCount = 0;

  for (const surah of surahs) {
    await upsertItem(db, 'quran_surah', `surah:${surah.number}`, surah, savedAt);
  }

  for (let index = 0; index < surahs.length; index += 1) {
    const surah = surahs[index];
    onProgress?.({
      label: `Mengunduh ${surah.name}`,
      phase: 'quran',
      value: surahs.length ? Math.round((index / surahs.length) * 50) : 0,
    });

    const ayahPayload = await requestJson(`/api/v1/ayah/surah/number/${surah.number}?size=300&page=0`);
    const ayahs = pickItems(ayahPayload).map(normalizeAyah).filter((item) => item.number);
    ayahCount += ayahs.length;

    for (const ayah of ayahs) {
      await upsertItem(db, 'quran_ayah', `ayah:${surah.number}:${ayah.number}`, { ...ayah, surahNumber: surah.number }, savedAt);
    }
  }

  return { surahCount: surahs.length, ayahCount };
};

const saveHadithPack = async ({ db, onProgress, savedAt }) => {
  let page = 0;
  let totalPages = 1;
  let hadithCount = 0;

  while (page < totalPages && page < HADITH_MAX_PAGES) {
    onProgress?.({
      label: `Mengunduh halaman hadis ${page + 1}`,
      phase: 'hadith',
      value: 50 + Math.round((page / Math.max(totalPages, 1)) * 45),
    });

    const payload = await requestJson(`/api/v1/hadiths?size=${HADITH_PAGE_SIZE}&page=${page}`);
    const items = pickItems(payload).map(normalizeHadith).filter((item) => item.id);
    totalPages = Number(payload?.total_pages ?? payload?.data?.total_pages ?? totalPages) || totalPages;

    for (const hadith of items) {
      await upsertItem(db, 'hadith', `hadith:${hadith.id}`, hadith, savedAt);
    }

    hadithCount += items.length;
    if (!items.length) break;
    page += 1;
  }

  return { hadithCount };
};

export const buildOfflinePack = async ({ onProgress } = {}) => {
  const db = await openDb();
  const savedAt = new Date().toISOString();

  await deleteItemTypes(db, MAIN_PACK_TYPES);
  const quran = await saveQuranPack({ db, onProgress, savedAt });
  const hadith = await saveHadithPack({ db, onProgress, savedAt });
  await setMeta(db, 'offline_pack', { ...quran, ...hadith, savedAt }, savedAt);

  onProgress?.({ label: 'Paket utama offline siap', phase: 'done', value: 100 });
  return getOfflineOverview();
};

export const getOfflineItems = async (type) => {
  const db = await openDb();
  const rows = await db.getAllAsync('SELECT payload FROM offline_items WHERE type = ? ORDER BY key ASC', [type]);
  return rows
    .map((row) => {
      try {
        return JSON.parse(row.payload);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
};
