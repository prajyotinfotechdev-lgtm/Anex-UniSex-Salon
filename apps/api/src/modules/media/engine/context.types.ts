import { Prisma } from '@prisma/client';

export interface ContextUploadResult {
  mediaAssetId: string;
  domainRecordId?: string;
}

export interface ContextHandler {
  name: string;
  
  /**
   * Returns the expected metadata schema format for the frontend wizard
   */
  getMetadataSchema(): any;

  /**
   * Validates the provided metadata against the expected schema
   */
  validateMetadata(metadata: any): void;

  /**
   * Creates the domain record within the transaction after the MediaAsset is created.
   * Return the ID of the created domain record.
   */
  createDomainRecord(
    tx: Prisma.TransactionClient,
    mediaAssetId: string,
    metadata: any,
    organizationId: string,
    uploadedById: string
  ): Promise<string>;
}
