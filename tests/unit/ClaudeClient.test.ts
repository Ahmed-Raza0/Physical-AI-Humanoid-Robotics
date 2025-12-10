/**
 * Unit tests for ClaudeClient
 * Tests API integration, retry logic, and rate limiting
 */

import { ClaudeClient } from '../../src/generator/ClaudeClient';
import { APIError, RateLimitError, TimeoutError } from '../../src/generator/errors';
import {
  MOCK_SECTION_RESPONSE,
  MOCK_RATE_LIMIT_ERROR,
  MOCK_OVERLOADED_ERROR,
  MOCK_INVALID_API_KEY_ERROR,
} from '../mocks/claude-responses';

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk');

describe('ClaudeClient', () => {
  let client: ClaudeClient;
  const mockApiKey = 'sk-ant-test-key-12345';

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ClaudeClient(mockApiKey);
  });

  describe('constructor', () => {
    it('should create a client with valid API key', () => {
      expect(client).toBeInstanceOf(ClaudeClient);
    });

    it('should throw error for invalid API key format', () => {
      expect(() => new ClaudeClient('invalid-key')).toThrow('API key must start with sk-ant-');
    });

    it('should throw error for empty API key', () => {
      expect(() => new ClaudeClient('')).toThrow();
    });
  });

  describe('generateContent', () => {
    it('should successfully generate content with valid prompt', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (client as any).anthropic = { messages: { create: mockCreate } };

      const result = await client.generateContent({
        type: 'section',
        template: 'Test template',
        systemPrompt: 'Test system prompt',
        maxTokens: 4000,
        thinkingTokens: 5000,
        temperature: 0.7,
      });

      expect(result).toBeDefined();
      expect(result.markdown).toContain('# What is Physical AI?');
      expect(result.tokensUsed).toBeGreaterThan(0);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should include thinking tokens in API call when specified', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (client as any).anthropic = { messages: { create: mockCreate } };

      await client.generateContent({
        type: 'section',
        template: 'Test template',
        systemPrompt: 'Test system prompt',
        maxTokens: 4000,
        thinkingTokens: 5000,
        temperature: 0.7,
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          thinking: {
            type: 'enabled',
            budget_tokens: 5000,
          },
        })
      );
    });

    it('should use correct model version', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (client as any).anthropic = { messages: { create: mockCreate } };

      await client.generateContent({
        type: 'section',
        template: 'Test template',
        systemPrompt: 'Test system prompt',
        maxTokens: 4000,
        thinkingTokens: 5000,
        temperature: 0.7,
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.stringContaining('claude'),
        })
      );
    });
  });

  describe('retry logic', () => {
    it('should retry on rate limit error with exponential backoff', async () => {
      const mockCreate = jest
        .fn()
        .mockRejectedValueOnce(new Error(JSON.stringify(MOCK_RATE_LIMIT_ERROR)))
        .mockRejectedValueOnce(new Error(JSON.stringify(MOCK_RATE_LIMIT_ERROR)))
        .mockResolvedValueOnce(MOCK_SECTION_RESPONSE);

      (client as any).anthropic = { messages: { create: mockCreate } };

      const result = await client.generateContent({
        type: 'section',
        template: 'Test template',
        systemPrompt: 'Test system prompt',
        maxTokens: 4000,
        thinkingTokens: 5000,
        temperature: 0.7,
      });

      expect(result).toBeDefined();
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it('should retry on overloaded error', async () => {
      const mockCreate = jest
        .fn()
        .mockRejectedValueOnce(new Error(JSON.stringify(MOCK_OVERLOADED_ERROR)))
        .mockResolvedValueOnce(MOCK_SECTION_RESPONSE);

      (client as any).anthropic = { messages: { create: mockCreate } };

      const result = await client.generateContent({
        type: 'section',
        template: 'Test template',
        systemPrompt: 'Test system prompt',
        maxTokens: 4000,
        thinkingTokens: 5000,
        temperature: 0.7,
      });

      expect(result).toBeDefined();
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should not retry on authentication error', async () => {
      const mockCreate = jest.fn().mockRejectedValue(
        new Error(JSON.stringify(MOCK_INVALID_API_KEY_ERROR))
      );

      (client as any).anthropic = { messages: { create: mockCreate } };

      await expect(
        client.generateContent({
          type: 'section',
          template: 'Test template',
          systemPrompt: 'Test system prompt',
          maxTokens: 4000,
          thinkingTokens: 5000,
          temperature: 0.7,
        })
      ).rejects.toThrow(APIError);

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should throw RateLimitError after max retries', async () => {
      const mockCreate = jest.fn().mockRejectedValue(
        new Error(JSON.stringify(MOCK_RATE_LIMIT_ERROR))
      );

      (client as any).anthropic = { messages: { create: mockCreate } };

      await expect(
        client.generateContent({
          type: 'section',
          template: 'Test template',
          systemPrompt: 'Test system prompt',
          maxTokens: 4000,
          thinkingTokens: 5000,
          temperature: 0.7,
        })
      ).rejects.toThrow(RateLimitError);

      // Default max retries is 3, so should be called 4 times total (initial + 3 retries)
      expect(mockCreate).toHaveBeenCalledTimes(4);
    });
  });

  describe('rate limiting', () => {
    it('should respect max concurrent requests', async () => {
      const mockCreate = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(MOCK_SECTION_RESPONSE), 100);
        });
      });

      (client as any).anthropic = { messages: { create: mockCreate } };

      // Set max concurrent to 2
      const clientWithLimit = new ClaudeClient(mockApiKey, { maxConcurrentRequests: 2 });
      (clientWithLimit as any).anthropic = { messages: { create: mockCreate } };

      // Start 5 requests
      const requests = Array(5)
        .fill(null)
        .map(() =>
          clientWithLimit.generateContent({
            type: 'section',
            template: 'Test template',
            systemPrompt: 'Test system prompt',
            maxTokens: 4000,
            thinkingTokens: 5000,
            temperature: 0.7,
          })
        );

      await Promise.all(requests);

      // All should complete
      expect(mockCreate).toHaveBeenCalledTimes(5);
    });
  });

  describe('timeout handling', () => {
    it('should timeout after specified duration', async () => {
      const mockCreate = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(MOCK_SECTION_RESPONSE), 10000);
        });
      });

      (client as any).anthropic = { messages: { create: mockCreate } };

      const clientWithTimeout = new ClaudeClient(mockApiKey, { timeoutMs: 100 });
      (clientWithTimeout as any).anthropic = { messages: { create: mockCreate } };

      await expect(
        clientWithTimeout.generateContent({
          type: 'section',
          template: 'Test template',
          systemPrompt: 'Test system prompt',
          maxTokens: 4000,
          thinkingTokens: 5000,
          temperature: 0.7,
        })
      ).rejects.toThrow(TimeoutError);
    }, 10000);
  });

  describe('error handling', () => {
    it('should throw APIError for unknown API errors', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('Unknown error'));

      (client as any).anthropic = { messages: { create: mockCreate } };

      await expect(
        client.generateContent({
          type: 'section',
          template: 'Test template',
          systemPrompt: 'Test system prompt',
          maxTokens: 4000,
          thinkingTokens: 5000,
          temperature: 0.7,
        })
      ).rejects.toThrow(APIError);
    });

    it('should preserve original error details', async () => {
      const originalError = new Error('Detailed error message');
      const mockCreate = jest.fn().mockRejectedValue(originalError);

      (client as any).anthropic = { messages: { create: mockCreate } };

      try {
        await client.generateContent({
          type: 'section',
          template: 'Test template',
          systemPrompt: 'Test system prompt',
          maxTokens: 4000,
          thinkingTokens: 5000,
          temperature: 0.7,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).message).toContain('Detailed error message');
      }
    });
  });
});
