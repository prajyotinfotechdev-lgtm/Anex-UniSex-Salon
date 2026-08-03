'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCustomerInspirationFeed, useCustomerInspirationCollections, useCustomerBookmarks, PublicInspirationPost, PublicInspirationCollection } from '../hooks/use-inspiration';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ChevronRight } from 'lucide-react';
import Image from 'next/image';
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

  const categories = ['ALL', 'HAIRCUT', 'HAIR_COLOUR', 'BEARD', 'HAIR_SPA', 'BRIDAL'];

  if (isLoadingFeed || isLoadingCollections) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-4 animate-pulse space-y-12">
        <div className="h-64 bg-zinc-900 rounded-3xl w-full"></div>
        <div className="flex gap-4 overflow-hidden">
          <div className="h-40 w-40 bg-zinc-900 rounded-2xl flex-shrink-0"></div>
          <div className="h-40 w-40 bg-zinc-900 rounded-2xl flex-shrink-0"></div>
          <div className="h-40 w-40 bg-zinc-900 rounded-2xl flex-shrink-0"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-zinc-900 rounded-2xl"></div>
          <div className="h-80 bg-zinc-900 rounded-2xl"></div>
          <div className="h-72 bg-zinc-900 rounded-2xl -mt-16"></div>
          <div className="h-64 bg-zinc-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Editorial Header */}
      <div className="pt-16 pb-8 px-6 text-center">
        <h1 className="text-4xl font-serif tracking-tight mb-2">Inspiration</h1>
        <p className="text-zinc-400 text-sm tracking-wide uppercase font-light">
          Discover your next look
        </p>
      </div>

      {/* Hero Carousel (Featured) */}
      {featuredPosts.length > 0 && (
        <div className="px-4 mb-12">
          <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-video rounded-3xl overflow-hidden group">
            <Link href={`/inspiration/${featuredPosts[0].slug || featuredPosts[0].id}`}>
              <Image 
                src={featuredPosts[0].heroMedia.secureUrl} 
                alt={featuredPosts[0].title}
                fill
                className="absolute inset-0 object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">
                  Featured
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif mb-2 leading-tight">
                  {featuredPosts[0].title}
                </h2>
                <p className="text-zinc-300 line-clamp-2 max-w-md text-sm mb-4">
                  {featuredPosts[0].description}
                </p>
                <div className="flex items-center text-sm font-medium">
                  Read Editorial <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
            <button 
              onClick={(e) => handleBookmark(e, featuredPosts[0].id)}
              className="absolute top-6 right-6 p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-black/40 transition-colors"
            >
              <Heart className={`h-6 w-6 ${featuredPosts[0].isBookmarked ? 'fill-white text-white' : 'text-white'}`} />
            </button>
          </div>
        </div>
      )}

      {/* Collections Shelf */}
      {collections.length > 0 && (
        <div className="mb-12">
          <div className="px-6 mb-4 flex justify-between items-end">
            <h3 className="text-xl font-serif">Curated Collections</h3>
          </div>
          <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x hide-scrollbar">
            {collections.map((collection: PublicInspirationCollection) => (
              <Link 
                href={`/inspiration/collection/${collection.slug || collection.id}`}
                key={collection.id} 
                className="relative w-48 h-64 flex-shrink-0 rounded-2xl overflow-hidden snap-start group"
              >
                {collection.coverImage ? (
                  <Image 
                    src={collection.coverImage.secureUrl} 
                    alt={collection.title}
                    fill
                    className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-zinc-900"></div>
                )}
                <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/30"></div>
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <h4 className="text-lg font-serif leading-tight">{collection.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filter Categories */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 mb-8 -mx-4 overflow-x-auto flex gap-6 hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap text-sm font-medium transition-colors ${
              activeCategory === cat 
                ? 'text-white border-b-2 border-white pb-1' 
                : 'text-zinc-500 hover:text-zinc-300 pb-1'
            }`}
          >
            {cat === 'ALL' ? 'Everything' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Masonry Grid (Approximated with CSS columns) */}
      <div className="px-4">
        <div className="columns-2 gap-4 space-y-4">
          <AnimatePresence>
            {filteredPosts.map((post: PublicInspirationPost) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key={post.id}
                className="break-inside-avoid relative rounded-2xl overflow-hidden group bg-zinc-900"
              >
                <Link href={`/inspiration/${post.slug || post.id}`} className="block">
                  <Image 
                    src={post.heroMedia.secureUrl} 
                    alt={post.title}
                    width={400}
                    height={400}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-white font-medium text-sm sm:text-base line-clamp-2 leading-tight">
                      {post.title}
                    </h4>
                    {post.service && (
                      <p className="text-zinc-400 text-xs mt-1">From ₹{post.service.basePrice}</p>
                    )}
                  </div>
                </Link>
                
                <button 
                  onClick={(e) => handleBookmark(e, post.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10"
                >
                  <Heart className={`h-4 w-4 ${post.isBookmarked ? 'fill-white text-white' : 'text-white'}`} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 px-6">
          <Sparkles className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-serif mb-2">No looks found</h3>
          <p className="text-zinc-500">Check back later for more inspiration in this category.</p>
        </div>
      )}
    </div>
  );
}
