"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, CalendarDays, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Inspire", href: "/inspiration", icon: Sparkles },
  { name: "Book", href: "/book", icon: Calendar },
  { name: "Appts", href: "/appointments", icon: CalendarDays },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] w-full max-w-[24rem] pointer-events-none px-4">
      <div className="flex items-center justify-between w-full rounded-full bg-background/80 backdrop-blur-2xl border border-border/40 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto ring-1 ring-white/5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => haptics.trigger("light")}
              className="relative outline-none group"
            >
              <div
                className={cn(
                  "flex items-center justify-center h-12 rounded-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                  isActive 
                    ? "bg-primary shadow-[0_0_20px_rgba(212,175,55,0.3)] px-4 w-auto" 
                    : "bg-transparent hover:bg-white/5 w-12"
                )}
              >
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] shrink-0 transition-colors duration-500",
                    isActive ? "text-black" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                
                {/* Expanding Text Container */}
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex items-center",
                    isActive ? "max-w-[100px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
                  )}
                >
                  <span className="text-black font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
