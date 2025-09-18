import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CRAWL_CONFIG } from './url-fetcher/core/crawl-config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all routes
  app.enableCors();
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  // Enable DTO validation globally
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }));
  
  // Swagger setup at /api/docs
  const config = new DocumentBuilder()
    .setTitle('Guardz URL Fetcher Service')
    .setDescription('API for submitting URLs to fetch and viewing results')
    .setVersion('1.0')
    .addTag('urls')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 8080;
  await app.listen(port);
  
  console.log(`🚀 URL Fetcher Service is running on port ${port}`);
  console.log(`📡 API available at: http://localhost:${port}/api`);
  console.log(`📘 Swagger docs: http://localhost:${port}/api/docs`);

  // Pretty startup configuration summary
  const summaryLines = [
    '──────────────────────────────────────────────────────────────',
    'Service configuration:',
    `• Crawl: maxDepth=${CRAWL_CONFIG.MAX_DEPTH} [CRAWL_MAX_DEPTH] – number of link-hops to follow (0 = only inputs).`,
    `         maxPagesPerDepth=${CRAWL_CONFIG.MAX_PAGES_PER_DEPTH} [CRAWL_MAX_PAGES_PER_DEPTH] – per page cap for links queued to the next depth.`,
    `         maxUrlsPerRequest=${CRAWL_CONFIG.MAX_URLS_PER_REQUEST} [CRAWL_MAX_URLS_PER_REQUEST] – max root URLs accepted per API call.`,
    `         jobConcurrency=${CRAWL_CONFIG.JOB_CONCURRENCY} [CRAWL_JOB_CONCURRENCY] – in-flight page fetches per crawl job.`,
    `         perDepthBatchSize=${CRAWL_CONFIG.PER_DEPTH_BATCH_SIZE} [CRAWL_PER_DEPTH_BATCH_SIZE] – concurrent URLs processed within a depth layer.`,
    `• Admission: MAX_ACTIVE_JOBS=${CRAWL_CONFIG.MAX_ACTIVE_JOBS} [MAX_ACTIVE_JOBS] – crawl jobs processed simultaneously; MAX_QUEUED_JOBS=${CRAWL_CONFIG.MAX_QUEUED_JOBS} [MAX_QUEUED_JOBS] – queue size before 429.`,
    `• Concurrency: MAX_CONCURRENCY=${CRAWL_CONFIG.MAX_CONCURRENCY} [MAX_CONCURRENCY] – global cap on in-flight HTTP requests.`,
    `• Per-host: PER_HOST_CONCURRENCY=${CRAWL_CONFIG.PER_HOST_CONCURRENCY} [PER_HOST_CONCURRENCY] – per-host concurrency; PER_HOST_RPS=${CRAWL_CONFIG.PER_HOST_RPS} [PER_HOST_RPS] – sustained RPS; PER_HOST_BURST=${CRAWL_CONFIG.PER_HOST_BURST} [PER_HOST_BURST] – burst capacity.`,
    `• HTTP: HTTP_MAX_ATTEMPTS=${CRAWL_CONFIG.HTTP_MAX_ATTEMPTS} [HTTP_MAX_ATTEMPTS] – retries; HTTP_BASE_DELAY_MS=${CRAWL_CONFIG.HTTP_BASE_DELAY_MS} [HTTP_BASE_DELAY_MS] – base backoff; timeoutMs=10000 – per-request timeout.`,
    `• Cache: CACHE_TTL_MS=${CRAWL_CONFIG.CACHE_TTL_MS} [CACHE_TTL_MS] – entry TTL; CACHE_MAX_ITEMS=${CRAWL_CONFIG.CACHE_MAX_ITEMS} [CACHE_MAX_ITEMS] – max entries.`,
    `ℹ️  For full details with descriptions: GET /api/config`,
    '──────────────────────────────────────────────────────────────',
  ];
  for (const line of summaryLines) console.log(line);

  // Worst-case capacity and time estimate (single request, worst-case unique links)
  const roots = CRAWL_CONFIG.MAX_URLS_PER_REQUEST;
  const depth = CRAWL_CONFIG.MAX_DEPTH;
  const linksPerPage = CRAWL_CONFIG.MAX_PAGES_PER_DEPTH;
  const avgMs = Number(process.env.ESTIMATE_AVG_PAGE_MS || 1000);
  const effectiveConcurrency = Math.max(1, Math.min(
    CRAWL_CONFIG.JOB_CONCURRENCY,
    CRAWL_CONFIG.PER_DEPTH_BATCH_SIZE,
    CRAWL_CONFIG.MAX_CONCURRENCY,
  ));
  let worstCasePages = 0;
  for (let d = 0; d <= depth; d++) {
    worstCasePages += roots * Math.pow(linksPerPage, d);
  }
  const estSeconds = Math.ceil((worstCasePages * avgMs) / 1000 / effectiveConcurrency);
  const estMinutes = (estSeconds / 60).toFixed(1);
  console.log('Capacity estimate (single request, worst case, same-domain, no duplicates):');
  console.log(`• Max pages = ${worstCasePages} (roots=${roots}, depth=${depth}, linksPerPage=${linksPerPage})`);
  console.log(`• Estimated time ~ ${estSeconds}s (~${estMinutes}m) at avg ${avgMs}ms/page with effectiveConcurrency=${effectiveConcurrency}`);
}
bootstrap();
