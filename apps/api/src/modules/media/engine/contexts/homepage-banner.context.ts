import { Prisma } from '@prisma/client';
import { ContextHandler } from '../context.types';
import { ValidationError } from '../../../../errors/AppErrors';

export class HomepageBannerContextHandler implements ContextHandler {
  name = 'HOMEPAGE_BANNER';

  getMetadataSchema() {
    return {
      type: 'object',
      properties: {
        title: { type: 'string', required: true },
      },
    };
  }

  validateMetadata(metadata: any): void {
    if (!metadata.title) {
      throw new ValidationError('Homepage banner requires a title.');
    }
  }

  async createDomainRecord(
    tx: Prisma.TransactionClient,
    mediaAssetId: string,
    metadata: any,
    organizationId: string,
    uploadedById: string
  ): Promise<string> {
    // For a dummy context, we'll just log it and return a fake ID.
    // In a real scenario, this would create a HomepageBanner record.
    console.log(`[Dummy] Created Homepage Banner with asset ${mediaAssetId} and title ${metadata.title}`);
    return `dummy-banner-record-${Date.now()}`;
  }
}
