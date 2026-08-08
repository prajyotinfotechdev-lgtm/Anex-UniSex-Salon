"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

interface Recommendation {
  type: string;
  title: string;
  subtitle: string;
  actionId: string;
}

const TYPE_EMOJI: Record<string, string> = {
  SERVICE: "✂️",
  PRODUCT: "🧴",
  OFFER: "🎁",
  MEMBERSHIP: "👑",
  LOYALTY: "⭐",
};

export function ContextualRecommendations({ recommendations }: { recommendations: Recommendation[] }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="space-y-4"
    >
      {/* Section header */}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-xl font-serif font-semibold tracking-tight text-stone-900 dark:text-white">
            Curated For You
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a96e] dark:text-[#e4c27e] mt-0.5">
            Personalised picks
          </p>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory -mx-5 px-5">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 + i * 0.07, duration: 0.4 }}
            className="snap-start shrink-0 w-[230px] cursor-pointer group"
          >
            <div className="
              h-full rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-300
              bg-white border-stone-200/70
              shadow-[0_2px_16px_rgba(201,169,110,0.07)]
              hover:border-[#c9a96e]/40 hover:shadow-[0_4px_24px_rgba(201,169,110,0.16)]
              dark:bg-[#111111] dark:border-white/8
              dark:hover:border-white/20 dark:hover:shadow-none
            ">
              {/* Icon badge */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg
                bg-[#c9a96e]/10 dark:bg-[#e4c27e]/8
                group-hover:scale-110 transition-transform duration-300">
                {TYPE_EMOJI[rec.type] || <Sparkles className="w-4 h-4 text-[#c9a96e]" />}
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="font-semibold text-[15px] leading-snug text-stone-900 dark:text-white mb-1.5">
                  {rec.title}
                </p>
                <p className="text-xs leading-relaxed line-clamp-2 text-stone-500 dark:text-zinc-400">
                  {rec.subtitle}
                </p>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1 text-xs font-bold
                text-[#c9a96e] dark:text-[#e4c27e]
                group-hover:gap-2 transition-all duration-200">
                Explore
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ))}
        <div className="shrink-0 w-1" />
      </div>
    </motion.div>
  );
}
