"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Dashboard Components
import { StatusHub } from "@/components/dashboard/status-hub";
import { DiscoverCarousel } from "@/components/dashboard/discover-carousel";
import { ContextualRecommendations } from "@/components/dashboard/contextual-recommendations";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const { data, isLoading, error } = useDashboard();
  const [scrolled, setScrolled] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState("Hello");

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

  // Split greeting if possible, or use the dynamic one
  const nameParts = data.greeting.split(',');
  const firstName = nameParts.length > 1 ? nameParts[1].trim() : data.greeting;

  return (
    <div className="flex-1 pb-32">
      {/* 1. Dynamic Sticky Header */}
      <motion.div 
        className={cn(
          "sticky top-0 z-50 px-6 pt-12 pb-4 transition-all duration-300 flex items-center justify-between",
          scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-sm" : "bg-transparent"
        )}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl md:text-2xl font-light text-zinc-400 tracking-wide">
            {timeGreeting},
          </h1>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-white tracking-tight">
            {firstName}
          </h2>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 relative bg-white/5 border border-white/10 hover:bg-white/10 text-white" haptic="light">
            <Bell className="w-4 h-4" />
            {(data.notifications?.unreadCount || 0) > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-black" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-11 w-11 bg-white/5 border border-white/10 hover:bg-white/10 text-white"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            haptic="medium"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
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