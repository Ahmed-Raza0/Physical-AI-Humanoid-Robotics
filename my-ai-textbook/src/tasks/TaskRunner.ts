/**
 * TaskRunner - Intelligent task orchestration system
 * Handles task execution, retries, caching, and error handling
 */

import type {
  Task,
  TaskContext,
  TaskResult,
  TaskChain,
  TaskExecution,
  TaskStatus
} from './types';

export class TaskRunner {
  private executions: Map<string, TaskExecution[]> = new Map();
  private cache: Map<string, any> = new Map();

  /**
   * Execute a single task with retry logic
   */
  async executeTask<TInput, TOutput>(
    task: Task<TInput, TOutput>,
    input: TInput,
    context?: TaskContext
  ): Promise<TaskResult<TOutput>> {
    const startTime = Date.now();
    const execution: TaskExecution = {
      taskName: task.name,
      status: 'running',
      startTime: new Date()
    };

    this.addExecution(task.name, execution);

    try {
      // Validation
      if (task.validate) {
        const isValid = await task.validate(input);
        if (!isValid) {
          throw new Error(`Validation failed for task: ${task.name}`);
        }
      }

      // Check cache
      const cacheKey = this.getCacheKey(task.name, input);
      if (this.cache.has(cacheKey)) {
        console.log(`[TaskRunner] Cache hit for ${task.name}`);
        execution.status = 'completed';
        execution.endTime = new Date();
        return {
          success: true,
          data: this.cache.get(cacheKey),
          duration: Date.now() - startTime,
          timestamp: new Date()
        };
      }

      // Execute with retry logic
      const result = await this.executeWithRetry(task, input, context);

      // Cache successful result
      if (result.success && result.data) {
        this.cache.set(cacheKey, result.data);
      }

      execution.status = 'completed';
      execution.endTime = new Date();

      return {
        ...result,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = error as Error;

      console.error(`[TaskRunner] Task ${task.name} failed:`, error);

      return {
        success: false,
        error: error as Error,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Execute task with retry logic
   */
  private async executeWithRetry<TInput, TOutput>(
    task: Task<TInput, TOutput>,
    input: TInput,
    context?: TaskContext
  ): Promise<TaskResult<TOutput>> {
    const maxRetries = task.retry?.maxRetries || 0;
    const retryDelay = task.retry?.retryDelay || 1000;
    const exponentialBackoff = task.retry?.exponentialBackoff || false;

    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        // Execute with timeout if specified
        const data = task.timeout
          ? await this.executeWithTimeout(task, input, context, task.timeout)
          : await task.execute(input, context);

        return {
          success: true,
          data,
          duration: 0, // Will be set by caller
          timestamp: new Date(),
          retries: attempt
        };
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (attempt <= maxRetries) {
          const delay = exponentialBackoff
            ? retryDelay * Math.pow(2, attempt - 1)
            : retryDelay;

          console.log(
            `[TaskRunner] Retry ${attempt}/${maxRetries} for ${task.name} in ${delay}ms`
          );

          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Task execution failed');
  }

  /**
   * Execute task with timeout
   */
  private async executeWithTimeout<TInput, TOutput>(
    task: Task<TInput, TOutput>,
    input: TInput,
    context: TaskContext | undefined,
    timeout: number
  ): Promise<TOutput> {
    return Promise.race([
      task.execute(input, context),
      new Promise<TOutput>((_, reject) =>
        setTimeout(() => reject(new Error(`Task ${task.name} timeout`)), timeout)
      )
    ]);
  }

  /**
   * Execute multiple tasks in sequence
   */
  async executeSequential(
    tasks: Task[],
    inputs: any[],
    context?: TaskContext
  ): Promise<TaskResult<any>[]> {
    const results: TaskResult<any>[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const result = await this.executeTask(tasks[i], inputs[i], context);
      results.push(result);

      // Stop if any task fails
      if (!result.success) {
        console.error(`[TaskRunner] Sequential execution stopped at task ${i}`);
        break;
      }
    }

    return results;
  }

  /**
   * Execute multiple tasks in parallel
   */
  async executeParallel(
    tasks: Task[],
    inputs: any[],
    context?: TaskContext
  ): Promise<TaskResult<any>[]> {
    const promises = tasks.map((task, index) =>
      this.executeTask(task, inputs[index], context)
    );

    return Promise.all(promises);
  }

  /**
   * Execute a task chain
   */
  async executeChain(
    chain: TaskChain,
    inputs: any[],
    context?: TaskContext
  ): Promise<TaskResult<any>[]> {
    if (chain.mode === 'sequential') {
      return this.executeSequential(chain.tasks, inputs, context);
    } else {
      return this.executeParallel(chain.tasks, inputs, context);
    }
  }

  /**
   * Clear cache
   */
  clearCache(pattern?: string) {
    if (pattern) {
      const keys = Array.from(this.cache.keys()).filter(key =>
        key.includes(pattern)
      );
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get task execution history
   */
  getExecutionHistory(taskName?: string): TaskExecution[] {
    if (taskName) {
      return this.executions.get(taskName) || [];
    }
    return Array.from(this.executions.values()).flat();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Helper methods
  private getCacheKey(taskName: string, input: any): string {
    return `${taskName}:${JSON.stringify(input)}`;
  }

  private addExecution(taskName: string, execution: TaskExecution) {
    if (!this.executions.has(taskName)) {
      this.executions.set(taskName, []);
    }
    this.executions.get(taskName)!.push(execution);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const taskRunner = new TaskRunner();
