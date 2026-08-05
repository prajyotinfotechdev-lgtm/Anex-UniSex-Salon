"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ContextualRecommendations } from "@/components/dashboard/contextual-recommendations";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const { data, isLoading, error } = useDashboard();
  const { profile, isGuest, isLoading: profileLoading } = useCustomerProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState("Hello");

  // Show onboarding after profile context finishes loading and user is still a guest
  useEffect(() => {
    if (!profileLoading && isGuest) {
      // Tiny delay so the splash screen finishes first
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
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
      <div className="flex-1 pb-32">
        <div className="p-6 pt-12 flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48 rounded-lg bg-zinc-900" />
          <Skeleton className="h-12 w-12 rounded-full bg-zinc-900" />
        </div>
        <div className="px-6 space-y-8">
          <Skeleton className="h-72 w-full rounded-3xl bg-zinc-900" />
          <div className="space-y-4 mt-8">
            <Skeleton className="h-6 w-32 rounded-md bg-zinc-900" />
            <div className="flex gap-4 overflow-hidden">
              <Skeleton className="h-72 w-64 rounded-3xl shrink-0 bg-zinc-900" />
              <Skeleton className="h-72 w-64 rounded-3xl shrink-0 bg-zinc-900" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Priority: live profile name > API greeting name > fallback
  const displayName = profile
    ? profile.firstName
    : (() => {
        const nameParts = data.greeting.split(',');
        return nameParts.length > 1 ? nameParts[1].trim() : data.greeting;
      })();

  return (
    <div className="flex-1 pb-32">
      {/* Premium Onboarding Card */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingCard onClose={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>
      {/* 1. Dynamic Sticky Header */}
      <motion.div 
        className={cn(
          "sticky top-0 z-50 px-6 pt-12 pb-4 transition-all duration-300 flex items-center justify-between",
          scrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 shadow-sm" : "bg-transparent"
        )}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl md:text-2xl font-light text-zinc-500 dark:text-zinc-400 tracking-wide">
            {timeGreeting},
          </h1>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-zinc-900 dark:text-white tracking-tight">
            {displayName}
          </h2>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 relative bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-800 dark:text-white" haptic="light">
              <Bell className="w-4 h-4" />
              {(data.notifications?.unreadCount || 0) > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-black" />
              )}
            </Button>
          </motion.div>
          {isGuest && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-11 w-11 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary"
                onClick={() => setShowOnboarding(true)}
                haptic="medium"
                title="Create your profile"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-11 w-11 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-800 dark:text-white"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              haptic="medium"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="px-6 space-y-10 mt-6">
        {/* 2. The Anex Hub (Merged Hero & Identity) */}
        <StatusHub
          urgencyState={data.urgencyState || 'normal'}
          urgentAction={data.urgentAction}
          predictiveBooking={data.predictiveBooking}
          financials={data.financials}
        />

        {/* Quick Actions Scroll Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6"
        >
          {['Quick Book', 'Gift Cards', 'My Packages', 'Refer a Friend'].map((action, i) => (
            <Button 
              key={action} 
              variant="outline" 
              className="rounded-full whitespace-nowrap bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20 text-zinc-700 dark:text-zinc-300 transition-all"
              haptic="light"
            >
              {action}
            </Button>
          ))}
        </motion.div>

        {/* 3. Contextual Recommendations */}
        <ContextualRecommendations recommendations={data.recommendations} />
      </div>

      {/* 4. Discover Section (Edge to Edge) */}
      <div className="mt-12">
        <DiscoverCarousel items={data.discover} />
      </div>

    </div>
  );
}