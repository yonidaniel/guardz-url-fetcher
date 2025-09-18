import { Injectable } from '@nestjs/common';
import { CRAWL_CONFIG } from '../core/crawl-config';

@Injectable()
export class ConcurrencyService {
  private maxConcurrentFetches: number = CRAWL_CONFIG.MAX_CONCURRENCY;
  private currentFetches: number = 0;
  private waitQueue: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (this.currentFetches < this.maxConcurrentFetches) {
      this.currentFetches++;
      return;
    }
    await new Promise<void>(resolve => this.waitQueue.push(resolve));
    this.currentFetches++;
  }

  release(): void {
    this.currentFetches = Math.max(0, this.currentFetches - 1);
    const next = this.waitQueue.shift();
    if (next) next();
  }
}


