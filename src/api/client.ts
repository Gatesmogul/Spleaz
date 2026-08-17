import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const TOKEN_KEY = 'spleaz_auth_token';
export const REFRESH_TOKEN_KEY = 'spleaz_refresh_token';

/**
 * Spleaz Backend
 *
 * Production:
 * https://spleaz.onrender.com
 *
 * API base:
 * https://spleaz.onrender.com/api/v1
 *
 * EXPO_PUBLIC_API_URL can still override this value
 * when running a different environment.
 */
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://spleaz.onrender.com/api/v1';

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  BASE_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Get the stored authentication token.
 *
 * Web:
 * AsyncStorage
 *
 * Android/iOS:
 * SecureStore
 */
const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }

    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('[ApiClient] Failed to read authentication token:', error);
    return null;
  }
};

/**
 * Axios API client.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Attach authentication token to outgoing requests.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (__DEV__) {
        console.log(
          `[ApiClient] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
        );
      }
    } catch (error) {
      console.error(
        '[ApiClient] Token read failed:',
        error
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Handle API responses and authentication errors.
 */
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error?.response?.status === 401) {
      console.warn(
        '[ApiClient] Unauthorized request:',
        error.config?.url
      );
    }

    if (!error.response) {
      console.error(
        '[ApiClient] Network error:',
        error.message
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
