import { z } from 'zod';

// These category values must exactly match what the customer feed filter uses
const InspirationCategoryEnum = z.enum([
  'HAIRCUT', 'HAIR_COLOUR', 'BEARD', 'HAIR_SPA', 'BRIDAL',
  'OCCASION', 'STUDENT', 'KIDS', 'TRANSFORMATION', 'TRENDING', 'STAFF_PICKS',
]);

const StatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

// ─── Post ──────────────────────────────────────────────────────────────────

export const createInspirationPostSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120),
    slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only').optional(),
    description: z.string().max(2000).optional().nullable(),
    category: InspirationCategoryEnum,
    status: StatusEnum.optional().default('DRAFT'),
    isFeatured: z.boolean().optional().default(false),
    heroMediaId: z.string().uuid('heroMediaId must be a valid UUID'),
    beforeMediaId: z.string().uuid().optional().nullable(),
    serviceId: z.string().uuid().optional().nullable(),
    employeeId: z.string().uuid().optional().nullable(),
    branchId: z.string().uuid().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
    galleryMediaIds: z.array(z.object({
      mediaId: z.string().uuid(),
      caption: z.string().optional(),
      sortOrder: z.number().int().optional().default(0),
    })).optional().default([]),
    collectionIds: z.array(z.string().uuid()).optional().default([]),
  }),
});

export const updateInspirationPostSchema = z.object({
  body: createInspirationPostSchema.shape.body.partial().extend({
    heroMediaId: z.string().uuid().optional(),
  }),
});

export const listInspirationPostsSchema = z.object({
  query: z.object({
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(20),
    status: StatusEnum.optional(),
    category: InspirationCategoryEnum.optional(),
    isFeatured: z.string().optional().transform(v => v === 'true').optional(),
    employeeId: z.string().uuid().optional(),
    serviceId: z.string().uuid().optional(),
    branchId: z.string().uuid().optional(),
    search: z.string().optional(),
    gender: z.string().optional(),
    cursor: z.string().optional(),
  }),
});

// ─── Collection ─────────────────────────────────────────────────────────────

export const createCollectionSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(80),
    slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().max(500).optional().nullable(),
    coverImageId: z.string().uuid().optional().nullable(),
    isPublic: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0),
    postIds: z.array(z.string().uuid()).optional().default([]),
  }),
});

export const updateCollectionSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(80).optional(),
    slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().max(500).optional().nullable(),
    coverImageId: z.string().uuid().optional().nullable(),
    isPublic: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    postIds: z.array(z.string().uuid()).optional(),
  }),
});

// ─── Event Tracking ─────────────────────────────────────────────────────────

export const trackEventSchema = z.object({
  body: z.object({
    eventType: z.enum(['DETAIL_OPEN', 'SHARE', 'BOOK_CLICK', 'IMPRESSION']),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});
