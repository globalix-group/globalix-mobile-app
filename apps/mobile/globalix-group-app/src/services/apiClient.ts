/**
 * apiClient.ts
 * HTTP client for communicating with Globalix backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Use EXPO_PUBLIC_API_BASE_URL to override in development
// Example: EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:3002/api/v1
const getDevServerHost = (): string | null => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    // @ts-expect-error manifest2 is available in newer Expo SDKs
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    // @ts-expect-error manifest2 is available in newer Expo SDKs
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    null;

  if (!hostUri) return null;

  const withoutScheme = hostUri.replace(/^https?:\/\//, '');
  const host = withoutScheme.split('/')[0]?.split(':')[0];
  return host || null;
};

const FALLBACK_API_BASE_URL =
  Platform.select({
    ios: 'http://localhost:3002/api/v1',
    android: 'http://10.0.2.2:3002/api/v1',
    default: 'http://localhost:3002/api/v1',
  }) || 'http://localhost:3002/api/v1';

const DEV_SERVER_HOST = getDevServerHost();
const DEFAULT_API_BASE_URL = DEV_SERVER_HOST
  ? `http://${DEV_SERVER_HOST}:3002/api/v1`
  : FALLBACK_API_BASE_URL;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

const AUTH_TOKEN_KEY = 'globalix.auth.token';
const REFRESH_TOKEN_KEY = 'globalix.auth.refreshToken';

let cachedToken: string | null = null;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const buildHeaders = async (requiresAuth: boolean) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const normalizeResponse = <T = any>(
  response: Response,
  payload: any
): ApiResponse<T> => {
  const success = payload?.success ?? response.ok;
  const data = payload?.data ?? payload;
  const error = payload?.error || payload?.message;
  return { success: !!success, data, error };
};

const makeRequest = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  requiresAuth: boolean = false
): Promise<ApiResponse<T>> => {
  try {
    const options: RequestInit = {
      method,
      headers: await buildHeaders(requiresAuth),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`🌐 API Request [${method} ${endpoint}]`, body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    let payload: any = null;
    try {
      payload = await response.json();
    } catch (parseError) {
      console.warn('Failed to parse JSON response:', parseError);
      payload = { success: response.ok };
    }

    console.log(`✅ API Response [${method} ${endpoint}]:`, payload);

    const normalized = normalizeResponse<T>(response, payload);

    if (!response.ok) {
      const errorMsg = normalized.error || 'Request failed';
      console.error(`❌ API Error [${response.status}]:`, errorMsg);
      return { success: false, error: errorMsg, data: normalized.data };
    }

    return normalized;
  } catch (error: any) {
    console.error(`⚠️ API Error [${method} ${endpoint}]:`, error.message);
    return { success: false, error: error.message || 'Network request failed' };
  }
};

export const setAuthTokens = async (token: string, refreshToken?: string) => {
  cachedToken = token;
  if (refreshToken) {
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, token],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  } else {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export const getAuthToken = async () => {
  if (cachedToken) return cachedToken;
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  cachedToken = token;
  return token;
};

export const clearAuthTokens = async () => {
  cachedToken = null;
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
};

export const authApi = {
  login: (email: string, password: string) =>
    makeRequest('/auth/login', 'POST', { email, password }),

  register: (email: string, password: string, name: string) =>
    makeRequest('/auth/register', 'POST', { email, password, name }),

  refresh: (refreshToken: string) =>
    makeRequest('/auth/refresh', 'POST', { refreshToken }),

  forgotPassword: (email: string) =>
    makeRequest('/auth/forgot-password', 'POST', { email }),

  appleCallback: (appleId: string, email: string, name: string) =>
    makeRequest('/auth/apple-callback', 'POST', { appleId, email, name }),

  googleCallback: (googleId: string, email: string, name: string, avatar?: string) =>
    makeRequest('/auth/google-callback', 'POST', { googleId, email, name, avatar }),

  logout: () =>
    makeRequest('/auth/logout', 'POST', undefined, true),
};

export const activityApi = {
  logActivity: (userId: string, action: string, type: string, metadata?: any) =>
    makeRequest('/activities/log', 'POST', { userId, action, type, metadata }),
};

export const propertiesApi = {
  list: (page: number = 1, limit: number = 20) =>
    makeRequest(`/properties?page=${page}&limit=${limit}`),
  categories: () => makeRequest('/properties/categories'),
  search: (query: string, type?: string) =>
    makeRequest(`/properties/search?query=${encodeURIComponent(query)}${type ? `&type=${encodeURIComponent(type)}` : ''}`),
  getById: (id: string) => makeRequest(`/properties/${id}`),
};

export const carsApi = {
  list: (page: number = 1, limit: number = 20) =>
    makeRequest(`/cars?page=${page}&limit=${limit}`),
  categories: () => makeRequest('/cars/categories'),
  search: (query: string) => makeRequest(`/cars/search?query=${encodeURIComponent(query)}`),
  getById: (id: string) => makeRequest(`/cars/${id}`),
};

export const userApi = {
  profile: () => makeRequest('/user/profile', 'GET', undefined, true),
  updateProfile: (payload: any) => makeRequest('/user/profile', 'PUT', payload, true),
  updatePreferences: (payload: any) => makeRequest('/user/preferences', 'PUT', payload, true),
};

export const inquiryApi = {
  create: (propertyId: string, message: string) =>
    makeRequest('/inquiries', 'POST', { propertyId, message }, true),
  list: () => makeRequest('/inquiries', 'GET', undefined, true),
  update: (id: string, payload: any) => makeRequest(`/inquiries/${id}`, 'PUT', payload, true),
};

export const notificationsApi = {
  list: (page: number = 1, limit: number = 20) =>
    makeRequest(`/notifications?page=${page}&limit=${limit}`, 'GET', undefined, true),
  markAsRead: (id: string) => makeRequest(`/notifications/${id}/read`, 'PUT', undefined, true),
};

export const contactsApi = {
  create: (payload: { name: string; email: string; phone?: string; message: string }) =>
    makeRequest('/contacts', 'POST', payload),
};

export const reservationsApi = {
  create: (payload: { carId: string; startDate: string; endDate: string; totalPrice: number }) =>
    makeRequest('/reservations', 'POST', payload, true),
  list: () => makeRequest('/reservations', 'GET', undefined, true),
  update: (id: string, payload: any) => makeRequest(`/reservations/${id}`, 'PUT', payload, true),
};

export default {
  authApi,
  activityApi,
  propertiesApi,
  carsApi,
  userApi,
  inquiryApi,
  notificationsApi,
  contactsApi,
  reservationsApi,
  setAuthTokens,
  getAuthToken,
  clearAuthTokens,
};
