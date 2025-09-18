import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CRAWL_CONFIG } from '../core/crawl-config';

@Injectable()
export class AdmissionControlService {
  private maxActiveJobs: number = CRAWL_CONFIG.MAX_ACTIVE_JOBS;
  private maxQueuedJobs: number = CRAWL_CONFIG.MAX_QUEUED_JOBS;
  private activeJobs: number = 0;
  private jobWaitQueue: Array<() => void> = [];

  async acquireJobSlot(): Promise<void> {
    if (this.activeJobs < this.maxActiveJobs) {
      this.activeJobs++;
      return;
    }
    if (this.jobWaitQueue.length >= this.maxQueuedJobs) {
      throw new HttpException('Service busy. Please retry later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    await new Promise<void>(resolve => this.jobWaitQueue.push(resolve));
    this.activeJobs++;
  }

  releaseJobSlot(): void {
    this.activeJobs = Math.max(0, this.activeJobs - 1);
    const next = this.jobWaitQueue.shift();
    if (next) next();
  }
}


