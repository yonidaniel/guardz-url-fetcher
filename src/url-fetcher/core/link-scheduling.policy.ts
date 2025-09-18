import { getIntEnv } from './runtime';

export class LinkSchedulingPolicy {
  constructor(private readonly perPageCap: number) {}

  scheduleNextLinks(
    links: string[],
    depth: number,
    visited: Set<string>,
    globalDiscovered: Set<string>,
    resultsMap: Map<string, any>,
    queue: Array<{ url: string; depth: number }>,
    discoveredThisRun: Set<string>,
  ): void {
    let pushed = 0;
    let skippedVisited = 0;
    let skippedDiscovered = 0;
    let skippedResults = 0;
    const pushedSamples: string[] = [];
    const skippedSamples: Array<{ url: string; reason: string }> = [];
    const maxSamples = getIntEnv('LOG_SCHEDULER_SAMPLE_LIMIT', 10);
    
    console.log(`[LinkScheduling] depth=${depth}, links=${links.length}, perPageCap=${this.perPageCap}`);
    
    for (const nextUrl of links) {
      if (!resultsMap.has(nextUrl)) {
        discoveredThisRun.add(nextUrl);
      }
      if (pushed >= this.perPageCap) {
        console.log(`[LinkScheduling] Reached perPageCap=${this.perPageCap}, stopping`);
        break;
      }
      if (!visited.has(nextUrl) && !globalDiscovered.has(nextUrl) && !resultsMap.has(nextUrl)) {
        globalDiscovered.add(nextUrl);
        queue.push({ url: nextUrl, depth: depth + 1 });
        pushed++;
        if (pushedSamples.length < maxSamples) pushedSamples.push(nextUrl);
      } else {
        if (visited.has(nextUrl)) {
          skippedVisited++;
          if (skippedSamples.length < maxSamples) skippedSamples.push({ url: nextUrl, reason: 'visited' });
        }
        if (globalDiscovered.has(nextUrl)) {
          skippedDiscovered++;
          if (skippedSamples.length < maxSamples) skippedSamples.push({ url: nextUrl, reason: 'already_discovered' });
        }
        if (resultsMap.has(nextUrl)) {
          skippedResults++;
          if (skippedSamples.length < maxSamples) skippedSamples.push({ url: nextUrl, reason: 'in_results' });
        }
      }
    }
    
    console.log(`[LinkScheduling] depth=${depth}: pushed=${pushed}, skippedVisited=${skippedVisited}, skippedDiscovered=${skippedDiscovered}, skippedResults=${skippedResults}`);
    if (pushedSamples.length > 0) {
      console.log(`[LinkScheduling] depth=${depth}: pushedSamples[${pushedSamples.length}]=${JSON.stringify(pushedSamples)}`);
    }
    if (skippedSamples.length > 0) {
      console.log(`[LinkScheduling] depth=${depth}: skippedSamples[${skippedSamples.length}]=${JSON.stringify(skippedSamples)}`);
    }
  }
}


