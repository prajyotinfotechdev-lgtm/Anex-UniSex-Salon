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

  const getAssets = useQuery({
    queryKey: ['media-assets'],
    queryFn: async () => {
      const res = await api.get('/api/v1/media');
      return res.data;
    },
  });

  const uploadAsset = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post('/api/v1/media/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
  });

  const updateAsset = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/api/v1/media/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/v1/media/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
  });

  return {
    getAssets,
    uploadAsset,
    updateAsset,
    deleteAsset,
  };
};
