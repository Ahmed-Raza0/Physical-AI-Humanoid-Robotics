/**
 * Tests for TaskRunner
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskRunner } from './TaskRunner';
import type { Task, TaskContext } from './types';

describe('TaskRunner', () => {
  let runner: TaskRunner;

  beforeEach(() => {
    runner = new TaskRunner();
  });

  describe('executeTask', () => {
    it('should execute a simple task successfully', async () => {
      const task: Task<number, number> = {
        name: 'double',
        description: 'Double the input',
        execute: async (input) => input * 2,
      };

      const result = await runner.executeTask(task, 5);

      expect(result.success).toBe(true);
      expect(result.data).toBe(10);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should handle task failures', async () => {
      const task: Task<number, number> = {
        name: 'failing-task',
        description: 'Task that always fails',
        execute: async () => {
          throw new Error('Task failed');
        },
      };

      const result = await runner.executeTask(task, 5);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Task failed');
    });

    it('should validate input before execution', async () => {
      const task: Task<number, number> = {
        name: 'positive-only',
        description: 'Only accepts positive numbers',
        validate: (input) => input > 0,
        execute: async (input) => input * 2,
      };

      const result = await runner.executeTask(task, -5);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Validation failed');
    });

    it('should pass context to task execution', async () => {
      const task: Task<number, number> = {
        name: 'context-task',
        description: 'Uses context',
        execute: async (input, context) => {
          return input + (context?.metadata?.offset || 0);
        },
      };

      const context: TaskContext = {
        metadata: { offset: 10 },
      };

      const result = await runner.executeTask(task, 5, context);

      expect(result.success).toBe(true);
      expect(result.data).toBe(15);
    });

    it('should cache successful results', async () => {
      const executeFn = vi.fn(async (input: number) => input * 2);
      const task: Task<number, number> = {
        name: 'cached-task',
        description: 'Task with caching',
        execute: executeFn,
      };

      // First execution
      const result1 = await runner.executeTask(task, 5);
      expect(result1.success).toBe(true);
      expect(result1.data).toBe(10);
      expect(executeFn).toHaveBeenCalledTimes(1);

      // Second execution with same input (should use cache)
      const result2 = await runner.executeTask(task, 5);
      expect(result2.success).toBe(true);
      expect(result2.data).toBe(10);
      expect(executeFn).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should not cache failed results', async () => {
      let callCount = 0;
      const task: Task<number, number> = {
        name: 'sometimes-fails',
        description: 'Fails first, succeeds second',
        execute: async (input) => {
          callCount++;
          if (callCount === 1) {
            throw new Error('First call fails');
          }
          return input * 2;
        },
      };

      // First execution (fails)
      const result1 = await runner.executeTask(task, 5);
      expect(result1.success).toBe(false);

      // Second execution (succeeds)
      const result2 = await runner.executeTask(task, 5);
      expect(result2.success).toBe(true);
      expect(result2.data).toBe(10);
      expect(callCount).toBe(2);
    });
  });

  describe('retry logic', () => {
    it('should retry failed tasks according to retry config', async () => {
      let attemptCount = 0;
      const task: Task<number, number> = {
        name: 'retry-task',
        description: 'Fails twice, succeeds on third attempt',
        execute: async (input) => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error(`Attempt ${attemptCount} failed`);
          }
          return input * 2;
        },
        retry: {
          maxRetries: 3,
          retryDelay: 10,
          exponentialBackoff: false,
        },
      };

      const result = await runner.executeTask(task, 5);

      expect(result.success).toBe(true);
      expect(result.data).toBe(10);
      expect(result.retries).toBe(2); // Failed twice, succeeded on 3rd attempt
      expect(attemptCount).toBe(3);
    });

    it('should give up after max retries', async () => {
      const task: Task<number, number> = {
        name: 'always-fails',
        description: 'Always fails',
        execute: async () => {
          throw new Error('Always fails');
        },
        retry: {
          maxRetries: 2,
          retryDelay: 10,
        },
      };

      const result = await runner.executeTask(task, 5);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Always fails');
    });

    it('should apply exponential backoff when configured', async () => {
      const delays: number[] = [];
      let attemptCount = 0;
      const task: Task<number, number> = {
        name: 'backoff-task',
        description: 'Tests exponential backoff',
        execute: async () => {
          attemptCount++;
          const now = Date.now();
          if (delays.length > 0) {
            const delay = now - delays[delays.length - 1];
            delays.push(delay);
          } else {
            delays.push(now);
          }

          if (attemptCount < 3) {
            throw new Error('Retry');
          }
          return 42;
        },
        retry: {
          maxRetries: 3,
          retryDelay: 50,
          exponentialBackoff: true,
        },
      };

      const result = await runner.executeTask(task, 5);

      expect(result.success).toBe(true);
      // Check that delays increase exponentially
      if (delays.length >= 2) {
        expect(delays[1]).toBeGreaterThanOrEqual(50); // First retry: 50ms
        expect(delays[2]).toBeGreaterThanOrEqual(100); // Second retry: 100ms
      }
    });
  });

  describe('timeout', () => {
    it('should timeout long-running tasks', async () => {
      const task: Task<number, number> = {
        name: 'slow-task',
        description: 'Takes too long',
        execute: async (input) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return input * 2;
        },
        timeout: 100, // 100ms timeout
      };

      const result = await runner.executeTask(task, 5);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('timeout');
    });

    it('should complete fast tasks within timeout', async () => {
      const task: Task<number, number> = {
        name: 'fast-task',
        description: 'Completes quickly',
        execute: async (input) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return input * 2;
        },
        timeout: 1000, // 1 second timeout
      };

      const result = await runner.executeTask(task, 5);

      expect(result.success).toBe(true);
      expect(result.data).toBe(10);
    });
  });

  describe('executeSequential', () => {
    it('should execute tasks in sequence', async () => {
      const executionOrder: number[] = [];

      const task1: Task<number, number> = {
        name: 'task1',
        description: 'First task',
        execute: async (input) => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          executionOrder.push(1);
          return input + 1;
        },
      };

      const task2: Task<number, number> = {
        name: 'task2',
        description: 'Second task',
        execute: async (input) => {
          await new Promise((resolve) => setTimeout(resolve, 20));
          executionOrder.push(2);
          return input + 1;
        },
      };

      const results = await runner.executeSequential([task1, task2], [1, 2]);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].data).toBe(2);
      expect(results[1].success).toBe(true);
      expect(results[1].data).toBe(3);
      expect(executionOrder).toEqual([1, 2]); // Must execute in order
    });

    it('should stop on first failure', async () => {
      const task1: Task<number, number> = {
        name: 'task1',
        description: 'First task (fails)',
        execute: async () => {
          throw new Error('Task 1 failed');
        },
      };

      const task2: Task<number, number> = {
        name: 'task2',
        description: 'Second task',
        execute: async (input) => input + 1,
      };

      const results = await runner.executeSequential([task1, task2], [1, 2]);

      expect(results).toHaveLength(1); // Only first task executed
      expect(results[0].success).toBe(false);
    });
  });

  describe('executeParallel', () => {
    it('should execute tasks in parallel', async () => {
      const startTimes: number[] = [];

      const createTask = (id: number): Task<number, number> => ({
        name: `task${id}`,
        description: `Task ${id}`,
        execute: async (input) => {
          startTimes.push(Date.now());
          await new Promise((resolve) => setTimeout(resolve, 50));
          return input + id;
        },
      });

      const tasks = [createTask(1), createTask(2), createTask(3)];
      const results = await runner.executeParallel(tasks, [1, 2, 3]);

      expect(results).toHaveLength(3);
      expect(results[0].data).toBe(2);
      expect(results[1].data).toBe(4);
      expect(results[2].data).toBe(6);

      // Check that tasks started roughly at the same time (within 50ms)
      const timeDiff = Math.max(...startTimes) - Math.min(...startTimes);
      expect(timeDiff).toBeLessThan(50);
    });

    it('should return all results even if some fail', async () => {
      const task1: Task<number, number> = {
        name: 'task1',
        description: 'First task',
        execute: async (input) => input + 1,
      };

      const task2: Task<number, number> = {
        name: 'task2',
        description: 'Second task (fails)',
        execute: async () => {
          throw new Error('Task 2 failed');
        },
      };

      const task3: Task<number, number> = {
        name: 'task3',
        description: 'Third task',
        execute: async (input) => input + 3,
      };

      const results = await runner.executeParallel([task1, task2, task3], [1, 2, 3]);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });
  });

  describe('cache management', () => {
    it('should clear all cache when no pattern provided', async () => {
      const task: Task<number, number> = {
        name: 'cached-task',
        description: 'Task with caching',
        execute: async (input) => input * 2,
      };

      await runner.executeTask(task, 5);
      const stats1 = runner.getCacheStats();
      expect(stats1.size).toBeGreaterThan(0);

      runner.clearCache();
      const stats2 = runner.getCacheStats();
      expect(stats2.size).toBe(0);
    });

    it('should clear cache by pattern', async () => {
      const task1: Task<number, number> = {
        name: 'task1',
        description: 'First task',
        execute: async (input) => input * 2,
      };

      const task2: Task<number, number> = {
        name: 'other-task',
        description: 'Other task',
        execute: async (input) => input * 3,
      };

      await runner.executeTask(task1, 5);
      await runner.executeTask(task2, 5);

      runner.clearCache('task1');
      const stats = runner.getCacheStats();
      expect(stats.keys.some((k) => k.includes('task1'))).toBe(false);
      expect(stats.keys.some((k) => k.includes('other-task'))).toBe(true);
    });
  });

  describe('execution history', () => {
    it('should track execution history', async () => {
      const task: Task<number, number> = {
        name: 'tracked-task',
        description: 'Task with history tracking',
        execute: async (input) => input * 2,
      };

      await runner.executeTask(task, 5);
      await runner.executeTask(task, 10);

      const history = runner.getExecutionHistory('tracked-task');
      expect(history).toHaveLength(2);
      expect(history[0].taskName).toBe('tracked-task');
      expect(history[0].status).toBe('completed');
      expect(history[1].status).toBe('completed');
    });

    it('should track failed executions', async () => {
      const task: Task<number, number> = {
        name: 'failing-task',
        description: 'Task that fails',
        execute: async () => {
          throw new Error('Failed');
        },
      };

      await runner.executeTask(task, 5);

      const history = runner.getExecutionHistory('failing-task');
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('failed');
      expect(history[0].error).toBeInstanceOf(Error);
    });

    it('should return all history when no task name provided', async () => {
      const task1: Task<number, number> = {
        name: 'task1',
        description: 'First task',
        execute: async (input) => input * 2,
      };

      const task2: Task<number, number> = {
        name: 'task2',
        description: 'Second task',
        execute: async (input) => input * 3,
      };

      await runner.executeTask(task1, 5);
      await runner.executeTask(task2, 5);

      const allHistory = runner.getExecutionHistory();
      expect(allHistory.length).toBeGreaterThanOrEqual(2);
    });
  });
});
