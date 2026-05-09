import { useCallback, useEffect, useState } from 'react';
import { BellRing } from 'lucide-react-native';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getNotificationInbox,
  getNotificationSettings,
  getPushTokenStatus,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
  saveNotificationSettings,
  sendPushTest,
} from '../api/personal';
import { useFeedback } from '../context/FeedbackContext';
import { useSession } from '../context/SessionContext';
import { colors, radius, spacing } from '../theme';
import {
  getPushNotificationAvailability,
  getPushNotificationRegistration,
  pushNotificationsSupported,
} from '../utils/pushNotifications';
import {
  scheduleSmartReminders,
  smartNotificationsSupported,
} from '../utils/smartNotifications';
import { Card, CardTitle } from './Card';
import { preferenceKeys, readPreference, writePreference } from '../storage/preferences';

const defaultSettings = [
  { body: 'Buka satu ayat untuk memulai hari.', is_active: true, label: 'Quran Harian', serverSync: true, time: '06:00', type: 'daily_quran' },
  { body: 'Satu hadis ringkas untuk pengingat harian.', is_active: true, label: 'Hadis Harian', serverSync: true, time: '07:00', type: 'daily_hadith' },
  { body: 'Baca doa harian pilihanmu.', is_active: true, label: 'Doa Harian', serverSync: true, time: '18:00', type: 'doa' },
  { body: 'Lanjutkan sesi belajar kajian.', is_active: false, label: 'Kajian', serverSync: false, time: '19:30', type: 'kajian' },
  { body: 'Waktu murojaah singkat hari ini.', is_active: false, label: 'Murojaah', serverSync: false, time: '20:15', type: 'murojaah' },
];
const defaultQuietHours = { end: '05:00', is_active: false, start: '22:00' };

const labelForType = (type) => defaultSettings.find((item) => item.type === type)?.label ?? type;
const toTimeDate = (value) => {
  const now = new Date();
  const match = /^(\d{1,2}):(\d{2})$/.exec(`${value ?? ''}`);
  if (!match) return now;

  const next = new Date(now);
  next.setHours(Math.min(23, Number(match[1])), Math.min(59, Number(match[2])), 0, 0);
  return next;
};
const toTimeString = (date) => `${date.getHours()}`.padStart(2, '0') + ':' + `${date.getMinutes()}`.padStart(2, '0');

const normalizeSettings = (items) =>
  defaultSettings.map((defaultItem) => {
    const saved = items.find((item) => item.type === defaultItem.type);
    return {
      ...defaultItem,
      is_active: saved?.is_active ?? defaultItem.is_active,
      time: saved?.time ?? defaultItem.time,
    };
  });

const normalizeQuietHours = (value) => ({
  end: value?.end ?? defaultQuietHours.end,
  is_active: Boolean(value?.is_active),
  start: value?.start ?? defaultQuietHours.start,
});

const toServerSettings = (items) =>
  items
    .filter((item) => item.serverSync)
    .map((item) => ({
      is_active: Boolean(item.is_active),
      time: item.time,
      type: item.type,
    }));

const NOTIF_TABS = [
  { key: 'settings', label: 'Pengaturan' },
  { key: 'inbox', label: 'Kotak Masuk' },
];

export function NotificationCenter() {
  const { session } = useSession();
  const { showError, showSuccess } = useFeedback();
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState(defaultSettings);
  const [quietHours, setQuietHours] = useState(defaultQuietHours);
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);
  const pushAvailability = getPushNotificationAvailability();
  const [pushState, setPushState] = useState({
    activeCount: 0,
    loading: false,
    message: pushAvailability.message,
    status: 'idle',
    testLoading: false,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [pickerState, setPickerState] = useState({ open: false, type: null, value: toTimeDate('06:00') });

  const syncLocalPreferences = useCallback(async (nextSettings, nextQuietHours, nextScheduled = null) => {
    await writePreference(preferenceKeys.smartNotifSettings, nextSettings);
    await writePreference(preferenceKeys.smartNotifQuietHours, nextQuietHours);
    if (nextScheduled !== null) {
      await writePreference(preferenceKeys.smartNotifLocalIds, nextScheduled);
    }
  }, []);

  const queuePendingSync = useCallback(async (serverSettings) => {
    await writePreference(preferenceKeys.smartNotifPendingSync, {
      queued_at: new Date().toISOString(),
      settings: serverSettings,
    });
    setPendingSync(true);
  }, []);

  const clearPendingSync = useCallback(async () => {
    await writePreference(preferenceKeys.smartNotifPendingSync, null);
    setPendingSync(false);
  }, []);

  const load = useCallback(async () => {
    if (!session?.token) return;

    setLoading(true);
    setMessage('');
    try {
      const [storedSettings, storedQuietHours, pendingPayload] = await Promise.all([
        readPreference(preferenceKeys.smartNotifSettings, null),
        readPreference(preferenceKeys.smartNotifQuietHours, defaultQuietHours),
        readPreference(preferenceKeys.smartNotifPendingSync, null),
      ]);

      let pendingMessage = '';
      if (pendingPayload?.settings?.length) {
        try {
          await saveNotificationSettings(pendingPayload.settings);
          await clearPendingSync();
          pendingMessage = 'Pengaturan lokal berhasil disinkronkan.';
        } catch {
          setPendingSync(true);
        }
      } else {
        setPendingSync(false);
      }

      const [nextSettings, nextInbox, nextPush] = await Promise.all([
        getNotificationSettings(),
        getNotificationInbox(),
        getPushTokenStatus(),
      ]);
      setSettings(normalizeSettings([...(nextSettings ?? []), ...(storedSettings ?? [])]));
      setQuietHours(normalizeQuietHours(storedQuietHours));
      setInbox(nextInbox.items);
      setUnreadCount(nextInbox.unreadCount);
      if (pendingMessage) setMessage(pendingMessage);
      if (nextPush.hasActive) {
        setPushState((current) => ({
          ...current,
          activeCount: nextPush.activeCount,
          message:
            nextPush.activeCount > 1
              ? `${nextPush.activeCount} perangkat aktif untuk push native.`
              : 'Push native aktif untuk perangkat ini.',
          status: 'enabled',
        }));
      }
    } catch (error) {
      setMessage(error?.message ?? 'Notifikasi belum bisa dimuat.');
    } finally {
      setLoading(false);
    }
  }, [clearPendingSync, session?.token]);

  const updateSetting = (type, patch) => {
    setSettings((current) => current.map((item) => (item.type === type ? { ...item, ...patch } : item)));
  };

  const updateWebTime = (type, raw) => {
    if (type === 'quiet_start') {
      setQuietHours((current) => ({ ...current, start: raw }));
    } else if (type === 'quiet_end') {
      setQuietHours((current) => ({ ...current, end: raw }));
    } else {
      updateSetting(type, { time: raw });
    }

    if (/^\d{1,2}:\d{2}$/.test(raw)) {
      const [h, m] = raw.split(':').map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return;
    }
    if (raw.length > 0 && !/^\d{0,2}:?\d{0,2}$/.test(raw)) {
      setMessage('Format waktu: HH:MM (contoh: 07:00)');
    } else {
      setMessage('');
    }
  };

  const openTimePicker = (type, time) => {
    if (Platform.OS === 'web') return;
    setPickerState({
      open: true,
      type,
      value: toTimeDate(time),
    });
  };

  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS !== 'ios') {
      setPickerState((current) => ({ ...current, open: false }));
    }
    if (event?.type === 'dismissed') return;
    if (!pickerState.type) return;

    const nextDate = selectedDate ?? pickerState.value;
    const nextTime = toTimeString(nextDate);
    setPickerState((current) => ({ ...current, value: nextDate }));
    if (pickerState.type === 'quiet_start') {
      setQuietHours((current) => ({ ...current, start: nextTime }));
      return;
    }
    if (pickerState.type === 'quiet_end') {
      setQuietHours((current) => ({ ...current, end: nextTime }));
      return;
    }
    updateSetting(pickerState.type, { time: nextTime });
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      const previousScheduled = await readPreference(preferenceKeys.smartNotifLocalIds, []);
      const localSchedule = await scheduleSmartReminders({
        previous: previousScheduled,
        quietHours,
        reminders: settings,
      });

      if (!smartNotificationsSupported()) {
        setMessage('Reminder lokal hanya tersedia di Android atau iOS.');
      } else if (localSchedule.status === 'denied') {
        setMessage('Izin notifikasi belum diberikan. Reminder lokal belum aktif.');
      } else if (localSchedule.status === 'scheduled') {
        setMessage(`${localSchedule.scheduled.length} reminder lokal dijadwalkan.`);
      }

      await syncLocalPreferences(
        settings,
        quietHours,
        localSchedule.status === 'scheduled' ? localSchedule.scheduled : previousScheduled,
      );

      const serverSettings = toServerSettings(settings);
      try {
        const saved = await saveNotificationSettings(serverSettings);
        const merged = normalizeSettings([...(saved?.data ?? saved ?? []), ...settings]);
        setSettings(merged);
        await clearPendingSync();
        await writePreference(preferenceKeys.smartNotifSettings, merged);
        setMessage('Pengaturan notifikasi disimpan.');
        showSuccess('Pengaturan notifikasi disimpan.');
      } catch (syncError) {
        await queuePendingSync(serverSettings);
        const queuedMessage =
          syncError?.message?.toLowerCase().includes('network request failed')
            ? 'Pengaturan disimpan lokal. Akan sinkron otomatis saat online.'
            : syncError?.message ?? 'Sinkron backend gagal. Pengaturan lokal tetap aktif.';
        setMessage(queuedMessage);
        showSuccess('Pengaturan lokal disimpan.');
      }
    } catch (error) {
      const nextMessage = error?.message ?? 'Pengaturan belum bisa disimpan.';
      setMessage(nextMessage);
      showError(nextMessage);
    } finally {
      setSaving(false);
    }
  };

  const enablePush = async () => {
    if (!session?.token) return;

    setPushState((current) => ({ ...current, loading: true, message: 'Meminta izin notifikasi...', status: 'loading' }));
    try {
      const registration = await getPushNotificationRegistration();
      if (!registration.granted) {
        const nextMessage = registration.message ?? 'Izin notifikasi belum diberikan dari sistem.';
        setPushState((current) => ({
          ...current,
          loading: false,
          message: nextMessage,
          status: registration.reason ?? 'denied',
        }));
        return;
      }

      if (!registration.token) {
        setPushState((current) => ({
          ...current,
          loading: false,
          message: registration.message ?? 'Token push belum tersedia. Pastikan app berjalan di device native.',
          status: 'token_unavailable',
        }));
        return;
      }

      await registerPushToken(registration);
      const nextPush = await getPushTokenStatus();
      setPushState((current) => ({
        ...current,
        activeCount: nextPush.activeCount || 1,
        loading: false,
        message: 'Push native aktif untuk perangkat ini.',
        status: 'enabled',
      }));
      showSuccess('Push native aktif untuk perangkat ini.');
    } catch (error) {
      showError(error?.message ?? 'Push native belum bisa diaktifkan.');
      setPushState((current) => ({
        ...current,
        loading: false,
        message: error?.message ?? 'Push native belum bisa diaktifkan.',
        status: 'error',
      }));
    }
  };

  const testPush = async () => {
    if (!session?.token) return;

    setPushState((current) => ({
      ...current,
      message: 'Mengirim test push ke perangkat...',
      testLoading: true,
    }));
    try {
      const result = await sendPushTest();
      setPushState((current) => ({
        ...current,
        message: result?.sent ? `Test push terkirim ke ${result.sent} perangkat.` : 'Test push terkirim.',
        status: 'enabled',
        testLoading: false,
      }));
      showSuccess(result?.sent ? `Test push terkirim ke ${result.sent} perangkat.` : 'Test push terkirim.');
      load();
    } catch (error) {
      showError(error?.message ?? 'Test push belum bisa dikirim.');
      setPushState((current) => ({
        ...current,
        message: error?.message ?? 'Test push belum bisa dikirim.',
        testLoading: false,
      }));
    }
  };

  const markRead = async (id) => {
    if (!id) return;

    try {
      await markNotificationRead(id);
      setInbox((current) => current.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      const nextMessage = error?.message ?? 'Notifikasi belum bisa ditandai terbaca.';
      setMessage(nextMessage);
      showError(nextMessage);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setInbox((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      setMessage('Semua notifikasi ditandai terbaca.');
      showSuccess('Semua notifikasi ditandai terbaca.');
    } catch (error) {
      const nextMessage = error?.message ?? 'Notifikasi belum bisa ditandai terbaca.';
      setMessage(nextMessage);
      showError(nextMessage);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  if (!session?.token) {
    return (
      <Card>
        <CardTitle meta="Masuk akun">Pusat Notifikasi</CardTitle>
        <Text style={styles.body}>Masuk dari tab Profil untuk mengatur pengingat dan melihat notifikasi.</Text>
      </Card>
    );
  }

  return (
    <View>
      <View style={styles.tabs}>
        {NOTIF_TABS.map((tab) => (
          <Pressable
            android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
            key={tab.key}
            onPress={() => { setActiveTab(tab.key); setMessage(''); }}
            style={[styles.tab, activeTab === tab.key ? styles.tabActive : null]}
          >
            <Text style={[styles.tabText, activeTab === tab.key ? styles.tabTextActive : null]}>
              {tab.label}
              {tab.key === 'inbox' && unreadCount > 0 ? ` (${unreadCount})` : ''}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'settings' ? (
      <Card>
        <CardTitle meta="Pengingat">Pengaturan Notifikasi</CardTitle>
        <View style={styles.pushBox}>
          <View style={styles.pushIcon}>
            <BellRing color={colors.primary} size={18} strokeWidth={2.2} />
          </View>
          <View style={styles.pushCopy}>
            <Text style={styles.settingTitle}>Push native</Text>
            <Text style={styles.settingMeta}>{pushState.message}</Text>
          </View>
          <Pressable
            android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
            disabled={pushState.loading || !pushNotificationsSupported()}
            onPress={enablePush}
            style={[styles.pushButton, (pushState.loading || !pushNotificationsSupported()) ? styles.disabled : null]}
          >
            {pushState.loading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.pushButtonText}>{pushState.status === 'enabled' ? 'Aktif' : 'Aktifkan'}</Text>
            )}
          </Pressable>
        </View>
        <View style={styles.pushActions}>
          <Pressable
            android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
            disabled={pushState.testLoading || pushState.status !== 'enabled'}
            onPress={testPush}
            style={[styles.secondaryButtonCompact, (pushState.testLoading || pushState.status !== 'enabled') ? styles.disabled : null]}
          >
            {pushState.testLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.secondaryText}>Kirim test push</Text>
            )}
          </Pressable>
          <Text style={styles.pushHint}>
            {pushState.activeCount ? `${pushState.activeCount} token aktif tersimpan di backend.` : 'Aktifkan dulu untuk menyimpan token perangkat.'}
          </Text>
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingBody}>
            <Text style={styles.settingTitle}>Quiet hours</Text>
            <Text style={styles.settingMeta}>Tahan reminder di jam tenang</Text>
          </View>
          <Pressable
            android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
            onPress={() => setQuietHours((current) => ({ ...current, is_active: !current.is_active }))}
            style={[styles.toggle, quietHours.is_active ? styles.toggleActive : null]}
          >
            <Text style={[styles.toggleText, quietHours.is_active ? styles.toggleTextActive : null]}>
              {quietHours.is_active ? 'On' : 'Off'}
            </Text>
          </Pressable>
        </View>
        {quietHours.is_active ? (
          <View style={styles.quietHoursRow}>
            {Platform.OS === 'web' ? (
              <>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  onChangeText={(time) => updateWebTime('quiet_start', time)}
                  placeholder="22:00"
                  placeholderTextColor={colors.muted}
                  style={styles.timeInput}
                  value={quietHours.start}
                />
                <Text style={styles.quietSeparator}>sampai</Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  onChangeText={(time) => updateWebTime('quiet_end', time)}
                  placeholder="05:00"
                  placeholderTextColor={colors.muted}
                  style={styles.timeInput}
                  value={quietHours.end}
                />
              </>
            ) : (
              <>
                <Pressable
                  android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                  onPress={() => openTimePicker('quiet_start', quietHours.start)}
                  style={styles.timeButton}
                >
                  <Text style={styles.timeButtonText}>{quietHours.start}</Text>
                </Pressable>
                <Text style={styles.quietSeparator}>sampai</Text>
                <Pressable
                  android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                  onPress={() => openTimePicker('quiet_end', quietHours.end)}
                  style={styles.timeButton}
                >
                  <Text style={styles.timeButtonText}>{quietHours.end}</Text>
                </Pressable>
              </>
            )}
          </View>
        ) : null}
        {settings.map((item) => (
          <View key={item.type} style={styles.settingRow}>
            <View style={styles.settingBody}>
              <Text style={styles.settingTitle}>{item.label}</Text>
              <Text style={styles.settingMeta}>
                {item.serverSync ? 'Reminder harian · sinkron cloud' : 'Reminder harian · lokal perangkat'}
              </Text>
            </View>
            {Platform.OS === 'web' ? (
              <TextInput
                autoCapitalize="none"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                onChangeText={(time) => updateWebTime(item.type, time)}
                placeholder="HH:MM"
                placeholderTextColor={colors.muted}
                style={styles.timeInput}
                value={item.time}
              />
            ) : (
              <Pressable
                android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                onPress={() => openTimePicker(item.type, item.time)}
                style={styles.timeButton}
              >
                <Text style={styles.timeButtonText}>{item.time}</Text>
              </Pressable>
            )}
            <Pressable
              android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
              onPress={() => updateSetting(item.type, { is_active: !item.is_active })}
              style={[styles.toggle, item.is_active ? styles.toggleActive : null]}
            >
              <Text style={[styles.toggleText, item.is_active ? styles.toggleTextActive : null]}>
                {item.is_active ? 'On' : 'Off'}
              </Text>
            </Pressable>
          </View>
        ))}
        <Pressable
          android_ripple={{ color: 'rgba(255, 255, 255, 0.12)', borderless: false }}
          disabled={saving}
          onPress={saveSettings}
          style={[styles.primaryButton, saving ? styles.disabled : null]}
        >
          {saving ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.primaryText}>Simpan pengaturan</Text>}
        </Pressable>
        {pendingSync ? (
          <Text style={styles.pendingSyncText}>
            Ada perubahan yang belum sinkron ke backend. Akan dicoba ulang saat online.
          </Text>
        ) : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {pickerState.open && Platform.OS !== 'web' ? (
          <View style={styles.timePickerWrap}>
            <DateTimePicker
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              mode="time"
              onChange={onTimeChange}
              value={pickerState.value}
            />
            {Platform.OS === 'ios' ? (
              <Pressable
                android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }}
                onPress={() => setPickerState((current) => ({ ...current, open: false }))}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryText}>Done</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </Card>
      ) : (
      <Card>
        <CardTitle meta={`${unreadCount} belum dibaca`}>Kotak Masuk</CardTitle>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {!loading && inbox.length === 0 ? <Text style={styles.body}>No notification inbox items yet.</Text> : null}
        {inbox.map((item) => (
          <Pressable
            android_ripple={{ color: 'rgba(91, 110, 91, 0.08)', borderless: false }}
            key={item.id}
            onPress={() => markRead(item.id)}
            style={[styles.inboxItem, !item.is_read ? styles.unreadItem : null]}
          >
            <View style={styles.inboxHeader}>
              <Text style={styles.inboxTitle}>{item.title || labelForType(item.type)}</Text>
              <Text style={styles.inboxType}>{item.is_read ? 'Terbaca' : 'Baru'}</Text>
            </View>
            {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
            <Text style={styles.settingMeta}>{[labelForType(item.type), item.ref_id].filter(Boolean).join(' · ')}</Text>
          </Pressable>
        ))}
        {inbox.length ? (
          <Pressable android_ripple={{ color: 'rgba(91, 110, 91, 0.12)', borderless: false }} onPress={markAllRead} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Tandai semua terbaca</Text>
          </Pressable>
        ) : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
  },
  tabText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  tabTextActive: {
    color: colors.primary,
  },
  body: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  disabled: {
    opacity: 0.55,
  },
  inboxHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  inboxItem: {
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  inboxTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  inboxType: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: spacing.md,
    textTransform: 'uppercase',
  },
  message: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  pendingSyncText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: spacing.sm,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 42,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  pushBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  pushButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: spacing.sm,
  },
  pushButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  pushCopy: {
    flex: 1,
  },
  pushIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.faint,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  pushActions: {
    marginBottom: spacing.sm,
  },
  pushHint: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: spacing.md,
    minHeight: 42,
  },
  secondaryButtonCompact: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  quietHoursRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  quietSeparator: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  settingBody: {
    flex: 1,
  },
  settingMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  settingRow: {
    alignItems: 'center',
    borderBottomColor: colors.faint,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  settingTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  timeInput: {
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    minHeight: 38,
    paddingHorizontal: spacing.sm,
    textAlign: 'center',
    width: 74,
  },
  timeButton: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    width: 74,
  },
  timeButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  timePickerWrap: {
    borderTopColor: colors.faint,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  toggle: {
    alignItems: 'center',
    borderColor: colors.faint,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    width: 54,
  },
  toggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  unreadItem: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
});
