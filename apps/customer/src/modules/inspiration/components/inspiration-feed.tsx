'use client';

import React, { useState, useRef, useEffect } from 'react';
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

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner({ post, onBookmark }: { post: PublicInspirationPost; onBookmark: (e: React.MouseEvent, id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);

  const imageUrl = getSafeImageUrl(post);
  if (!imageUrl) return null;

  return (
    <div ref={ref} className="relative w-full h-[80vh] overflow-hidden">
      {/* Parallax image */}
      <motion.div style={{ y }} className="absolute inset-0 scale-[1.1]">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover"
          priority
          quality={90}
        />
      </motion.div>

      {/* Gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-semibold px-4 py-2 rounded-full">
              <Sparkles className="w-3 h-3" />
              Featured Look
            </span>
            {post.employee && (
              <span className="text-white/50 text-xs">by {post.employee.firstName} {post.employee.lastName}</span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight text-white leading-[1.05] mb-5 max-w-3xl">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-white/60 text-sm md:text-base max-w-xl mb-8 leading-relaxed font-light">
              {post.description}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/inspiration/${post.slug || post.id}`}
              className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-zinc-100 transition-colors shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
            >
              View This Look <ArrowUpRight className="w-4 h-4" />
            </Link>
            {post.service && (
              <span className="text-white/70 bg-white/10 backdrop-blur-xl border border-white/15 text-sm font-medium px-5 py-3 rounded-full">
                {post.service.name} · ₹{Number(post.service.basePrice).toLocaleString('en-IN')}
              </span>
            )}
            <button
              onClick={(e) => onBookmark(e, post.id)}
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-200 hover:scale-110",
                post.isBookmarked
                  ? 'bg-red-500/90 border-red-400/40'
                  : 'bg-white/10 border-white/20 hover:bg-red-500/70 hover:border-red-400/40'
              )}
            >
              <Heart className={cn("w-4 h-4 text-white", post.isBookmarked && 'fill-current')} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bookmark count badge */}
      {post.bookmarkCount > 0 && (
        <div className="absolute top-8 right-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-red-400 fill-current" />
            <span className="text-white text-xs font-semibold">{post.bookmarkCount.toLocaleString()}</span>
          </div>
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
  const posts = allPosts.filter(p => getSafeImageUrl(p));
  const featuredPost = posts.find(p => p.isFeatured) || posts[0] || null;
  const collections: PublicInspirationCollection[] = collectionsData?.data || [];

  const filteredPosts = posts.filter(p => {
    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Exclude hero from the masonry grid to avoid duplication
  const gridPosts = featuredPost
    ? filteredPosts.filter(p => p.id !== featuredPost.id)
    : filteredPosts;

  const handleBookmark = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try { await toggleBookmark.mutateAsync(postId); } catch { /* silent */ }
  };

  if (isLoadingFeed || isLoadingCollections) return <PinterestSkeleton />;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20">

      {/* ─── Hero ─── */}
      {featuredPost && (
        <HeroBanner post={featuredPost} onBookmark={handleBookmark} />
      )}

      {/* ─── Page header (when no hero) ─── */}
      {!featuredPost && (
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
