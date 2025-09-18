import { IsArray, ArrayMinSize, ArrayMaxSize, IsOptional, IsInt, Min, Max, IsUrl, ValidateIf } from 'class-validator';
import { CRAWL_CONFIG } from '../core/crawl-config';

export class FetchUrlsDto {
  @IsArray({ message: 'urls must be an array of URLs' })
  @ArrayMinSize(1, { message: 'urls must contain at least 1 URL' })
  @ArrayMaxSize(CRAWL_CONFIG.MAX_URLS_PER_REQUEST, { message: `urls cannot exceed ${CRAWL_CONFIG.MAX_URLS_PER_REQUEST} items` })
  @ValidateIf((o) => Array.isArray(o.urls))
  // class-validator lacks built-in array-of-urls; validate elements via custom check in controller if needed
  urls: string[];

  @IsOptional()
  @IsInt({ message: 'depth must be an integer' })
  @Min(0, { message: 'depth cannot be negative' })
  @Max(CRAWL_CONFIG.MAX_DEPTH, { message: `depth cannot exceed ${CRAWL_CONFIG.MAX_DEPTH}` })
  depth?: number; // optional crawl depth, defaults to 0

  @IsOptional()
  @IsInt({ message: 'maxLinksPerPage must be an integer' })
  @Min(1, { message: 'maxLinksPerPage must be at least 1' })
  maxLinksPerPage?: number; // optional, capped by server
}
