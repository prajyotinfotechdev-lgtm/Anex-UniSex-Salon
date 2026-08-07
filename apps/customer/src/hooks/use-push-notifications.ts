"use client";

import { useEffect, useState, useCallback } from 'react';

// Utility to convert Base64 URL to Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Creates a brand-new push subscription using VAPID key.
 * Called both on first subscribe and on auto-recovery.
 */
async function createPushSubscription(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicVapidKey) {
    console.error('[PushNotif] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set.');
    return null;
  }
  try {
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    return sub;
  } catch (err) {
    console.error('[PushNotif] pushManager.subscribe failed:', err);
    return null;
  }
}

/**
 * Saves a push subscription to the backend DB.
 * This is idempotent – calling it multiple times is safe.
 */
async function saveSubscriptionToBackend(subscription: PushSubscription, customerId: string): Promise<void> {
  try {
    const res = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, customerId }),
    });
    if (!res.ok) {
      console.error('[PushNotif] Failed to save subscription to backend:', await res.text());
    } else {
      console.log('[PushNotif] Subscription saved to backend successfully.');
    }
  } catch (err) {
    console.error('[PushNotif] Network error saving subscription:', err);
  }
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Wait for the SW to be ready (handles timing with layout's registration)
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  /**
   * Full subscribe flow:
   * 1. Request browser permission
   * 2. Create push subscription with VAPID
   * 3. Save to backend
   * Returns 'granted' | 'denied' | 'failed'
   */
  const subscribeToPush = useCallback(async (customerId: string): Promise<'granted' | 'denied' | 'failed'> => {
    if (!isSupported) {
      console.warn('[PushNotif] Push notifications not supported.');
      return 'failed';
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        return 'denied';
      }

      const registration = await navigator.serviceWorker.ready;

      // Check if a subscription already exists (e.g., browser remembers it)
      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        sub = await createPushSubscription(registration);
      }

      if (!sub) {
        return 'failed';
      }

      setSubscription(sub);
      await saveSubscriptionToBackend(sub, customerId);
      return 'granted';
    } catch (error) {
      console.error('[PushNotif] subscribeToPush error:', error);
      return 'failed';
    }
  }, [isSupported]);

  /**
   * Auto-recovery: if permission is already granted but no push
   * subscription exists in the browser (e.g., after SW update, 
   * browser cache clear, or expired subscription), silently
   * create a new one and save it.
   */
  const ensureSubscription = useCallback(async (customerId: string): Promise<void> => {
    if (!isSupported || Notification.permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();

      if (!sub) {
        console.log('[PushNotif] Permission granted but no subscription found – auto-recovering...');
        sub = await createPushSubscription(registration);
      }

      if (sub) {
        setSubscription(sub);
        await saveSubscriptionToBackend(sub, customerId);
      }
    } catch (err) {
      console.error('[PushNotif] ensureSubscription error:', err);
    }
  }, [isSupported]);

  const unsubscribeFromPush = useCallback(async (customerId: string): Promise<boolean> => {
    if (!subscription) return false;

    try {
      const successful = await subscription.unsubscribe();
      if (successful) {
        setSubscription(null);
        setPermission('default');

        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId }),
        });

        return true;
      }
    } catch (error) {
      console.error('[PushNotif] unsubscribeFromPush error:', error);
    }
    return false;
  }, [subscription]);

  return {
    isSupported,
    permission,
    subscription,
    subscribeToPush,
    ensureSubscription,
    unsubscribeFromPush,
  };
}
