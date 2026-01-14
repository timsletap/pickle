import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = (): string => {
  // 1. Check for environment variable (most reliable for production/team use)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    console.log('[API] Using env var:', envApiUrl);
    return envApiUrl;
  }

  // 2. Auto-detect from Expo dev server (works for local development)
  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
  const localhost = debuggerHost?.split(':')[0];

  if (localhost) {
    const url = `http://${localhost}:8000`;
    console.log('[API] Auto-detected URL:', url);
    return url;
  }

  // 3. Fallback to localhost (works for web/emulator)
  const fallback = Platform.OS === 'android'
    ? "http://10.0.2.2:8000"  // Android emulator localhost
    : "http://localhost:8000";  // Web/iOS
  console.warn('[API] Using fallback URL:', fallback, '- Backend may not be reachable!');
  return fallback;
};

export const API_BASE_URL: string = getApiUrl();

// Log API configuration on app start
console.log('='.repeat(50));
console.log('[API Configuration]');
console.log('Base URL:', API_BASE_URL);
console.log('Platform:', Platform.OS);
console.log('='.repeat(50));