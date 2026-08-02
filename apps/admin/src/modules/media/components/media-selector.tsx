import React, { useState } from 'react';
import { useMediaStudio, MediaAsset } from '../hooks/use-media';
import { Image as ImageIcon, UploadCloud, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaSelectorProps {
  onSelect: (asset: MediaAsset) => void;
  selectedAssetId?: string | null;
  module?: string;
  trigger?: React.ReactNode;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({ 
  onSelect, 
  selectedAssetId, 
  module = 'general',
  trigger 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getAssets, uploadAsset } = useMediaStudio();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const assets = getAssets.data?.data || [];
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', module);

    const res = await uploadAsset.mutateAsync(formData);
    if (res.success && res.data) {
      onSelect(res.data);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <button type="button" className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors text-sm font-medium">
            <ImageIcon className="w-4 h-4" /> Select Media
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <h2 className="text-lg font-semibold text-neutral-900">Select Media</h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload New
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={handleFileChange} 
                />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-neutral-50">
                {getAssets.isLoading ? (
                  <div className="flex justify-center items-center h-full text-neutral-400">Loading assets...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {assets.map((asset: MediaAsset) => {
                      const isSelected = selectedAssetId === asset.id;
                      return (
                        <div 
                          key={asset.id}
                          onClick={() => {
                            onSelect(asset);
                            setIsOpen(false);
                          }}
                          className={`
                            relative cursor-pointer rounded-xl overflow-hidden border-2 bg-white group aspect-square
                            ${isSelected ? 'border-black' : 'border-transparent hover:border-neutral-300'}
                          `}
                        >
                          {asset.type === 'IMAGE' ? (
                            <img src={asset.url} alt={asset.originalFilename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-100">Video</div>
                          )}
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-black text-white rounded-full p-1 shadow-sm">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
