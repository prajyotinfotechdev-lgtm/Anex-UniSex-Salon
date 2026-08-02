import { Prisma } from '@anex/database';
import { prisma } from './prisma.client';

export class TransactionManager {
  static async execute<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    }
  ): Promise<T> {
    return prisma.$transaction(operation, options);
  }
}
