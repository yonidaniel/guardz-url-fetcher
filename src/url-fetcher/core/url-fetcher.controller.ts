import { Controller, Post, Get, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UrlFetcherService } from './url-fetcher.service';
import { CRAWL_CONFIG, clampMaxLinksPerPage } from './crawl-config';
import { FetchUrlsDto } from '../dto/fetch-urls.dto';
import { UrlResult } from '../interfaces/url-result.interface';

@ApiTags('urls')
@Controller('urls')
export class UrlFetcherController {
  constructor(private readonly urlFetcherService: UrlFetcherService) {}

  @Post('fetch')
  @ApiOperation({ summary: 'Submit URLs to fetch' })
  @ApiBody({ schema: { properties: { urls: { type: 'array', items: { type: 'string' }, description: `Max ${CRAWL_CONFIG.MAX_URLS_PER_REQUEST} URLs per request` } , depth: { type: 'number', nullable: true, description: `Crawl depth (0-${CRAWL_CONFIG.MAX_DEPTH}, default 0)` }, maxLinksPerPage: { type: 'number', nullable: true, description: `Max links per page (server cap ${CRAWL_CONFIG.MAX_PAGES_PER_DEPTH})` } } } })
  @ApiResponse({ status: 200, description: 'Fetch started and results returned' })
  @HttpCode(HttpStatus.OK)
  async fetchUrls(@Body() fetchUrlsDto: FetchUrlsDto): Promise<{ message: string; limits: { maxDepth: number; maxPagesPerDepth: number; maxUrlsPerRequest: number }; pagesCrawled: number; depthCounts: Record<number, number>; totalUniqueLinksFound: number; totalLinksVisited: number; results: UrlResult[] }> {
    if (Array.isArray(fetchUrlsDto.urls) && fetchUrlsDto.urls.length > CRAWL_CONFIG.MAX_URLS_PER_REQUEST) {
      throw new BadRequestException(`Max number of URLs per request is ${CRAWL_CONFIG.MAX_URLS_PER_REQUEST}`);
    }
    const requestedDepth = typeof fetchUrlsDto.depth === 'number' ? fetchUrlsDto.depth : 0;
    if (requestedDepth > CRAWL_CONFIG.MAX_DEPTH) {
      throw new BadRequestException(`Max depth is ${CRAWL_CONFIG.MAX_DEPTH}`);
    }
    if (typeof fetchUrlsDto.maxLinksPerPage === 'number' && fetchUrlsDto.maxLinksPerPage > CRAWL_CONFIG.MAX_PAGES_PER_DEPTH) {
      throw new BadRequestException(`maxLinksPerPage exceeds server cap: ${CRAWL_CONFIG.MAX_PAGES_PER_DEPTH}`);
    }
    const maxLinksPerPage = clampMaxLinksPerPage(fetchUrlsDto.maxLinksPerPage);
    const { results, pagesCrawled, depthCounts, totalUniqueLinksFound, totalLinksVisited, limits } = await this.urlFetcherService.fetchUrls(fetchUrlsDto.urls, requestedDepth, maxLinksPerPage);
    
    return {
      message: `Processing ${fetchUrlsDto.urls.length} URLs with depth ${requestedDepth}`,
      limits: { ...limits, maxUrlsPerRequest: CRAWL_CONFIG.MAX_URLS_PER_REQUEST },
      pagesCrawled,
      depthCounts,
      results,
      totalUniqueLinksFound,
      totalLinksVisited,
    };
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get crawl limits and constraints (server-enforced)' })
  @ApiResponse({ status: 200, description: 'Static limits for the crawling service' })
  async getLimits(): Promise<{ limits: { maxDepth: number; maxPagesPerDepth: number; maxUrlsPerRequest: number } }> {
    return {
      limits: {
        maxDepth: CRAWL_CONFIG.MAX_DEPTH,
        maxPagesPerDepth: CRAWL_CONFIG.MAX_PAGES_PER_DEPTH,
        maxUrlsPerRequest: CRAWL_CONFIG.MAX_URLS_PER_REQUEST,
      },
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
  async getStatus(): Promise<{ status: string; timestamp: Date; summary: any; depthCounts: Record<number, number> }> {
    const results = this.urlFetcherService.getAllResults();
    
    const summary = {
      total: results.length,
      pending: results.filter(r => r.status === 'pending').length,
      success: results.filter(r => r.status === 'success').length,
      error: results.filter(r => r.status === 'error').length,
    };
    const depthCounts: Record<number, number> = {} as any;
    for (const r of results) {
      const d = (r as any).depth ?? 0;
      depthCounts[d] = (depthCounts[d] || 0) + 1;
    }
    
    return {
      status: 'running',
      timestamp: new Date(),
      summary,
      depthCounts,
    };
  }
}


