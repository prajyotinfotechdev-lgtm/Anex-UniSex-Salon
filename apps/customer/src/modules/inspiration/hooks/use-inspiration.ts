import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface PublicInspirationPost {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  difficulty: string | null;
  hairLength: string | null;
  hairType: string | null;
  maintenanceLevel: string | null;
  visitFrequencyWeeks: number | null;
  heroMedia: { url: string; secureUrl: string; width?: number; height?: number };
  beforeMedia: { url: string; secureUrl: string } | null;
  employee: { id: string; firstName: string; lastName: string } | null;
  service: { id: string; name: string; basePrice: number; durationMinutes: number } | null;
  branch: { id: string; name: string } | null;
  galleryItems: { id: string; media: { url: string; secureUrl: string } }[];
  isBookmarked: boolean;
  bookmarkCount: number;
  isFeatured?: boolean;
}

export interface PublicInspirationCollection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: { url: string; secureUrl: string } | null;
  posts: PublicInspirationPost[];
}

export const useCustomerInspirationFeed = () => {
  return useQuery({
    queryKey: ['inspiration-feed'],
    queryFn: async () => {
      const res = await api.get('/api/v1/public/inspiration');
      return res.data;
    },
  });
};

export const useCustomerInspirationPost = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['inspiration-post', idOrSlug],
    queryFn: async () => {
      const res = await api.get(`/api/v1/public/inspiration/${idOrSlug}`);
      return res.data;
    },
    enabled: !!idOrSlug,
  });
};

export const useCustomerInspirationCollections = () => {
  return useQuery({
    queryKey: ['inspiration-public-collections'],
    queryFn: async () => {
      const res = await api.get('/api/v1/public/inspiration/collections');
      return res.data;
    },
  });
};

export const useCustomerInspirationCollection = (slug: string) => {
  return useQuery({
    queryKey: ['inspiration-collection', slug],
    queryFn: async () => {
      const res = await api.get(`/api/v1/public/inspiration/collections/${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });
};

export const useCustomerBookmarks = () => {
  const queryClient = useQueryClient();

  const getMyBookmarks = useQuery({
    queryKey: ['inspiration-bookmarks'],
    queryFn: async () => {
      const res = await api.get('/api/v1/me/inspiration/bookmarks');
      return res.data;
    },
    retry: false // Don't retry on 401
  });

  const toggleBookmark = useMutation({
    mutationFn: async (postId: string) => {
      const res = await api.post(`/api/v1/me/inspiration/${postId}/bookmark`);
      return res.data;
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['inspiration-feed'] });
      await queryClient.cancelQueries({ queryKey: ['inspiration-post', postId] });
      const previousFeed = queryClient.getQueryData(['inspiration-feed']);
      return { previousFeed };
    },
    onSettled: (data, error, postId) => {
      queryClient.invalidateQueries({ queryKey: ['inspiration-feed'] });
      queryClient.invalidateQueries({ queryKey: ['inspiration-post', postId] });
      queryClient.invalidateQueries({ queryKey: ['inspiration-bookmarks'] });
    },
  });

  return { getMyBookmarks, toggleBookmark };
};

export const useCustomerInspirationAnalytics = () => {
  const trackEvent = useMutation({
    mutationFn: async ({ postId, eventType }: { postId: string, eventType: string }) => {
      const res = await api.post(`/api/v1/public/inspiration/${postId}/event`, { eventType });
      return res.data;
    },
  });

  return { trackEvent };
};
