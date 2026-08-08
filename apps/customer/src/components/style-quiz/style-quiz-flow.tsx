"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { FaceShape, HairTexture, HairLength, QuizAnswers, StyleResult, getRecommendations } from './style-engine';
import { FaceShapeIllustration } from './face-shapes';

interface Props {
  onClose: () => void;
}

const TOTAL_STEPS = 3;

// ── Step Data ──────────────────────────────────────────────────────────────
const FACE_SHAPES: { value: FaceShape; label: string; hint: string }[] = [
  { value: 'oval',    label: 'Oval',    hint: 'Longer than wide, rounded chin' },
  { value: 'round',  label: 'Round',   hint: 'Width & height roughly equal' },
  { value: 'square', label: 'Square',  hint: 'Strong, angular jaw' },
  { value: 'heart',  label: 'Heart',   hint: 'Wide forehead, narrow chin' },
  { value: 'diamond',label: 'Diamond', hint: 'Wide cheekbones, narrow forehead & chin' },
];

const HAIR_TEXTURES: { value: HairTexture; label: string; emoji: string; hint: string }[] = [
  { value: 'straight', label: 'Straight', emoji: '〰️', hint: 'Lies flat, minimal wave' },
  { value: 'wavy',     label: 'Wavy',     emoji: '〜',  hint: 'Gentle S-pattern waves' },
  { value: 'curly',    label: 'Curly',    emoji: '🌀',  hint: 'Defined spirals or coils' },
];

const HAIR_LENGTHS: { value: HairLength; label: string; hint: string }[] = [
  { value: 'short',  label: 'Short',  hint: 'Above the ears' },
  { value: 'medium', label: 'Medium', hint: 'Ear to shoulder' },
  { value: 'long',   label: 'Long',   hint: 'Below the shoulder' },
];

// ── Animation Variants ─────────────────────────────────────────────────────
const slideIn = {
  initial:  { opacity: 0, x: 40 },
  animate:  { opacity: 1, x: 0 },
  exit:     { opacity: 0, x: -40 },
  transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] as const },
};

// ── Result Card ────────────────────────────────────────────────────────────
function ResultCard({ style, index, onBook }: {
  style: StyleResult;
  index: number;
  onBook: (style: StyleResult) => void;
}) {
  const safeUrl = style.imageUrl.replace(/^http:\/\//, 'https://');
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/60 flex flex-col"
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        <Image
          src={safeUrl}
          alt={style.name}
          fill
          className="object-cover"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Index badge */}
        <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-primary/90 flex items-center justify-center text-xs font-bold text-black">
          {index + 1}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <h4 className="font-serif text-lg text-white font-semibold">{style.name}</h4>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{style.description}</p>
        </div>
        {/* Why it works */}
        <div className="flex gap-2 rounded-xl bg-primary/8 border border-primary/15 p-3">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-300 leading-relaxed">{style.whyItWorks}</p>
        </div>
        {/* Book CTA */}
        <button
          onClick={() => onBook(style)}
          className="mt-auto w-full h-11 rounded-xl bg-white text-black text-sm font-bold
            hover:bg-primary hover:text-white transition-colors duration-200
            flex items-center justify-center gap-2"
        >
          Book This Look <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Quiz Flow ─────────────────────────────────────────────────────────
export function StyleQuizFlow({ onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    faceShape: null,
    hairTexture: null,
    hairLength: null,
  });
  const [results, setResults] = useState<StyleResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      // Compute results
      const recs = getRecommendations(answers);
      setResults(recs);
      setShowResults(true);
    }
  };

  const goBack = () => {
    if (showResults) {
      setShowResults(false);
      return;
    }
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    } else {
      onClose();
    }
  };

  const canAdvance =
    (step === 1 && answers.faceShape) ||
    (step === 2 && answers.hairTexture) ||
    (step === 3 && answers.hairLength);

  const handleBook = (style: StyleResult) => {
    onClose();
    router.push(`/book?style=${encodeURIComponent(style.name)}&service=${encodeURIComponent(style.serviceKeyword)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
    >
      {/* ── Top Sheet ── */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        exit={{ y: '-100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="absolute top-0 left-0 right-0 max-h-[94dvh] flex flex-col
          bg-zinc-950 rounded-b-[2rem] border-b border-white/8 overflow-hidden shadow-2xl"
      >
        {/* Handle bar for Top Sheet */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3 mt-auto shrink-0 order-last" />        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-4 pb-3 shrink-0">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full flex items-center justify-center
              bg-white/6 border border-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              {showResults ? 'Your Style Profile' : 'Style Quiz'}
            </p>
            {!showResults && (
              <p className="text-[10px] text-zinc-500 mt-0.5">Step {step} of {TOTAL_STEPS}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center
              bg-white/6 border border-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Progress bar ── */}
        {!showResults && (
          <div className="px-6 mb-2 shrink-0">
            <div className="h-1 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 no-scrollbar">
          <AnimatePresence mode="wait">

            {/* ── RESULTS ── */}
            {showResults && (
              <motion.div key="results" {...slideIn} className="pt-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-serif text-white font-semibold leading-tight">
                    Your Top Picks
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1.5">
                    Based on your {answers.faceShape} face shape and {answers.hairTexture} hair
                  </p>
                </div>

                {results.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <Sparkles className="w-10 h-10 text-primary/50" />
                    <p className="text-zinc-400">We're still perfecting our style library. Come back soon!</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {results.map((style, i) => (
                      <ResultCard key={style.id} style={style} index={i} onBook={handleBook} />
                    ))}

                    {/* Start over */}
                    <button
                      onClick={() => { setShowResults(false); setStep(1); setAnswers({ faceShape: null, hairTexture: null, hairLength: null }); }}
                      className="w-full h-10 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      ↺ Retake the quiz
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── STEP 1: FACE SHAPE ── */}
            {!showResults && step === 1 && (
              <motion.div key="step1" {...slideIn} className="pt-4">
                <h2 className="text-2xl font-serif text-white font-semibold leading-snug mb-2">
                  What's your face shape?
                </h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Select the silhouette that most closely resembles yours.
                </p>
                <div className="grid grid-cols-5 gap-3 mb-8">
                  {FACE_SHAPES.map(fs => {
                    const isActive = answers.faceShape === fs.value;
                    return (
                      <button
                        key={fs.value}
                        onClick={() => setAnswers(a => ({ ...a, faceShape: fs.value }))}
                        className={`
                          flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200
                          ${isActive
                            ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(201,169,110,0.2)]'
                            : 'bg-white/4 border-white/10 hover:border-white/25'
                          }
                        `}
                      >
                        <FaceShapeIllustration shape={fs.value} size={52} active={isActive} />
                        <span className={`text-[11px] font-semibold ${isActive ? 'text-primary' : 'text-zinc-400'}`}>
                          {fs.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected hint */}
                <AnimatePresence>
                  {answers.faceShape && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-3 rounded-2xl bg-primary/8 border border-primary/20 p-4 mb-6"
                    >
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-zinc-300">
                        <span className="text-primary font-semibold capitalize">{answers.faceShape} face: </span>
                        {FACE_SHAPES.find(f => f.value === answers.faceShape)?.hint}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── STEP 2: HAIR TEXTURE ── */}
            {!showResults && step === 2 && (
              <motion.div key="step2" {...slideIn} className="pt-4">
                <h2 className="text-2xl font-serif text-white font-semibold leading-snug mb-2">
                  What's your hair texture?
                </h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Think about your hair in its natural, unstyled state.
                </p>
                <div className="space-y-3 mb-8">
                  {HAIR_TEXTURES.map(ht => {
                    const isActive = answers.hairTexture === ht.value;
                    return (
                      <button
                        key={ht.value}
                        onClick={() => setAnswers(a => ({ ...a, hairTexture: ht.value }))}
                        className={`
                          w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left
                          ${isActive
                            ? 'bg-primary/10 border-primary'
                            : 'bg-white/4 border-white/10 hover:border-white/25'
                          }
                        `}
                      >
                        <span className="text-2xl w-10 text-center">{ht.emoji}</span>
                        <div className="flex-1">
                          <p className={`font-semibold ${isActive ? 'text-primary' : 'text-white'}`}>
                            {ht.label}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">{ht.hint}</p>
                        </div>
                        {isActive && <Check className="w-5 h-5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: HAIR LENGTH ── */}
            {!showResults && step === 3 && (
              <motion.div key="step3" {...slideIn} className="pt-4">
                <h2 className="text-2xl font-serif text-white font-semibold leading-snug mb-2">
                  What's your current hair length?
                </h2>
                <p className="text-sm text-zinc-400 mb-6">
                  This helps us recommend styles that work with what you have now.
                </p>
                <div className="space-y-3 mb-8">
                  {HAIR_LENGTHS.map(hl => {
                    const isActive = answers.hairLength === hl.value;
                    return (
                      <button
                        key={hl.value}
                        onClick={() => setAnswers(a => ({ ...a, hairLength: hl.value }))}
                        className={`
                          w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left
                          ${isActive
                            ? 'bg-primary/10 border-primary'
                            : 'bg-white/4 border-white/10 hover:border-white/25'
                          }
                        `}
                      >
                        <div className="flex-1">
                          <p className={`font-semibold ${isActive ? 'text-primary' : 'text-white'}`}>
                            {hl.label}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">{hl.hint}</p>
                        </div>
                        {isActive && <Check className="w-5 h-5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Sticky CTA (only during quiz steps) ── */}
        {!showResults && (
          <div className="shrink-0 px-6 pb-8 pt-2 border-t border-white/6 bg-zinc-950">
            <motion.button
              onClick={goNext}
              disabled={!canAdvance}
              whileHover={{ scale: canAdvance ? 1.02 : 1 }}
              whileTap={{ scale: canAdvance ? 0.98 : 1 }}
              className={`
                w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2
                transition-all duration-300
                ${canAdvance
                  ? 'bg-white text-black shadow-lg shadow-white/10 hover:bg-primary hover:text-white'
                  : 'bg-white/10 text-zinc-600 cursor-not-allowed'
                }
              `}
            >
              {step === TOTAL_STEPS ? (
                <><Sparkles className="w-5 h-5" /> Reveal My Styles</>
              ) : (
                <>Continue <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
