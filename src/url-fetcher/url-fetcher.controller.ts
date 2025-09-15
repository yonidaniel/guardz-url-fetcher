import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UrlFetcherService } from './url-fetcher.service';
import { FetchUrlsDto } from './dto/fetch-urls.dto';
import { UrlResult } from './interfaces/url-result.interface';

@ApiTags('urls')
@Controller('urls')
export class UrlFetcherController {
  constructor(private readonly urlFetcherService: UrlFetcherService) {}

  @Post('fetch')
  @ApiOperation({ summary: 'Submit URLs to fetch' })
  @ApiBody({ schema: { properties: { urls: { type: 'array', items: { type: 'string' } } } } })
  @ApiResponse({ status: 200, description: 'Fetch started and results returned' })
  @HttpCode(HttpStatus.OK)
  async fetchUrls(@Body() fetchUrlsDto: FetchUrlsDto): Promise<{ message: string; results: UrlResult[] }> {
    const results = await this.urlFetcherService.fetchUrls(fetchUrlsDto.urls);
    
    return {
      message: `Processing ${fetchUrlsDto.urls.length} URLs`,
      results,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all fetched URL results' })
  @ApiResponse({ status: 200, description: 'List of results with summary' })
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
  @ApiOperation({ summary: 'Service status and results summary' })
  @ApiResponse({ status: 200, description: 'Service is running' })
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
