"use client";

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

// Dashboard Components
import { StatusHub } from "@/components/dashboard/status-hub";
import { DiscoverCarousel } from "@/components/dashboard/discover-carousel";
import { NotificationPrompt } from "@/components/dashboard/notification-prompt";
import { ContextualRecommendations } from "@/components/dashboard/contextual-recommendations";

export default function HomePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { data, isLoading, error } = useDashboard();
  const { profile, isGuest, isLoading: profileLoading } = useCustomerProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState("Hello");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!profileLoading && isGuest) {
      const t = setTimeout(() => setShowOnboarding(true), 400);
      return () => clearTimeout(t);
    }
  }, [profileLoading, isGuest]);

  useEffect(() => {
    if (error) {
      toast.error("Could not load your dashboard", {
        description: "Please check your connection and try again.",
      });
    }
  }, [error]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting("Good Morning");
    else if (hour < 18) setTimeGreeting("Good Afternoon");
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
        const nameParts = data.greeting.split(',');
        return nameParts.length > 1 ? nameParts[1].trim() : data.greeting;
      })();

  const isLight = mounted && resolvedTheme === 'light';

  return (
    <div className="flex-1 pb-36 overflow-x-hidden">
      {/* Premium Onboarding Card */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingCard onClose={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      {/* === PREMIUM HERO HEADER === */}
      <div className="relative">
        {/* Soft ambient gradient behind header — only visible in light */}
        {isLight && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdf8f0] via-[#fdf8f0]/80 to-transparent pointer-events-none" />
        )}

        <motion.div
          className={cn(
            "sticky top-0 z-50 px-6 pt-12 pb-4 transition-all duration-500",
            scrolled
              ? "bg-white/85 dark:bg-black/85 backdrop-blur-2xl border-b border-[#cba876]/15 dark:border-white/5 shadow-[0_1px_24px_rgba(203,168,118,0.08)]"
              : "bg-transparent"
          )}
        >
          <div className="flex items-center justify-between pt-8">
            {/* Left: Greeting */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
              <p className={cn(
                "text-sm font-medium tracking-widest uppercase mb-0.5",
                isLight ? "text-[#cba876]" : "text-[#e6c896]"
              )}>
                {timeGreeting}
              </p>
              <h1 className="text-3xl font-serif font-semibold text-zinc-900 dark:text-white tracking-tight leading-tight">
                {displayName}
              </h1>
            </motion.div>

            {/* Right: Action Buttons */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Bell */}
              <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full h-11 w-11 relative border",
                    isLight
                      ? "bg-[#fdf6ed] border-[#cba876]/20 hover:bg-[#cba876]/10 text-zinc-700"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                  )}
                  haptic="light"
                >
                  <Bell className="w-4 h-4" />
                  {(data.notifications?.unreadCount || 0) > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#cba876] rounded-full ring-2 ring-white dark:ring-black shadow-sm" />
                  )}
                </Button>
              </motion.div>

              {/* Guest sign-up */}
              {isGuest && (
                <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-11 w-11 bg-[#cba876]/10 border border-[#cba876]/30 hover:bg-[#cba876]/20 text-[#cba876]"
                    onClick={() => setShowOnboarding(true)}
                    haptic="medium"
                    title="Create your profile"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {/* Theme toggle */}
              <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-full h-11 w-11 border",
                    isLight
                      ? "bg-[#fdf6ed] border-[#cba876]/20 hover:bg-[#cba876]/10 text-zinc-700"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                  )}
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
        </motion.div>
      </div>

      {/* Push Notification Prompt */}
      <div className="px-6">
        <NotificationPrompt customerId="mock-customer-id-for-now" />
      </div>

      {/* === MAIN CONTENT === */}
      <div className="px-5 space-y-8 mt-4">

        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#cba876]" />
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em]",
            isLight ? "text-[#cba876]" : "text-[#e6c896]"
          )}>
            Your Status
          </span>
        </motion.div>

        {/* StatusHub — The Hero */}
        <StatusHub
          urgencyState={data.urgencyState || 'normal'}
          urgentAction={data.urgentAction}
          predictiveBooking={data.predictiveBooking}
          financials={data.financials}
        />

        {/* Contextual Recommendations */}
        <ContextualRecommendations recommendations={data.recommendations} />
      </div>

      {/* Discover — Edge-to-edge */}
      <div className="mt-10">
        <DiscoverCarousel items={data.discover} />
      </div>
    </div>
  );
}