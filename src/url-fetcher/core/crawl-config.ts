import {
  defaultJobConcurrency,
  defaultMaxConcurrency,
  defaultPerDepthBatchSize,
  defaultPerHostBurst,
  defaultPerHostConcurrency,
  defaultPerHostRps,
  defaultMaxActiveJobs,
  defaultMaxQueuedJobs,
  defaultCacheMaxItems,
  getIntEnv,
} from './runtime';

export const CRAWL_CONFIG = {
  MAX_DEPTH: getIntEnv('CRAWL_MAX_DEPTH', 3),
  MAX_PAGES_PER_DEPTH: getIntEnv('CRAWL_MAX_PAGES_PER_DEPTH', 5),
  MAX_URLS_PER_REQUEST: getIntEnv('CRAWL_MAX_URLS_PER_REQUEST', 5),
  JOB_CONCURRENCY: getIntEnv('CRAWL_JOB_CONCURRENCY', defaultJobConcurrency()),
  //JOB_CONCURRENCY: getIntEnv('CRAWL_JOB_CONCURRENCY', 1),
  PER_DEPTH_BATCH_SIZE: getIntEnv('CRAWL_PER_DEPTH_BATCH_SIZE', defaultPerDepthBatchSize()),
  //PER_DEPTH_BATCH_SIZE: getIntEnv('CRAWL_PER_DEPTH_BATCH_SIZE', 1),
  // Note: below defaults are read directly elsewhere via process.env; exposed here for discovery/logs
  MAX_CONCURRENCY: getIntEnv('MAX_CONCURRENCY', defaultMaxConcurrency()),
  PER_HOST_CONCURRENCY: getIntEnv('PER_HOST_CONCURRENCY', defaultPerHostConcurrency()),
  PER_HOST_RPS: getIntEnv('PER_HOST_RPS', defaultPerHostRps()),
  PER_HOST_BURST: getIntEnv('PER_HOST_BURST', defaultPerHostBurst()),
  MAX_ACTIVE_JOBS: getIntEnv('MAX_ACTIVE_JOBS', defaultMaxActiveJobs()),
  MAX_QUEUED_JOBS: getIntEnv('MAX_QUEUED_JOBS', defaultMaxQueuedJobs()),
  CACHE_MAX_ITEMS: getIntEnv('CACHE_MAX_ITEMS', defaultCacheMaxItems()),
  CACHE_TTL_MS: getIntEnv('CACHE_TTL_MS', 10 * 60 * 1000),
  HTTP_MAX_ATTEMPTS: getIntEnv('HTTP_MAX_ATTEMPTS', 3),
  HTTP_BASE_DELAY_MS: getIntEnv('HTTP_BASE_DELAY_MS', 500),
};

export function clampMaxLinksPerPage(requested?: number): number {
  const serverCap = CRAWL_CONFIG.MAX_PAGES_PER_DEPTH;
  if (typeof requested !== 'number' || Number.isNaN(requested)) {
    return serverCap;
  }
  const normalized = Math.max(1, Math.floor(requested));
  return Math.min(serverCap, normalized);
}


