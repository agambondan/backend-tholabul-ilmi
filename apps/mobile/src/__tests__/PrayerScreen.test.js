import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { High: 5, Balanced: 3 },
}));

import * as Location from 'expo-location';

jest.mock('../components/Screen', () => {
  const { View, Text, ActivityIndicator } = require('react-native');
  return {
    Screen: ({ children, title, subtitle, refreshing, actions }) => (
      <View>
        <Text testID="screen-title">{title}</Text>
        {subtitle ? <Text testID="screen-subtitle">{subtitle}</Text> : null}
        <View testID="screen-actions">{actions}</View>
        {refreshing ? (
          <ActivityIndicator testID="screen-loader" />
        ) : null}
        {children}
      </View>
    ),
  };
});

jest.mock('../components/Card', () => {
  const { View, Text } = require('react-native');
  return {
    Card: ({ children, style }) => (
      <View testID="card" style={style}>
        {children}
      </View>
    ),
    CardTitle: ({ children, meta }) => (
      <View>
        <Text testID="card-title">{children}</Text>
        {meta ? <Text testID="card-meta">{meta}</Text> : null}
      </View>
    ),
  };
});

jest.mock('../components/Paper', () => {
  const { Pressable, Text } = require('react-native');
  return {
    IconActionButton: ({ label, onPress, disabled }) => (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        testID={`action-${label}`}
      >
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});

jest.mock('../context/SessionContext', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

jest.mock('../context/FeedbackContext', () => ({
  useFeedback: jest.fn(),
  FeedbackProvider: ({ children }) => children,
}));

jest.mock('../api/client', () => ({
  getPrayerTimes: jest.fn(),
}));

jest.mock('../api/personal', () => ({
  getTodayPrayerLog: jest.fn(),
  getPrayerStats: jest.fn(),
  savePrayerLog: jest.fn(),
}));

jest.mock('../storage/offlineContent', () => ({
  buildPrayerOfflinePack: jest.fn(),
  clearPrayerOfflinePack: jest.fn(),
  getOfflinePrayerForDate: jest.fn(),
  getPrayerOfflineOverview: jest.fn(),
}));

jest.mock('../storage/preferences', () => ({
  preferenceKeys: {
    prayerMethod: 'prayer-method',
    prayerMadhab: 'prayer-madhab',
    prayerAdjustments: 'prayer-adjustments',
    prayerReminderEnabled: 'prayer-reminder-enabled',
    prayerReminderLeadMinutes: 'prayer-reminder-lead-minutes',
    prayerReminderPrayers: 'prayer-reminder-prayers',
    prayerReminderIds: 'prayer-reminder-ids',
  },
  readPreference: jest.fn(),
  writePreference: jest.fn(),
}));

jest.mock('../utils/prayerNotifications', () => ({
  cancelPrayerReminders: jest.fn(),
  notificationsSupported: jest.fn(() => true),
  schedulePrayerReminders: jest.fn(),
}));

import { PrayerScreen } from '../screens/PrayerScreen';
import { useSession } from '../context/SessionContext';
import { useFeedback } from '../context/FeedbackContext';
import { getPrayerTimes } from '../api/client';
import {
  getTodayPrayerLog,
  getPrayerStats,
  savePrayerLog,
} from '../api/personal';
import { readPreference, writePreference } from '../storage/preferences';
import { getPrayerOfflineOverview } from '../storage/offlineContent';

const mockPrayerTimes = {
  imsak: '04:30',
  fajr: '04:40',
  sunrise: '05:50',
  dhuhr: '11:45',
  asr: '15:00',
  maghrib: '17:45',
  isha: '19:00',
};

const defaultNavigation = {
  setBack: jest.fn(),
  clearBack: jest.fn(),
  current: null,
};

describe('PrayerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    readPreference.mockResolvedValue(null);
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -6.2, longitude: 106.8 },
    });

    useSession.mockReturnValue({ user: null });
    useFeedback.mockReturnValue({
      showError: jest.fn(),
      showInfo: jest.fn(),
      showSuccess: jest.fn(),
    });
  });

  test('renders screen title', () => {
    const { getByTestId } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    expect(getByTestId('screen-title')).toBeTruthy();
    expect(getByTestId('screen-title').props.children).toBe(
      'Jadwal Sholat',
    );
  });

  test('shows loader while loading', () => {
    Location.requestForegroundPermissionsAsync.mockReturnValue(
      new Promise(() => {}),
    );

    const { getByTestId } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    expect(getByTestId('screen-loader')).toBeTruthy();
  });

  test('shows permission denied message', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    const { getByText } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    await waitFor(() => {
      expect(
        getByText(
          'Aktifkan lokasi untuk memuat jadwal sholat sesuai tempatmu.',
        ),
      ).toBeTruthy();
    });
  });

  test('shows manual location form when permission denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    const { getByText, getByPlaceholderText } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Lokasi Manual')).toBeTruthy();
    });

    expect(getByPlaceholderText('-6.2088 (Lintang)')).toBeTruthy();
    expect(getByPlaceholderText('106.8456 (Bujur)')).toBeTruthy();
  });

  test('renders prayer schedule with location', async () => {
    getPrayerTimes.mockResolvedValue(mockPrayerTimes);
    getPrayerOfflineOverview.mockResolvedValue({
      supported: false,
      days: 0,
      error:
        'Fitur jadwal offline tersedia di aplikasi mobile.',
    });

    const { getByText, queryByText } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Subuh')).toBeTruthy();
    });

    expect(getByText('Dzuhur')).toBeTruthy();
    expect(getByText('Asr')).toBeTruthy();
    expect(getByText('Maghrib')).toBeTruthy();
    expect(getByText('Isya')).toBeTruthy();
    expect(queryByText('Lokasi Manual')).toBeNull();
  });

  test('shows login prompt for non-logged-in user', async () => {
    getPrayerTimes.mockResolvedValue(mockPrayerTimes);
    getPrayerOfflineOverview.mockResolvedValue({
      supported: false,
      days: 0,
    });

    const { getByText } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    await waitFor(() => {
      expect(
        getByText(
          'Buka Profil untuk masuk dan mencatat status sholat harian.',
        ),
      ).toBeTruthy();
    });
  });

  test('shows prayer log for logged in user', async () => {
    useSession.mockReturnValue({
      user: { id: '1', name: 'Test User' },
    });
    getPrayerTimes.mockResolvedValue(mockPrayerTimes);
    getPrayerOfflineOverview.mockResolvedValue({
      supported: false,
      days: 0,
    });
    getTodayPrayerLog.mockResolvedValue({
      date: '2026-05-14',
      prayers: { subuh: { status: 'berjamaah' } },
    });
    getPrayerStats.mockResolvedValue({
      total_days: 10,
      berjamaah_pct: 80,
    });

    const { getByText, queryByText } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Log Sholat')).toBeTruthy();
    });

    expect(getByText('10 hari tercatat · 80% jamaah')).toBeTruthy();
    expect(
      queryByText(
        'Buka Profil untuk masuk dan mencatat status sholat harian.',
      ),
    ).toBeNull();
  });

  test('saves prayer log on status press', async () => {
    useSession.mockReturnValue({
      user: { id: '1', name: 'Test User' },
    });
    getPrayerTimes.mockResolvedValue(mockPrayerTimes);
    getPrayerOfflineOverview.mockResolvedValue({
      supported: false,
      days: 0,
    });
    getTodayPrayerLog.mockResolvedValue({
      date: '2026-05-14',
      prayers: {},
    });
    getPrayerStats
      .mockResolvedValueOnce({ total_days: 0, berjamaah_pct: 0 })
      .mockResolvedValueOnce({ total_days: 1, berjamaah_pct: 100 });
    savePrayerLog.mockResolvedValue({ status: 'berjamaah' });

    const { showSuccess } = useFeedback();

    const { getByText, getAllByText } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Subuh')).toBeTruthy();
    });

    fireEvent.press(getAllByText('Jamaah')[0]);

    await waitFor(() => {
      expect(savePrayerLog).toHaveBeenCalledWith({
        date: expect.any(String),
        prayer: 'subuh',
        status: 'berjamaah',
      });
      expect(showSuccess).toHaveBeenCalled();
    });
  });

  test('shows login prompt instead of log buttons for guest', async () => {
    getPrayerTimes.mockResolvedValue(mockPrayerTimes);
    getPrayerOfflineOverview.mockResolvedValue({
      supported: false,
      days: 0,
    });

    const { getByText, queryByText } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    await waitFor(() => {
      expect(
        getByText(
          'Buka Profil untuk masuk dan mencatat status sholat harian.',
        ),
      ).toBeTruthy();
    });

    expect(queryByText('Jamaah')).toBeNull();
  });

  test('navigates to settings view', async () => {
    getPrayerTimes.mockResolvedValue(mockPrayerTimes);
    getPrayerOfflineOverview.mockResolvedValue({
      supported: false,
      days: 0,
    });

    const { getByText, getByTestId } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Subuh')).toBeTruthy();
    });

    fireEvent.press(getByText('Buka pengaturan sholat'));

    await waitFor(() => {
      expect(getByTestId('screen-title').props.children).toBe(
        'Pengaturan Sholat',
      );
    });

    expect(getByText('Kemenag')).toBeTruthy();
    expect(getByText('MWL')).toBeTruthy();
    expect(getByText('Makkah')).toBeTruthy();
    expect(getByText('ISNA')).toBeTruthy();
    expect(getByText('Shafi')).toBeTruthy();
    expect(getByText('Hanafi')).toBeTruthy();
  });

  test('method selection persists preference', async () => {
    getPrayerTimes.mockResolvedValue(mockPrayerTimes);
    getPrayerOfflineOverview.mockResolvedValue({
      supported: false,
      days: 0,
    });

    const { getByText } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Subuh')).toBeTruthy();
    });

    fireEvent.press(getByText('Buka pengaturan sholat'));

    await waitFor(() => {
      expect(getByText('MWL')).toBeTruthy();
    });

    fireEvent.press(getByText('MWL'));

    await waitFor(() => {
      expect(writePreference).toHaveBeenCalledWith(
        'prayer-method',
        'mwl',
      );
    });
  });

  test('shows error message when API fails', async () => {
    getPrayerTimes.mockRejectedValue(new Error('Network error'));
    getPrayerOfflineOverview.mockResolvedValue({
      supported: false,
      days: 0,
    });

    const { getByText } = render(
      <PrayerScreen isActive={true} navigation={defaultNavigation} />,
    );

    await waitFor(() => {
      expect(getByText('Network error')).toBeTruthy();
    });
  });
});
