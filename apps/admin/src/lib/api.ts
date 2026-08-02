const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function healthCheck() {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("API is not reachable");
  }

  return res.json();
}