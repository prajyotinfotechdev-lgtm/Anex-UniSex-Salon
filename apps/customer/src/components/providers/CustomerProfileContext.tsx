'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PROFILE_KEY = 'anex_customer_profile';
const DEVICE_TOKEN_KEY = 'anex_device_token';
const DEVICE_ID_KEY = 'anex_device_id';

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  primaryPhone: string;
  email?: string | null;
  gender?: string | null;
  deviceToken: string;
}

interface CustomerProfileContextType {
  profile: CustomerProfile | null;
  isGuest: boolean;
  isLoading: boolean;
  saveProfile: (profile: CustomerProfile) => void;
  clearProfile: () => void;
  updateProfileLocally: (data: Partial<CustomerProfile>) => void;
}

const CustomerProfileContext = createContext<CustomerProfileContextType | undefined>(undefined);

export function CustomerProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) {
        const parsed: CustomerProfile = JSON.parse(stored);
        setProfile(parsed);
        // Also ensure the device token is in localStorage for the dashboard hook
        localStorage.setItem(DEVICE_TOKEN_KEY, parsed.deviceToken);
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem(PROFILE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProfile = useCallback((newProfile: CustomerProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    localStorage.setItem(DEVICE_TOKEN_KEY, newProfile.deviceToken);
    setProfile(newProfile);
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(DEVICE_TOKEN_KEY);
    localStorage.removeItem(DEVICE_ID_KEY);
    setProfile(null);
  }, []);

  const updateProfileLocally = useCallback((data: Partial<CustomerProfile>) => {
    setProfile(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <CustomerProfileContext.Provider value={{
      profile,
      isGuest: !profile,
      isLoading,
      saveProfile,
      clearProfile,
      updateProfileLocally,
    }}>
      {children}
    </CustomerProfileContext.Provider>
  );
}

export function useCustomerProfile() {
  const ctx = useContext(CustomerProfileContext);
  if (!ctx) throw new Error('useCustomerProfile must be used within CustomerProfileProvider');
  return ctx;
}

/**
 * Get or generate a stable device ID for this browser session.
 * The device ID persists across sessions (same browser = same device ID).
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}
