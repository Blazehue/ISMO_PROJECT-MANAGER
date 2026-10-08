import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const REFRESH_TOKEN_KEY = 'ismo.refreshToken';

/**
 * The refresh token lives in the OS secure store: Android Keystore-backed
 * encrypted storage (iOS: Keychain). Never AsyncStorage or other plain storage.
 *
 * The web build exists only as a development preview; SecureStore has no web
 * implementation, so there the token is kept in memory for the tab's lifetime.
 */
let webMemoryToken: string | null = null;

export const tokenStorage = {
  async get() {
    if (Platform.OS === 'web') return webMemoryToken;
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  async set(token: string) {
    if (Platform.OS === 'web') {
      webMemoryToken = token;
      return;
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async clear() {
    if (Platform.OS === 'web') {
      webMemoryToken = null;
      return;
    }
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
