import { Injectable } from '@nestjs/common';
import { load as loadHtml } from 'cheerio';

@Injectable()
export class LinkExtractorService {
  extractSameDomainLinks(root: URL, html: string): string[] {
    const $ = loadHtml(html);
    const links: string[] = [];
    let totalLinks = 0;
    let filteredLinks = 0;
    let sameDomainLinks = 0;
    
    $('a[href]').each((_, el) => {
      try {
        const href = ($(el).attr('href') || '').trim();
        totalLinks++;
        
        if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('#')) {
          filteredLinks++;
          return;
        }
        
        const resolved = new URL(href, root.href);
        if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
          const rootHost = root.host;
          const candidateHost = resolved.host;
          const isSameHostOrSubdomain = candidateHost === rootHost || candidateHost.endsWith(`.${rootHost}`);
          if (isSameHostOrSubdomain) {
            resolved.hash = '';
            links.push(resolved.href);
            sameDomainLinks++;
          } else {
            filteredLinks++;
          }
        } else {
          filteredLinks++;
        }
      } catch (_) { 
        filteredLinks++;
        /* ignore invalid URLs */ 
      }
    });
    
    const uniqueLinks = Array.from(new Set(links));
    console.log(`[LinkExtractor] ${root.href}: total=${totalLinks}, filtered=${filteredLinks}, sameDomain=${sameDomainLinks}, unique=${uniqueLinks.length}`);
    
    return uniqueLinks;
  }

  countLinks(html: string): number {
    const $ = loadHtml(html);
    return $('a[href]').length;
  }
}


