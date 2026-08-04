'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCustomerInspirationPost,
  useCustomerBookmarks,
  useCustomerInspirationAnalytics,
} from '../hooks/use-inspiration';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ArrowLeft, Share2, Calendar, User,
  Scissors, Clock, X, ChevronLeft, ChevronRight, ZoomIn, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { data: postData, isLoading } = useCustomerInspirationPost(idOrSlug);
  const { toggleBookmark } = useCustomerBookmarks();
  const { trackEvent } = useCustomerInspirationAnalytics();
  const galleryRef = useRef<HTMLDivElement>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [shared, setShared] = useState(false);

  const post = postData?.data;

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

  return (
    <div className="min-h-screen bg-black text-white pb-32 selection:bg-white/20">

      {/* ─── Gallery ─── */}
      <div className="relative w-full bg-zinc-950 overflow-hidden">
        {/* Scrollable horizontal gallery */}
        <div
          ref={galleryRef}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.offsetWidth);
            setGalleryIndex(index);
          }}
        >
          {allImages.map((img, index) => (
            <div
              key={index}
              className="w-full shrink-0 snap-center relative"
              style={{ scrollSnapAlign: 'center' }}
            >
              <div
                className="relative w-full aspect-[3/4] cursor-zoom-in"
                onClick={() => openLightbox(index)}
              >
                <motion.img
                  layoutId={`gallery-image-${index}`}
                  src={img.secureUrl || img.url}
                  alt={`${post.title} - ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Before label */}
                {img.label === 'Before' && (
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold border border-white/10">
                    Before
                  </div>
                )}
                {/* Tap to fullscreen hint */}
                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur p-2 rounded-full opacity-60">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gallery dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToGallery(i)}
                className={cn(
                  "rounded-full transition-all duration-200",
                  i === galleryIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
                )}
              />
            ))}
          </div>
        )}

        {/* Top nav bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-black/50 transition-colors pointer-events-auto"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-black/50 transition-colors"
            >
              {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleBookmark}
              className={cn(
                "w-10 h-10 rounded-full backdrop-blur border flex items-center justify-center transition-all",
                post.isBookmarked
                  ? 'bg-red-500/80 border-red-400/40'
                  : 'bg-black/30 border-white/10 hover:bg-black/50'
              )}
            >
              <Heart className={cn("w-4 h-4", post.isBookmarked && 'fill-current')} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="px-5 pt-7">

        {/* Category + metadata */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            {post.category?.replace(/_/g, ' ')}
          </span>
          {post.isFeatured && (
            <>
              <span className="text-zinc-700">·</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">Featured</span>
            </>
          )}
          {post.bookmarkCount > 0 && (
            <>
              <span className="text-zinc-700">·</span>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Heart className="w-3 h-3 inline fill-current text-red-400" />
                {post.bookmarkCount.toLocaleString()}
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl font-serif leading-tight mb-3">{post.title}</h1>

        {post.description && (
          <p className="text-zinc-400 text-base font-light leading-relaxed mb-7">
            {post.description}
          </p>
        )}

        {/* Service card */}
        {post.service && (
          <div className="bg-zinc-900/80 border border-white/6 rounded-2xl p-5 mb-6">
            <h3 className="text-base font-semibold mb-4 text-white">Get This Look</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                    <Scissors className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <p className="font-medium text-sm text-white">{post.service.name}</p>
                </div>
                <p className="font-serif text-white">₹{Number(post.service.basePrice).toLocaleString('en-IN')}</p>
              </div>

              {post.service.durationMinutes && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-400">{post.service.durationMinutes} minutes</p>
                </div>
              )}

              {post.employee && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-600 uppercase tracking-wider">Styled by</p>
                    <p className="text-sm font-medium text-white">
                      {post.employee.firstName} {post.employee.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gallery thumbnails (if multiple images) */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => { scrollToGallery(i); openLightbox(i); }}
                className={cn(
                  "shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                  i === galleryIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'
                )}
              >
                <img src={img.secureUrl || img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Floating CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 p-5 pt-10 bg-gradient-to-t from-black via-black/95 to-transparent z-50">
        <button
          onClick={handleBook}
          className="w-full bg-white text-black py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-xl"
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
