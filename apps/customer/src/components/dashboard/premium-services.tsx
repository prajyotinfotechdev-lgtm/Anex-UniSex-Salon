"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBookingEngine } from "../booking/booking-orchestrator";

const PREMIUM_SERVICES = [
  {
    id: "premium-1",
    name: "24K Gold Facial",
    description: "Ultimate luxury treatment for glowing skin.",
    price: "₹4,999",
    duration: "60 mins"
  },
  {
    id: "premium-2",
    name: "Keratin Deep Therapy",
    description: "Restores and smooths frizzy hair instantly.",
    price: "₹6,499",
    duration: "120 mins"
  },
  {
    id: "premium-3",
    name: "Bridal Platinum Package",
    description: "Complete styling, makeup, and prep.",
    price: "₹24,999",
    duration: "Half Day"
  }
];

export function PremiumServicesList() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-4"
    >
      <div className="px-6 flex items-end justify-between">
        <div>
          <h3 className="text-xl font-serif tracking-tight text-zinc-900 dark:text-white mb-0.5 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary fill-primary" />
            Best Premium
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-500 font-medium tracking-wide uppercase">Signature Services</p>
        </div>
        <Button variant="ghost" className="text-xs text-primary font-semibold pr-0 hover:bg-transparent" onClick={() => router.push("/book")}>
          View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Button>
      </div>
      
      <div className="px-6 space-y-3">
        {PREMIUM_SERVICES.map((service, i) => (
          <motion.div 
            key={service.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
          >
            <Card className="border-black/5 dark:border-white/5 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-black hover:border-primary/30 transition-all shadow-md group rounded-2xl overflow-hidden cursor-pointer" onClick={() => router.push("/book")}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-base text-zinc-900 dark:text-white mb-0.5">{service.name}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] line-clamp-1">{service.description}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="font-semibold text-primary">{service.price}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{service.duration}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
