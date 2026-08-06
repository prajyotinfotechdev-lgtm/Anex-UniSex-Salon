"use client";

import { useEffect } from "react";
import { useCustomerProfile } from "./CustomerProfileContext";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useCustomerProfile();
  const { isSupported, permission, subscribeToPush } = usePushNotifications();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return (
    <>
      {children}
      {/* Optional: Floating prompt for users who haven't subscribed */}
      {isSupported && permission === "default" && profile && (
        <div className="fixed bottom-24 left-4 right-4 z-50 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-1">Enable Notifications</h4>
            <p className="text-xs text-zinc-400">Get updates on your appointments and exclusive offers.</p>
          </div>
          <Button 
            size="sm" 
            onClick={() => subscribeToPush(profile.id)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            <Bell className="w-4 h-4 mr-2" />
            Enable
          </Button>
        </div>
      )}
    </>
  );
}
