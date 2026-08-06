'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useMediaStudio, MediaAsset } from '../hooks/use-media';
import { 
  UploadCloud, Search, Filter, Grid, List as ListIcon, 
  MoreVertical, Image as ImageIcon, Video, Trash2, Edit2,
  FolderOpen, LayoutDashboard, Users, Scissors, Sparkles, Box, FileText, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DynamicMediaUploadWizard } from './dynamic-upload-wizard';
import { PremiumLoader } from '@/components/ui/premium-loader';

const FOLDERS = [
  { id: 'all', name: 'All Media', icon: LayoutDashboard },
  { id: 'services', name: 'Services', icon: Scissors },
  { id: 'employees', name: 'Employees', icon: Users },
  { id: 'inspiration', name: 'Inspiration', icon: Sparkles },
  { id: 'products', name: 'Products', icon: Box },
];

export const MediaStudio = () => {
  const [activeFolder, setActiveFolder] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getAssets, uploadAsset, deleteAsset, bulkDeleteMedia } = useMediaStudio();
  
  // Construct query params based on active folder and search
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {};
    if (activeFolder !== 'all') params.folder = activeFolder;
    if (search.trim()) params.search = search.trim();
    return params;
  }, [activeFolder, search]);

  const { data, isLoading, refetch } = getAssets(queryParams);
  const assets: MediaAsset[] = data?.data || [];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 10) {
      toast.error('You can only upload a maximum of 10 images at a time.');
      return;
    }

    setUploadFiles(Array.from(files));
    
    // Clear input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    toast.promise(deleteAsset.mutateAsync(id), {
      loading: 'Deleting asset...',
      success: 'Asset deleted successfully',
      error: 'Failed to delete asset (it may be in use)',
    });
    setSelectedAsset(null);
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} assets?`)) return;
    
    toast.promise(bulkDeleteMedia.mutateAsync(Array.from(selectedIds)), {
      loading: 'Deleting assets...',
      success: (data) => `Deleted ${data.data?.deletedCount || 0} assets successfully${data.data?.failedCount ? ` (${data.data.failedCount} failed because they are in use)` : ''}`,
      error: 'Failed to delete assets',
    });
    setSelectedIds(new Set());
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200/60">
      
      {/* ─── Sidebar ─── */}
      <div className="w-64 bg-neutral-50/50 border-r border-neutral-200/60 flex flex-col hidden md:flex shrink-0">
        <div className="p-5 border-b border-neutral-200/60 bg-white/50 backdrop-blur-sm">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">Library</h2>
        </div>
        <div className="p-3 flex-1 overflow-y-auto space-y-1">
          {FOLDERS.map(folder => {
            const isActive = activeFolder === folder.id;
            const Icon = folder.icon;
            return (
              <button 
                key={folder.id}
                onClick={() => { setActiveFolder(folder.id); setSelectedAsset(null); setSelectedIds(new Set()); }}
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
        <div className="p-5 border-t border-neutral-200/60 bg-white/50">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-900">Storage</span>
              <span className="text-xs text-neutral-500">12%</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-black h-1.5 rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
        
        {/* Top Bar */}
        <div className="h-16 border-b border-neutral-200/60 bg-white flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black transition-colors" />
              <input 
                type="text" 
                placeholder="Search assets by filename..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200/60 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <div className="flex bg-neutral-50 p-1 rounded-xl border border-neutral-200/60">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-neutral-900')}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded-lg transition-all", viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-neutral-900')}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
            
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
                </motion.button>
              )}
            </AnimatePresence>

            <button 
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-all shadow-sm hover:shadow active:scale-95"
            >
              <UploadCloud className="w-4 h-4" /> Upload
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*,video/*"
              onChange={handleFileChange} 
            />
          </div>
        </div>

        {/* Asset Grid/List */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/30">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <PremiumLoader text="Loading media..." />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 mb-6 relative">
                <ImageIcon className="w-8 h-8 text-neutral-300" />
                <div className="absolute -bottom-2 -right-2 bg-black text-white p-1.5 rounded-lg shadow-lg">
                  <UploadCloud className="w-3 h-3" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">No media found</h3>
              <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                {activeFolder === 'all' 
                  ? "Your media library is empty. Upload images or videos to get started." 
                  : `You don't have any media in the ${FOLDERS.find(f => f.id === activeFolder)?.name} folder yet.`}
              </p>
              <button onClick={handleUploadClick} className="mt-6 text-sm font-medium text-black bg-white border border-neutral-200 px-4 py-2 rounded-xl shadow-sm hover:bg-neutral-50 transition-colors">
                Upload First File
              </button>
            </div>
          ) : (
            <div className={cn("grid gap-4", viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-max' : 'grid-cols-1')}>
              {assets.map((asset) => (
                <motion.div
                  layoutId={`asset-${asset.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={cn(
                    "group cursor-pointer rounded-2xl overflow-hidden bg-white transition-all shadow-sm",
                    selectedAsset?.id === asset.id ? 'ring-2 ring-black ring-offset-2' : 'border border-neutral-200 hover:border-neutral-300 hover:shadow-md',
                    viewMode === 'list' ? 'flex items-center p-3 gap-4' : 'flex flex-col'
                  )}
                >
                  <div className={cn("relative bg-neutral-100 overflow-hidden", viewMode === 'list' ? 'w-16 h-16 rounded-xl shrink-0' : 'aspect-square w-full')}>
                    {asset.type === 'IMAGE' ? (
                      <img src={asset.url} alt={asset.originalFilename} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-100">
                        <Video className="w-8 h-8" />
                      </div>
                    )}
                    {viewMode === 'grid' && (
                      <div className={cn(
                        "absolute inset-0 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]",
                        selectedIds.has(asset.id) ? "bg-black/20 opacity-100" : "bg-black/40 opacity-0 group-hover:opacity-100"
                      )}>
                         <span className="text-white text-xs font-medium px-4 py-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors">View Details</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={(e) => toggleSelection(asset.id, e)}
                      className={cn(
                        "absolute top-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-10",
                        selectedIds.has(asset.id) 
                          ? "bg-black border-black text-white opacity-100 scale-100" 
                          : "border-white/70 bg-black/20 text-transparent opacity-0 group-hover:opacity-100 hover:bg-black/40 hover:border-white scale-95 hover:scale-100"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className={cn("p-4", viewMode === 'list' ? 'flex-1 flex items-center justify-between py-2' : '')}>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{asset.originalFilename}</p>
                      <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-medium">{asset.format} • {(asset.bytes / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {viewMode === 'list' && (
                       <p className="text-xs font-medium text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg">{format(new Date(asset.createdAt), 'MMM d, yyyy')}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Detail Inspector ─── */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white border-l border-neutral-200/60 flex flex-col shrink-0 overflow-hidden z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.03)]"
          >
            <div className="p-5 border-b border-neutral-200/60 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <h3 className="font-semibold text-neutral-900">Asset Details</h3>
              <button onClick={() => setSelectedAsset(null)} className="p-2 text-neutral-400 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors">
                 &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200 relative group">
                {selectedAsset.type === 'IMAGE' ? (
                  <img src={selectedAsset.secureUrl} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-neutral-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={selectedAsset.secureUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg hover:bg-white text-black transition-colors" title="Open Original">
                    <Search className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Filename</label>
                  <p className="text-sm font-medium text-neutral-900 break-all">{selectedAsset.originalFilename}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Type</label>
                    <p className="text-sm font-medium text-neutral-900">{selectedAsset.type}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Size</label>
                    <p className="text-sm font-medium text-neutral-900">{(selectedAsset.bytes / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Dimensions</label>
                    <p className="text-sm font-medium text-neutral-900">{selectedAsset.width} x {selectedAsset.height}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 block">Uploaded</label>
                    <p className="text-sm font-medium text-neutral-900">{format(new Date(selectedAsset.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">System Tags</label>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-600 shadow-sm capitalize">Folder: {selectedAsset.folder || 'general'}</span>
                    <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-600 shadow-sm">{selectedAsset.format}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <button onClick={() => handleDelete(selectedAsset.id)} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl text-sm transition-colors border border-red-100">
                    <Trash2 className="w-4 h-4" /> Delete Asset
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Upload Wizard */}
      <AnimatePresence>
        {uploadFiles.length > 0 && (
          <DynamicMediaUploadWizard
            isOpen={uploadFiles.length > 0}
            files={uploadFiles}
            defaultContext={activeFolder === 'all' ? undefined : activeFolder.toUpperCase()}
            onClose={() => setUploadFiles([])}
            onSuccess={() => {
              refetch();
              setUploadFiles([]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
