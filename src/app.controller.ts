import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CRAWL_CONFIG } from './url-fetcher/core/crawl-config';

@ApiTags('root')
@Controller()
export class AppController {
  // With global prefix 'api', this handles GET /api
  @Get()
  getApiRoot() {
    return {
      message: 'Guardz URL Fetcher Service',
      docs: '/api/docs',
      endpoints: {
        status: '/api/urls/status',
        results: '/api/urls',
        submit: '/api/urls/fetch',
        config: '/api/config',
      },
    };
  }

  // Returns configuration details and brief descriptions
  @Get('config')
  @ApiOperation({ summary: 'Get service configuration and descriptions' })
  @ApiResponse({ status: 200, description: 'Current configuration values' })
  getConfig() {
    return {
      crawl: {
        maxDepth: CRAWL_CONFIG.MAX_DEPTH,
        maxPagesPerDepth: CRAWL_CONFIG.MAX_PAGES_PER_DEPTH,
        maxUrlsPerRequest: CRAWL_CONFIG.MAX_URLS_PER_REQUEST,
        jobConcurrency: CRAWL_CONFIG.JOB_CONCURRENCY,
        perDepthBatchSize: CRAWL_CONFIG.PER_DEPTH_BATCH_SIZE,
        notes: {
          maxDepth: 'How many link-hops to follow from each input URL (0 = just the input pages).',
          maxPagesPerDepth: 'Per page cap: at most this many discovered links are queued for the next depth.',
          maxUrlsPerRequest: 'How many root URLs the API accepts in a single request.',
          jobConcurrency: 'Within one crawl request, maximum number of pages fetched in parallel.',
          perDepthBatchSize: 'Within one depth layer, how many URLs can be processed at once.',
        },
      },
      admission: {
        maxActiveJobs: CRAWL_CONFIG.MAX_ACTIVE_JOBS,
        maxQueuedJobs: CRAWL_CONFIG.MAX_QUEUED_JOBS,
        notes: {
          maxActiveJobs: 'How many crawl requests the server processes at the same time.',
          maxQueuedJobs: 'How many additional crawl requests can wait in queue before the API returns 429.',
        },
      },
      concurrency: {
        maxConcurrency: CRAWL_CONFIG.MAX_CONCURRENCY,
        notes: {
          maxConcurrency: 'Global ceiling on in-flight HTTP requests across the whole server.',
        },
      },
      perHost: {
        perHostConcurrency: CRAWL_CONFIG.PER_HOST_CONCURRENCY,
        perHostRps: CRAWL_CONFIG.PER_HOST_RPS,
        perHostBurst: CRAWL_CONFIG.PER_HOST_BURST,
        notes: {
          perHostConcurrency: 'Max simultaneous requests to any single host.',
          perHostRps: 'Sustained requests-per-second limit to any single host.',
          perHostBurst: 'Short-term burst allowance per host (token bucket capacity).',
        },
      },
      http: {
        maxAttempts: CRAWL_CONFIG.HTTP_MAX_ATTEMPTS,
        baseDelayMs: CRAWL_CONFIG.HTTP_BASE_DELAY_MS,
        timeoutMs: 10000,
        notes: {
          maxAttempts: 'Maximum retry attempts for an HTTP GET to the same URL.',
          baseDelayMs: 'Initial backoff between retries; it doubles with each attempt.',
          timeoutMs: 'Per-request timeout for a single HTTP call.',
        },
      },
      cache: {
        ttlMs: CRAWL_CONFIG.CACHE_TTL_MS,
        maxItems: CRAWL_CONFIG.CACHE_MAX_ITEMS,
        notes: {
          ttlMs: 'How long cached fetch results are kept before expiring.',
          maxItems: 'Maximum number of cached URL entries held in memory.',
        },
      },
    };
  }
}


