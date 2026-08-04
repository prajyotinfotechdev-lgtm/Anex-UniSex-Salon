import { PrismaClient, MediaType, AssetStatus } from '@prisma/client';
import { cloudinaryService } from './cloudinary.service';
import { NotFoundError, ValidationError } from '../../errors/AppErrors';

const prisma = new PrismaClient();

export class MediaService {
  /**
   * Uploads a new asset to Cloudinary and saves metadata to the database
   */
  async uploadAsset(
    buffer: Buffer,
    organizationId: string,
    uploadedById: string,
    params: {
      originalFilename: string;
      mimeType: string;
      sizeBytes: number;
      module: string;
      type: MediaType;
      caption?: string;
      tags?: string[];
      isFeatured?: boolean;
    }
  ) {
    // 1. Upload to Cloudinary
    const result = await cloudinaryService.uploadBuffer(
      buffer,
      organizationId,
      params.module,
      params.originalFilename
    );

    // 2. Save metadata to DB
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        organizationId,
        uploadedById,
        originalFilename: params.originalFilename,
        filename: result.original_filename,
        mimeType: params.mimeType,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        folder: params.module,
        caption: params.caption,
        tags: params.tags || [],
        isFeatured: params.isFeatured || false,
        status: AssetStatus.PUBLISHED,
        url: result.url,
        secureUrl: result.secure_url,
        type: params.type,
        provider: 'cloudinary',
        providerId: result.public_id,
      },
    });

    return mediaAsset;
  }

  /**
   * List assets with pagination, filtering, and tags
   */
  async listAssets(
    organizationId: string,
    query: {
      page?: number;
      limit?: number;
      type?: MediaType;
      folder?: string;
      search?: string;
      tags?: string[];
      isFeatured?: boolean;
    }
  ) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      status: { not: AssetStatus.ARCHIVED },
      deletedAt: null,
    };

    if (query.type) where.type = query.type;
    if (query.folder) where.folder = { contains: query.folder, mode: 'insensitive' };
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    
    if (query.search) {
      where.OR = [
        { originalFilename: { contains: query.search, mode: 'insensitive' } },
        { caption: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tags && query.tags.length > 0) {
      where.tags = { hasSome: query.tags };
    }

    const [total, assets] = await Promise.all([
      prisma.mediaAsset.count({ where }),
      prisma.mediaAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      assets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Soft delete an asset
   */
  async deleteAsset(organizationId: string, assetId: string) {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.organizationId !== organizationId) {
      throw new NotFoundError('Media asset not found');
    }

    if (asset.usageCount > 0) {
      throw new ValidationError('Cannot delete asset. It is currently being used by other modules.');
    }

    // Attempt to delete from Cloudinary
    try {
      if (asset.providerId) {
        await cloudinaryService.deleteAsset(asset.providerId);
      }
    } catch (e) {
      console.warn('Failed to delete asset from Cloudinary', e);
      // Soft delete in DB even if cloudinary fails
    }

    return prisma.mediaAsset.update({
      where: { id: assetId },
      data: {
        status: AssetStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Update asset metadata (caption, tags, featured status)
   */
  async updateAssetMetadata(
    organizationId: string,
    assetId: string,
    data: {
      caption?: string;
      tags?: string[];
      isFeatured?: boolean;
    }
  ) {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.organizationId !== organizationId) {
      throw new NotFoundError('Media asset not found');
    }

    return prisma.mediaAsset.update({
      where: { id: assetId },
      data: {
        caption: data.caption,
        tags: data.tags,
        isFeatured: data.isFeatured,
      },
    });
  }
}

export const mediaService = new MediaService();
