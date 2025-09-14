import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { UrlResult } from './interfaces/url-result.interface';

@Injectable()
export class UrlFetcherService {
  private readonly logger = new Logger(UrlFetcherService.name);
  private urlResults: UrlResult[] = [];

  async fetchUrls(urls: string[]): Promise<UrlResult[]> {
    this.logger.log(`Starting to fetch ${urls.length} URLs`);
    this.logger.debug(`URLs to fetch: ${JSON.stringify(urls)}`);
    
    const results: UrlResult[] = [];
    
    for (const url of urls) {
      this.logger.debug(`Processing URL: ${url}`);
      
      const result: UrlResult = {
        url,
        status: 'pending',
        timestamp: new Date(),
      };
      
      results.push(result);
      this.urlResults.push(result);
      
      try {
        const startTime = Date.now();
        this.logger.debug(`Making HTTP request to: ${url}`);
        
        const response = await axios.get(url, {
          timeout: 10000, // 10 second timeout
          headers: {
            'User-Agent': 'Guardz-URL-Fetcher/1.0',
          },
        });
        
        const responseTime = Date.now() - startTime;
        
        result.status = 'success';
        result.content = response.data;
        result.responseTime = responseTime;
        
        this.logger.log(`Successfully fetched ${url} in ${responseTime}ms`);
        this.logger.debug(`Response status: ${response.status}, Content length: ${JSON.stringify(response.data).length} chars`);
      } catch (error) {
        result.status = 'error';
        result.error = error.message;
        
        this.logger.error(`Failed to fetch ${url}: ${error.message}`);
        this.logger.debug(`Error details: ${JSON.stringify({
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText
        })}`);
      }
    }
    
    this.logger.debug(`Completed fetching ${urls.length} URLs. Results: ${JSON.stringify(results.map(r => ({ url: r.url, status: r.status })))}`);
    return results;
  }

  getAllResults(): UrlResult[] {
    return this.urlResults;
  }

  getResultsByStatus(status: 'pending' | 'success' | 'error'): UrlResult[] {
    return this.urlResults.filter(result => result.status === status);
  }

  clearResults(): void {
    this.urlResults = [];
    this.logger.log('Cleared all URL results');
  }
}
