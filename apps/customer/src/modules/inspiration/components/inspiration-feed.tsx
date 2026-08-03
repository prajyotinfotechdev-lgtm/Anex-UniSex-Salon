'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ChevronRight, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCustomerInspirationFeed,
  useCustomerInspirationCollections,
  useCustomerBookmarks,
  PublicInspirationPost,
  PublicInspirationCollection,
} from '../hooks/use-inspiration';

// ─── Category definitions ─────────────────────────────────────────────────────
// Values must exactly match the InspirationCategoryEnum in the backend validator
const CATEGORIES = [
  { id: 'ALL',         label: 'For You'  },
  { id: 'HAIRCUT',     label: 'Haircut'  },
  { id: 'HAIR_COLOUR', label: 'Color'    },
  { id: 'BEARD',       label: 'Beard'    },
  { id: 'HAIR_SPA',    label: 'Spa'      },
  { id: 'BRIDAL',      label: 'Bridal'   },
  { id: 'TRENDING',    label: 'Trending' },
];

// ─── Safe image helper ────────────────────────────────────────────────────────
function getSafeImageUrl(post: PublicInspirationPost): string | null {
  return post.heroMedia?.secureUrl || post.heroMedia?.url || null;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function InspirationSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 animate-pulse space-y-12 bg-[#0a0a0a]">
      <div className="h-72 bg-white/5 rounded-[2rem] w-full" />
      <div className="flex gap-4 overflow-hidden">
        {[1,2,3].map(i => <div key={i} className="h-48 w-48 bg-white/5 rounded-3xl flex-shrink-0" />)}
      </div>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {[64, 96, 72, 80, 64, 96].map((h, i) => (
          <div key={i} className={`h-${h} bg-white/5 rounded-3xl break-inside-avoid`} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Feed Component ──────────────────────────────────────────────────────
export function InspirationFeed() {
  const { data: feedData, isLoading: isLoadingFeed } = useCustomerInspirationFeed();
  const { data: collectionsData, isLoading: isLoadingCollections } = useCustomerInspirationCollections();
  const { toggleBookmark } = useCustomerBookmarks();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Safe extraction: filter out any post without a valid hero image
  const allPosts: PublicInspirationPost[] = Array.isArray(feedData?.data) ? feedData.data : [];
  const posts = allPosts.filter(p => getSafeImageUrl(p));

  const featuredPosts = posts.filter(p => p.isFeatured);
  const collections: PublicInspirationCollection[] = collectionsData?.data || [];

  const filteredPosts = activeCategory === 'ALL'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  const handleBookmark = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleBookmark.mutateAsync(postId);
    } catch {
      // Silently fail — user not logged in
    }
  };

  if (isLoadingFeed || isLoadingCollections) return <InspirationSkeleton />;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 selection:bg-white/20">

      {/* ─── Editorial Header ─── */}
      <div className="pt-20 pb-10 px-6 text-center max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Inspiration
          </h1>
          <p className="text-zinc-400 text-sm md:text-base tracking-widest uppercase font-medium">
            Discover your next signature look
          </p>
        </motion.div>
      </div>

      {/* ─── Hero Carousel (Featured) ─── */}
      {featuredPosts.length > 0 && getSafeImageUrl(featuredPosts[0]) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="px-4 sm:px-6 mb-16"
        >
          <div className="relative w-full aspect-[4/5] sm:aspect-[21/9] rounded-[2rem] overflow-hidden group shadow-2xl">
            <Link href={`/inspiration/${featuredPosts[0].slug || featuredPosts[0].id}`}>
              <Image
                src={getSafeImageUrl(featuredPosts[0])!}
                alt={featuredPosts[0].title}
                fill
                className="object-cover transition-transform duration-[1.5s] group-hover:scale-[1.03] will-change-transform"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-widest font-semibold px-4 py-1.5 rounded-full mb-4 inline-block">
                    Featured Editorial
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4 leading-[1.1] text-white">
                    {featuredPosts[0].title}
                  </h2>
                  {featuredPosts[0].description && (
                    <p className="text-zinc-300 line-clamp-2 max-w-xl text-sm md:text-base mb-6 font-light">
                      {featuredPosts[0].description}
                    </p>
                  )}
                  <div className="flex items-center text-sm font-semibold tracking-wide bg-white text-black px-6 py-3 rounded-full w-max hover:bg-zinc-200 transition-colors">
                    View Look <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </motion.div>
              </div>
            </Link>

            <button
              onClick={(e) => handleBookmark(e, featuredPosts[0].id)}
              className="absolute top-6 right-6 p-4 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-black/40 hover:scale-110 transition-all duration-300 group/btn shadow-lg"
              aria-label="Bookmark this look"
            >
              <Heart className={cn("h-5 w-5 transition-colors", (featuredPosts[0] as any).isBookmarked ? 'fill-white text-white' : 'text-white group-hover/btn:text-red-400')} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── Collections Shelf ─── */}
      {collections.length > 0 && (
        <div className="mb-16">
          <div className="px-6 mb-6">
            <h3 className="text-2xl font-serif tracking-tight">Curated Collections</h3>
          </div>
          <div className="flex overflow-x-auto gap-4 px-6 pb-6 snap-x hide-scrollbar">
            {collections.map((collection, i) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                key={collection.id}
                className="snap-start"
              >
                <Link
                  href={`/inspiration/collection/${collection.slug || collection.id}`}
                  className="relative w-[260px] h-[340px] flex-shrink-0 rounded-[2rem] overflow-hidden group block shadow-xl border border-white/5"
                >
                  {collection.coverImage?.secureUrl ? (
                    <Image
                      src={collection.coverImage.secureUrl}
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-[1s] group-hover:scale-110 will-change-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h4 className="text-xl font-serif leading-tight mb-2">{collection.title}</h4>
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">
                      {(collection as any)._count?.posts || 0} Looks
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Category Filter (Sticky Pill Bar) ─── */}
      <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 py-4 px-4 sm:px-6 mb-10">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar justify-start sm:justify-center">
          <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/5">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "relative whitespace-nowrap px-5 py-2 text-sm font-semibold transition-all duration-300 rounded-full outline-none",
                    isActive ? 'text-black' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-white rounded-full shadow-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Masonry Grid (Pinterest Style) ─── */}
      <div className="px-4 sm:px-6 max-w-[2000px] mx-auto">
        {filteredPosts.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
            <AnimatePresence>
              {filteredPosts.map((post) => {
                const imageUrl = getSafeImageUrl(post);
                if (!imageUrl) return null;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    key={post.id}
                    className="break-inside-avoid relative rounded-2xl overflow-hidden group bg-zinc-900 shadow-xl mb-3 sm:mb-4"
                  >
                    <Link href={`/inspiration/${post.slug || post.id}`} className="block relative">
                      <Image
                        src={imageUrl}
                        alt={post.title}
                        width={600}
                        height={800}
                        className="w-full h-auto object-cover transition-transform duration-[1s] group-hover:scale-105 will-change-transform"
                        loading="lazy"
                        unoptimized={false}
                      />

                      {/* Glassmorphism Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]" />

                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-end translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <h4 className="text-white font-serif text-lg sm:text-xl leading-tight mb-2 drop-shadow-md line-clamp-2">
                          {post.title}
                        </h4>
                        {post.service && (
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white flex-wrap">
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                              {post.service.name}
                            </span>
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                              ₹{Number(post.service.basePrice).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Floating Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300">
                      <button
                        onClick={(e) => handleBookmark(e, post.id)}
                        className="p-2.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-white hover:text-black transition-colors shadow-lg"
                        aria-label="Bookmark"
                      >
                        <Heart className={cn("h-4 w-4", (post as any).isBookmarked ? 'fill-white text-white' : 'text-white')} />
                      </button>
                      <button
                        className="p-2.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-white hover:text-black transition-colors shadow-lg"
                        aria-label="Share"
                      >
                        <Share2 className="h-4 w-4 text-white" />
                      </button>
                    </div>

                    {/* Stylist Badge */}
                    {post.employee && (
                      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full pr-3 p-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[9px] font-bold text-white">
                            {post.employee.firstName[0]}
                          </div>
                          <span className="text-white text-xs font-medium">{post.employee.firstName}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 px-6"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-zinc-500" />
            </div>
            <h3 className="text-3xl font-serif mb-3">
              {activeCategory === 'ALL' ? 'No looks yet' : `No ${CATEGORIES.find(c => c.id === activeCategory)?.label} looks yet`}
            </h3>
            <p className="text-zinc-500 font-medium tracking-wide max-w-sm mx-auto">
              {activeCategory !== 'ALL'
                ? 'Try another category or check back soon for fresh inspiration.'
                : 'Our team is curating looks for you. Check back soon.'}
            </p>
            {activeCategory !== 'ALL' && (
              <button
                onClick={() => setActiveCategory('ALL')}
                className="mt-6 px-6 py-2 rounded-full border border-white/20 text-white text-sm hover:bg-white hover:text-black transition-colors"
              >
                Show All Looks
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
