"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface DiscoverCarouselProps {
  items: DiscoverItem[];
}

function getHref(item: DiscoverItem): string {
  if (item.action === 'VIEW_INSPIRATION') {
    return `/inspiration/${item.targetId}`;
  }
  return `/inspiration`;
}

function getSafeImageUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^http:\/\//, 'https://');
}

export function DiscoverCarousel({ items }: DiscoverCarouselProps) {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="space-y-5"
    >
      <div className="flex items-end justify-between px-6">
        <div>
          <h3 className="text-2xl font-serif tracking-tight text-white mb-0.5">Lookbook</h3>
          <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Curated Inspiration</p>
        </div>
        <Link href="/inspiration">
          <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-white px-2" haptic="light">
            Explore <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Edge-to-edge carousel: no px on the container, but padding inside the scroll area */}
      <div className="flex gap-4 overflow-x-auto pb-6 px-6 no-scrollbar snap-x snap-mandatory">
        {items.map((item) => {
          const safeUrl = getSafeImageUrl(item.imageUrl);
          return (
            <Link
              key={item.id}
              href={getHref(item)}
              className="snap-start shrink-0 w-[260px] relative rounded-[2rem] overflow-hidden group cursor-pointer block ring-1 ring-white/10 hover:ring-white/30 transition-all shadow-2xl"
            >
              <div className="aspect-[4/5] relative bg-zinc-900">
                {safeUrl ? (
                  <Image
                    src={safeUrl}
                    alt={item.title}
                    fill
                    className="absolute inset-0 object-cover transition-transform duration-1000 group-hover:scale-110 will-change-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}

                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-primary">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-white font-serif text-lg leading-tight mb-4 line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="w-full h-10 border-white/20 text-white bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border text-xs font-semibold group-hover:bg-white group-hover:text-black transition-colors duration-300">
                    View Look
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        {/* Spacer for the right edge */}
        <div className="shrink-0 w-2" />
      </div>
    </motion.div>
  );
}
