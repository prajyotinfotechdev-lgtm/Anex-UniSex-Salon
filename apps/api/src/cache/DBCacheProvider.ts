import { CacheProvider } from './CacheProvider';
import { prisma } from '../database/prisma.client';

export class DBCacheProvider implements CacheProvider {
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "__cache" (
          "key" TEXT PRIMARY KEY,
          "value" JSONB,
          "expires_at" TIMESTAMP
        );
      `);
      this.initialized = true;
    } catch (err) {
      console.error('Failed to initialize DBCacheProvider', err);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();
    
    // Clean up expired items opportunistically
    await prisma.$executeRawUnsafe(`DELETE FROM "__cache" WHERE "expires_at" < NOW();`);

    const result = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "value" FROM "__cache" WHERE "key" = $1 AND ("expires_at" IS NULL OR "expires_at" > NOW()) LIMIT 1`,
      key
    );

    if (!result || result.length === 0) return null;
    return result[0].value as T;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    await this.init();

    // Calculate expiry
    const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : null;
    
    // Upsert logic
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "__cache" ("key", "value", "expires_at")
      VALUES ($1, $2::jsonb, $3)
      ON CONFLICT ("key") DO UPDATE SET "value" = $2::jsonb, "expires_at" = $3
      `,
      key,
      JSON.stringify(value),
      expiresAt
    );
  }

  async delete(key: string): Promise<void> {
    await this.init();
    await prisma.$executeRawUnsafe(`DELETE FROM "__cache" WHERE "key" = $1`, key);
  }

  async clear(): Promise<void> {
    await this.init();
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "__cache"`);
  }
}
