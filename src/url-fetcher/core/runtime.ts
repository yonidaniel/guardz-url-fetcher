import os from 'os';

export function cpuCores(): number {
  try {
    return Math.max(1, os.cpus()?.length || 1);
  } catch {
    return 1;
  }
}

export function totalMemGb(): number {
  try {
    return (os.totalmem() || 0) / (1024 * 1024 * 1024);
  } catch {
    return 0;
  }
}

export function getIntEnv(name: string, computedDefault: number): number {
  const raw = process.env[name];
  const parsed = raw !== undefined ? Number(raw) : NaN;
  if (Number.isFinite(parsed)) return parsed as number;
  return computedDefault;
}

export function defaultMaxConcurrency(): number {
  const cores = cpuCores();
  return Math.max(4, Math.min(32, cores * 3));
}

export function defaultJobConcurrency(): number {
  return Math.max(1, Math.min(defaultMaxConcurrency(), Math.ceil(defaultMaxConcurrency() / 2)));
}

export function defaultPerDepthBatchSize(): number {
  return defaultJobConcurrency();
}

export function defaultPerHostConcurrency(): number {
  const cores = cpuCores();
  return Math.max(2, Math.min(4, Math.floor(cores / 2)));
}

export function defaultPerHostRps(): number {
  return cpuCores() <= 2 ? 1 : 2;
}

export function defaultPerHostBurst(): number {
  return 4;
}

export function defaultMaxActiveJobs(): number {
  return Math.max(2, Math.min(8, Math.floor(cpuCores() / 2)));
}

export function defaultMaxQueuedJobs(): number {
  return 20;
}

export function defaultCacheMaxItems(): number {
  return totalMemGb() >= 8 ? 30000 : 10000;
}


