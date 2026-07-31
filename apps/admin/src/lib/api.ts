const API_URL = "http://localhost:5000";

export async function healthCheck() {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("API is not reachable");
  }

  return res.json();
}