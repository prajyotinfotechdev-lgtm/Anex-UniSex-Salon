"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Recommendation {
  type: string;
  title: string;
  subtitle: string;
  actionId: string;
}

interface ContextualRecommendationsProps {
  recommendations: Recommendation[];
}

const ICONS: Record<string, string> = {
  SERVICE: "✂️",
  PRODUCT: "🧴",
  OFFER: "✨",
  MEMBERSHIP: "👑",
  LOYALTY: "🎁",
};

export function ContextualRecommendations({ recommendations }: ContextualRecommendationsProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!recommendations || recommendations.length === 0) return null;

  const isLight = mounted && resolvedTheme === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <h3 className={cn(
            "text-xl font-serif tracking-tight mb-0.5",
            isLight ? "text-zinc-900" : "text-white"
          )}>
            Curated For You
          </h3>
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-[0.15em]",
            isLight ? "text-[#cba876]/80" : "text-[#e6c896]/60"
          )}>
            Personalised
          </p>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory -mx-5 px-5">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
          >
            <Card
              className={cn(
                "snap-start shrink-0 w-[240px] cursor-pointer group transition-all duration-300 rounded-2xl overflow-hidden border",
                isLight
                  ? "bg-gradient-to-br from-[#fffdf9] to-[#fdf7ee] border-[#cba876]/18 hover:border-[#cba876]/40 shadow-[0_2px_20px_rgba(203,168,118,0.10)] hover:shadow-[0_4px_32px_rgba(203,168,118,0.20)]"
                  : "bg-gradient-to-br from-zinc-900 to-black border-white/8 hover:border-white/20 shadow-xl"
              )}
            >
              <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                <div>
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-lg transition-transform group-hover:scale-110",
                    isLight ? "bg-[#cba876]/12" : "bg-white/8"
                  )}>
                    {ICONS[rec.type] || <Sparkles className="w-4 h-4 text-[#cba876]" />}
                  </div>

                  <p className={cn(
                    "font-semibold text-[15px] leading-snug mb-1.5",
                    isLight ? "text-zinc-900" : "text-white"
                  )}>
                    {rec.title}
                  </p>
                  <p className={cn(
                    "text-xs leading-relaxed line-clamp-2",
                    isLight ? "text-zinc-500" : "text-zinc-400"
                  )}>
                    {rec.subtitle}
                  </p>
                </div>

                {/* CTA */}
                <div className={cn(
                  "flex items-center text-xs font-bold gap-1 transition-colors",
                  isLight
                    ? "text-[#cba876] group-hover:text-[#b8966a]"
                    : "text-[#e6c896] group-hover:text-[#cba876]"
                )}>
                  Explore
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        <div className="shrink-0 w-2" />
      </div>
    </motion.div>
  );
}
