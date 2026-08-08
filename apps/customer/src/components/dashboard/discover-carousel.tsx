"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DiscoverItem {
  id: string;
  type: string;
  title: string;
  imageUrl: string;
  action: string;
  targetId: string;
}

interface DiscoverCarouselProps {
  items: DiscoverItem[];
}

function getHref(item: DiscoverItem): string {
  if (item.action === 'VIEW_INSPIRATION') return `/inspiration/${item.targetId}`;
  return `/inspiration`;
}

function getSafeImageUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^http:\/\//, 'https://');
}

function CarouselItem({ item, containerRef }: {
  item: DiscoverItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const safeUrl = getSafeImageUrl(item.imageUrl);
  const itemRef = useRef<HTMLAnchorElement>(null);
  const { scrollXProgress } = useScroll({ container: containerRef });
  const x = useTransform(scrollXProgress, [0, 1], ["0%", "12%"]);

  return (
    <Link
      ref={itemRef}
      href={getHref(item)}
      className="snap-start shrink-0 w-[230px] relative rounded-[1.75rem] overflow-hidden group cursor-pointer block
        ring-1 ring-black/8 hover:ring-[#cba876]/40
        shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgba(203,168,118,0.20)]
        transition-all duration-500"
    >
      <div className="aspect-[4/5] relative bg-zinc-100 overflow-hidden">
        {safeUrl ? (
          <motion.div style={{ x, width: "115%", height: "100%", left: "-7.5%", position: "absolute" }}>
            <Image
              src={safeUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-108 will-change-transform"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </motion.div>
        ) : (
          /* Elegant placeholder */
          <div className="absolute inset-0 bg-gradient-to-br from-[#fdf7ee] to-[#e9d8be] flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-[#cba876]/40" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
          {/* Type badge */}
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-[#cba876]" />
            <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-[#cba876]">
              {item.type.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-white font-serif text-[17px] leading-snug mb-4 line-clamp-2">
            {item.title}
          </h4>

          {/* CTA pill */}
          <div className="w-full h-10 rounded-full flex items-center justify-center border text-xs font-semibold
            border-white/25 text-white bg-white/10 backdrop-blur-md
            group-hover:bg-white group-hover:text-zinc-900 group-hover:border-transparent
            transition-all duration-300">
            View Look
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DiscoverCarousel({ items }: DiscoverCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shuffledItems, setShuffledItems] = React.useState<DiscoverItem[]>([]);
  const [isMounted, setIsMounted] = React.useState(false);
  const { resolvedTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => { setThemeReady(true); }, []);

  React.useEffect(() => {
    if (items && items.length > 0) {
      setShuffledItems([...items].sort(() => Math.random() - 0.5));
    }
    setIsMounted(true);
  }, [items]);

  if (!items || items.length === 0) return null;

  const displayItems = isMounted ? shuffledItems : items;
  const isLight = themeReady && resolvedTheme === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
      className="space-y-5"
    >
      {/* Section header */}
      <div className="flex items-end justify-between px-5">
        <div>
          <h3 className={cn(
            "text-2xl font-serif tracking-tight mb-0.5",
            isLight ? "text-zinc-900" : "text-white"
          )}>
            Lookbook
          </h3>
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-[0.18em]",
            isLight ? "text-[#cba876]/80" : "text-[#e6c896]/60"
          )}>
            Curated Inspiration
          </p>
        </div>
        <Link href="/inspiration">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 text-xs font-semibold rounded-full border gap-1",
              isLight
                ? "bg-[#fdf6ed] border-[#cba876]/25 text-[#8a6d3b] hover:bg-[#cba876]/15"
                : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
            )}
            haptic="light"
          >
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-6 px-5 no-scrollbar snap-x snap-mandatory"
      >
        {displayItems.map((item) => (
          <CarouselItem key={item.id} item={item} containerRef={scrollRef} />
        ))}
        <div className="shrink-0 w-1" />
      </div>
    </motion.div>
  );
}
