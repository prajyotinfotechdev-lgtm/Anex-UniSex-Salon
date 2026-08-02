'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInspiration, InspirationCollection } from '../hooks/use-inspiration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MediaSelector } from '@/modules/media/components/media-selector';
import { MediaAsset } from '@/modules/media/hooks/use-media';
import { Plus, Edit, Trash2, ArrowLeft, Image as ImageIcon, Layers } from 'lucide-react';
import { toast } from 'sonner';

export function InspirationCollectionManager() {
  const router = useRouter();
  const { getCollections, createCollection, updateCollection, deleteCollection } = useInspiration();
  const { data: collectionsData, isLoading } = getCollections;
  
  const collections = collectionsData?.data || [];

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageId, setCoverImageId] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCoverImageId('');
    setCoverPreview('');
    setIsFeatured(false);
    setEditingId(null);
  };

  const handleEdit = (col: InspirationCollection) => {
    setTitle(col.title);
    setDescription(col.description || '');
    setCoverImageId(col.coverImageId || '');
    setCoverPreview(col.coverImage?.url || '');
    setIsFeatured(col.isFeatured);
    setEditingId(col.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      await deleteCollection.mutateAsync(id);
      toast.success('Collection deleted');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Title is required');
      return;
    }

    const payload = {
      title,
      description: description || null,
      coverImageId: coverImageId || null,
      isFeatured,
      status: 'PUBLISHED', // Simplified for now
    };

    try {
      if (editingId) {
        await updateCollection.mutateAsync({ id: editingId, data: payload });
        toast.success('Collection updated');
      } else {
        await createCollection.mutateAsync(payload);
        toast.success('Collection created');
      }
      setIsOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Failed to save collection');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/inspiration')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Collections</h2>
            <p className="text-muted-foreground mt-1">Group your inspiration posts into thematic collections.</p>
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            <Plus className="mr-2 h-4 w-4" /> New Collection
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Collection' : 'Create Collection'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Summer Bridal Looks" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Brief description of this collection..." 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="w-full aspect-[21/9] bg-muted rounded-md overflow-hidden relative flex items-center justify-center border">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="object-cover w-full h-full" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  )}
                </div>
                <MediaSelector 
                  module="inspiration"
                  selectedAssetId={coverImageId}
                  onSelect={(asset: MediaAsset) => {
                    setCoverImageId(asset.id);
                    setCoverPreview(asset.secureUrl);
                  }}
                  trigger={
                    <Button type="button" variant="outline" className="w-full mt-2">
                      {coverImageId ? 'Change Image' : 'Select Image'}
                    </Button>
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Featured Collection</Label>
                  <p className="text-sm text-muted-foreground">Show prominently in the app.</p>
                </div>
                <Checkbox 
                  id="isFeatured" 
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(!!checked)}
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button type="submit">{editingId ? 'Save Changes' : 'Create Collection'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Loading collections...</div>
      ) : collections.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center bg-card rounded-lg border">
          <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No collections yet</p>
          <p className="text-sm text-muted-foreground">Group your posts into collections to help customers find looks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col: InspirationCollection) => (
            <Card key={col.id} className="overflow-hidden">
              <div className="h-40 bg-muted w-full relative">
                {col.coverImage ? (
                  <img src={col.coverImage.url} alt={col.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground/30">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                {col.isFeatured && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-sm font-medium">
                    Featured
                  </div>
                )}
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1" title={col.title}>{col.title}</h3>
                  <div className="flex gap-1 -mr-2 -mt-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(col)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500/70 hover:text-red-600" onClick={() => handleDelete(col.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-4">
                  {col.description || 'No description provided.'}
                </p>
                <div className="text-xs font-medium bg-muted w-fit px-2 py-1 rounded">
                  {col._count?.posts || 0} Posts
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
