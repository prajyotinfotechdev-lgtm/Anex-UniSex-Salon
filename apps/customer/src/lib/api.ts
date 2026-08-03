const DEFAULT_API_URL = "https://anex-api.onrender.com";

export function getFullApiUrl(endpoint: string): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  const baseUrl = envUrl.trim().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.trim().replace(/^\/+/, '');

  // Handle URL concatenation safely
  if (baseUrl.endsWith('/api/v1') && cleanEndpoint.startsWith('api/v1/')) {
    return `${baseUrl}/${cleanEndpoint.slice(7)}`;
  }
  if (!baseUrl.includes('/api/v1') && !cleanEndpoint.startsWith('api/v1/')) {
    return `${baseUrl}/api/v1/${cleanEndpoint}`;
  }

  return `${baseUrl}/${cleanEndpoint}`;
}

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-organization-id': process.env.NEXT_PUBLIC_ORGANIZATION_ID || '10fdbe22-4c40-4bd6-8266-9a3c49f9ed8b',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("anex_device_token") || localStorage.getItem("customer_token") || localStorage.getItem("anex_customer_token");
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const api = {
  get: async (url: string) => {
    const fetchUrl = getFullApiUrl(url);
    const res = await fetch(fetchUrl, { headers: getHeaders() });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return { data: await res.json() };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: async (url: string, body?: any) => {
    const fetchUrl = getFullApiUrl(url);
    const res = await fetch(fetchUrl, {
      method: 'POST',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    return { data: await res.json() };
  }
};
