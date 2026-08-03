"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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

// Build navigation href based on action type
function getHref(item: DiscoverItem): string {
  if (item.action === 'VIEW_INSPIRATION') {
    return `/inspiration/${item.targetId}`;
  }
  // Fallback for future action types
  return `/inspiration`;
}

// Ensure image URL uses https (Cloudinary can return http)
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
      transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-semibold tracking-tight">Discover</h3>
        <Link href="/inspiration">
          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground text-xs" haptic="light">
            See All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar snap-x snap-mandatory">
        {items.map((item) => {
          const safeUrl = getSafeImageUrl(item.imageUrl);
          return (
            <Link
              key={item.id}
              href={getHref(item)}
              className="snap-start shrink-0 w-64 relative rounded-3xl overflow-hidden group cursor-pointer block"
            >
              {/* Aspect Ratio Container */}
              <div className="aspect-[4/5] relative bg-muted">
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary to-muted opacity-20" />
                {safeUrl ? (
                  <Image
                    src={safeUrl}
                    alt={item.title}
                    fill
                    className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-primary/90 mb-1 block">
                    {item.type}
                  </span>
                  <h4 className="text-white font-medium leading-tight mb-3">
                    {item.title}
                  </h4>
                  <div className="w-full text-xs h-9 border-white/20 text-white bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border font-medium">
                    Explore
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
