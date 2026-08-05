'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function PremiumLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] h-full w-full">
      <div className="relative flex items-center justify-center">
        
        {/* Outer Ring - Slow rotation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-32 rounded-full border-2 border-dashed border-primary/30"
        />

        {/* Inner Ring - Fast rotation opposite direction */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="absolute w-28 h-28 rounded-full border-t-2 border-r-2 border-primary"
        />

        {/* Center Logo */}
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-background shadow-2xl border border-primary/20"
        >
          <Image
            src="/anex-logo.png"
            alt="Anex Salon"
            fill
            className="object-contain p-2"
            priority
          />
        </motion.div>

      </div>
      
      {/* Loading Text */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-primary/80 font-medium text-sm tracking-[0.2em] uppercase flex items-center gap-1"
        >
          {text}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            .
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
