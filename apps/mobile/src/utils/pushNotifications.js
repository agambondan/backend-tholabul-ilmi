import { NativeModules, Platform } from 'react-native';

export const APP_NOTIFICATION_CHANNEL_ID = 'daily-reminders';

let Notifications;
let handlerReady = false;
let notificationsLoadError = null;

const isExpoGo = () => {
  const ownership = NativeModules.ExponentConstants?.appOwnership ?? '';
  const executionEnvironment = NativeModules.ExponentConstants?.executionEnvironment ?? '';
  return `${ownership} ${executionEnvironment}`.toLowerCase().includes('expo');
};

const loadErrorReason = () => {
  const message = `${notificationsLoadError?.message ?? notificationsLoadError ?? ''}`;
  if (/expo go|sdk 53|remote notifications/i.test(message)) {
    return 'expo_go_unsupported';
  }
  return 'native_module_unavailable';
};

export const getPushNotificationAvailability = () => {
  if (Platform.OS === 'web') {
    return {
      message: 'Push native hanya tersedia di Android atau iOS.',
      reason: 'unsupported',
      supported: false,
    };
  }

  if (isExpoGo()) {
    return {
      message: 'Push remote butuh development build, bukan Expo Go.',
      reason: 'expo_go_unsupported',
      supported: false,
    };
  }

  if (notificationsLoadError) {
    return {
      message:
        loadErrorReason() === 'expo_go_unsupported'
          ? 'Push remote butuh development build, bukan Expo Go.'
          : 'Module notifikasi native belum tersedia di build ini.',
      reason: loadErrorReason(),
      supported: false,
    };
  }

  return {
    message: 'Push native belum aktif di perangkat ini.',
    reason: 'ready',
    supported: true,
  };
};

export const pushNotificationsSupported = () => getPushNotificationAvailability().supported;

const getNotifications = () => {
  if (Platform.OS === 'web') return null;

  if (!Notifications) {
    try {
      Notifications = require('expo-notifications');
      notificationsLoadError = null;
    } catch (error) {
      notificationsLoadError = error;
      return null;
    }
  }

  if (!handlerReady) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerReady = true;
  }

  return Notifications;
};

const resolveDeviceId = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL ?? '';
  const host = /^[a-z][a-z0-9+.-]*:\/\/([^/:]+)/i.exec(scriptURL)?.[1] ?? '';
  return [Platform.OS, host].filter(Boolean).join(':');
};

export const getPushNotificationRegistration = async () => {
  const availability = getPushNotificationAvailability();
  if (!availability.supported) {
    return { granted: false, message: availability.message, reason: availability.reason };
  }

  const nativeNotifications = getNotifications();
  if (!nativeNotifications) {
    const nextAvailability = getPushNotificationAvailability();
    return { granted: false, message: nextAvailability.message, reason: nextAvailability.reason };
  }

  const existing = await nativeNotifications.getPermissionsAsync();
  let granted = existing.granted || existing.ios?.status === nativeNotifications.IosAuthorizationStatus.PROVISIONAL;

  if (!granted) {
    const requested = await nativeNotifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    granted = requested.granted || requested.ios?.status === nativeNotifications.IosAuthorizationStatus.PROVISIONAL;
  }

  if (!granted) {
    return { granted: false, reason: 'denied' };
  }

  if (Platform.OS === 'android') {
    await nativeNotifications.setNotificationChannelAsync(APP_NOTIFICATION_CHANNEL_ID, {
      importance: nativeNotifications.AndroidImportance.HIGH,
      lightColor: '#5b6e5b',
      name: 'Daily Reminders',
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  let token = '';
  let provider = 'expo';
  try {
    const expoToken = await nativeNotifications.getExpoPushTokenAsync();
    token = expoToken?.data ?? '';
  } catch {
    token = '';
  }

  if (!token) {
    try {
      const deviceToken = await nativeNotifications.getDevicePushTokenAsync();
      token = `${deviceToken?.data ?? ''}`;
      provider = Platform.OS;
    } catch {
      token = '';
    }
  }

  return {
    deviceId: resolveDeviceId(),
    granted: true,
    platform: Platform.OS,
    provider,
    reason: token ? 'ready' : 'token_unavailable',
    token,
  };
};
