const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://anex-api.onrender.com/api/v1";

export async function healthCheck() {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("API is not reachable");
  }

  return res.json();
}