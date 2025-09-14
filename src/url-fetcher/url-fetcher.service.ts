import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { UrlResult } from './interfaces/url-result.interface';

@Injectable()
export class UrlFetcherService {
  private readonly logger = new Logger(UrlFetcherService.name);
  private urlResults: UrlResult[] = [];

  async fetchUrls(urls: string[]): Promise<UrlResult[]> {
    this.logger.log(`Starting to fetch ${urls.length} URLs`);
    
    const results: UrlResult[] = [];
    
    for (const url of urls) {
      const result: UrlResult = {
        url,
        status: 'pending',
        timestamp: new Date(),
      };
      
      results.push(result);
      this.urlResults.push(result);
      
      try {
        const startTime = Date.now();
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
      } catch (error) {
        result.status = 'error';
        result.error = error.message;
        
        this.logger.error(`Failed to fetch ${url}: ${error.message}`);
      }
    }
    
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
