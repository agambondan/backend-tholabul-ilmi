jest.mock('../context/SessionContext', () => ({
  useSession: jest.fn(),
}));

jest.mock('../context/FeedbackContext', () => ({
  useFeedback: jest.fn(),
}));

jest.mock('../api/personal', () => ({
  getNotificationSettings: jest.fn(),
  getNotificationInbox: jest.fn(),
  getPushTokenStatus: jest.fn(),
  markNotificationRead: jest.fn(),
  markAllNotificationsRead: jest.fn(),
  registerPushToken: jest.fn(),
  saveNotificationSettings: jest.fn(),
  sendPushTest: jest.fn(),
}));

jest.mock('../utils/pushNotifications', () => ({
  getPushNotificationAvailability: jest.fn(),
  getPushNotificationRegistration: jest.fn(),
  pushNotificationsSupported: jest.fn(),
}));

jest.mock('../utils/smartNotifications', () => ({
  getSmartReminderSchedule: jest.fn(),
  scheduleSmartReminders: jest.fn(),
  smartNotificationsSupported: jest.fn(),
}));

jest.mock('../storage/preferences', () => ({
  readPreference: jest.fn(),
  writePreference: jest.fn(),
  preferenceKeys: {
    smartNotifSettings: 'smart-notif-settings',
    smartNotifQuietHours: 'smart-notif-quiet-hours',
    smartNotifLocalIds: 'smart-notif-local-ids',
    smartNotifPendingSync: 'smart-notif-pending-sync',
  },
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NotificationCenter } from '../components/NotificationCenter';

const { useSession } = require('../context/SessionContext');
const { useFeedback } = require('../context/FeedbackContext');
const {
  getNotificationSettings,
  getNotificationInbox,
  getPushTokenStatus,
} = require('../api/personal');
const { getPushNotificationAvailability } = require('../utils/pushNotifications');
const { getSmartReminderSchedule, smartNotificationsSupported } = require('../utils/smartNotifications');
const { readPreference } = require('../storage/preferences');

const mockFeedback = {
  showError: jest.fn(),
  showInfo: jest.fn(),
  showSuccess: jest.fn(),
};

const defaultInbox = { items: [], unreadCount: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  useSession.mockReturnValue({ session: { token: 'abc' } });
  useFeedback.mockReturnValue(mockFeedback);
  getPushNotificationAvailability.mockReturnValue({ message: '', supported: true });
  getSmartReminderSchedule.mockReturnValue([]);
  smartNotificationsSupported.mockReturnValue(true);
  readPreference.mockResolvedValue(null);
  getNotificationSettings.mockResolvedValue([]);
  getNotificationInbox.mockResolvedValue(defaultInbox);
  getPushTokenStatus.mockResolvedValue({ hasActive: false });
});

describe('NotificationCenter', () => {
  test('renders settings tab by default', () => {
    const { getByText } = render(<NotificationCenter />);
    expect(getByText('Pengaturan')).toBeTruthy();
    expect(getByText('Pengaturan Notifikasi')).toBeTruthy();
  });

  test('renders both tabs when has session', () => {
    const { getByText } = render(<NotificationCenter />);
    expect(getByText('Pengaturan')).toBeTruthy();
    expect(getByText('Kotak Masuk')).toBeTruthy();
  });

  test('renders inbox tab with empty state', async () => {
    const { getByText, findByText } = render(<NotificationCenter />);
    fireEvent.press(getByText('Kotak Masuk'));
    expect(await findByText('Belum ada notifikasi masuk.')).toBeTruthy();
  });

  test('renders inbox items', async () => {
    getNotificationInbox.mockResolvedValue({
      items: [{ id: '1', title: 'Notif 1', body: 'Body 1', type: 'daily_quran', is_read: false }],
      unreadCount: 1,
    });
    const { findByText } = render(<NotificationCenter />);
    fireEvent.press(await findByText('Kotak Masuk'));
    expect(await findByText('Notif 1')).toBeTruthy();
    expect(await findByText('Body 1')).toBeTruthy();
  });

  test('shows local notice when no session', () => {
    useSession.mockReturnValue({ session: null });
    const { getByText } = render(<NotificationCenter />);
    expect(getByText('Reminder lokal tetap aktif')).toBeTruthy();
  });

  test('toggles quiet hours', () => {
    const { getAllByText } = render(<NotificationCenter />);
    const offButtons = getAllByText('Off');
    fireEvent.press(offButtons[0]);
    expect(getAllByText('On').length).toBeGreaterThanOrEqual(1);
  });

  test('renders reminder settings list', () => {
    const { getByText } = render(<NotificationCenter />);
    expect(getByText('Quran Harian')).toBeTruthy();
    expect(getByText('Hadis Harian')).toBeTruthy();
    expect(getByText('Doa Harian')).toBeTruthy();
  });

  test('renders save button', () => {
    const { getByText } = render(<NotificationCenter />);
    expect(getByText('Simpan pengaturan')).toBeTruthy();
  });

  test('renders preview section with active reminders', () => {
    getSmartReminderSchedule.mockReturnValue([
      { type: 'daily_quran', label: 'Quran Harian', scheduledTime: '06:00', serverSync: true },
    ]);
    const { getByText } = render(<NotificationCenter />);
    expect(getByText('Jadwal aktif')).toBeTruthy();
  });

  test('renders empty preview when no reminders active', () => {
    getSmartReminderSchedule.mockReturnValue([]);
    const { getByText } = render(<NotificationCenter />);
    expect(getByText('Belum ada reminder aktif')).toBeTruthy();
  });
});
