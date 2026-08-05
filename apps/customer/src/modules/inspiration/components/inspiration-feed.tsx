'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Heart, Sparkles, ChevronRight, Share2, Search, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useCustomerInspirationFeed,
  useCustomerInspirationCollections,
  useCustomerBookmarks,
  PublicInspirationPost,
  PublicInspirationCollection,
} from '../hooks/use-inspiration';

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'ALL',         label: 'All'          },
  { id: 'HAIRCUT',     label: 'Haircut'      },
  { id: 'HAIR_COLOUR', label: 'Colour'       },
  { id: 'BEARD',       label: 'Beard'        },
  { id: 'HAIR_SPA',    label: 'Spa'          },
  { id: 'BRIDAL',      label: 'Bridal'       },
  { id: 'TRENDING',    label: 'Trending'     },
  { id: 'TRANSFORMATION', label: 'Transform' },
];

function getSafeImageUrl(post: PublicInspirationPost): string | null {
  return post.heroMedia?.secureUrl || post.heroMedia?.url || null;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function PinterestSkeleton() {
  const heights = [280, 360, 240, 320, 400, 260, 340, 300, 380, 220, 360, 280];
  return (
    <div className="min-h-screen bg-[#050505] pt-0">
      {/* Hero skeleton */}
      <div className="h-[70vh] bg-zinc-900/50 animate-pulse" />
      <div className="px-4 sm:px-6 py-10">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {heights.map((h, i) => (
            <div
              key={i}
              className="break-inside-avoid rounded-2xl bg-zinc-900/60 animate-pulse mb-3"
              style={{ height: h }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pin Card (Pinterest-style) ───────────────────────────────────────────────
function PinCard({ post, onBookmark }: { post: PublicInspirationPost; onBookmark: (e: React.MouseEvent, id: string) => void }) {
  const imageUrl = getSafeImageUrl(post);
  if (!imageUrl) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="break-inside-avoid mb-3 sm:mb-4 group relative rounded-2xl overflow-hidden bg-zinc-900 cursor-pointer"
    >
      <Link href={`/inspiration/${post.slug || post.id}`} className="block relative">
        <Image
          src={imageUrl}
          alt={post.title}
          width={600}
          height={900}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.04] will-change-transform"
          loading="lazy"
        />

        {/* Gradient overlay — only on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h4 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2 drop-shadow-md">
            {post.title}
          </h4>
          {post.service && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                {post.service.name}
              </span>
              <span className="text-[10px] font-bold text-white/60">
                ₹{Number(post.service.basePrice).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        {/* Stylist badge */}
        {post.employee && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur border border-white/10 rounded-full pl-1 pr-2.5 py-1">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                {post.employee.firstName[0]}
              </div>
              <span className="text-white text-[10px] font-medium">{post.employee.firstName}</span>
            </div>
          </div>
        )}
      </Link>

      {/* Action buttons — top right */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <button
          onClick={(e) => onBookmark(e, post.id)}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-lg transition-all duration-200 hover:scale-110",
            post.isBookmarked
              ? 'bg-red-500/90 border-red-400/50 text-white'
              : 'bg-black/40 border-white/20 text-white hover:bg-red-500/80 hover:border-red-400/50'
          )}
          aria-label="Save"
        >
          <Heart className={cn("w-4 h-4", post.isBookmarked && 'fill-current')} />
        </button>
        <button
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-lg hover:bg-white/20 hover:scale-110 transition-all duration-200"
          aria-label="Share"
          onClick={(e) => {
            e.preventDefault();
            if (navigator.share) {
              navigator.share({ title: post.title, url: window.location.origin + `/inspiration/${post.slug || post.id}` });
            }
          }}
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category chip — always visible */}
      <div className="absolute top-3 left-3 opacity-100 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 bg-black/30 backdrop-blur px-2 py-0.5 rounded-full">
          {post.category?.replace(/_/g, ' ')}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Hero Banner Slideshow ────────────────────────────────────────────────────────
function HeroBanner({ posts, onBookmark }: { posts: PublicInspirationPost[]; onBookmark: (e: React.MouseEvent, id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % posts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [posts.length]);

  const activePost = posts[current];
  if (!activePost) return null;
  const imageUrl = getSafeImageUrl(activePost);
  if (!imageUrl) return null;

  return (
    <div ref={ref} className="relative w-full h-[75vh] sm:h-[80vh] overflow-hidden bg-black">
      {/* Slide Image with Fade-in/out */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`slide-img-${activePost.id}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          style={{ y }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={imageUrl}
            alt={activePost.title}
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </motion.div>
      </AnimatePresence>

      {/* Luxury Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-[#050505]/40 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/50 via-transparent to-transparent z-10" />

      {/* Content Container */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-14 z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-content-${activePost.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[9px] uppercase tracking-[0.2em] font-semibold px-3 py-1.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5 text-primary animate-pulse" />
                Featured Look
              </span>
              {activePost.employee && (
                <span className="text-white/60 text-xs font-light">by {activePost.employee.firstName} {activePost.employee.lastName}</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif tracking-tight text-white leading-tight mb-4 max-w-3xl">
              {activePost.title}
            </h1>

            {activePost.description && (
              <p className="text-zinc-300 text-xs sm:text-sm max-w-xl mb-6 leading-relaxed font-light line-clamp-2">
                {activePost.description}
              </p>
            )}

            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href={`/inspiration/${activePost.slug || activePost.id}`}
                className="inline-flex items-center gap-2 bg-white text-black font-semibold text-xs px-5 py-3 rounded-full hover:bg-zinc-100 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                View Details <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              {activePost.service && (
                <span className="text-white/80 bg-white/10 backdrop-blur-xl border border-white/10 text-xs font-medium px-4.5 py-3 rounded-full">
                  {activePost.service.name} · ₹{Number(activePost.service.basePrice).toLocaleString('en-IN')}
                </span>
              )}

              <button
                onClick={(e) => onBookmark(e, activePost.id)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-200 hover:scale-110",
                  activePost.isBookmarked
                    ? 'bg-red-500/90 border-red-400/40 text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-red-500/70'
                )}
              >
                <Heart className={cn("w-3.5 h-3.5", activePost.isBookmarked && 'fill-current')} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slideshow Side Dots */}
      {posts.length > 1 && (
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-20">
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-1.5 rounded-full transition-all duration-300",
                i === current ? 'h-6 bg-white' : 'h-1.5 bg-white/30 hover:bg-white/60'
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Collections Row ──────────────────────────────────────────────────────────
function CollectionsRow({ collections }: { collections: PublicInspirationCollection[] }) {
  if (collections.length === 0) return null;
  return (
    <div className="mb-12">
      <div className="px-4 sm:px-6 mb-5 flex items-center justify-between">
        <h3 className="text-white text-xl font-serif tracking-tight">Collections</h3>
        <Link href="/inspiration/collections" className="text-zinc-500 hover:text-white text-xs font-medium transition-colors flex items-center gap-1">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex overflow-x-auto gap-3 px-4 sm:px-6 pb-4 snap-x snap-mandatory hide-scrollbar">
        {collections.map((col, i) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            className="snap-start shrink-0"
          >
            <Link
              href={`/inspiration/collection/${col.slug || col.id}`}
              className="relative w-[200px] h-[270px] rounded-2xl overflow-hidden group block border border-white/5 shadow-xl"
            >
              {col.coverImage?.secureUrl ? (
                <Image
                  src={col.coverImage.secureUrl}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.06] will-change-transform"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-white font-semibold text-sm leading-tight mb-1">{col.title}</h4>
                <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-medium">
                  {(col as any)._count?.posts ?? col.posts?.length ?? 0} looks
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Feed ────────────────────────────────────────────────────────────────
export function InspirationFeed() {
  const [selectedGender, setSelectedGender] = useState('ALL');
  const { data: feedData, isLoading: isLoadingFeed } = useCustomerInspirationFeed(selectedGender);
  const { data: collectionsData, isLoading: isLoadingCollections } = useCustomerInspirationCollections();
  const { toggleBookmark } = useCustomerBookmarks();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allPosts: PublicInspirationPost[] = Array.isArray(feedData?.data) ? feedData.data : [];
  
  // Stable mixing for "All Styles" view to intersperse Men & Women looks dynamically
  // And strict filtering for Men/Women tabs to prevent any leaks
  const posts = useMemo(() => {
    let validPosts = allPosts.filter(p => getSafeImageUrl(p));

    if (selectedGender === 'MEN') {
      validPosts = validPosts.filter(p => {
        const hasMenTag = p.tags?.includes('men');
        const hasWomenTag = p.tags?.includes('women');
        if (hasMenTag && !hasWomenTag) return true;
        if (hasMenTag && hasWomenTag) return true; // unisex
        if (p.tags && p.tags.length > 0 && !hasMenTag) return false;
        
        // Fallback keyword heuristic if tags are empty
        const title = p.title.toLowerCase();
        const hasWomenKeyword = title.includes('women') || title.includes('girl') || title.includes('lady') || title.includes('ladies') || title.includes('female');
        return !hasWomenKeyword;
      });
    } else if (selectedGender === 'WOMEN') {
      validPosts = validPosts.filter(p => {
        const hasWomenTag = p.tags?.includes('women');
        const hasMenTag = p.tags?.includes('men');
        if (hasWomenTag && !hasMenTag) return true;
        if (hasWomenTag && hasMenTag) return true; // unisex
        if (p.tags && p.tags.length > 0 && !hasWomenTag) return false;
        
        // Fallback keyword heuristic if tags are empty
        const title = p.title.toLowerCase();
        const hasMenKeyword = title.includes('men') || title.includes('beard') || title.includes('shave') || title.includes('guy') || title.includes('boy');
        return !hasMenKeyword;
      });
    }

    if (selectedGender === 'ALL') {
      const hashString = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        return hash;
      };
      return [...validPosts].sort((a, b) => hashString(a.id) - hashString(b.id));
    }
    return validPosts;
  }, [allPosts, selectedGender]);

  // Featured looks slideshow (top 4 looks)
  const slideshowPosts = useMemo(() => {
    const featured = posts.filter(p => p.isFeatured);
    return featured.length > 0 ? featured.slice(0, 4) : posts.slice(0, 4);
  }, [posts]);

  const collections: PublicInspirationCollection[] = collectionsData?.data || [];

  const filteredPosts = posts.filter(p => {
    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Exclude slideshow posts from the masonry grid to avoid duplication
  const gridPosts = useMemo(() => {
    if (filteredPosts.length <= 4) return filteredPosts;
    return filteredPosts.filter(p => !slideshowPosts.some(sp => sp.id === p.id));
  }, [filteredPosts, slideshowPosts]);

  const handleBookmark = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try { await toggleBookmark.mutateAsync(postId); } catch { /* silent */ }
  };

  if (isLoadingFeed || isLoadingCollections) return <PinterestSkeleton />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20">

      {/* ─── Hero Slideshow ─── */}
      {slideshowPosts.length > 0 && (
        <HeroBanner posts={slideshowPosts} onBookmark={handleBookmark} />
      )}

      {/* ─── Page header (when no hero) ─── */}
      {slideshowPosts.length === 0 && (
        <div className="pt-24 pb-10 px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-6xl font-serif tracking-tight mb-3 bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
              Inspiration
            </h1>
            <p className="text-zinc-500 text-sm tracking-widest uppercase font-medium">
              Discover your next signature look
            </p>
          </motion.div>
        </div>
      )}

      {/* ─── Main content ─── */}
      <div className="px-0 pb-20">

        {/* ─── Collections ─── */}
        <div className="pt-10">
          <CollectionsRow collections={collections} />
        </div>

        {/* ─── Sticky filter bar ─── */}
        <div className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-2xl border-b border-white/5 py-3 px-4 sm:px-6 space-y-3">
          {/* Gender Filter Row */}
          <div className="flex gap-2">
            {[
              { id: 'ALL', label: 'All Styles' },
              { id: 'MEN', label: 'Men' },
              { id: 'WOMEN', label: 'Women' }
            ].map(g => {
              const isActive = selectedGender === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGender(g.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border",
                    isActive
                      ? "bg-primary border-primary text-black font-extrabold"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Category pills */}
            <div className="flex-1 flex gap-1.5 overflow-x-auto hide-scrollbar">
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "relative whitespace-nowrap px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-250 shrink-0",
                      isActive ? 'text-black' : 'text-zinc-500 hover:text-white'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activePill"
                        className="absolute inset-0 bg-white rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(s => !s)}
              className={cn(
                "shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200",
                searchOpen
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/30 hover:text-white'
              )}
            >
              {searchOpen ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden px-4 sm:px-6 pb-3"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Search looks, styles, techniques…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/25 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Pinterest Masonry Grid ─── */}
        <div className="px-3 sm:px-4 pt-6">
          {gridPosts.length > 0 ? (
            <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4">
              <AnimatePresence>
                {gridPosts.map((post) => (
                  <PinCard key={post.id} post={post} onBookmark={handleBookmark} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 px-6"
            >
              <div className="w-20 h-20 rounded-full bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-2xl font-serif mb-2 text-white">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : activeCategory !== 'ALL'
                    ? `No ${CATEGORIES.find(c => c.id === activeCategory)?.label} looks yet`
                    : 'The Lookbook is being curated'}
              </h3>
              <p className="text-zinc-600 text-sm max-w-xs mx-auto leading-relaxed">
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Our team is adding fresh looks. Check back soon.'}
              </p>
              {(activeCategory !== 'ALL' || searchQuery || selectedGender !== 'ALL') && (
                <button
                  onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); setSelectedGender('ALL'); }}
                  className="mt-6 px-5 py-2 rounded-full border border-white/15 text-white text-xs font-medium hover:bg-white/10 transition-colors"
                >
                  Show all looks
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
