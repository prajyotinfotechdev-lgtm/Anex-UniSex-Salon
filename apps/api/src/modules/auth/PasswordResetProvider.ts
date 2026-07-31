import { CacheProvider } from '../../cache/CacheProvider';
import { MemoryCacheProvider } from '../../cache/MemoryCacheProvider';
import { env } from '../../config/env.config';

export class PasswordResetProvider {
  private cache: CacheProvider;
  private readonly TTL_SECONDS = 15 * 60; // 15 minutes

  constructor() {
    this.cache = new MemoryCacheProvider();
  }

  async saveToken(userId: string, token: string): Promise<void> {
    await this.cache.set(`reset:${token}`, userId, this.TTL_SECONDS);
  }

  async getUserIdByToken(token: string): Promise<string | null> {
    return this.cache.get<string>(`reset:${token}`);
  }

  async invalidateToken(token: string): Promise<void> {
    await this.cache.delete(`reset:${token}`);
  }

  async sendResetEmail(email: string, token: string): Promise<void> {
    // In production, integrate email provider here.
    if (env.NODE_ENV !== 'production') {
      console.log(`[DEV ONLY] Password reset token for ${email}: ${token}`);
    }
  }
}
