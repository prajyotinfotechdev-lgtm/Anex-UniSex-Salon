'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCustomerInspirationFeed, useCustomerInspirationCollections, useCustomerBookmarks, PublicInspirationPost, PublicInspirationCollection } from '../hooks/use-inspiration';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ChevronRight, Share2, Calendar } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function InspirationFeed() {
  const { data: feedData, isLoading: isLoadingFeed } = useCustomerInspirationFeed();
  const { data: collectionsData, isLoading: isLoadingCollections } = useCustomerInspirationCollections();
  const { toggleBookmark } = useCustomerBookmarks();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const posts = Array.isArray(feedData?.data) ? feedData.data : [];
  const featuredPosts = posts.filter((p: any) => p.isFeatured);
  const collections = collectionsData?.data || [];

  const handleBookmark = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleBookmark.mutateAsync(postId);
  };

  const filteredPosts = activeCategory === 'ALL' 
    ? posts 
    : posts.filter((p: PublicInspirationPost) => p.category === activeCategory);

  const categories = [
    { id: 'ALL', label: 'For You' },
    { id: 'HAIRCUT', label: 'Haircut' },
    { id: 'HAIR_COLOUR', label: 'Color' },
    { id: 'BEARD', label: 'Beard' },
    { id: 'HAIR_SPA', label: 'Spa' },
    { id: 'BRIDAL', label: 'Bridal' },
    { id: 'TRENDING', label: 'Trending' }
  ];

  if (isLoadingFeed || isLoadingCollections) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 animate-pulse space-y-12 bg-[#0a0a0a]">
        <div className="h-72 bg-white/5 rounded-[2rem] w-full"></div>
        <div className="flex gap-4 overflow-hidden">
          <div className="h-48 w-32 bg-white/5 rounded-3xl flex-shrink-0"></div>
          <div className="h-48 w-32 bg-white/5 rounded-3xl flex-shrink-0"></div>
          <div className="h-48 w-32 bg-white/5 rounded-3xl flex-shrink-0"></div>
        </div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          <div className="h-64 bg-white/5 rounded-3xl break-inside-avoid"></div>
          <div className="h-96 bg-white/5 rounded-3xl break-inside-avoid"></div>
          <div className="h-72 bg-white/5 rounded-3xl break-inside-avoid"></div>
          <div className="h-80 bg-white/5 rounded-3xl break-inside-avoid"></div>
        </div>
      </div>
    );
  }

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
      {featuredPosts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="px-4 sm:px-6 mb-16"
        >
          <div className="relative w-full aspect-[4/5] sm:aspect-[21/9] rounded-[2rem] overflow-hidden group shadow-2xl">
            <Link href={`/inspiration/${featuredPosts[0].slug || featuredPosts[0].id}`}>
              <Image 
                src={featuredPosts[0].heroMedia.secureUrl} 
                alt={featuredPosts[0].title}
                fill
                className="absolute inset-0 object-cover transition-transform duration-[1.5s] group-hover:scale-[1.03] will-change-transform"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-widest font-semibold px-4 py-1.5 rounded-full mb-4 inline-block">
                    Featured Editorial
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4 leading-[1.1] text-white">
                    {featuredPosts[0].title}
                  </h2>
                  <p className="text-zinc-300 line-clamp-2 max-w-xl text-sm md:text-base mb-6 font-light">
                    {featuredPosts[0].description}
                  </p>
                  <div className="flex items-center text-sm font-semibold tracking-wide bg-white text-black px-6 py-3 rounded-full w-max hover:bg-zinc-200 transition-colors">
                    Read Story <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </motion.div>
              </div>
            </Link>
            
            <button 
              onClick={(e) => handleBookmark(e, featuredPosts[0].id)}
              className="absolute top-6 right-6 p-4 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-black/40 hover:scale-110 transition-all duration-300 group/btn shadow-lg"
            >
              <Heart className={cn("h-5 w-5 transition-colors", featuredPosts[0].isBookmarked ? 'fill-white text-white' : 'text-white group-hover/btn:text-red-400')} />
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
            {collections.map((collection: PublicInspirationCollection, i: number) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                key={collection.id} 
                className="snap-start"
              >
                <Link 
                  href={`/inspiration/collection/${collection.slug || collection.id}`}
                  className="relative w-[280px] h-[360px] flex-shrink-0 rounded-[2rem] overflow-hidden group block shadow-xl border border-white/5"
                >
                  {collection.coverImage ? (
                    <Image 
                      src={collection.coverImage.secureUrl} 
                      alt={collection.title}
                      fill
                      className="absolute inset-0 object-cover transition-transform duration-[1s] group-hover:scale-110 will-change-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-900"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500"></div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-end transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <h4 className="text-2xl font-serif leading-tight mb-2">{collection.title}</h4>
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

      {/* ─── Filter Categories (Premium Segmented) ─── */}
      <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 py-4 px-4 sm:px-6 mb-10 -mx-4 overflow-x-auto flex gap-2 hide-scrollbar">
        <div className="flex gap-2 mx-auto w-max bg-white/5 p-1 rounded-full border border-white/5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "relative whitespace-nowrap px-6 py-2.5 text-sm font-semibold transition-all duration-300 rounded-full outline-none",
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
            )
          })}
        </div>
      </div>

      {/* ─── Masonry Grid (Pinterest Style) ─── */}
      <div className="px-4 sm:px-6 max-w-[2000px] mx-auto">
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          <AnimatePresence>
            {filteredPosts.map((post: PublicInspirationPost) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={post.id}
                className="break-inside-avoid relative rounded-[2rem] overflow-hidden group bg-zinc-900 shadow-xl"
              >
                <Link href={`/inspiration/${post.slug || post.id}`} className="block relative">
                  <Image 
                    src={post.heroMedia.secureUrl} 
                    alt={post.title}
                    width={600}
                    height={800} // Approximate height to allow masonry to calculate, actual CSS height is auto
                    className="w-full h-auto object-cover transform transition-transform duration-[1s] group-hover:scale-105 will-change-transform"
                    loading="lazy"
                  />
                  
                  {/* Glassmorphism Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]"></div>
                  
                  <div className="absolute inset-0 p-5 flex flex-col justify-end translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h4 className="text-white font-serif text-xl sm:text-2xl leading-tight mb-2 drop-shadow-md">
                      {post.title}
                    </h4>
                    
                    {post.service && (
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                          {post.service.name}
                        </span>
                        <span className="bg-primary/20 text-primary backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/20">
                          ₹{post.service.basePrice}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                
                {/* Floating Actions on Hover */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <button 
                    onClick={(e) => handleBookmark(e, post.id)}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white hover:text-black transition-colors shadow-lg"
                  >
                    <Heart className={cn("h-4 w-4", post.isBookmarked ? 'fill-current text-current' : '')} />
                  </button>
                  <button className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white hover:text-black transition-colors shadow-lg">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Author/Stylist Badge (Optional, future ready) */}
                {post.employee && (
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full pr-4 p-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-[10px] font-bold">
                        {post.employee.firstName[0]}
                      </div>
                      <span className="text-xs font-medium">{post.employee.firstName}</span>
                    </div>
                  </div>
                )}

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {filteredPosts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-32 px-6"
        >
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-zinc-500" />
          </div>
          <h3 className="text-3xl font-serif mb-3">No looks found</h3>
          <p className="text-zinc-500 font-medium tracking-wide max-w-sm mx-auto">
            We haven't curated any looks in this category yet. Check back soon for fresh inspiration.
          </p>
        </motion.div>
      )}
    </div>
  );
}
