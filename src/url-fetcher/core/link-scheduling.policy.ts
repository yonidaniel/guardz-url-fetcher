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
    for (const nextUrl of links) {
      if (!resultsMap.has(nextUrl)) {
        discoveredThisRun.add(nextUrl);
      }
      if (pushed >= this.perPageCap) break;
      if (!visited.has(nextUrl) && !globalDiscovered.has(nextUrl) && !resultsMap.has(nextUrl)) {
        globalDiscovered.add(nextUrl);
        queue.push({ url: nextUrl, depth: depth + 1 });
        pushed++;
      }
    }
  }
}


