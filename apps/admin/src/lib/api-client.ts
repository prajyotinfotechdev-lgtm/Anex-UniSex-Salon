import { useAuthStore } from '@/shared/store/authStore';

const DEFAULT_API_URL = "https://anex-api.onrender.com";

export function getApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  const cleaned = envUrl.trim().replace(/\/+$/, '');
  if (cleaned.endsWith('/api/v1')) return cleaned;
  return `${cleaned}/api/v1`;
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;
  const url = new URL(`${getApiUrl()}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const token = useAuthStore.getState().accessToken;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(url.toString(), {
    headers: defaultHeaders,
    ...rest,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'An error occurred during the request');
  }

  // The backend wrapper returns { success: boolean, data: T }
  return data?.data ?? data;
}
