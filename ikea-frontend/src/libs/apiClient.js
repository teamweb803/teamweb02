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

function extractMessageFromPayload(payload) {
  if (!payload) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    return payload
      .map((item) => extractMessageFromPayload(item))
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  if (typeof payload === 'object') {
    const directCandidates = [
      payload.message,
      payload.error,
      payload.detail,
      payload.title,
    ];
    const directMessage = directCandidates.find(
      (candidate) => typeof candidate === 'string' && candidate.trim() !== '',
    );

    if (directMessage) {
      return directMessage.trim();
    }

    if (Array.isArray(payload.errors)) {
      const joinedErrors = payload.errors
        .map((item) => extractMessageFromPayload(item))
        .filter(Boolean)
        .join('\n')
        .trim();

      if (joinedErrors) {
        return joinedErrors;
      }
    }

    if (payload.errors && typeof payload.errors === 'object') {
      const joinedErrors = Object.values(payload.errors)
        .flat()
        .map((item) => extractMessageFromPayload(item))
        .filter(Boolean)
        .join('\n')
        .trim();

      if (joinedErrors) {
        return joinedErrors;
      }
    }
  }

  return '';
}

function createApiError(error) {
  const responsePayload = error.response?.data ?? null;
  const message = (
    extractMessageFromPayload(responsePayload)
    || String(error.response?.statusText ?? '').trim()
    || error.message
    || 'Request failed'
  );
  const apiError = new Error(message);
  apiError.status = error.response?.status ?? 0;
  apiError.data = responsePayload;
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
