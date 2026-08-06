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
      {/* Aggressive Modal prompt for users who haven't subscribed */}
      {isSupported && permission === "default" && profile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Don't Miss Out!</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Enable notifications to instantly receive exclusive offers, appointment reminders, and salon updates.
              </p>
            </div>

            <Button 
              size="lg" 
              onClick={() => subscribeToPush(profile.id)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12 text-md"
            >
              <Bell className="w-5 h-5 mr-2" />
              Allow Notifications
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
