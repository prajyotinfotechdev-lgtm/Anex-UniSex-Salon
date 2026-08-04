"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Recommendation {
  type: string;
  title: string;
  subtitle: string;
  actionId: string;
}

interface ContextualRecommendationsProps {
  recommendations: Recommendation[];
}

export function ContextualRecommendations({ recommendations }: ContextualRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="space-y-4"
    >
      <div className="px-1">
        <h3 className="text-xl font-serif tracking-tight text-white mb-0.5">Curated For You</h3>
        <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Personalized Recommendations</p>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory -mx-6 px-6">
        {recommendations.map((rec, i) => (
          <Card 
            key={i} 
            className="snap-start shrink-0 w-[280px] border-white/5 bg-gradient-to-br from-zinc-900 to-black hover:border-primary/30 transition-all shadow-xl group rounded-2xl overflow-hidden cursor-pointer"
          >
            <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
              <div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <p className="font-medium text-base text-white leading-tight mb-1">
                  {rec.title}
                </p>
                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                  {rec.subtitle}
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-primary group-hover:text-primary/80 transition-colors">
                Explore <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        ))}
        {/* Spacer for right edge */}
        <div className="shrink-0 w-2" />
      </div>
    </motion.div>
  );
}
