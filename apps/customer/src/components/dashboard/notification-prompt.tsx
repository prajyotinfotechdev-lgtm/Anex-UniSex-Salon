"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useState, useEffect } from "react";

export function NotificationPrompt({ customerId }: { customerId: string }) {
  const { isSupported, permission, subscribeToPush } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show prompt only if supported, and we haven't asked yet (permission is default)
    if (isSupported && permission === 'default') {
      const timer = setTimeout(() => setIsVisible(true), 3000); // delay prompt slightly so it isn't overwhelming on load
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="mx-6 mt-4 relative rounded-2xl overflow-hidden bg-primary/10 border border-primary/20 p-5 shadow-lg flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">Stay Updated!</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Enable notifications for appointment reminders and exclusive offers.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            onClick={() => {
              subscribeToPush(customerId);
              setIsVisible(false);
            }}
            className="rounded-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
          >
            Enable
          </Button>
          <button 
            onClick={() => setIsVisible(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
