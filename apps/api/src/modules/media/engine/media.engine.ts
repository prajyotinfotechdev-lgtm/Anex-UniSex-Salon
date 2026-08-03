import { PrismaClient, MediaType, AssetStatus } from '@prisma/client';
import { cloudinaryService } from '../cloudinary.service';
import { ContextHandler } from './context.types';
import { defaultContexts } from './contexts';
import { ValidationError, InternalServerError } from '../../../errors/AppErrors';

// Instantiate prisma client
const prisma = new PrismaClient();

export class MediaContentEngine {
  private registry: Map<string, ContextHandler> = new Map();

  constructor() {
    defaultContexts.forEach(handler => this.registerContext(handler));
  }

  registerContext(handler: ContextHandler) {
    this.registry.set(handler.name.toUpperCase(), handler);
  }

  getContext(name: string): ContextHandler {
    const handler = this.registry.get(name.toUpperCase());
    if (!handler) {
      throw new ValidationError(`Context handler for ${name} not found`);
    }
    return handler;
  }

  async processUpload(
    buffer: Buffer,
    organizationId: string,
    uploadedById: string,
    contextName: string,
    metadataStr: string,
    originalFilename: string,
    mimeType: string,
    sizeBytes: number
  ) {
    // 1. Resolve Context and Parse Metadata
    const handler = this.getContext(contextName);
    let metadata: any;
    try {
      metadata = JSON.parse(metadataStr || '{}');
    } catch (e) {
      throw new ValidationError('Invalid metadata JSON');
    }

    // 2. Validate Context Specific Metadata
    handler.validateMetadata(metadata);

    // 3. Cloudinary Upload (outside of transaction)
    // Assuming context name maps roughly to folder
    const folderModule = contextName.toLowerCase();
    let cloudinaryResult: any;
    try {
      cloudinaryResult = await cloudinaryService.uploadBuffer(
        buffer,
        organizationId,
        folderModule,
        originalFilename
      );
    } catch (error) {
      throw new InternalServerError('Failed to upload media to Cloudinary');
    }

    // 4. DB Transaction
    try {
      const result = await prisma.$transaction(async (tx) => {
        // A. Create Media Asset (Pure Media Data)
        const isPublished = metadata.status === 'PUBLISHED';
        const mediaAsset = await tx.mediaAsset.create({
          data: {
            organizationId,
            uploadedById,
            originalFilename,
            filename: cloudinaryResult.original_filename,
            mimeType,
            format: cloudinaryResult.format,
            bytes: cloudinaryResult.bytes,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            folder: cloudinaryResult.folder,
            // Core asset status can be PUBLISHED or PENDING based on the context's intention
            status: isPublished ? AssetStatus.PUBLISHED : AssetStatus.PENDING,
            url: cloudinaryResult.url,
            secureUrl: cloudinaryResult.secure_url,
            type: mimeType.startsWith('video') ? MediaType.VIDEO : MediaType.IMAGE,
            provider: 'cloudinary',
            providerId: cloudinaryResult.public_id,
            // Set usage count to 1 immediately as it will be associated with the domain
            usageCount: 1,
          },
        });

        // B. Create Associated Domain Record
        const domainRecordId = await handler.createDomainRecord(
          tx,
          mediaAsset.id,
          metadata,
          organizationId,
          uploadedById
        );

        return { mediaAsset, domainRecordId };
      });

      return result;
    } catch (error) {
      // Rollback: cleanup cloudinary
      if (cloudinaryResult && cloudinaryResult.public_id) {
        await cloudinaryService.deleteAsset(cloudinaryResult.public_id).catch(() => {
          // Swallow cleanup errors but log them ideally
          console.error(`Failed to cleanup orphaned asset ${cloudinaryResult.public_id}`);
        });
      }
      throw new InternalServerError('Failed to process contextual upload due to database transaction failure');
    }
  }
}

export const mediaContentEngine = new MediaContentEngine();
