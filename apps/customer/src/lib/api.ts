const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://anex-api.onrender.com";

export const api = {
  get: async (url: string) => {
    const fetchUrl = url.startsWith("/") ? `${API_URL}${url}` : url;
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error('API Error');
    return { data: await res.json() };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: async (url: string, body?: any) => {
    const fetchUrl = url.startsWith("/") ? `${API_URL}${url}` : url;
    const res = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error('API Error');
    return { data: await res.json() };
  }
};
