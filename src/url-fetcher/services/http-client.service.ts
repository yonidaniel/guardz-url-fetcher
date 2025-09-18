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

  async get(url: string, headers: Record<string, string> = {}): Promise<AxiosResponse<any>> {
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
    const defaultHeaders: Record<string, string> = {
      // Modern desktop Chrome UA
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,he;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };
    const mergedHeaders = { ...defaultHeaders, ...headers };
    const response = await axios.get(url, { timeout: 15000, headers: mergedHeaders, maxRedirects: 5, decompress: true, validateStatus: () => true });
    const contentType = response.headers?.['content-type'];
    this.logger.debug(`HTTP ${response.status} ${response.statusText || ''} for ${url} content-type=${contentType || 'unknown'} len=${(response.data?.length ?? 'n/a')}`);
    if (response.status >= 400) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }
    return response;
  }

  private async handleRetryDelay(attempt: number): Promise<void> {
    const jitter = Math.floor(Math.random() * 100);
    const delay = this.baseDelayMs * Math.pow(2, attempt - 1) + jitter;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

