import { Request, Response, NextFunction } from 'express';
import { mediaService } from './media.service';
import { MediaType } from '@prisma/client';

export const mediaController = {
  /**
   * Upload an asset
   */
  uploadAsset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const { module, type, caption, tags, isFeatured } = req.body;
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const organizationId = user.organizationId;
      const uploadedById = user.userId;

      let parsedTags: string[] = [];
      if (tags) {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = typeof tags === 'string' ? tags.split(',') : tags;
        }
      }

      const asset = await mediaService.uploadAsset(
        req.file.buffer,
        organizationId,
        uploadedById,
        {
          originalFilename: req.file.originalname,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          module: module || 'general',
          type: (type as MediaType) || MediaType.IMAGE,
          caption,
          tags: parsedTags,
          isFeatured: isFeatured === 'true',
        }
      );

      res.status(201).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * List assets
   */
  listAssets: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const organizationId = user.organizationId;
      const { page, limit, type, folder, search, tags, isFeatured } = req.query;

      let parsedTags: string[] = [];
      if (tags) {
        try {
          parsedTags = JSON.parse(tags as string);
        } catch (e) {
          parsedTags = typeof tags === 'string' ? (tags as string).split(',') : tags as any;
        }
      }

      const result = await mediaService.listAssets(organizationId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        type: type as MediaType,
        folder: folder as string,
        search: search as string,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        isFeatured: isFeatured ? isFeatured === 'true' : undefined,
      });

      res.status(200).json({
        success: true,
        data: result.assets,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete asset
   */
  deleteAsset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const organizationId = user.organizationId;
      const id = req.params.id as string;

      await mediaService.deleteAsset(organizationId, id);

      res.status(200).json({
        success: true,
        message: 'Asset deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update asset metadata
   */
  updateAssetMetadata: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const organizationId = user.organizationId;
      const id = req.params.id as string;
      const { caption, tags, isFeatured } = req.body;

      const asset = await mediaService.updateAssetMetadata(organizationId, id, {
        caption,
        tags,
        isFeatured,
      });

      res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  },
};
