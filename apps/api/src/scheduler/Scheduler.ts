export interface Scheduler {
  scheduleJob(cronExpression: string, job: () => Promise<void>): void;
  start(): void;
  stop(): void;
}
