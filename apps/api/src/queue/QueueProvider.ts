export interface QueueProvider {
  enqueue<T>(queueName: string, data: T, options?: any): Promise<void>;
  process<T>(queueName: string, handler: (data: T) => Promise<void>): void;
}
