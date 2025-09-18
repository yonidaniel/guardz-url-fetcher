import { Injectable } from '@nestjs/common';
import { load as loadHtml } from 'cheerio';

@Injectable()
export class LinkExtractorService {
  extractSameDomainLinks(root: URL, html: string): string[] {
    const $ = loadHtml(html);
    const links: string[] = [];
    $('a[href]').each((_, el) => {
      try {
        const href = ($(el).attr('href') || '').trim();
        if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('#')) return;
        const resolved = new URL(href, root.href);
        if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
          if (resolved.host === root.host) {
            resolved.hash = '';
            links.push(resolved.href);
          }
        }
      } catch (_) { /* ignore invalid URLs */ }
    });
    return Array.from(new Set(links));
  }

  countLinks(html: string): number {
    const $ = loadHtml(html);
    return $('a[href]').length;
  }
}


