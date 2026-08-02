import { LoginRequest, LoginResponse } from "@/types/auth";

const DEFAULT_API_URL = "https://anex-api.onrender.com";

function getAdminBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  const cleaned = envUrl.trim().replace(/\/+$/, '');
  if (cleaned.endsWith('/api/v1')) return cleaned;
  return `${cleaned}/api/v1`;
}

const API_URL = getAdminBaseUrl();

export async function login(
  data: LoginRequest
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
}