import { apiClient as api } from '@/shared/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InspirationPost {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  stylistNotes?: string | null;
  whyItWorks?: string | null;
  whoItSuits?: string | null;
  maintenanceLevel?: string | null;
  visitFrequencyWeeks?: number | null;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  difficulty?: string | null;
  hairLength?: string | null;
  hairType?: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  heroMediaId: string;
  beforeMediaId?: string | null;
  serviceId?: string | null;
  employeeId?: string | null;
  branchId?: string | null;
  personalizationTags: string[];
  viewCount: number;
  detailOpenCount: number;
  bookmarkCount: number;
  shareCount: number;
  bookThisLookClicks: number;
  bookingsGenerated: number;
  completedVisits: number;
  revenueGenerated: number;
  createdAt: string;
  publishedAt?: string | null;
  heroMedia?: { id: string; url: string; secureUrl: string; width?: number; height?: number; dominantColor?: string };
  beforeMedia?: { id: string; url: string; secureUrl: string } | null;
  employee?: { id: string; firstName: string; lastName: string } | null;
  service?: { id: string; name: string; basePrice: number; durationMinutes: number } | null;
  branch?: { id: string; name: string } | null;
  galleryItems?: { id: string; mediaId: string; sortOrder: number; media: { url: string; secureUrl: string } }[];
}

export interface InspirationCollection {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImageId?: string | null;
  isFeatured: boolean;
  sortOrder: number;
  status: string;
  coverImage?: { id: string; url: string } | null;
  _count?: { posts: number };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useGetPost = (id: string) => useQuery({
  queryKey: ['inspiration-post', id],
  queryFn: async () => {
    const res = await api.get(`/inspiration/${id}`);
    return res.data;
  },
  enabled: !!id,
});

export const useInspiration = () => {
  const queryClient = useQueryClient();

  const getPosts = useQuery({
    queryKey: ['inspiration-posts'],
    queryFn: async () => {
      const res = await api.get('/inspiration');
      return res.data;
    },
  });


  const getAnalytics = useQuery({
    queryKey: ['inspiration-analytics'],
    queryFn: async () => {
      const res = await api.get('/inspiration/analytics');
      return res.data;
    },
  });

  const createPost = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/inspiration', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-posts'] });
      queryClient.invalidateQueries({ queryKey: ['inspiration-analytics'] });
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/inspiration/${id}`, data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-posts'] });
      queryClient.invalidateQueries({ queryKey: ['inspiration-post', id] });
    },
  });

  const publishPost = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/inspiration/${id}/publish`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspiration-posts'] }),
  });

  const archivePost = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/inspiration/${id}/archive`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspiration-posts'] }),
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/inspiration/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspiration-posts'] }),
  });

  const getCollections = useQuery({
    queryKey: ['inspiration-collections'],
    queryFn: async () => {
      const res = await api.get('/inspiration/collections');
      return res.data;
    },
  });

  const createCollection = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/inspiration/collections', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspiration-collections'] }),
  });

  const updateCollection = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/inspiration/collections/${id}`, data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspiration-collections'] }),
  });

  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/inspiration/collections/${id}`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspiration-collections'] }),
  });

  return {
    getPosts,
    getAnalytics,
    createPost,
    updatePost,
    publishPost,
    archivePost,
    deletePost,
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection,
  };
};
