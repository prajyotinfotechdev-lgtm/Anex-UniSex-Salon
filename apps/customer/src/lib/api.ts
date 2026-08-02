export const api = {
  get: async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Error');
    return { data: await res.json() };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: async (url: string, body?: any) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error('API Error');
    return { data: await res.json() };
  }
};
