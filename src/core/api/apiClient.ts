import axios from 'axios';
import { APP_CONFIG } from '../config/appConfig';
import { sessionStore } from '../../auth/sessionStore';

export class ApiError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 10000
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStore.getState().tokens?.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const { logout } = sessionStore.getState();
      logout({ propagate: false });
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.message || error.message || 'Unexpected error, please try again';
    return Promise.reject(new ApiError(message, status, error.response?.data));
  }
);
