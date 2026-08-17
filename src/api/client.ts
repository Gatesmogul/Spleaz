import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const TOKEN_KEY = 'spleaz_auth_token';
export const REFRESH_TOKEN_KEY = 'spleaz_refresh_token';
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || BASE_URL.replace(/\/api\/v1\/?$/, '');

const getToken = async () => Platform.OS === 'web' ? AsyncStorage.getItem(TOKEN_KEY) : SecureStore.getItemAsync(TOKEN_KEY);
const apiClient: AxiosInstance = axios.create({ baseURL: BASE_URL, timeout: 20000, headers: { 'Content-Type': 'application/json', Accept: 'application/json' } });

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (error) { console.error('[ApiClient] Token read failed:', error); }
  return config;
});

apiClient.interceptors.response.use(response => response, async error => {
  if (error?.response?.status === 401) {
    console.warn('[ApiClient] Unauthorized request:', error.config?.url);
  }
  return Promise.reject(error);
});

export default apiClient;
