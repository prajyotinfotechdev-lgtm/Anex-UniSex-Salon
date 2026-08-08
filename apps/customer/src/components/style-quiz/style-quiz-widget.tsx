"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { StyleQuizFlow } from './style-quiz-flow';

export function StyleQuizWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ── Dashboard Entry Card ── */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="
          w-full text-left relative overflow-hidden rounded-3xl border border-white/10
          bg-gradient-to-br from-zinc-900 to-zinc-950
          shadow-xl shadow-black/20
          group transition-all duration-300 hover:border-primary/30
        "
      >
        {/* Ambient gold glow on hover */}
        <div className="
          absolute -top-10 -right-10 w-48 h-48 rounded-full
          bg-[radial-gradient(circle,rgba(201,169,110,0.15)_0%,transparent_70%)]
          opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
        " />

        <div className="relative z-10 p-6 flex items-start gap-4">
          {/* Icon */}
          <div className="
            w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center
            bg-gradient-to-br from-primary/20 to-amber-500/10 border border-primary/25
            group-hover:from-primary/30 transition-all duration-300
          ">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                AI Style Guide
              </p>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/25">
                NEW
              </span>
            </div>
            <h3 className="font-serif text-lg text-white font-semibold leading-snug">
              Find Your Perfect Cut
            </h3>
            <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
              Answer 3 quick questions about your face shape and hair type to get your personalised style recommendations.
            </p>
          </div>

          {/* Arrow */}
          <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center
            bg-white/6 border border-white/10 text-zinc-400
            group-hover:bg-primary/15 group-hover:border-primary/30 group-hover:text-primary
            transition-all duration-300 mt-1">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Bottom preview strip — 3 sample style thumbnails */}
        <div className="px-6 pb-5 flex gap-2 overflow-hidden">
          {[
            '/images/haircuts/high-skin-fade.png',
            '/images/haircuts/classic-side-part.png',
            '/images/haircuts/pompadour.png',
          ].map((url, i) => (
            <div
              key={i}
              className={`
                h-16 flex-1 rounded-xl overflow-hidden bg-zinc-800
                ring-1 ring-white/8 group-hover:ring-primary/20
                transition-all duration-500
                ${i === 2 ? 'hidden sm:block' : ''}
              `}
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top'
              }}
            />
          ))}
          {/* Overlay fade */}
          <div className="absolute bottom-5 right-5 w-24 h-16 bg-gradient-to-l from-zinc-950/90 to-transparent rounded-r-xl" />
        </div>
      </motion.button>

      {/* ── Quiz Modal ── */}
      <AnimatePresence>
        {isOpen && <StyleQuizFlow onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
