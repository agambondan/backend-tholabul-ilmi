import AsyncStorage from '@react-native-async-storage/async-storage';

const PREF_PREFIX = 'tholabul:pref:';

const keyFor = (key) => `${PREF_PREFIX}${key}`;

export const preferenceKeys = {
  prayerAdjustments: 'prayer-adjustments',
  prayerMadhab: 'prayer-madhab',
  prayerMethod: 'prayer-method',
  prayerReminderEnabled: 'prayer-reminder-enabled',
  prayerReminderIds: 'prayer-reminder-ids',
  prayerReminderLeadMinutes: 'prayer-reminder-lead-minutes',
  prayerReminderPrayers: 'prayer-reminder-prayers',
  quranArabicFont: 'quran-arabic-font',
  quranAudioQari: 'quran-audio-qari',
  quranDisplayMode: 'quran-display-mode',
  quranFontSize: 'quran-font-size',
  quranMemorizationMode: 'quran-memorization-mode',
};

export const readPreference = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(keyFor(key));
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const writePreference = async (key, value) => {
  await AsyncStorage.setItem(keyFor(key), JSON.stringify(value));
  return value;
};
