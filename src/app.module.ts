import { Module } from '@nestjs/common';
import { UrlFetcherModule } from './url-fetcher/url-fetcher.module';

@Module({
  imports: [UrlFetcherModule],
})
export class AppModule {}
