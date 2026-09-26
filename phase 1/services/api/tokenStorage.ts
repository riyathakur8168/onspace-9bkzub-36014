import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'oneplace_jwt_access_token';

export async function setStoredToken(token: string): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.warn('Error saving auth token to secure storage:', error);
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
}

export async function getStoredToken(): Promise<string | null> {
  try {
    if (Platform.OS !== 'web') {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) return token;
    }
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.warn('Error reading auth token from secure storage:', error);
    return await AsyncStorage.getItem(TOKEN_KEY);
  }
}

export async function removeStoredToken(): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.warn('Error removing auth token:', error);
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}
