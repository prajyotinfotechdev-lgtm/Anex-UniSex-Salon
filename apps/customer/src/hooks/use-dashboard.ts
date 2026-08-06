"use client";

import { useState, useEffect } from "react";
import { getFullApiUrl } from "@/lib/api";
import { useCustomerProfile } from "@/components/providers/CustomerProfileContext";

export interface DashboardData {
  greeting: string;
  metrics?: { loyaltyPoints?: number };
  upcomingAppointment?: Record<string, unknown> | null;
  notifications?: { unreadCount: number };
  urgencyState?: 'NONE' | 'CHECK_IN' | 'PAYMENT' | 'LATE' | 'FIRST_TIME' | 'RETURNING' | 'INACTIVE' | 'APPOINTMENT_TODAY';
  urgentAction?: { label: string; action: string; type: 'primary' | 'destructive' };
  predictiveBooking?: { title: string; subtitle: string; serviceId: string; suggestionReason: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  financials?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recommendations?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  discover?: any;
}

const DEFAULT_GUEST_DASHBOARD: DashboardData = {
  greeting: "Welcome, Guest",
  urgencyState: "FIRST_TIME",
  financials: null,
  recommendations: [
    {
      type: "SERVICE",
      title: "Discover Premium Haircare",
      subtitle: "Tailored styling by top professionals.",
      actionId: "srv_discover"
    }
  ],
  discover: [
    {
      id: "content_1",
      type: "TREND",
      title: "The Textured Crop",
      imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80",
      action: "BOOK_SERVICE",
      targetId: "srv_crop"
    },
    {
      id: "content_2",
      type: "TIP",
      title: "Rainy Day Frizz Control",
      imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80",
      action: "READ_ARTICLE",
      targetId: "art_12"
    }
  ],
  notifications: { unreadCount: 0 }
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { profile, isLoading: isProfileLoading, clearProfile } = useCustomerProfile();

  useEffect(() => {
    if (isProfileLoading) return; // wait until profile context finishes loading from localStorage

    async function fetchDashboard() {
      try {
        const token = profile?.deviceToken || localStorage.getItem("anex_device_token");
        if (!token) {
          // Guest User (No device registered yet) -> Load Guest Dashboard
          setData(DEFAULT_GUEST_DASHBOARD);
          setIsLoading(false);
          return;
        }

        const fetchUrl = getFullApiUrl('/api/v1/me/dashboard');
        const res = await fetch(fetchUrl, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.status === 401 || res.status === 404) {
          // Token expired or revoked -> clear local token and revert to Guest Dashboard
          clearProfile();
          setData(DEFAULT_GUEST_DASHBOARD);
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to load dashboard data (Status ${res.status})`);
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
  }, [profile, isProfileLoading]);

  return { data, isLoading, error };
}
