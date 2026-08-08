"use client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Bell, UserPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumLoader } from "@/components/ui/premium-loader";
import { useDashboard } from "@/hooks/use-dashboard";
import { useCustomerProfile } from "@/components/providers/CustomerProfileContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";

import { StatusHub } from "@/components/dashboard/status-hub";
import { DiscoverCarousel } from "@/components/dashboard/discover-carousel";
import { NotificationPrompt } from "@/components/dashboard/notification-prompt";
import { ContextualRecommendations } from "@/components/dashboard/contextual-recommendations";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const { data, isLoading, error } = useDashboard();
  const { profile, isGuest, isLoading: profileLoading } = useCustomerProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState("Hello");

  useEffect(() => {
    if (!profileLoading && isGuest) {
      const t = setTimeout(() => setShowOnboarding(true), 400);
      return () => clearTimeout(t);
    }
  }, [profileLoading, isGuest]);

  useEffect(() => {
    if (error) toast.error("Could not load your dashboard", { description: "Please check your connection and try again." });
  }, [error]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setTimeGreeting("Good Morning");
    else if (h < 18) setTimeGreeting("Good Afternoon");
    else setTimeGreeting("Good Evening");
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 pb-32 flex items-center justify-center h-screen">
        <PremiumLoader text="Loading your dashboard..." />
      </div>
    );
  }

  if (!data) return null;

  const displayName = profile
    ? profile.firstName
    : (() => {
        const parts = data.greeting.split(',');
        return parts.length > 1 ? parts[1].trim() : data.greeting;
      })();

  return (
    <div className="flex-1 pb-36 overflow-x-hidden">
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && <OnboardingCard onClose={() => setShowOnboarding(false)} />}
      </AnimatePresence>

      {/* ── HEADER ───────────────────────────────────────────── */}
      <motion.header
        className={cn(
          "sticky top-0 z-50 px-5 pb-4 pt-12 transition-all duration-500",
          scrolled
            ? "bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-b border-stone-200 dark:border-white/8 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="flex items-center justify-between">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Time-of-day label — gold in light, gold in dark */}
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c9a96e] dark:text-[#e4c27e] mb-0.5">
              {timeGreeting}
            </p>
            <h1 className="text-[28px] font-serif font-semibold text-stone-900 dark:text-white tracking-tight leading-none">
              {displayName}
            </h1>
          </motion.div>

          {/* Action icons */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Notifications */}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Button
                variant="ghost" size="icon"
                className="rounded-full h-11 w-11 relative
                  bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-600
                  dark:bg-white/8 dark:border-white/10 dark:hover:bg-white/15 dark:text-white"
                haptic="light"
              >
                <Bell className="w-4 h-4" />
                {(data.notifications?.unreadCount || 0) > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#c9a96e] rounded-full ring-2 ring-white dark:ring-black" />
                )}
              </Button>
            </motion.div>

            {/* Guest sign-up */}
            {isGuest && (
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <Button
                  variant="ghost" size="icon"
                  className="rounded-full h-11 w-11
                    bg-[#c9a96e]/12 border border-[#c9a96e]/35 hover:bg-[#c9a96e]/22 text-[#a07840]
                    dark:bg-[#e4c27e]/10 dark:border-[#e4c27e]/25 dark:hover:bg-[#e4c27e]/18 dark:text-[#e4c27e]"
                  onClick={() => setShowOnboarding(true)}
                  haptic="medium"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Theme toggle */}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Button
                variant="ghost" size="icon"
                className="rounded-full h-11 w-11
                  bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-600
                  dark:bg-white/8 dark:border-white/10 dark:hover:bg-white/15 dark:text-white"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                haptic="medium"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Notification bar */}
      <div className="px-5">
        <NotificationPrompt customerId="mock-customer-id-for-now" />
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="px-5 space-y-8 mt-5">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] dark:bg-[#e4c27e]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a96e] dark:text-[#e4c27e]">
            Your Status
          </span>
        </motion.div>

        {/* Hero Card */}
        <StatusHub
          urgencyState={data.urgencyState || 'normal'}
          urgentAction={data.urgentAction}
          predictiveBooking={data.predictiveBooking}
          financials={data.financials}
        />

        {/* Recommendations */}
        <ContextualRecommendations recommendations={data.recommendations} />
      </div>

      {/* ── LOOKBOOK ─────────────────────────────────────────── */}
      <div className="mt-12">
        <DiscoverCarousel items={data.discover} />
      </div>
    </div>
  );
}