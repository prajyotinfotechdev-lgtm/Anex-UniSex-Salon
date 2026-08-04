import { apiClient as api } from '@/shared/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface MediaAsset {
  id: string;
  url: string;
  secureUrl: string;
  originalFilename: string;
  filename: string;
  format: string;
  mimeType: string;
  bytes: number;
  width: number;
  height: number;
  folder: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  providerId: string;
  caption?: string;
  tags: string[];
  isFeatured: boolean;
  usageCount: number;
  createdAt: string;
}

export const useMediaStudio = () => {
  const queryClient = useQueryClient();

  const getAssets = (params?: Record<string, any>) => useQuery({
    queryKey: ['media-assets', params],
    queryFn: async () => {
      const res = await api.get('/media', { params });
      return res.data;
    },
  });

  const getContextSchema = (contextType: string) => useQuery({
    queryKey: ['context-schema', contextType],
    queryFn: async () => {
      if (!contextType) return null;
      const res = await api.get(`/media/contexts/${contextType}/schema`);
      return res.data;
    },
    enabled: !!contextType,
  });

  const uploadAsset = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post('/media/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
  });

  const uploadContextualAsset = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post('/media/upload-contextual', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
      queryClient.invalidateQueries({ queryKey: ['inspiration-posts'] });   // FIX: was missing — Inspiration Studio now updates immediately
      queryClient.invalidateQueries({ queryKey: ['inspiration-analytics'] });
    },
  });


  const updateAsset = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/media/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/media/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
  });

  const bulkDeleteMedia = useMutation({
    mutationFn: async (assetIds: string[]) => {
      const res = await api.post(`/media/bulk-delete`, { assetIds });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
  });

  return {
    getAssets,
    getContextSchema,
    uploadAsset,
    uploadContextualAsset,
    updateAsset,
    deleteAsset,
    bulkDeleteMedia,
  };
};
