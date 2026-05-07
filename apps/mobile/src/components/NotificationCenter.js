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
import { useSession } from '../context/SessionContext';
import { colors, radius, spacing } from '../theme';
import {
  getPushNotificationAvailability,
  getPushNotificationRegistration,
  pushNotificationsSupported,
} from '../utils/pushNotifications';
import { Card, CardTitle } from './Card';

const defaultSettings = [
  { is_active: true, label: 'Quran Harian', time: '06:00', type: 'daily_quran' },
  { is_active: true, label: 'Hadis Harian', time: '07:00', type: 'daily_hadith' },
  { is_active: true, label: 'Doa Harian', time: '18:00', type: 'doa' },
];

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

const NOTIF_TABS = [
  { key: 'settings', label: 'Pengaturan' },
  { key: 'inbox', label: 'Kotak Masuk' },
];

export function NotificationCenter() {
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState(defaultSettings);
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
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

  const load = useCallback(async () => {
    if (!session?.token) return;

    setLoading(true);
    setMessage('');
    try {
      const [nextSettings, nextInbox, nextPush] = await Promise.all([
        getNotificationSettings(),
        getNotificationInbox(),
        getPushTokenStatus(),
      ]);
      setSettings(normalizeSettings(nextSettings));
      setInbox(nextInbox.items);
      setUnreadCount(nextInbox.unreadCount);
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
  }, [session?.token]);

  const updateSetting = (type, patch) => {
    setSettings((current) => current.map((item) => (item.type === type ? { ...item, ...patch } : item)));
  };

  const updateWebTime = (type, raw) => {
    updateSetting(type, { time: raw });
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
    setPickerState((current) => ({ ...current, value: nextDate }));
    updateSetting(pickerState.type, { time: toTimeString(nextDate) });
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      const saved = await saveNotificationSettings(settings);
      setSettings(normalizeSettings(saved?.data ?? saved ?? []));
      setMessage('Pengaturan notifikasi disimpan.');
    } catch (error) {
      setMessage(error?.message ?? 'Pengaturan belum bisa disimpan.');
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
    } catch (error) {
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
      load();
    } catch (error) {
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
      setMessage(error?.message ?? 'Notifikasi belum bisa ditandai terbaca.');
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setInbox((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      setMessage('Semua notifikasi ditandai terbaca.');
    } catch (error) {
      setMessage(error?.message ?? 'Notifikasi belum bisa ditandai terbaca.');
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
        {settings.map((item) => (
          <View key={item.type} style={styles.settingRow}>
            <View style={styles.settingBody}>
              <Text style={styles.settingTitle}>{item.label}</Text>
              <Text style={styles.settingMeta}>Reminder harian</Text>
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
