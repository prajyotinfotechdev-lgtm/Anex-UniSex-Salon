"use client";

import { useEffect, useState } from 'react';

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

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check if already subscribed
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const subscribeToPush = async (customerId: string) => {
    if (!isSupported) {
      console.warn('Push notifications are not supported by this browser.');
      return;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) {
          throw new Error('VAPID public key not found in environment');
        }

        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        setSubscription(sub);

        // Send subscription to backend
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: sub,
            customerId,
          }),
        });

        return true;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
    return false;
  };

  const unsubscribeFromPush = async (customerId: string) => {
    if (!subscription) return false;

    try {
      const successful = await subscription.unsubscribe();
      if (successful) {
        setSubscription(null);
        setPermission('default');
        
        // Remove subscription from backend
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customerId }),
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
    return false;
  };

  return {
    isSupported,
    permission,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
