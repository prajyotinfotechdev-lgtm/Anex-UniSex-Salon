import { Prisma } from '@prisma/client';
import { ContextHandler } from '../context.types';
import { ValidationError } from '../../../../errors/AppErrors';
import { SchemaService } from '../../../schema/schema.service';

export class InspirationContextHandler implements ContextHandler {
  name = 'INSPIRATION';

  getMetadataSchema() {
    return SchemaService.getModelMetadata('InspirationPost');
  }

  validateMetadata(metadata: any): void {
    if (!metadata.title || typeof metadata.title !== 'string') {
      throw new ValidationError('Inspiration context requires a valid title.');
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async createDomainRecord(
    tx: Prisma.TransactionClient,
    mediaAssetId: string,
    metadata: any,
    organizationId: string,
    uploadedById: string
  ): Promise<string> {
    const baseSlug = this.generateSlug(metadata.title);
    let slug = baseSlug;
    let attempt = 0;
    
    // Ensure unique slug inside the transaction
    while (true) {
      const existing = await tx.inspirationPost.findFirst({
        where: { organizationId, slug },
      });
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const post = await tx.inspirationPost.create({
      data: {
        organizationId,
        heroMediaId: mediaAssetId,
        title: metadata.title,
        slug,
        description: metadata.description || null,
        category: metadata.category || null,
        serviceId: metadata.serviceId || null,
        employeeId: metadata.employeeId || null,
        status: metadata.status || 'DRAFT',
        publishedAt: metadata.status === 'PUBLISHED' ? new Date() : null,
        tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      },
    });

    return post.id;
  }
}
