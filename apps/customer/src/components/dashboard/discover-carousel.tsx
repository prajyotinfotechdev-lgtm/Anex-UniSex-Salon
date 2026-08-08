"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface DiscoverItem {
  id: string;
  type: string;
  title: string;
  imageUrl: string;
  action: string;
  targetId: string;
}

function getSafeUrl(url: string) {
  if (!url) return '';
  return url.replace(/^http:\/\//, 'https://');
}

function getHref(item: DiscoverItem) {
  return item.action === 'VIEW_INSPIRATION' ? `/inspiration/${item.targetId}` : '/inspiration';
}

function CarouselCard({ item, containerRef }: {
  item: DiscoverItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const safeUrl = getSafeUrl(item.imageUrl);
  const { scrollXProgress } = useScroll({ container: containerRef });
  const x = useTransform(scrollXProgress, [0, 1], ["0%", "10%"]);

  return (
    <Link
      href={getHref(item)}
      className="
        snap-start shrink-0 w-[220px] block rounded-[1.75rem] overflow-hidden group
        ring-1 ring-stone-200 hover:ring-[#c9a96e]/60
        dark:ring-white/8 dark:hover:ring-white/25
        shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_rgba(201,169,110,0.22)]
        dark:shadow-none
        transition-all duration-500
      "
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-stone-100 dark:bg-zinc-900">
        {safeUrl ? (
          <motion.div style={{ x, width: "115%", height: "100%", left: "-7.5%", position: "absolute" }}>
            <Image
              src={safeUrl} alt={item.title} fill
              className="object-cover group-hover:scale-105 transition-transform duration-1000 will-change-transform"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </motion.div>
        ) : (
          /* Placeholder */
          <div className="absolute inset-0 flex items-center justify-center
            bg-gradient-to-br from-stone-100 to-[#f0e4cc]
            dark:from-zinc-900 dark:to-zinc-800">
            <Sparkles className="w-10 h-10 text-[#c9a96e]/40 dark:text-[#e4c27e]/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent
          opacity-75 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4
          translate-y-1 group-hover:translate-y-0 transition-transform duration-400">
          {/* Type */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-[#c9a96e]" />
            <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#c9a96e]">
              {item.type.replace(/_/g, ' ')}
            </span>
          </div>
          {/* Title */}
          <h4 className="text-white font-serif text-base leading-snug line-clamp-2 mb-3">
            {item.title}
          </h4>
          {/* CTA pill */}
          <div className="
            w-full h-9 rounded-full border flex items-center justify-center text-[11px] font-semibold
            border-white/25 text-white bg-white/12 backdrop-blur-sm
            group-hover:bg-white group-hover:text-stone-900 group-hover:border-transparent
            transition-all duration-300
          ">
            View Look
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DiscoverCarousel({ items }: { items: DiscoverItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shuffled, setShuffled] = useState<DiscoverItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (items?.length) setShuffled([...items].sort(() => Math.random() - 0.5));
    setReady(true);
  }, [items]);

  if (!items?.length) return null;

  const display = ready ? shuffled : items;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-end justify-between px-5">
        <div>
          <h3 className="text-2xl font-serif font-semibold tracking-tight text-stone-900 dark:text-white">
            Lookbook
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a96e] dark:text-[#e4c27e] mt-0.5">
            Curated Inspiration
          </p>
        </div>
        <Link href="/inspiration">
          <div className="
            flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border
            bg-[#c9a96e]/8 border-[#c9a96e]/30 text-[#8a6030]
            hover:bg-[#c9a96e]/15 hover:border-[#c9a96e]/50
            dark:bg-[#e4c27e]/8 dark:border-[#e4c27e]/20 dark:text-[#e4c27e]
            dark:hover:bg-[#e4c27e]/15
            transition-all duration-200
          ">
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Scroll row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-6 px-5 no-scrollbar snap-x snap-mandatory"
      >
        {display.map(item => (
          <CarouselCard key={item.id} item={item} containerRef={scrollRef} />
        ))}
        <div className="shrink-0 w-1" />
      </div>
    </motion.section>
  );
}
