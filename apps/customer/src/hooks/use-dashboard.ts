"use client";

import { useState, useEffect } from "react";

export interface DashboardData {
  greeting: string;
  metrics?: { loyaltyPoints?: number };
  upcomingAppointment?: Record<string, unknown> | null;
  notifications?: { unreadCount: number };
  urgencyState?: 'NONE' | 'CHECK_IN' | 'PAYMENT' | 'LATE';
  urgentAction?: { label: string; action: string; type: 'primary' | 'destructive' };
  predictiveBooking?: { title: string; subtitle: string; serviceId: string; suggestionReason: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  financials?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  discover?: any;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("anex_device_token");
        if (!token) {
          throw new Error("No device token found. Please register device.");
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://anex-api.onrender.com";
        const res = await fetch(`${API_URL}/api/v1/me/dashboard`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("An unknown error occurred"));
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return { data, isLoading, error };
}
