import { Injectable } from '@nestjs/common';
import { CRAWL_CONFIG } from '../core/crawl-config';

@Injectable()
export class HostLimiterService {
  private perHostMaxConcurrent: number = CRAWL_CONFIG.PER_HOST_CONCURRENCY;
  private perHostRps: number = CRAWL_CONFIG.PER_HOST_RPS;
  private perHostBurst: number = CRAWL_CONFIG.PER_HOST_BURST;

  private hostActiveCount: Map<string, number> = new Map();
  private hostWaitQueues: Map<string, Array<() => void>> = new Map();
  private hostTokens: Map<string, { tokens: number; lastRefillMs: number }> = new Map();

  async acquireHost(host: string): Promise<void> {
    if (!this.hostActiveCount.has(host)) this.hostActiveCount.set(host, 0);
    if (!this.hostWaitQueues.has(host)) this.hostWaitQueues.set(host, []);
    const active = this.hostActiveCount.get(host)!;
    if (active < this.perHostMaxConcurrent) {
      this.hostActiveCount.set(host, active + 1);
      return;
    }
    await new Promise<void>(resolve => this.hostWaitQueues.get(host)!.push(resolve));
    const newActive = this.hostActiveCount.get(host)! + 1;
    this.hostActiveCount.set(host, newActive);
  }

  releaseHost(host: string): void {
    const active = (this.hostActiveCount.get(host) || 1) - 1;
    this.hostActiveCount.set(host, Math.max(0, active));
    const q = this.hostWaitQueues.get(host);
    if (q && q.length > 0) {
      const next = q.shift();
      if (next) next();
    }
  }

  async takeToken(host: string): Promise<void> {
    const now = Date.now();
    const capacity = this.perHostBurst;
    const refillRatePerMs = this.perHostRps / 1000;
    const state = this.hostTokens.get(host) || { tokens: capacity, lastRefillMs: now };
    const elapsed = now - state.lastRefillMs;
    state.tokens = Math.min(capacity, state.tokens + elapsed * refillRatePerMs);
    state.lastRefillMs = now;
    if (state.tokens >= 1) {
      state.tokens -= 1;
      this.hostTokens.set(host, state);
      return;
    }
    const deficitMs = Math.ceil((1 - state.tokens) / refillRatePerMs);
    await new Promise(resolve => setTimeout(resolve, Math.min(1000, Math.max(0, deficitMs))));
    return this.takeToken(host);
  }
}


