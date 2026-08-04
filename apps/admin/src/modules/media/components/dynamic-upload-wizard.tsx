'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, Sparkles, Scissors, Users, ArrowRight, ArrowLeft,
  ImageIcon, UploadCloud, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { useMediaStudio } from '../hooks/use-media';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Context Options ──────────────────────────────────────────────────────────
const CONTEXT_OPTIONS = [
  {
    id: 'INSPIRATION',
    label: 'Inspiration Post',
    description: 'Visible in customer Lookbook feed',
    icon: Sparkles,
    color: 'from-violet-600 to-purple-700',
  },
  {
    id: 'EMPLOYEES',
    label: 'Employee Photo',
    description: 'Profile photo for a team member',
    icon: Users,
    color: 'from-blue-600 to-cyan-700',
  },
  {
    id: 'SERVICES',
    label: 'Service Image',
    description: 'Photo for a salon service',
    icon: Scissors,
    color: 'from-emerald-600 to-teal-700',
  },
];

// ─── Curated category list (matches Prisma enum exactly) ──────────────────────
const INSPIRATION_CATEGORIES = [
  { value: 'HAIRCUT',        label: 'Haircut'           },
  { value: 'HAIR_COLOUR',    label: 'Hair Colour'       },
  { value: 'BEARD',          label: 'Beard'             },
  { value: 'HAIR_SPA',       label: 'Hair Spa'          },
  { value: 'BRIDAL',         label: 'Bridal'            },
  { value: 'OCCASION',       label: 'Occasion'          },
  { value: 'STUDENT',        label: 'Student'           },
  { value: 'KIDS',           label: 'Kids'              },
  { value: 'TRANSFORMATION', label: 'Transformation'    },
  { value: 'TRENDING',       label: 'Trending'          },
  { value: 'STAFF_PICKS',    label: 'Staff Picks'       },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface DynamicMediaUploadWizardProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  defaultContext?: string;
  onSuccess?: () => void;
}

type WizardStep = 'context' | 'metadata' | 'uploading' | 'success';

// ─── Field Component ──────────────────────────────────────────────────────────
const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50 transition-all";

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export const DynamicMediaUploadWizard: React.FC<DynamicMediaUploadWizardProps> = ({
  isOpen, onClose, file, defaultContext, onSuccess
}) => {
  const { uploadContextualAsset } = useMediaStudio();

  const [step, setStep] = useState<WizardStep>(defaultContext ? 'metadata' : 'context');
  const [contextType, setContextType] = useState<string>(defaultContext?.toUpperCase() || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any>>({
    status: 'PUBLISHED',
    isFeatured: false,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  useEffect(() => {
    if (isOpen) {
      setStep(defaultContext ? 'metadata' : 'context');
      setContextType(defaultContext?.toUpperCase() || '');
      setMetadata({ status: 'PUBLISHED', isFeatured: false });
      setValidationError(null);
    }
  }, [isOpen, defaultContext]);

  const set = useCallback((field: string, value: any) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    setValidationError(null);
  }, []);

  const validate = (): boolean => {
    if (contextType === 'INSPIRATION') {
      if (!metadata.title?.trim()) {
        setValidationError('Please add a title for this look.');
        return false;
      }
      if (!metadata.category) {
        setValidationError('Please select a category so customers can find this.');
        return false;
      }
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validate() || !file) return;
    setStep('uploading');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contextType', contextType);
      formData.append('metadata', JSON.stringify(metadata));
      await uploadContextualAsset.mutateAsync(formData);
      setStep('success');
      toast.success(
        metadata.status === 'PUBLISHED' ? 'Look published to customer feed!' : 'Draft saved.',
        { description: `"${metadata.title || 'Media'}" is ready.` }
      );
      onSuccess?.();
    } catch (error: any) {
      setStep('metadata');
      const msg = error?.response?.data?.message || error?.message || 'Upload failed. Please try again.';
      setValidationError(msg);
      toast.error('Upload failed', { description: msg });
    }
  };

  if (!isOpen || !file) return null;

  const selectedContext = CONTEXT_OPTIONS.find(c => c.id === contextType);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="bg-[#0d0d0d] border border-white/8 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] w-full max-w-3xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row min-h-[480px]">

            {/* ─── Left Panel: Preview ─── */}
            <div className="w-full md:w-[38%] bg-black/40 flex flex-col items-center justify-center p-6 gap-4 border-b md:border-b-0 md:border-r border-white/8 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-transparent pointer-events-none" />
              
              {previewUrl ? (
                <div className="relative w-full max-w-[220px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  {step === 'success' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <CheckCircle2 className="w-14 h-14 text-emerald-400 drop-shadow-lg" />
                    </div>
                  )}
                  {step === 'uploading' && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                      <div className="w-9 h-9 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <p className="text-white/80 text-xs font-medium">Publishing…</p>
                    </div>
                  )}
                  {/* Category badge on preview */}
                  {metadata.category && step === 'metadata' && (
                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                      <span className="bg-black/60 backdrop-blur text-white text-[10px] font-semibold px-2 py-1 rounded-full border border-white/10">
                        {INSPIRATION_CATEGORIES.find(c => c.value === metadata.category)?.label}
                      </span>
                      {metadata.isFeatured && (
                        <span className="bg-violet-600/80 backdrop-blur text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                          ✦ Featured
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-[220px] aspect-[3/4] rounded-2xl border border-dashed border-white/15 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-zinc-700" />
                </div>
              )}

              <div className="text-center relative z-10">
                <p className="text-white/70 text-xs font-medium truncate max-w-[180px]">{file.name}</p>
                <p className="text-zinc-600 text-[11px] mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type.split('/')[1]?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* ─── Right Panel: Steps ─── */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                <div>
                  <h2 className="text-white font-semibold text-base">
                    {step === 'context' && 'Where should this go?'}
                    {step === 'metadata' && (selectedContext ? `${selectedContext.label}` : 'Add Details')}
                    {step === 'uploading' && 'Publishing…'}
                    {step === 'success' && 'Done!'}
                  </h2>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    {step === 'context' && 'Choose where this image will be used'}
                    {step === 'metadata' && 'Fill in the details below — keep it clean and minimal'}
                    {step === 'uploading' && 'Uploading to cloud & saving to database…'}
                    {step === 'success' && (metadata.status === 'PUBLISHED' ? 'Live in the customer Lookbook' : 'Saved as draft')}
                  </p>
                </div>
                {step !== 'uploading' && step !== 'success' && (
                  <button onClick={onClose} className="p-2 rounded-full text-zinc-600 hover:text-white hover:bg-white/8 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 px-6 py-5 overflow-y-auto">
                <AnimatePresence mode="wait">

                  {/* Step 1: Context Picker */}
                  {step === 'context' && (
                    <motion.div key="context" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-2.5">
                      {CONTEXT_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => { setContextType(opt.id); setStep('metadata'); }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/8 hover:border-white/20 hover:bg-white/4 transition-all duration-200 group text-left"
                          >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0", opt.color)}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{opt.label}</p>
                              <p className="text-zinc-600 text-xs mt-0.5">{opt.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Step 2: Curated Metadata Form */}
                  {step === 'metadata' && (
                    <motion.div key="metadata" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">

                      {/* INSPIRATION form — clean & curated */}
                      {contextType === 'INSPIRATION' && (
                        <>
                          <Field label="Title" required>
                            <input
                              autoFocus
                              type="text"
                              className={inputCls}
                              placeholder="e.g. Balayage Summer Transformation"
                              value={metadata.title || ''}
                              onChange={e => set('title', e.target.value)}
                            />
                          </Field>

                          <Field label="Category" required>
                            <select
                              className={inputCls}
                              value={metadata.category || ''}
                              onChange={e => set('category', e.target.value)}
                            >
                              <option value="">Select a category…</option>
                              {INSPIRATION_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                              ))}
                            </select>
                          </Field>

                          <Field label="Description">
                            <textarea
                              className={cn(inputCls, 'h-16 resize-none')}
                              placeholder="Describe the look, technique, or vibe (optional)…"
                              value={metadata.description || ''}
                              onChange={e => set('description', e.target.value)}
                            />
                          </Field>

                          {/* Visibility + Featured row */}
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Visibility</p>
                              <div className="flex rounded-xl overflow-hidden border border-zinc-800">
                                {[{ v: 'PUBLISHED', label: 'Published', icon: Eye }, { v: 'DRAFT', label: 'Draft', icon: EyeOff }].map(opt => (
                                  <button
                                    key={opt.v}
                                    type="button"
                                    onClick={() => set('status', opt.v)}
                                    className={cn(
                                      "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all duration-200",
                                      metadata.status === opt.v
                                        ? 'bg-white text-black'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                    )}
                                  >
                                    <opt.icon className="w-3 h-3" />
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Feature this?</p>
                              <button
                                type="button"
                                onClick={() => set('isFeatured', !metadata.isFeatured)}
                                className={cn(
                                  "w-full py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2",
                                  metadata.isFeatured
                                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                                    : 'border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
                                )}
                              >
                                <Sparkles className="w-3 h-3" />
                                {metadata.isFeatured ? 'Featured ✓' : 'Set Featured'}
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* EMPLOYEES / SERVICES form — ultra minimal */}
                      {(contextType === 'EMPLOYEES' || contextType === 'SERVICES') && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
                            <UploadCloud className="w-6 h-6 text-zinc-500" />
                          </div>
                          <p className="text-white font-medium mb-1.5 text-sm">Ready to upload</p>
                          <p className="text-zinc-600 text-xs max-w-[220px] leading-relaxed">
                            This photo will be saved to the {contextType === 'EMPLOYEES' ? 'Employees' : 'Services'} library.
                            You can link it to a specific record later.
                          </p>
                        </div>
                      )}

                      {/* Validation error */}
                      {validationError && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/25 rounded-xl p-3"
                        >
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-red-400 text-xs">{validationError}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Success */}
                  {step === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-10 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-5">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-white text-lg font-semibold mb-1.5">
                        {metadata.status === 'PUBLISHED' ? 'Published!' : 'Draft Saved'}
                      </h3>
                      <p className="text-zinc-600 text-xs max-w-[220px] leading-relaxed">
                        {contextType === 'INSPIRATION'
                          ? metadata.status === 'PUBLISHED'
                            ? 'Your look is live in the customer Lookbook.'
                            : 'Saved as a draft — publish it anytime from Inspiration Studio.'
                          : 'Your photo has been saved to the media library.'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {(step === 'metadata' || step === 'success') && (
                <div className="px-6 py-4 border-t border-white/8 flex items-center gap-3">
                  {step === 'metadata' && (
                    <>
                      {!defaultContext ? (
                        <button
                          onClick={() => setStep('context')}
                          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-white transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                      ) : <div />}
                      <div className="ml-auto flex gap-2.5">
                        <button
                          onClick={onClose}
                          className="px-4 py-2 text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpload}
                          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-white text-black rounded-xl hover:bg-zinc-100 transition-colors shadow-sm"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          {metadata.status === 'DRAFT' ? 'Save Draft' : 'Publish'}
                        </button>
                      </div>
                    </>
                  )}
                  {step === 'success' && (
                    <button
                      onClick={onClose}
                      className="w-full py-2.5 text-sm font-semibold bg-white text-black rounded-xl hover:bg-zinc-100 transition-colors"
                    >
                      Done
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
