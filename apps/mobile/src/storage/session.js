import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'tholabul:session';
const FALLBACK_SESSION_KEY = 'tholabul:fallback-session';

let secureStoreAvailable;

const canUseSecureStore = async () => {
  if (secureStoreAvailable !== undefined) return secureStoreAvailable;

  try {
    secureStoreAvailable = await SecureStore.isAvailableAsync();
  } catch {
    secureStoreAvailable = false;
  }

  return secureStoreAvailable;
};

export const saveSession = async (session) => {
  const value = JSON.stringify(session);

  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(SESSION_KEY, value);
    return;
  }

  await AsyncStorage.setItem(FALLBACK_SESSION_KEY, value);
};

export const readSession = async () => {
  try {
    const value = (await canUseSecureStore())
      ? await SecureStore.getItemAsync(SESSION_KEY)
      : await AsyncStorage.getItem(FALLBACK_SESSION_KEY);

    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const clearSession = async () => {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }

  await AsyncStorage.removeItem(FALLBACK_SESSION_KEY);
};
