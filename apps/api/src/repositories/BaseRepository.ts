import { PrismaClient, Prisma } from '@anex/database';
import { prisma } from '../database/prisma.client';

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected readonly db: PrismaClient | Prisma.TransactionClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.db = tx || prisma;
  }

  abstract findById(id: string): Promise<T | null>;
  abstract findMany(params: any): Promise<T[]>;
  abstract create(data: CreateInput): Promise<T>;
  abstract update(id: string, data: UpdateInput): Promise<T>;
  abstract delete(id: string): Promise<T>;
  abstract softDelete(id: string): Promise<T>;
}
