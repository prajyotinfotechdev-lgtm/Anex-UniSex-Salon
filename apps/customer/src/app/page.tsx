"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";
import { toast } from "sonner";
import { useEffect } from "react";

// Dashboard Components
import { HeroCard } from "@/components/dashboard/hero-card";
import { IdentityCard } from "@/components/dashboard/identity-card";
import { DiscoverCarousel } from "@/components/dashboard/discover-carousel";
import { ContextualRecommendations } from "@/components/dashboard/contextual-recommendations";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const { data, isLoading, error } = useDashboard();

  useEffect(() => {
    if (error) {
      toast.error("Could not load your dashboard", {
        description: "Please check your connection and try again.",
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 pt-12 space-y-8 pb-32">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-6 w-32 rounded-md" />
          <div className="flex gap-4 overflow-hidden">
            <Skeleton className="h-72 w-64 rounded-3xl shrink-0" />
            <Skeleton className="h-72 w-64 rounded-3xl shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null; // Let the error toast handle it

  return (
    <div className="flex-1 p-6 pt-12 space-y-8 pb-32">
      {/* 1. Header (Greeting + Actions) */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">
          {data.greeting.split(',')[0]}, <br />
          <span className="text-primary">{data.greeting.split(',')[1]}</span>
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 relative" haptic="light">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {(data.notifications?.unreadCount || 0) > 0 && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            haptic="medium"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* 2. Dynamic Hero Card (Urgency State Takeover) */}
      <HeroCard
        urgencyState={data.urgencyState || 'normal'}
        urgentAction={data.urgentAction}
        predictiveBooking={data.predictiveBooking}
      />

      {/* 3. Digital Identity Card */}
      {data.financials && <IdentityCard financials={data.financials} />}

      {/* 4. Contextual Recommendations */}
      <ContextualRecommendations recommendations={data.recommendations} />

      {/* 5. Discover Section */}
      <DiscoverCarousel items={data.discover} />

    </div>
  );
}