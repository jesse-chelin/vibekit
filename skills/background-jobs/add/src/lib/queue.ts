import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export function createQueue(name: string) {
  return new Queue(name, { connection });
}

export function createWorker<T>(
  name: string,
  processor: (job: Job<T>) => Promise<void>,
  options?: { concurrency?: number }
) {
  return new Worker<T>(name, processor, {
    connection,
    concurrency: options?.concurrency ?? 1,
  });
}

export { Queue, Worker, type Job };
