"use client";

import { useState, useEffect } from "react";
import { getFullApiUrl } from "@/lib/api";
import { useCustomerProfile } from "@/components/providers/CustomerProfileContext";

export interface DashboardData {
  greeting: string;
  metrics?: { loyaltyPoints?: number };
  upcomingAppointment?: Record<string, unknown> | null;
  notifications?: { unreadCount: number };
  urgencyState?: 'NONE' | 'CHECK_IN' | 'PAYMENT' | 'LATE' | 'FIRST_TIME' | 'RETURNING' | 'INACTIVE' | 'APPOINTMENT_TODAY' | 'UPCOMING_APPOINTMENT';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  urgentAction?: any;
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
  urgencyState: "UPCOMING_APPOINTMENT",
  urgentAction: {
    type: "UPCOMING_APPOINTMENT",
    title: "Signature Haircut",
    subtitle: "with Stylist",
    time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    actions: ["MANAGE"]
  },
  financials: null,
  recommendations: [
    {
      type: "SERVICE",
      title: "Discover Premium Haircare",
      subtitle: "Tailored styling by top professionals.",
      actionId: "srv_discover"
    }
  ],
  discover: [], // Set dynamically below
  notifications: { unreadCount: 0 }
};

const MOCK_DISCOVER_POOL = [
  { id: "content_1", type: "TREND", title: "The Textured Crop", imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80", action: "BOOK_SERVICE", targetId: "srv_crop" },
  { id: "content_2", type: "TIP", title: "Rainy Day Frizz Control", imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80", action: "READ_ARTICLE", targetId: "art_12" },
  { id: "content_3", type: "INSPIRATION", title: "Modern Fade", imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=80", action: "BOOK_SERVICE", targetId: "srv_fade" },
  { id: "content_4", type: "TREND", title: "Vibrant Balayage", imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&auto=format&fit=crop&q=80", action: "BOOK_SERVICE", targetId: "srv_color" },
  { id: "content_5", type: "INSPIRATION", title: "Bridal Elegance", imageUrl: "https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=800&auto=format&fit=crop&q=80", action: "BOOK_SERVICE", targetId: "srv_bridal" },
];

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { profile, isLoading: isProfileLoading, clearProfile } = useCustomerProfile();

  async function fetchGuestDashboard() {
    try {
      const res = await fetch(getFullApiUrl("/public/inspiration"));
      if (res.ok) {
        const json = await res.json();
        let items = Array.isArray(json) ? json : (json.data || []);
        items = items.filter((p: any) => p.heroMedia?.url || p.heroMedia?.secureUrl);
        if (items.length > 0) {
          const randomizedDiscover = items.sort(() => 0.5 - Math.random()).slice(0, 8).map((p: any) => ({
            id: p.id,
            type: p.category || 'INSPIRATION',
            title: p.title,
            imageUrl: p.heroMedia?.secureUrl || p.heroMedia?.url || '',
            action: 'VIEW_INSPIRATION',
            targetId: p.slug || p.id,
          }));
          return { ...DEFAULT_GUEST_DASHBOARD, discover: randomizedDiscover };
        }
      }
    } catch (e) {
      // ignore
    }
    // fallback to mock
    const mockDiscover = [...MOCK_DISCOVER_POOL].sort(() => 0.5 - Math.random()).slice(0, 3);
    return { ...DEFAULT_GUEST_DASHBOARD, discover: mockDiscover };
  }

  useEffect(() => {
    if (isProfileLoading) return; // wait until profile context finishes loading from localStorage

    async function fetchDashboard() {
      try {
        const token = profile?.deviceToken || localStorage.getItem("anex_device_token");
        if (!token) {
          // Guest User (No device registered yet) -> Load Guest Dashboard
          const guestData = await fetchGuestDashboard();
          setData(guestData);
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
          const guestData = await fetchGuestDashboard();
          setData(guestData);
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
