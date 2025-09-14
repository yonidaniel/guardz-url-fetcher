import { Module } from '@nestjs/common';
import { UrlFetcherController } from './url-fetcher.controller';
import { UrlFetcherService } from './url-fetcher.service';

@Module({
  controllers: [UrlFetcherController],
  providers: [UrlFetcherService],
})
export class UrlFetcherModule {}
