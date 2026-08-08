"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, CalendarDays, Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Inspire", href: "/inspiration", icon: Sparkles },
  { name: "Book", href: "/book", icon: Calendar },
  { name: "Appointments", href: "/appointments", icon: CalendarDays },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] w-[92%] max-w-sm pointer-events-none">
      <div className="flex items-center justify-between w-full rounded-full bg-card/40 backdrop-blur-3xl border border-border/30 px-3 py-2.5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] pointer-events-auto ring-1 ring-border/10">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center justify-center w-12 h-12 rounded-full group outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="floating-nav-indicator"
                  className="absolute inset-0 bg-primary/20 rounded-[1.25rem] border border-primary/20 shadow-inner"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8
                  }}
                />
              )}
              
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                className="relative z-10"
              >
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] transition-all duration-300",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  strokeWidth={isActive ? 2 : 1.25}
                />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
