'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCustomerInspirationPost,
  useCustomerBookmarks,
  useCustomerInspirationAnalytics,
  useCustomerInspirationFeed,
} from '../hooks/use-inspiration';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ArrowLeft, Share2, Calendar, User,
  Scissors, Clock, X, ChevronLeft, ChevronRight, ZoomIn, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface InspirationDetailProps {
  idOrSlug: string;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: { secureUrl: string; url: string; label?: string }[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[activeIndex];
  if (!img) return null;

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Image */}
      <div
        className="relative max-h-[90vh] max-w-[90vw] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            layoutId={`gallery-image-${activeIndex}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            src={img.secureUrl || img.url}
            alt={img.label || ''}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        </AnimatePresence>
        {img.label && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white text-xs font-medium px-4 py-2 rounded-full">
            {img.label}
          </div>
        )}
      </div>

        {/* Controls */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    i === activeIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
  );
}

// ─── Main Detail ──────────────────────────────────────────────────────────────
export function InspirationDetail({ idOrSlug }: InspirationDetailProps) {
  const router = useRouter();
  
  // Use enabled so that if idOrSlug is undefined (e.g. from async params before resolution), it does not fetch yet.
  const { data: postData, isLoading } = useCustomerInspirationPost(idOrSlug);
  const { data: feedData } = useCustomerInspirationFeed();
  
  const { toggleBookmark } = useCustomerBookmarks();
  const { trackEvent } = useCustomerInspirationAnalytics();
  const galleryRef = useRef<HTMLDivElement>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [shared, setShared] = useState(false);

  const post = postData?.data;

  // Track View
  useEffect(() => {
    if (post) trackEvent.mutate({ postId: post.id, eventType: 'view' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  const allImages = post ? [
    { ...(post.heroMedia || {}), label: 'Hero Look' },
    ...(post.beforeMedia ? [{ ...post.beforeMedia, label: 'Before' }] : []),
    ...(post.galleryItems?.map((item: any) => ({ ...item.media, label: '' })) || []),
  ].filter(img => img.secureUrl || img.url) : [];

  const scrollToGallery = useCallback((index: number) => {
    const el = galleryRef.current;
    if (!el) return;
    const target = el.children[index] as HTMLElement;
    if (target) {
      el.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    }
    setGalleryIndex(index);
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/inspiration/${post?.slug || post?.id}`;
    const title = post?.title || 'Check out this look';
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // user cancelled
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!post) return;
    await toggleBookmark.mutateAsync(post.id);
  };

  const handleBook = () => {
    if (!post) return;
    trackEvent.mutate({ postId: post.id, eventType: 'book_click' });
    const query = new URLSearchParams();
    if (post.serviceId) query.append('serviceId', post.serviceId);
    if (post.employeeId) query.append('employeeId', post.employeeId);
    if (post.branchId) query.append('branchId', post.branchId);
    query.append('inspirationId', post.id);
    router.push(`/book?${query.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="h-[65vh] bg-zinc-900 animate-pulse" />
        <div className="p-6 space-y-4">
          <div className="h-8 bg-zinc-800 rounded-xl animate-pulse w-3/4" />
          <div className="h-4 bg-zinc-800 rounded animate-pulse w-full" />
          <div className="h-4 bg-zinc-800 rounded animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  if (!post || allImages.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif mb-2">Look Not Found</h2>
        <p className="text-zinc-500 mb-6">This post may have been removed or is no longer published.</p>
        <button onClick={() => router.back()} className="bg-white text-black px-6 py-3 rounded-full font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  // Get suggested looks (exclude current)
  const suggestedLooks = feedData?.data?.filter((p: any) => p.id !== post.id).slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-black text-white pb-32 selection:bg-white/20">

      {/* ─── Nav Header ─── */}
      <div className="sticky top-0 left-0 right-0 z-40 px-4 py-3 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="font-serif text-lg tracking-wide text-white/90">Lookbook</div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleBookmark}
            className={cn(
              "w-10 h-10 rounded-full border flex items-center justify-center transition-all",
              post.isBookmarked
                ? 'bg-red-500/80 border-red-400/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            )}
          >
            <Heart className={cn("w-4 h-4", post.isBookmarked && 'fill-current')} />
          </button>
        </div>
      </div>

      {/* ─── Hero Image Section ─── */}
      <div className="relative w-full max-w-2xl mx-auto mt-4 px-4">
        {/* Background Blur for aesthetics */}
        <div className="absolute inset-0 -z-10 blur-3xl opacity-30 pointer-events-none scale-105">
          <img src={allImages[0].secureUrl || allImages[0].url} alt="" className="w-full h-full object-cover rounded-3xl" />
        </div>
        
        <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <motion.img
            layoutId={`gallery-image-0`}
            src={allImages[0].secureUrl || allImages[0].url}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover cursor-zoom-in hover:scale-[1.02] transition-transform duration-500"
            onClick={() => openLightbox(0)}
          />
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md p-2.5 rounded-full text-white pointer-events-none shadow-lg">
            <ZoomIn className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ─── Additional Gallery ─── */}
      {allImages.length > 1 && (
        <div className="mt-4 px-4 max-w-2xl mx-auto flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2">
          {allImages.slice(1).map((img, i) => (
            <div key={i + 1} className="shrink-0 snap-center relative">
              <button
                onClick={() => openLightbox(i + 1)}
                className="relative w-24 h-24 rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-white/30 transition-all cursor-zoom-in"
              >
                <img src={img.secureUrl || img.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors" />
              </button>
              {img.label && (
                <div className="absolute -top-2 -right-2 bg-zinc-800 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg border border-zinc-700 z-10">
                  {img.label}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Info Section ─── */}
      <div className="px-5 pt-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 bg-white/5 px-3 py-1 rounded-full">
            {post.category?.replace(/_/g, ' ')}
          </span>
          {post.isFeatured && (
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-300 bg-violet-900/40 px-3 py-1 rounded-full ring-1 ring-violet-500/50">
              Featured
            </span>
          )}
          {post.bookmarkCount > 0 && (
            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 ml-auto">
              <Heart className="w-3.5 h-3.5 fill-current text-red-500/70" />
              {post.bookmarkCount.toLocaleString()}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-serif leading-tight mb-4">{post.title}</h1>

        {post.description && (
          <div className="text-zinc-300 text-[15px] font-light leading-relaxed mb-8 whitespace-pre-line prose prose-invert max-w-none">
            {post.description}
          </div>
        )}

        {/* ─── Premium Service Card ─── */}
        {(post.service || post.employee) && (
          <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-6 mb-10 overflow-hidden shadow-2xl">
            {/* Subtle glow effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-zinc-500 mb-5">
              Service Details
            </h3>
            
            <div className="space-y-4">
              {post.service && (
                <div className="flex items-center justify-between bg-black/30 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Scissors className="w-4 h-4 text-zinc-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-[15px] text-white leading-tight mb-0.5">{post.service.name}</p>
                      {post.service.durationMinutes && (
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.service.durationMinutes} mins
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-serif text-lg font-medium text-white">₹{Number(post.service.basePrice).toLocaleString('en-IN')}</p>
                </div>
              )}

              {post.employee && (
                <div className="flex items-center gap-3.5 p-2">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-white/10">
                    <span className="text-white font-bold text-sm">{post.employee.firstName[0]}</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">Styled By</p>
                    <p className="text-[15px] font-medium text-white">
                      {post.employee.firstName} {post.employee.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Suggested Looks ─── */}
        {suggestedLooks.length > 0 && (
          <div className="mt-12 mb-8">
            <h3 className="text-xl font-serif mb-6 text-white/90">More Inspiration</h3>
            <div className="columns-2 gap-3 space-y-3">
              {suggestedLooks.map((item: any) => (
                <Link 
                  href={`/inspiration/${item.slug || item.id}`} 
                  key={item.id}
                  className="block break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer ring-1 ring-white/10"
                >
                  <img
                    src={item.heroMedia?.secureUrl || item.heroMedia?.url}
                    alt={item.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <p className="text-white text-xs font-semibold leading-tight line-clamp-2">
                      {item.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Floating CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 p-5 pt-12 bg-gradient-to-t from-black via-black/95 to-transparent z-40 max-w-2xl mx-auto">
        <button
          onClick={handleBook}
          className="w-full bg-white text-black py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2.5 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-2xl ring-4 ring-white/10"
        >
          <Calendar className="w-5 h-5" />
          Book This Look
        </button>
      </div>

      {/* ─── Lightbox ─── */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={allImages as any}
            activeIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            onPrev={() => setLightboxIndex(i => (i - 1 + allImages.length) % allImages.length)}
            onNext={() => setLightboxIndex(i => (i + 1) % allImages.length)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
