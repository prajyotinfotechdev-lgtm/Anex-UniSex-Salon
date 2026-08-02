import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env.config';
import { InternalServerError } from '../../errors/AppErrors';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const cloudinaryService = {
  /**
   * Uploads a file buffer to Cloudinary using a deterministic folder structure.
   */
  uploadBuffer: async (
    buffer: Buffer,
    organizationId: string,
    module: string,
    originalFilename: string
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const folderPath = `anex/organizations/${organizationId}/${module}`;
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          resource_type: 'auto',
          filename_override: originalFilename,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) return reject(new InternalServerError('Failed to upload media to Cloudinary'));
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });
  },

  /**
   * Deletes an asset from Cloudinary
   */
  deleteAsset: async (providerId: string): Promise<any> => {
    try {
      return await cloudinary.uploader.destroy(providerId);
    } catch (error) {
      throw new InternalServerError('Failed to delete media from Cloudinary');
    }
  },

  /**
   * Retrieves an optimized delivery URL for an asset
   */
  getOptimizedUrl: (providerId: string, type: 'image' | 'video' = 'image') => {
    return cloudinary.url(providerId, {
      resource_type: type,
      fetch_format: 'auto',
      quality: 'auto',
    });
  }
};
