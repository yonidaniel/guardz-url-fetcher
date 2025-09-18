import { Injectable, Logger } from '@nestjs/common';
import { CRAWL_CONFIG } from '../core/crawl-config';
import axios, { AxiosResponse } from 'axios';
import { ConcurrencyService } from './concurrency.service';
import { HostLimiterService } from './host-limiter.service';

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);
  private maxAttempts: number = CRAWL_CONFIG.HTTP_MAX_ATTEMPTS;
  private baseDelayMs: number = CRAWL_CONFIG.HTTP_BASE_DELAY_MS;

  constructor(
    private readonly concurrency: ConcurrencyService,
    private readonly hostLimiter: HostLimiterService,
  ) {}

  async get(url: string, headers: Record<string, string> = { 'User-Agent': 'Guardz-URL-Fetcher/1.0' }): Promise<AxiosResponse<any>> {
    let lastError: any = null;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const host = new URL(url).host;
        await this.acquireLimits(host);
        const response = await this.doRequest(url, headers)
          .finally(() => this.releaseLimits(host));
        return response;
      } catch (error) {
        lastError = error;
        const isLastAttempt = attempt === this.maxAttempts;
        this.logger.warn(`HTTP GET failed for ${url} attempt ${attempt}/${this.maxAttempts}: ${error.message}${isLastAttempt ? '' : ' - retrying'}`);
        if (!isLastAttempt) {
          await this.handleRetryDelay(attempt);
        }
      }
    }
    throw lastError;
  }

  private async acquireLimits(host: string): Promise<void> {
    await this.concurrency.acquire();
    await this.hostLimiter.acquireHost(host);
    await this.hostLimiter.takeToken(host);
  }

  private releaseLimits(host: string): void {
    this.hostLimiter.releaseHost(host);
    this.concurrency.release();
  }

  private async doRequest(url: string, headers: Record<string, string>): Promise<AxiosResponse<any>> {
    return axios.get(url, { timeout: 10000, headers });
  }

  private async handleRetryDelay(attempt: number): Promise<void> {
    const jitter = Math.floor(Math.random() * 100);
    const delay = this.baseDelayMs * Math.pow(2, attempt - 1) + jitter;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

