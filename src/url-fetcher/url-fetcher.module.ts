import { Module } from '@nestjs/common';
import { UrlFetcherController } from './core/url-fetcher.controller';
import { UrlFetcherService } from './core/url-fetcher.service';
import { LinkExtractorService } from './services/link-extractor.service';
import { CacheService } from './services/cache.service';
import { ConcurrencyService } from './services/concurrency.service';
import { HostLimiterService } from './services/host-limiter.service';
import { HttpClientService } from './services/http-client.service';
import { AdmissionControlService } from './services/admission-control.service';

@Module({
  controllers: [UrlFetcherController],
  providers: [
    UrlFetcherService,
    LinkExtractorService,
    CacheService,
    ConcurrencyService,
    HostLimiterService,
    HttpClientService,
    AdmissionControlService,
  ],
})
export class UrlFetcherModule {}
