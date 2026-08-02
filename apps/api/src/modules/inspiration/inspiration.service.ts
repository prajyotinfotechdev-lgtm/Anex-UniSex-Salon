import { prisma } from '@anex/database';
import { NotFoundError } from '../../errors/AppErrors';

// ─── Slug Utility ────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function ensureUniqueSlug(
  organizationId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const existing = await prisma.inspirationPost.findFirst({
      where: { organizationId, slug, id: excludeId ? { not: excludeId } : undefined },
    });
    if (!existing) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}

// ─── Post Service ─────────────────────────────────────────────────────────────

export const InspirationService = {
  // ── List Posts ──────────────────────────────────────────────────────────────
  async listPosts(organizationId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    employeeId?: string;
    serviceId?: string;
    branchId?: string;
    hairLength?: string;
    search?: string;
    cursor?: string;
  }) {
    const { page = 1, limit = 20, cursor, ...filters } = params;
    const take = Math.min(limit, 50);

    const where: any = { organizationId };
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
    if (filters.isTrending !== undefined) where.isTrending = filters.isTrending;
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.serviceId) where.serviceId = filters.serviceId;
    if (filters.branchId) where.branchId = filters.branchId;
    if (filters.hairLength) where.hairLength = filters.hairLength;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { personalizationTags: { has: filters.search.toLowerCase() } },
      ];
    }
    if (cursor) where.id = { lt: cursor };

    const posts = await prisma.inspirationPost.findMany({
      where,
      take,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        heroMedia: { select: { id: true, url: true, secureUrl: true, width: true, height: true, dominantColor: true } },
        employee: { select: { id: true, firstName: true, lastName: true, profileImageId: true } },
        service: { select: { id: true, name: true, basePrice: true, durationMinutes: true } },
        branch: { select: { id: true, name: true } },
        _count: { select: { bookmarks: true } },
      },
    });

    const total = await prisma.inspirationPost.count({ where });
    const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;

    return {
      data: posts,
      meta: { total, page, limit: take, nextCursor },
    };
  },

  // ── Get Single Post ─────────────────────────────────────────────────────────
  async getPost(organizationId: string, slugOrId: string) {
    const post = await prisma.inspirationPost.findFirst({
      where: {
        organizationId,
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        heroMedia: true,
        beforeMedia: true,
        galleryItems: {
          orderBy: { sortOrder: 'asc' },
          include: { media: true },
        },
        employee: {
          select: {
            id: true, firstName: true, lastName: true, bio: true,
            profileImageId: true, profileImage: { select: { url: true, secureUrl: true } },
          },
        },
        service: { select: { id: true, name: true, basePrice: true, durationMinutes: true, pricingType: true } },
        branch: { select: { id: true, name: true, address: true } },
        collections: {
          include: { collection: { select: { id: true, title: true, slug: true } } },
        },
        _count: { select: { bookmarks: true } },
      },
    });

    if (!post) throw new NotFoundError('Inspiration post not found');
    return post;
  },

  // ── Create Post ─────────────────────────────────────────────────────────────
  async createPost(organizationId: string, data: any) {
    const baseSlug = data.slug || generateSlug(data.title);
    const slug = await ensureUniqueSlug(organizationId, baseSlug);

    const { galleryMediaIds = [], collectionIds = [], ...rest } = data;

    const post = await prisma.inspirationPost.create({
      data: {
        ...rest,
        slug,
        organizationId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : undefined,
        galleryItems: galleryMediaIds.length > 0 ? {
          create: galleryMediaIds.map((g: any) => ({
            mediaId: g.mediaId,
            caption: g.caption,
            sortOrder: g.sortOrder ?? 0,
          })),
        } : undefined,
        collections: collectionIds.length > 0 ? {
          create: collectionIds.map((id: string, i: number) => ({
            collectionId: id,
            sortOrder: i,
          })),
        } : undefined,
      },
      include: {
        heroMedia: { select: { id: true, url: true, secureUrl: true } },
        galleryItems: true,
      },
    });

    return post;
  },

  // ── Update Post ─────────────────────────────────────────────────────────────
  async updatePost(organizationId: string, id: string, data: any) {
    const existing = await prisma.inspirationPost.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundError('Inspiration post not found');

    const { galleryMediaIds, collectionIds, ...rest } = data;

    // Recalculate slug only if title changed and no explicit slug provided
    if (rest.title && !rest.slug) {
      rest.slug = await ensureUniqueSlug(organizationId, generateSlug(rest.title), id);
    }

    // Set publishedAt if transitioning to PUBLISHED
    if (rest.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      rest.publishedAt = new Date();
    }

    const post = await prisma.inspirationPost.update({
      where: { id },
      data: {
        ...rest,
        // Replace gallery if provided
        ...(galleryMediaIds !== undefined && {
          galleryItems: {
            deleteMany: {},
            create: galleryMediaIds.map((g: any) => ({
              mediaId: g.mediaId, caption: g.caption, sortOrder: g.sortOrder ?? 0,
            })),
          },
        }),
        // Replace collection assignments if provided
        ...(collectionIds !== undefined && {
          collections: {
            deleteMany: {},
            create: collectionIds.map((cid: string, i: number) => ({
              collectionId: cid, sortOrder: i,
            })),
          },
        }),
      },
      include: { heroMedia: { select: { id: true, url: true, secureUrl: true } } },
    });

    return post;
  },

  // ── Publish / Archive ───────────────────────────────────────────────────────
  async publishPost(organizationId: string, id: string) {
    const post = await prisma.inspirationPost.findFirst({ where: { id, organizationId } });
    if (!post) throw new NotFoundError('Inspiration post not found');

    return prisma.inspirationPost.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: post.publishedAt ?? new Date() },
    });
  },

  async archivePost(organizationId: string, id: string) {
    const post = await prisma.inspirationPost.findFirst({ where: { id, organizationId } });
    if (!post) throw new NotFoundError('Inspiration post not found');

    return prisma.inspirationPost.update({ where: { id }, data: { status: 'ARCHIVED' } });
  },

  // ── Delete ──────────────────────────────────────────────────────────────────
  async deletePost(organizationId: string, id: string) {
    const post = await prisma.inspirationPost.findFirst({ where: { id, organizationId } });
    if (!post) throw new NotFoundError('Inspiration post not found');

    await prisma.inspirationPost.delete({ where: { id } });
    return { deleted: true };
  },

  // ─── Analytics ────────────────────────────────────────────────────────────────
  async getAnalytics(organizationId: string) {
    const posts = await prisma.inspirationPost.findMany({
      where: { organizationId, status: 'PUBLISHED' },
      select: {
        id: true, title: true, slug: true, category: true,
        viewCount: true, detailOpenCount: true, bookmarkCount: true,
        shareCount: true, bookThisLookClicks: true, bookingsGenerated: true,
        completedVisits: true, revenueGenerated: true,
        heroMedia: { select: { url: true } },
      },
      orderBy: { revenueGenerated: 'desc' },
      take: 50,
    });

    return { data: posts };
  },

  // ─── Async event tracking — non-blocking ──────────────────────────────────────
  async trackEvent(postId: string, customerId: string | null, eventType: string, metadata?: any) {
    // Fire and forget — never block the API response
    setImmediate(async () => {
      try {
        await prisma.inspirationEvent.create({
          data: { postId, customerId, eventType, metadata },
        });

        // Increment the relevant counter
        const counterMap: Record<string, any> = {
          IMPRESSION: { viewCount: { increment: 1 } },
          DETAIL_OPEN: { detailOpenCount: { increment: 1 } },
          BOOKMARK: { bookmarkCount: { increment: 1 } },
          SHARE: { shareCount: { increment: 1 } },
          BOOK_CLICK: { bookThisLookClicks: { increment: 1 } },
          BOOKING_CONFIRMED: { bookingsGenerated: { increment: 1 } },
          VISIT_COMPLETED: { completedVisits: { increment: 1 } },
        };

        if (counterMap[eventType]) {
          await prisma.inspirationPost.update({
            where: { id: postId },
            data: counterMap[eventType],
          });
        }
      } catch {
        // Silently fail — analytics must never break the main request
      }
    });
  },

  // ─── Collections ──────────────────────────────────────────────────────────────
  async listCollections(organizationId: string) {
    return prisma.inspirationCollection.findMany({
      where: { organizationId },
      include: {
        coverImage: { select: { id: true, url: true, secureUrl: true } },
        _count: { select: { posts: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    });
  },

  async createCollection(organizationId: string, data: any) {
    const baseSlug = data.slug || generateSlug(data.title);
    const existing = await prisma.inspirationCollection.findFirst({ where: { organizationId, slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const { postIds = [], ...rest } = data;

    return prisma.inspirationCollection.create({
      data: {
        ...rest,
        slug,
        organizationId,
        posts: postIds.length > 0 ? {
          create: postIds.map((pid: string, i: number) => ({ postId: pid, sortOrder: i })),
        } : undefined,
      },
      include: { coverImage: { select: { id: true, url: true } } },
    });
  },

  async updateCollection(organizationId: string, id: string, data: any) {
    const existing = await prisma.inspirationCollection.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundError('Collection not found');

    const { postIds, ...rest } = data;

    return prisma.inspirationCollection.update({
      where: { id },
      data: {
        ...rest,
        ...(postIds !== undefined && {
          posts: {
            deleteMany: {},
            create: postIds.map((pid: string, i: number) => ({ postId: pid, sortOrder: i })),
          },
        }),
      },
      include: { coverImage: { select: { id: true, url: true } } },
    });
  },

  async deleteCollection(organizationId: string, id: string) {
    const existing = await prisma.inspirationCollection.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundError('Collection not found');
    await prisma.inspirationCollection.delete({ where: { id } });
    return { deleted: true };
  },

  // ─── Customer: Toggle Bookmark ────────────────────────────────────────────────
  async toggleBookmark(customerId: string, postId: string) {
    const existing = await prisma.inspirationBookmark.findUnique({
      where: { customerId_postId: { customerId, postId } },
    });

    if (existing) {
      await prisma.inspirationBookmark.delete({ where: { id: existing.id } });
      // Decrement counter async
      setImmediate(async () => {
        try {
          await prisma.inspirationPost.update({
            where: { id: postId },
            data: { bookmarkCount: { decrement: 1 } },
          });
        } catch {}
      });
      return { bookmarked: false };
    }

    await prisma.inspirationBookmark.create({ data: { customerId, postId } });
    setImmediate(async () => {
      try {
        await prisma.inspirationPost.update({
          where: { id: postId },
          data: { bookmarkCount: { increment: 1 } },
        });
      } catch {}
    });
    return { bookmarked: true };
  },

  // ─── Customer: Get Bookmarks ──────────────────────────────────────────────────
  async getCustomerBookmarks(customerId: string, organizationId: string) {
    const bookmarks = await prisma.inspirationBookmark.findMany({
      where: { customerId, post: { organizationId, status: 'PUBLISHED' } },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            heroMedia: { select: { id: true, url: true, secureUrl: true, width: true, height: true, dominantColor: true } },
            employee: { select: { id: true, firstName: true, lastName: true } },
            service: { select: { id: true, name: true, basePrice: true, durationMinutes: true } },
          },
        },
      },
    });

    return { data: bookmarks.map(b => b.post) };
  },
};

