"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { StyleQuizWidget } from "@/components/style-quiz/style-quiz-widget";

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
      <div className="flex-1 pb-32 flex items-center justify-center h-screen">
        <PremiumLoader text="Loading your dashboard..." />
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
        </motion.div>
      </motion.div>

      {/* Push Notification Prompt */}
      <NotificationPrompt customerId="mock-customer-id-for-now" />

      <div className="px-6 space-y-10 mt-6">
        {/* 2. The Anex Hub (Merged Hero & Identity) */}
        <StatusHub
          urgencyState={data.urgencyState || 'normal'}
          urgentAction={data.urgentAction}
          predictiveBooking={data.predictiveBooking}
          financials={data.financials}
        />

        {/* 3. Style Quiz Widget */}
        <StyleQuizWidget />

        {/* 4. Contextual Recommendations */}
        <ContextualRecommendations recommendations={data.recommendations} />
      </div>

      {/* 4. Discover Section (Edge to Edge) */}
      <div className="mt-12">
        <DiscoverCarousel items={data.discover} />
      </div>

    </div>
  );
}