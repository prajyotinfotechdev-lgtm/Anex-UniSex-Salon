import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const DEFAULT_API_URL = "https://anex-api.onrender.com";

function getAdminBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  const cleaned = envUrl.trim().replace(/\/+$/, '');
  if (cleaned.endsWith('/api/v1')) return cleaned;
  return `${cleaned}/api/v1`;
}

const API_URL = getAdminBaseUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token available');
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken } = response.data.data;
        useAuthStore.getState().setTokens(accessToken, refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
