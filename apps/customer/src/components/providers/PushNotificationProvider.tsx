"use client";

import { useEffect, useState } from "react";
import { useCustomerProfile } from "./CustomerProfileContext";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useCustomerProfile();
  const { isSupported, permission, subscription, subscribeToPush, ensureSubscription } = usePushNotifications();

  // Track loading state so button doesn't double-fire
  const [isSubscribing, setIsSubscribing] = useState(false);
  // Track if user explicitly dismissed the modal this session
  const [dismissed, setDismissed] = useState(false);

  /**
   * AUTO-RECOVERY EFFECT
   * Runs every time the profile loads (i.e., every app open).
   * Handles the case where:
   *   - Permission is "granted" in the browser
   *   - But the push subscription was lost (browser cleared it, SW updated, etc.)
   *   - OR it was never saved to the DB (subscription attempt failed silently)
   *
   * This silently re-subscribes and saves to the DB with no user interaction.
   */
  useEffect(() => {
    if (!profile?.id || !isSupported) return;

    // Give the SW a moment to register from the layout script
    const timer = setTimeout(() => {
      ensureSubscription(profile.id);
    }, 2000);

    return () => clearTimeout(timer);
  }, [profile?.id, isSupported, ensureSubscription]);

  const handleAllowNotifications = async () => {
    if (!profile?.id || isSubscribing) return;

    setIsSubscribing(true);
    const result = await subscribeToPush(profile.id);
    setIsSubscribing(false);

    if (result === 'denied') {
      // User denied — dismiss the modal
      setDismissed(true);
    }
    // If 'granted' the permission state will update and modal will hide automatically
    // If 'failed' keep showing the modal so they can try again
  };

  /**
   * Modal visibility logic:
   * Show the modal only when ALL of the following are true:
   * - Push is supported on this device/browser
   * - The browser permission is still "default" (not yet asked)
   * - The user is logged in
   * - The user hasn't dismissed it this session
   */
  const showModal = isSupported && permission === "default" && !!profile && !dismissed;

  /**
   * Show a secondary banner if permission was granted but no subscription
   * is active (recovery failed or subscription was lost and recovery
   * hasn't kicked in yet). This helps the user manually trigger a fix.
   */
  const showResubscribeBanner =
    isSupported &&
    permission === "granted" &&
    !subscription &&
    !!profile &&
    !isSubscribing;

  return (
    <>
      {children}

      {/* === FIRST-TIME PERMISSION MODAL === */}
      {showModal && (
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

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setDismissed(true)}
                className="flex-1 rounded-xl h-12 text-zinc-400 hover:text-white"
              >
                Not Now
              </Button>
              <Button
                size="lg"
                onClick={handleAllowNotifications}
                disabled={isSubscribing}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12"
              >
                <Bell className="w-5 h-5 mr-2" />
                {isSubscribing ? "Enabling..." : "Enable"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* === SILENT RE-SUBSCRIBE: no UI, handled by ensureSubscription above === */}
      {/* === RESUBSCRIBE BANNER (fallback if auto-recovery fails) === */}
      {showResubscribeBanner && (
        <div className="fixed bottom-24 left-4 right-4 z-50 p-3 bg-yellow-900/80 backdrop-blur-xl border border-yellow-700/50 shadow-2xl rounded-2xl flex items-center gap-3">
          <BellOff className="w-5 h-5 text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-200 flex-1">Notifications are off. Tap to re-enable.</p>
          <Button
            size="sm"
            onClick={handleAllowNotifications}
            disabled={isSubscribing}
            className="rounded-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs"
          >
            {isSubscribing ? "..." : "Fix"}
          </Button>
        </div>
      )}
    </>
  );
}
