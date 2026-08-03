'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckCircle2, Sparkles, Scissors, Users, ArrowRight, ArrowLeft,
  ImageIcon, UploadCloud, AlertCircle
} from 'lucide-react';
import { useMediaStudio } from '../hooks/use-media';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Category values must match Prisma InspirationCategoryEnum exactly ────────
const INSPIRATION_CATEGORIES = [
  { value: 'HAIRCUT',      label: 'Haircut'        },
  { value: 'HAIR_COLOUR',  label: 'Hair Colour'    },
  { value: 'BEARD',        label: 'Beard'          },
  { value: 'HAIR_SPA',     label: 'Hair Spa'       },
  { value: 'BRIDAL',       label: 'Bridal'         },
  { value: 'OCCASION',     label: 'Occasion'       },
  { value: 'STUDENT',      label: 'Student'        },
  { value: 'KIDS',         label: 'Kids'           },
  { value: 'TRANSFORMATION', label: 'Transformation' },
  { value: 'TRENDING',     label: 'Trending'       },
  { value: 'STAFF_PICKS',  label: 'Staff Picks'    },
];

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

// ─── Props ────────────────────────────────────────────────────────────────────
interface MediaUploadWizardProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
  defaultContext?: string;
  onSuccess?: () => void;
}

// ─── Wizard Steps ─────────────────────────────────────────────────────────────
type WizardStep = 'context' | 'metadata' | 'uploading' | 'success';

export const MediaUploadWizard: React.FC<MediaUploadWizardProps> = ({
  isOpen, onClose, file, defaultContext, onSuccess
}) => {
  const { uploadContextualAsset } = useMediaStudio();

  const [step, setStep] = useState<WizardStep>(defaultContext ? 'metadata' : 'context');
  const [contextType, setContextType] = useState<string>(defaultContext?.toUpperCase() || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any>>({ status: 'PUBLISHED' });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generate local preview URL
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  // Reset state when wizard opens
  useEffect(() => {
    if (isOpen) {
      setStep(defaultContext ? 'metadata' : 'context');
      setContextType(defaultContext?.toUpperCase() || '');
      setMetadata({ status: 'PUBLISHED' });
      setValidationError(null);
    }
  }, [isOpen, defaultContext]);

  const handleMetadataChange = useCallback((field: string, value: any) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    setValidationError(null);
  }, []);

  const validateMetadata = (): boolean => {
    if (contextType === 'INSPIRATION') {
      if (!metadata.title?.trim()) {
        setValidationError('Title is required for Inspiration posts.');
        return false;
      }
      if (!metadata.category) {
        setValidationError('Category is required for Inspiration posts.');
        return false;
      }
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateMetadata()) return;
    if (!file) return;

    setStep('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contextType', contextType);
      formData.append('metadata', JSON.stringify(metadata));

      await uploadContextualAsset.mutateAsync(formData);
      setStep('success');
      toast.success('Content published successfully!', {
        description: contextType === 'INSPIRATION' ? 'Your look is now live in the customer Lookbook.' : 'Your media has been saved.'
      });
      onSuccess?.();
    } catch (error: any) {
      setStep('metadata');
      const msg = error?.response?.data?.message || error?.message || 'Upload failed. Please try again.';
      setValidationError(msg);
      toast.error('Upload failed', { description: msg });
    }
  };

  if (!isOpen || !file) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row min-h-[520px]">

            {/* ─── Left: Image Preview ─── */}
            <div className="w-full md:w-[42%] bg-zinc-950 border-b md:border-b-0 md:border-r border-white/10 flex flex-col items-center justify-center p-6 gap-4">
              {previewUrl ? (
                <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-xl overflow-hidden border border-white/10 shadow-xl">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Status badge */}
                  {step === 'success' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                    </div>
                  )}
                  {step === 'uploading' && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <p className="text-white text-xs font-medium">Publishing…</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-[280px] aspect-[3/4] rounded-xl border border-dashed border-white/20 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-zinc-600" />
                </div>
              )}

              <div className="text-center">
                <p className="text-white/80 text-sm font-medium truncate max-w-[220px]">{file.name}</p>
                <p className="text-zinc-500 text-xs mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type.split('/')[1]?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* ─── Right: Wizard Steps ─── */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <div>
                  <h2 className="text-white font-semibold text-lg">
                    {step === 'context' && 'Where should this go?'}
                    {step === 'metadata' && 'Add Details'}
                    {step === 'uploading' && 'Publishing…'}
                    {step === 'success' && 'Published!'}
                  </h2>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {step === 'context' && 'Choose where this image will be used'}
                    {step === 'metadata' && `Creating ${CONTEXT_OPTIONS.find(c => c.id === contextType)?.label || 'content'}`}
                    {step === 'uploading' && 'Uploading to Cloudinary & saving to database…'}
                    {step === 'success' && 'Your content is live'}
                  </p>
                </div>
                {step !== 'uploading' && step !== 'success' && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">

                  {/* Step 1: Context Selection */}
                  {step === 'context' && (
                    <motion.div
                      key="context"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      {CONTEXT_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => { setContextType(opt.id); setStep('metadata'); }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200 group text-left"
                          >
                            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0", opt.color)}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{opt.label}</p>
                              <p className="text-zinc-500 text-xs mt-0.5">{opt.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Step 2: Metadata Form */}
                  {step === 'metadata' && (
                    <motion.div
                      key="metadata"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      {/* Inspiration Form */}
                      {contextType === 'INSPIRATION' && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                              Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                              placeholder="e.g. Balayage Summer Transformation"
                              value={metadata.title || ''}
                              onChange={e => handleMetadataChange('title', e.target.value)}
                              autoFocus
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                              Category <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
                              value={metadata.category || ''}
                              onChange={e => handleMetadataChange('category', e.target.value)}
                            >
                              <option value="">Select category…</option>
                              {INSPIRATION_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                              Description
                            </label>
                            <textarea
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 h-20 resize-none focus:outline-none focus:border-zinc-500 transition-colors"
                              placeholder="Describe the look, technique, or vibe…"
                              value={metadata.description || ''}
                              onChange={e => handleMetadataChange('description', e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                              Visibility
                            </label>
                            <div className="flex gap-3">
                              {[{ v: 'PUBLISHED', label: 'Published', desc: 'Live in customer feed' }, { v: 'DRAFT', label: 'Draft', desc: 'Hidden from customers' }].map(opt => (
                                <button
                                  key={opt.v}
                                  type="button"
                                  onClick={() => handleMetadataChange('status', opt.v)}
                                  className={cn(
                                    "flex-1 p-3 rounded-xl border text-left transition-all duration-200",
                                    metadata.status === opt.v
                                      ? 'border-white/40 bg-white/10 text-white'
                                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                                  )}
                                >
                                  <p className="text-sm font-semibold">{opt.label}</p>
                                  <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <div
                                onClick={() => handleMetadataChange('isFeatured', !metadata.isFeatured)}
                                className={cn(
                                  "w-10 h-6 rounded-full transition-colors relative",
                                  metadata.isFeatured ? 'bg-white' : 'bg-zinc-700'
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-4 h-4 rounded-full bg-black transition-transform",
                                  metadata.isFeatured ? 'translate-x-5' : 'translate-x-1'
                                )} />
                              </div>
                              <div>
                                <p className="text-sm text-white font-medium">Featured Look</p>
                                <p className="text-xs text-zinc-500">Displays in the hero banner at top of the feed</p>
                              </div>
                            </label>
                          </div>
                        </>
                      )}

                      {/* Employee/Service Context (Generic caption) */}
                      {(contextType === 'EMPLOYEES' || contextType === 'SERVICES') && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                            <UploadCloud className="w-8 h-8 text-zinc-400" />
                          </div>
                          <p className="text-white font-medium mb-2">Ready to upload</p>
                          <p className="text-zinc-500 text-sm">
                            This image will be saved as a {contextType === 'EMPLOYEES' ? 'general employee photo' : 'service image'}.
                            You can link it to a specific record from the{' '}
                            {contextType === 'EMPLOYEES' ? 'Employees' : 'Services'} section.
                          </p>
                        </div>
                      )}

                      {/* Validation Error */}
                      {validationError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                        >
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-red-400 text-sm">{validationError}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Step: Success */}
                  {step === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-10 text-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-white text-xl font-semibold mb-2">Published Successfully</h3>
                      <p className="text-zinc-500 text-sm max-w-xs">
                        {contextType === 'INSPIRATION'
                          ? metadata.status === 'PUBLISHED'
                            ? 'Your look is now live in the customer Lookbook feed.'
                            : 'Your look has been saved as a draft.'
                          : 'Your media has been saved to the library.'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Actions */}
              {(step === 'metadata' || step === 'success') && (
                <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center gap-3">
                  {step === 'metadata' && (
                    <>
                      {!defaultContext && (
                        <button
                          onClick={() => setStep('context')}
                          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>
                      )}
                      {defaultContext && <div />}
                      <div className="flex gap-3 ml-auto">
                        <button
                          onClick={onClose}
                          className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpload}
                          disabled={contextType === 'INSPIRATION' && (!metadata.title?.trim() || !metadata.category)}
                          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <UploadCloud className="w-4 h-4" />
                          {metadata.status === 'DRAFT' ? 'Save Draft' : 'Publish'}
                        </button>
                      </div>
                    </>
                  )}
                  {step === 'success' && (
                    <button
                      onClick={onClose}
                      className="w-full py-2.5 text-sm font-semibold bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors"
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
