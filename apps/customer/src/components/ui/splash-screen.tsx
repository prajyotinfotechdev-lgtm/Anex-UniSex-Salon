'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedPlaying = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
      return;
    }

    // Check if the video has started playing after 4 seconds.
    // If it hasn't (blocked by iOS Low Power Mode, user settings, or slow network),
    // immediately skip the splash screen so the user doesn't see a play button or frozen frame.
    const autoplayCheckTimer = setTimeout(() => {
      if (!hasStartedPlaying.current) {
        console.log("Autoplay blocked or loading slowly, skipping splash screen.");
        handleVideoEnd();
      }
    }, 4000);

    // Safety fallback: dismiss splash screen after 8 seconds if video gets stuck or takes too long to load
    timerRef.current = setTimeout(() => {
      handleVideoEnd();
    }, 8000);

    return () => {
      clearTimeout(autoplayCheckTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleVideoEnd = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  const handlePlay = () => {
    hasStartedPlaying.current = true;
    // Once the video successfully starts playing, clear the safety timer so it can play to the end
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Configure iOS Safari specific properties directly on the DOM element to ensure native autoplay
  useEffect(() => {
    if (isMounted && showSplash && videoRef.current) {
      const video = videoRef.current;
      video.defaultMuted = true;
      video.muted = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
    }
  }, [isMounted, showSplash]);

  // Do not render anything until client-side hydration is complete to prevent layout shift or flashes
  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              preload="metadata"
              onPlay={handlePlay}
              onEnded={handleVideoEnd}
              onError={handleVideoEnd}
              className="w-full h-full object-cover"
            >
              <source src="/anex-logo-vdo.mp4" type="video/mp4" />
            </video>
            
            {/* Premium Skip Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onClick={handleVideoEnd}
              className="absolute top-12 right-6 z-[100000] px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-xs font-medium tracking-widest uppercase hover:bg-white/20 hover:text-white transition-all shadow-xl"
            >
              Skip
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={cn(
          "h-full w-full",
          showSplash 
            ? "h-screen overflow-hidden opacity-0 pointer-events-none" 
            : "opacity-100 transition-opacity duration-1000"
        )}
      >
        {children}
      </div>
    </>
  );
}
