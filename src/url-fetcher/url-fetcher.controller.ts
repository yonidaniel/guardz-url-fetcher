import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UrlFetcherService } from './url-fetcher.service';
import { FetchUrlsDto } from './dto/fetch-urls.dto';
import { UrlResult } from './interfaces/url-result.interface';

@Controller('urls')
export class UrlFetcherController {
  constructor(private readonly urlFetcherService: UrlFetcherService) {}

  @Post('fetch')
  @HttpCode(HttpStatus.OK)
  async fetchUrls(@Body() fetchUrlsDto: FetchUrlsDto): Promise<{ message: string; results: UrlResult[] }> {
    const results = await this.urlFetcherService.fetchUrls(fetchUrlsDto.urls);
    
    return {
      message: `Processing ${fetchUrlsDto.urls.length} URLs`,
      results,
    };
  }

  @Get()
  async getAllResults(): Promise<{ results: UrlResult[]; summary: any }> {
    const results = this.urlFetcherService.getAllResults();
    
    const summary = {
      total: results.length,
      pending: results.filter(r => r.status === 'pending').length,
      success: results.filter(r => r.status === 'success').length,
      error: results.filter(r => r.status === 'error').length,
    };
    
    return {
      results,
      summary,
    };
  }

  @Get('status')
  async getStatus(): Promise<{ status: string; timestamp: Date; summary: any }> {
    const results = this.urlFetcherService.getAllResults();
    
    const summary = {
      total: results.length,
      pending: results.filter(r => r.status === 'pending').length,
      success: results.filter(r => r.status === 'success').length,
      error: results.filter(r => r.status === 'error').length,
    };
    
    return {
      status: 'running',
      timestamp: new Date(),
      summary,
    };
  }
}
