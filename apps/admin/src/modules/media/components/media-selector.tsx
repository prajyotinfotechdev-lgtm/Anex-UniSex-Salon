import React, { useState, useMemo } from 'react';
import { useMediaStudio, MediaAsset } from '../hooks/use-media';
import { Image as ImageIcon, UploadCloud, CheckCircle2, X, LayoutDashboard, Scissors, Users, Sparkles, Box, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MediaSelectorProps {
  onSelect: (asset: MediaAsset) => void;
  selectedAssetId?: string | null;
  module?: string; // If provided, limits selector to this folder and forces uploads to it. If not, shows all folders.
  trigger?: React.ReactNode;
}

const FOLDERS = [
  { id: 'all', name: 'All Media', icon: LayoutDashboard },
  { id: 'services', name: 'Services', icon: Scissors },
  { id: 'employees', name: 'Employees', icon: Users },
  { id: 'inspiration', name: 'Inspiration', icon: Sparkles },
  { id: 'products', name: 'Products', icon: Box },
];

export const MediaSelector: React.FC<MediaSelectorProps> = ({ 
  onSelect, 
  selectedAssetId, 
  module,
  trigger 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(module || 'all');
  const { getAssets, uploadAsset } = useMediaStudio();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (activeFolder !== 'all') params.folder = activeFolder;
    return params;
  }, [activeFolder]);

  const { data, isLoading } = getAssets(queryParams);
  const assets = data?.data || [];
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      // If a hard module is passed as prop, use it. Otherwise use the active folder.
      const uploadModule = module || (activeFolder === 'all' ? 'general' : activeFolder);
      formData.append('module', uploadModule);

      toast.promise(uploadAsset.mutateAsync(formData), {
        loading: `Uploading ${file.name}...`,
        success: 'Asset uploaded successfully!',
        error: 'Failed to upload asset',
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl z-[101] flex flex-col overflow-hidden border border-neutral-200/50"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/60 bg-white">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Select Media</h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload New
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange} 
                />
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Only if module prop is not hardcoded) */}
                {!module && (
                  <div className="w-56 bg-neutral-50/50 border-r border-neutral-200/60 p-3 space-y-1 overflow-y-auto">
                    {FOLDERS.map(folder => {
                      const isActive = activeFolder === folder.id;
                      const Icon = folder.icon;
                      return (
                        <button 
                          key={folder.id}
                          onClick={() => setActiveFolder(folder.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                            isActive 
                              ? "bg-white shadow-sm border border-neutral-200/60 text-black" 
                              : "text-neutral-500 hover:bg-neutral-100/50 hover:text-neutral-900 border border-transparent"
                          )}
                        >
                          <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-neutral-400")} /> 
                          {folder.name}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/30">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="w-8 h-8 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                    </div>
                  ) : assets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 max-w-sm mx-auto text-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 mb-4">
                        <ImageIcon className="w-8 h-8 text-neutral-300" />
                      </div>
                      <p className="font-semibold text-neutral-900 text-lg">No media found</p>
                      <p className="text-sm mt-1 mb-6 text-neutral-500">Upload a new image or video to use it here.</p>
                      <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-black bg-white border border-neutral-200 px-4 py-2 rounded-xl shadow-sm hover:bg-neutral-50 transition-colors">
                        Upload Asset
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max">
                      {assets.map((asset: MediaAsset) => {
                        const isSelected = selectedAssetId === asset.id;
                        return (
                          <div 
                            key={asset.id}
                            onClick={() => {
                              onSelect(asset);
                              setIsOpen(false);
                            }}
                            className={cn(
                              "relative cursor-pointer rounded-2xl overflow-hidden bg-white group aspect-square shadow-sm transition-all duration-200",
                              isSelected ? 'ring-2 ring-black ring-offset-2' : 'border border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                            )}
                          >
                            {asset.type === 'IMAGE' ? (
                              <img src={asset.url} alt={asset.originalFilename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                                <Video className="w-8 h-8 text-neutral-400" />
                              </div>
                            )}
                            
                            <div className={cn("absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity", isSelected && "opacity-20")} />
                            
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-black text-white rounded-full p-1 shadow-md scale-in">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
