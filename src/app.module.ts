import { Module } from '@nestjs/common';
import { UrlFetcherModule } from './url-fetcher/url-fetcher.module';
import { AppController } from './app.controller';

@Module({
  imports: [UrlFetcherModule],
  controllers: [AppController],
})
export class AppModule {}
