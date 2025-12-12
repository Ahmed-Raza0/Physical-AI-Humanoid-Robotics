/**
 * Core types for the intelligent tasks system
 */

export interface TaskContext {
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  cache?: Map<string, any>;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff?: boolean;
}

export interface TaskResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  duration: number;
  timestamp: Date;
  retries?: number;
}

export interface Task<TInput = any, TOutput = any> {
  name: string;
  description: string;
  execute: (input: TInput, context?: TaskContext) => Promise<TOutput>;
  validate?: (input: TInput) => boolean | Promise<boolean>;
  retry?: RetryConfig;
  timeout?: number; // in milliseconds
}

export interface TaskChain {
  tasks: Task[];
  mode: 'sequential' | 'parallel';
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TaskExecution {
  taskName: string;
  status: TaskStatus;
  startTime?: Date;
  endTime?: Date;
  error?: Error;
}
