import { Injectable, Logger } from '@nestjs/common';
import { UrlResult } from '../interfaces/url-result.interface';
import { LinkExtractorService } from '../services/link-extractor.service';
import { CacheService } from '../services/cache.service';
import { HttpClientService } from '../services/http-client.service';
import { AdmissionControlService } from '../services/admission-control.service';
import { CRAWL_CONFIG } from './crawl-config';
import { LinkSchedulingPolicy } from './link-scheduling.policy';

@Injectable()
export class UrlFetcherService {
  private readonly logger = new Logger(UrlFetcherService.name);
  private urlResultsByUrl: Map<string, UrlResult> = new Map();
  private discoveredLinksByHost: Map<string, Set<string>> = new Map();
  private inflightRequests: Map<string, Promise<UrlResult>> = new Map();

  constructor(
    private readonly linkExtractor: LinkExtractorService,
    private readonly cache: CacheService,
    private readonly httpClient: HttpClientService,
    private readonly admission: AdmissionControlService,
  ) {}

  async fetchUrls(urls: string[], maxDepth: number = 0, maxLinksPerPage: number = CRAWL_CONFIG.MAX_PAGES_PER_DEPTH): Promise<{ results: UrlResult[]; pagesCrawled: number; depthCounts: Record<number, number>; totalUniqueLinksFound: number; totalLinksVisited: number; limits: { maxDepth: number; maxPagesPerDepth: number } }> {
    await this.admission.acquireJobSlot();
    const jobStartMs = Date.now();
    this.logger.log(`Starting to fetch ${urls.length} URLs`);
    this.logger.debug(`URLs to fetch: ${JSON.stringify(urls)}, maxDepth=${maxDepth}, maxLinksPerPage=${maxLinksPerPage}`);
    // Theoretical capacity log (upper bound assuming each page yields 'maxLinksPerPage' new same-domain links, no duplicates)
    try {
      const roots = Math.max(0, Array.isArray(urls) ? urls.length : 0);
      const capPerDepth: number[] = [];
      let runningTotal = 0;
      for (let d = 0; d <= maxDepth; d++) {
        const cap = roots * (d === 0 ? 1 : Math.pow(maxLinksPerPage, d));
        capPerDepth.push(cap);
        runningTotal += cap;
      }
      const perDepthStr = capPerDepth.map((v, i) => `d${i}=${v}`).join(', ');
      this.logger.log(
        `Theoretical capacity (upper bound): roots=${roots}, maxDepth=${maxDepth}, perPageCap=${maxLinksPerPage} → ${perDepthStr}; total=${runningTotal}`
      );
    } catch {}
    
    const MAX_PAGES_PER_DEPTH = maxLinksPerPage; // server-enforced per depth cap
    const resultsMap = new Map<string, UrlResult>();
    const seenInRequest = new Set<string>();
    let pagesCrawled = 0;
    const pagesCrawledPerDepth: Map<number, number> = new Map();
    const discoveredThisRun: Set<string> = new Set();
    
    for (const rootUrl of urls) {
      this.logger.debug(`Processing URL: ${rootUrl}`);
      if (seenInRequest.has(rootUrl)) {
        this.logger.debug(`Duplicate URL in request detected and skipped: ${rootUrl}`);
        continue;
      }
      seenInRequest.add(rootUrl);

      try {
        const { root, queue, visited, globalDiscovered } = this.buildCrawlContext(rootUrl);

        while (queue.length > 0) {
          const batch = this.dequeueDepthBatch(queue, CRAWL_CONFIG.PER_DEPTH_BATCH_SIZE);
          for (let i = 0; i < batch.length; i += CRAWL_CONFIG.JOB_CONCURRENCY) {
            const slice = batch.slice(i, i + CRAWL_CONFIG.JOB_CONCURRENCY);
            await Promise.all(slice.map(async ({ url, depth }) => {
              if (!url || visited.has(url)) return;
              visited.add(url);

              if (this.shouldSkipUrl(url)) return;
              this.markPending(url, depth);

              const result = await this.handleFetch(url, depth, resultsMap, pagesCrawledPerDepth);
              pagesCrawled++;

              this.enqueueNextLinks(root, result, depth, maxDepth, MAX_PAGES_PER_DEPTH, visited, globalDiscovered, queue, discoveredThisRun);
            }));
          }
        }
      } catch (e) {
        this.logger.warn(`Skipping crawl for invalid URL: ${rootUrl} - ${e.message}`);
        const invalid: UrlResult = { url: rootUrl, status: 'error', timestamp: new Date(), error: 'Invalid URL', depth: 0 };
        const orderedInvalid = this.formatResult(invalid);
        resultsMap.set(rootUrl, orderedInvalid);
        this.urlResultsByUrl.set(rootUrl, orderedInvalid);
      }
    }
    
    const results = Array.from(resultsMap.values());
    const elapsedMs = Date.now() - jobStartMs;
    this.logger.debug(`Completed processing in ${elapsedMs}ms (~${(elapsedMs/1000).toFixed(1)}s). Results: ${JSON.stringify(results.map(r => ({ url: r.url, status: r.status })))}`);
    const depthCounts: Record<number, number> = {} as any;
    for (const [depth, count] of pagesCrawledPerDepth.entries()) {
      depthCounts[depth] = count;
    }
    
    // Analysis of why we didn't reach theoretical maximum
    this.logger.log(`=== DEPTH ANALYSIS ===`);
    for (let d = 0; d <= maxDepth; d++) {
      const actual = pagesCrawledPerDepth.get(d) || 0;
      const theoretical = urls.length * (d === 0 ? 1 : Math.pow(MAX_PAGES_PER_DEPTH, d));
      const efficiency = theoretical > 0 ? ((actual / theoretical) * 100).toFixed(1) : '0';
      this.logger.log(`Depth ${d}: actual=${actual}, theoretical=${theoretical}, efficiency=${efficiency}%`);
      
      if (actual < theoretical && d > 0) {
        this.logger.log(`  → Why depth ${d} is below max:`);
        this.logger.log(`    • Previous depth had ${pagesCrawledPerDepth.get(d-1) || 0} pages (need ${theoretical/MAX_PAGES_PER_DEPTH} for full capacity)`);
        this.logger.log(`    • Each page can yield max ${MAX_PAGES_PER_DEPTH} links`);
        this.logger.log(`    • Many pages may not have enough same-domain links`);
        this.logger.log(`    • Some links may be duplicates or filtered out`);
      }
    }
    this.logger.log(`=== END DEPTH ANALYSIS ===`);
    
    this.admission.releaseJobSlot();
    return { results, pagesCrawled, depthCounts, totalUniqueLinksFound: discoveredThisRun.size, totalLinksVisited: pagesCrawled, limits: { maxDepth: CRAWL_CONFIG.MAX_DEPTH, maxPagesPerDepth: MAX_PAGES_PER_DEPTH } };
  }

  private buildCrawlContext(rootUrl: string): { root: URL; queue: Array<{ url: string; depth: number }>; visited: Set<string>; globalDiscovered: Set<string> } {
    const root = new URL(rootUrl);
    const rootHost = root.host;
    const queue: Array<{ url: string; depth: number }>= [{ url: root.href, depth: 0 }];
    const visited = new Set<string>();
    if (!this.discoveredLinksByHost.has(rootHost)) {
      this.discoveredLinksByHost.set(rootHost, new Set<string>());
    }
    const globalDiscovered = this.discoveredLinksByHost.get(rootHost)!;
    return { root, queue, visited, globalDiscovered };
  }

  private dequeueDepthBatch(queue: Array<{ url: string; depth: number }>, batchSize: number): Array<{ url: string; depth: number }> {
    const batch: Array<{ url: string; depth: number }> = [];
    if (queue.length === 0) return batch;
    const currentDepth = queue[0].depth;
    while (queue.length > 0 && queue[0].depth === currentDepth && batch.length < batchSize) {
      const item = queue.shift();
      if (!item) break;
      batch.push(item);
    }
    return batch;
  }

  private shouldSkipUrl(url: string): boolean {
    const existing = this.urlResultsByUrl.get(url);
    const knownInResults = !!existing && existing.status === 'success';
    const cached = this.cache.get(url);
    if (knownInResults || (cached && cached.status === 'success')) {
      this.logger.debug(`Known page skipped (not counted): ${url}`);
      return true;
    }
    return false;
  }

  private markPending(url: string, depth: number): void {
    const pending: UrlResult = { url, status: 'pending', timestamp: new Date(), depth } as UrlResult;
    this.urlResultsByUrl.set(url, pending);
  }

  private async handleFetch(url: string, depth: number, resultsMap: Map<string, UrlResult>, pagesCrawledPerDepth: Map<number, number>): Promise<UrlResult> {
    const result = await this.fetchSingle(url);
    const ordered = this.formatResult(result);
    ordered.depth = depth;
    resultsMap.set(url, ordered);
    this.urlResultsByUrl.set(url, ordered);
    pagesCrawledPerDepth.set(depth, (pagesCrawledPerDepth.get(depth) || 0) + 1);
    return ordered;
  }

  private enqueueNextLinks(root: URL, result: UrlResult, depth: number, maxDepth: number, perPageCap: number, visited: Set<string>, globalDiscovered: Set<string>, queue: Array<{ url: string; depth: number }>, discoveredThisRun: Set<string>): void {
    if (result.status !== 'success' || depth >= maxDepth) return;
    const content = result.content;
    if (typeof content !== 'string') return;
    if (!(result.contentType || '').includes('text/html') && !content.includes('<a')) return;
    const links = this.linkExtractor.extractSameDomainLinks(root, content);
    const policy = new LinkSchedulingPolicy(perPageCap);
    policy.scheduleNextLinks(links, depth, visited, globalDiscovered, this.urlResultsByUrl, queue, discoveredThisRun);
  }

  getAllResults(): UrlResult[] {
    return Array.from(this.urlResultsByUrl.values());
  }

  getResultsByStatus(status: 'pending' | 'success' | 'error'): UrlResult[] {
    return Array.from(this.urlResultsByUrl.values()).filter(result => result.status === status);
  }

  clearResults(): void {
    this.urlResultsByUrl.clear();
    this.cache.clear();
    this.logger.log('Cleared all URL results');
  }

  private async fetchSingle(url: string): Promise<UrlResult> {
    const cachedVal = this.cache.get(url);
    if (cachedVal && cachedVal.status === 'success') {
      const cachedServed: UrlResult = { ...cachedVal, timestamp: new Date() };
      const orderedCached = this.formatResult(cachedServed);
      this.logger.log(`Cache hit for ${url}. Returning cached successful response.`);
      return orderedCached;
    }

    const inflight = this.inflightRequests.get(url);
    if (inflight) {
      this.logger.debug(`Coalescing in-flight request for ${url}`);
      return inflight;
    }

    const result: UrlResult = { url, status: 'pending', timestamp: new Date() };
    const maxAttempts = 3;
    const baseDelayMs = 500;
    let lastError: any = null;

    const task = (async () => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const startTime = Date.now();
          this.logger.debug(`Making HTTP request to: ${url} (attempt ${attempt}/${maxAttempts})`);
          const response = await this.httpClient.get(url, { 'User-Agent': 'Guardz-URL-Fetcher/1.0' });
          const responseTime = Date.now() - startTime;
          result.status = 'success';
          result.content = response.data;
          result.responseTime = responseTime;
          result.contentType = response.headers?.['content-type'];
          if ((result.contentType || '').includes('text/html') && typeof result.content === 'string') {
            result.linkCount = this.linkExtractor.countLinks(result.content);
          }
          const ordered = this.formatResult(result);
          this.cache.set(url, ordered);
          this.logger.log(`Successfully fetched ${url} in ${responseTime}ms (attempt ${attempt})`);
          return { ...ordered };
        } catch (error) {
          lastError = error;
          const isLastAttempt = attempt === maxAttempts;
          this.logger.warn(`Attempt ${attempt} failed for ${url}: ${error.message}${isLastAttempt ? '' : ' - will retry'}`);
          this.logger.debug(`Error details: ${JSON.stringify({
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText
          })}`);
          if (!isLastAttempt) {
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      result.status = 'error';
      result.error = lastError?.message || 'Unknown error';
      const orderedFinal = this.formatResult(result);
      this.cache.set(url, orderedFinal);
      return orderedFinal;
    })();

    this.inflightRequests.set(url, task);
    try {
      return await task;
    } finally {
      this.inflightRequests.delete(url);
    }
  }

  private formatResult(result: UrlResult): UrlResult {
    const ordered: UrlResult = {
      url: result.url,
      status: result.status,
      timestamp: result.timestamp,
      responseTime: result.responseTime,
      contentType: result.contentType,
      linkCount: result.linkCount,
      content: result.content,
      error: result.error,
      depth: result.depth,
    };
    return ordered;
  }
}


