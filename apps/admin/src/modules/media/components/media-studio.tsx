'use client';

import React, { useState, useRef } from 'react';
import { useMediaStudio, MediaAsset } from '../hooks/use-media';
import { 
  UploadCloud, 
  Search, 
  Filter, 
  Grid, 
  List as ListIcon, 
  MoreVertical, 
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Edit2,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBytes } from '@/lib/utils'; // Assumes a generic format util exists or we provide one
import { format } from 'date-fns';
import { toast } from 'sonner';

export const MediaStudio = () => {
  const { getAssets, uploadAsset, deleteAsset } = useMediaStudio();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assets: MediaAsset[] = getAssets.data?.data || [];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', 'general');

      toast.promise(uploadAsset.mutateAsync(formData), {
        loading: `Uploading ${file.name}...`,
        success: 'Asset uploaded successfully!',
        error: 'Failed to upload asset',
      });
    }

    // Reset input
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
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200">
      
      {/* Sidebar / Folders */}
      <div className="w-64 bg-white border-r border-neutral-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Media Studio</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-neutral-100 text-neutral-900">
            <ImageIcon className="w-4 h-4" /> All Media
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-neutral-600 hover:bg-neutral-50">
            <FolderOpen className="w-4 h-4" /> Services
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-neutral-600 hover:bg-neutral-50">
            <FolderOpen className="w-4 h-4" /> Employees
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-neutral-600 hover:bg-neutral-50">
            <FolderOpen className="w-4 h-4" /> Inspiration
          </button>
        </div>
        <div className="p-4 border-t border-neutral-200">
          <div className="bg-neutral-100 rounded-lg p-3 text-xs text-neutral-500">
            Storage: 1.2 GB used
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Top Bar */}
        <div className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <div className="flex bg-neutral-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
            
            <button className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            
            <button 
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
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
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50">
          {getAssets.isLoading ? (
            <div className="flex items-center justify-center h-full text-neutral-400">Loading assets...</div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <ImageIcon className="w-8 h-8 text-neutral-300" />
              </div>
              <p className="font-medium text-neutral-900">No media found</p>
              <p className="text-sm mt-1">Upload an image or video to get started</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
              {assets.map((asset) => (
                <motion.div
                  layoutId={`asset-${asset.id}`}
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`
                    group cursor-pointer rounded-xl overflow-hidden border bg-white transition-all
                    ${selectedAsset?.id === asset.id ? 'ring-2 ring-black border-transparent' : 'border-neutral-200 hover:border-neutral-300'}
                    ${viewMode === 'list' ? 'flex items-center p-3 gap-4' : 'flex flex-col'}
                  `}
                >
                  <div className={`relative bg-neutral-100 ${viewMode === 'list' ? 'w-16 h-16 rounded-lg shrink-0' : 'aspect-square w-full'} overflow-hidden`}>
                    {asset.type === 'IMAGE' ? (
                      <img src={asset.url} alt={asset.originalFilename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Video className="w-8 h-8" />
                      </div>
                    )}
                    {/* Hover Overlay */}
                    {viewMode === 'grid' && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-white text-xs font-medium px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-md">Preview</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-3 ${viewMode === 'list' ? 'flex-1 flex items-center justify-between' : ''}`}>
                    <div className="truncate">
                      <p className="text-sm font-medium text-neutral-900 truncate">{asset.originalFilename}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 uppercase">{asset.format} • {(asset.bytes / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {viewMode === 'list' && (
                       <p className="text-xs text-neutral-500">{format(new Date(asset.createdAt), 'MMM d, yyyy')}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Inspector Sidebar */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-l border-neutral-200 flex flex-col shrink-0 overflow-hidden"
          >
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Asset Details</h3>
              <button onClick={() => setSelectedAsset(null)} className="text-neutral-400 hover:text-neutral-900">
                 &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Preview */}
              <div className="aspect-video bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                {selectedAsset.type === 'IMAGE' ? (
                  <img src={selectedAsset.url} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-neutral-400" />
                  </div>
                )}
              </div>

              {/* Info Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Filename</label>
                  <p className="text-sm text-neutral-900 mt-1 break-all">{selectedAsset.originalFilename}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedAsset.type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Size</label>
                    <p className="text-sm text-neutral-900 mt-1">{(selectedAsset.bytes / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Dimensions</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedAsset.width} x {selectedAsset.height}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Uploaded</label>
                    <p className="text-sm text-neutral-900 mt-1">{format(new Date(selectedAsset.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  <button className="w-full flex items-center gap-2 justify-center py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium rounded-lg text-sm transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit Metadata
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedAsset.id)}
                    className="w-full flex items-center gap-2 justify-center py-2 text-red-600 hover:bg-red-50 font-medium rounded-lg text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Asset
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
