'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleVideoEnd = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

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
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnd}
              onError={handleVideoEnd}
              className="w-full h-full object-contain max-w-md"
            >
              <source src="/anex-logo-vdo.mp4" type="video/mp4" />
            </video>
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
