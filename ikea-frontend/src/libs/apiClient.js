import axios from 'axios';
import { useAccountStore } from '../stores/account';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8402/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

function buildRequestConfig(path, options = {}) {
  const { body, query, headers, method = 'GET', ...rest } = options;
  const requestHeaders = {
    ...headers,
  };

  const config = {
    url: path,
    method,
    params: query,
    headers: requestHeaders,
    ...rest,
  };

  if (body !== undefined) {
    config.data = body;

    if (!(body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
  }

  return config;
}

function createApiError(error) {
  const message = error.response?.data?.message ?? error.message ?? 'Request failed';
  const apiError = new Error(message);
  apiError.status = error.response?.status ?? 0;
  apiError.data = error.response?.data ?? null;
  return apiError;
}

apiClient.interceptors.request.use((config) => {
  const authStore = useAccountStore();

  if (authStore.accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const authStore = useAccountStore();
    const originalRequest = error.config ?? {};
    const requestUrl = String(originalRequest.url ?? '');
    const shouldRetry = (
      error.response?.status === 401
      && authStore.refreshToken
      && !originalRequest._retry
      && !requestUrl.includes('/auth/login')
      && !requestUrl.includes('/member/login')
      && !requestUrl.includes('/auth/refresh')
    );

    if (shouldRetry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await refreshClient.post('/auth/refresh', {
          refreshToken: authStore.refreshToken,
        });
        const refreshedData = refreshResponse.data ?? {};

        authStore.setTokens({
          accessToken: refreshedData.accessToken ?? '',
          refreshToken: refreshedData.refreshToken ?? authStore.refreshToken,
        });

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        authStore.clearAuth();
        throw createApiError(refreshError);
      }
    }

    throw createApiError(error);
  },
);

export async function apiRequest(path, options = {}) {
  return apiClient(buildRequestConfig(path, options));
}

export { API_BASE_URL, apiClient };
