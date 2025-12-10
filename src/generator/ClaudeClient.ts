/**
 * ClaudeClient - Handles API calls to Claude with retry logic and rate limiting
 */

import Anthropic from '@anthropic-ai/sdk';
import { GenerationPrompt, GeneratedContent } from '../types/models';
import {
  APIError,
  RateLimitError,
  TimeoutError,
  ConfigurationError,
} from './errors';

export interface ClaudeClientOptions {
  maxConcurrentRequests?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  model?: string;
}

export class ClaudeClient {
  private anthropic: Anthropic;
  private maxConcurrentRequests: number;
  private retryAttempts: number;
  private retryDelayMs: number;
  private timeoutMs: number;
  private model: string;
  private activeRequests: number = 0;
  private requestQueue: Array<() => void> = [];

  constructor(apiKey: string, options: ClaudeClientOptions = {}) {
    // Validate API key
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      throw new ConfigurationError('API key must start with sk-ant-', 'apiKey');
    }

    this.anthropic = new Anthropic({ apiKey });
    this.maxConcurrentRequests = options.maxConcurrentRequests ?? 5;
    this.retryAttempts = options.retryAttempts ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 1000;
    this.timeoutMs = options.timeoutMs ?? 120000; // 2 minutes default
    this.model = options.model ?? 'claude-sonnet-4-20250514';
  }

  /**
   * Generates content using Claude API
   */
  async generateContent(prompt: GenerationPrompt): Promise<GeneratedContent> {
    // Wait for available request slot
    await this.acquireRequestSlot();

    try {
      const result = await this.generateWithRetry(prompt);
      return result;
    } finally {
      this.releaseRequestSlot();
    }
  }

  /**
   * Generate content with retry logic
   */
  private async generateWithRetry(
    prompt: GenerationPrompt,
    attempt: number = 0
  ): Promise<GeneratedContent> {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new TimeoutError(`Request timeout after ${this.timeoutMs}ms`, this.timeoutMs));
        }, this.timeoutMs);
      });

      // Create API call promise
      const apiPromise = this.callClaudeAPI(prompt);

      // Race between API call and timeout
      const response = await Promise.race([apiPromise, timeoutPromise]);

      // Parse and return result
      return this.parseResponse(response, prompt);
    } catch (error) {
      // Check if error is retryable
      if (this.isRetryableError(error) && attempt < this.retryAttempts) {
        // Calculate backoff delay
        const delay = this.calculateBackoffDelay(attempt, error);
        await this.sleep(delay);

        // Retry
        return this.generateWithRetry(prompt, attempt + 1);
      }

      // Not retryable or max retries exceeded
      throw this.normalizeError(error);
    }
  }

  /**
   * Make actual API call to Claude
   */
  private async callClaudeAPI(prompt: GenerationPrompt): Promise<Anthropic.Message> {
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: prompt.template,
      },
    ];

    const params: Anthropic.MessageCreateParams = {
      model: this.model,
      max_tokens: prompt.maxTokens,
      temperature: prompt.temperature,
      system: prompt.systemPrompt,
      messages,
    };

    // Add thinking tokens if specified
    if (prompt.thinkingTokens > 0) {
      (params as any).thinking = {
        type: 'enabled',
        budget_tokens: prompt.thinkingTokens,
      };
    }

    return await this.anthropic.messages.create(params);
  }

  /**
   * Parse Claude API response into GeneratedContent
   */
  private parseResponse(
    response: Anthropic.Message,
    prompt: GenerationPrompt
  ): GeneratedContent {
    // Extract text content
    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    if (!textContent) {
      throw new APIError('No text content in API response');
    }

    // Extract front matter for metadata
    const frontMatterMatch = textContent.match(/^---\n([\s\S]*?)\n---/);
    let metadata: {
      title: string;
      description: string;
      keywords: string[];
      sidebar_position: number;
    } = {
      title: 'Untitled',
      description: '',
      keywords: [],
      sidebar_position: 1,
    };

    if (frontMatterMatch) {
      try {
        // Parse YAML front matter (simple parsing)
        const frontMatter = frontMatterMatch[1];
        const titleMatch = frontMatter.match(/title:\s*["'](.+?)["']/);
        const descMatch = frontMatter.match(/description:\s*["'](.+?)["']/);
        const keywordsMatch = frontMatter.match(/keywords:\s*\[(.*?)\]/);
        const posMatch = frontMatter.match(/sidebar_position:\s*(\d+)/);

        if (titleMatch) metadata.title = titleMatch[1];
        if (descMatch) metadata.description = descMatch[1];
        if (keywordsMatch) {
          metadata.keywords = keywordsMatch[1]
            .split(',')
            .map((k) => k.trim().replace(/["']/g, ''));
        }
        if (posMatch) metadata.sidebar_position = parseInt(posMatch[1], 10);
      } catch (e) {
        // Keep default metadata if parsing fails
      }
    }

    return {
      markdown: textContent,
      metadata,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      thinkingTokens: 0, // API doesn't return thinking tokens separately yet
      generatedAt: new Date(),
      modelVersion: response.model,
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof RateLimitError || error instanceof TimeoutError) {
      return true;
    }

    // Check for overloaded errors from API
    const errorStr = String(error);
    if (
      errorStr.includes('overloaded_error') ||
      errorStr.includes('rate_limit_error') ||
      errorStr.includes('529') ||
      errorStr.includes('503')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number, error: unknown): number {
    // Check if error includes retry-after header
    if (error instanceof RateLimitError && error.retryAfterMs) {
      return error.retryAfterMs;
    }

    // Exponential backoff: base * 2^attempt
    return this.retryDelayMs * Math.pow(2, attempt);
  }

  /**
   * Normalize errors to our custom error types
   */
  private normalizeError(error: unknown): Error {
    if (error instanceof APIError) {
      return error;
    }

    const errorStr = String(error);
    const errorObj = error instanceof Error ? error : new Error(errorStr);

    // Rate limit error
    if (errorStr.includes('rate_limit_error') || errorStr.includes('429')) {
      return new RateLimitError('Rate limit exceeded', undefined);
    }

    // Timeout error
    if (error instanceof TimeoutError) {
      return error;
    }

    // Authentication error
    if (errorStr.includes('authentication_error') || errorStr.includes('401')) {
      return new APIError('Authentication failed - invalid API key', 401, undefined, false);
    }

    // Generic API error
    return new APIError(
      `API request failed: ${errorObj.message}`,
      undefined,
      errorObj,
      false
    );
  }

  /**
   * Request queue management - acquire slot
   */
  private async acquireRequestSlot(): Promise<void> {
    if (this.activeRequests < this.maxConcurrentRequests) {
      this.activeRequests++;
      return;
    }

    // Wait in queue
    return new Promise<void>((resolve) => {
      this.requestQueue.push(resolve);
    });
  }

  /**
   * Request queue management - release slot
   */
  private releaseRequestSlot(): void {
    this.activeRequests--;

    // Process next queued request
    const next = this.requestQueue.shift();
    if (next) {
      this.activeRequests++;
      next();
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
