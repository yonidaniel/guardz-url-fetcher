import { Injectable } from '@nestjs/common';
import { CRAWL_CONFIG } from '../core/crawl-config';
import { UrlResult } from '../interfaces/url-result.interface';

interface CacheEntry { value: UrlResult; expiresAt: number }

@Injectable()
export class CacheService {
  private store: Map<string, CacheEntry> = new Map();
  private ttlMs: number = CRAWL_CONFIG.CACHE_TTL_MS;
  private maxItems: number = CRAWL_CONFIG.CACHE_MAX_ITEMS;

  get(url: string): UrlResult | undefined {
    const entry = this.store.get(url);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(url);
      return undefined;
    }
    return entry.value;
  }

  set(url: string, value: UrlResult): void {
    if (this.store.size >= this.maxItems) {
      const oldestKey = this.store.keys().next().value as string | undefined;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(url, { value, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.store.clear();
  }
}


