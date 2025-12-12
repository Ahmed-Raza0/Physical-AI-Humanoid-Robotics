/**
 * Tests for embedTask
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { embedTask } from './embedTask';
import type { EmbedInput } from './embedTask';

// Mock the OpenAI module
vi.mock('../lib/ai/openai', () => ({
  generateEmbedding: vi.fn(async (text: string) => {
    // Return a mock embedding based on text length
    return Array.from({ length: 1536 }, (_, i) => Math.random());
  }),
  generateEmbeddings: vi.fn(async (texts: string[]) => {
    // Return mock embeddings for each text
    return texts.map(() => Array.from({ length: 1536 }, (_, i) => Math.random()));
  }),
}));

describe('embedTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should validate single text input', () => {
      const input: EmbedInput = { text: 'Hello world' };
      expect(embedTask.validate?.(input)).toBe(true);
    });

    it('should validate array of text inputs', () => {
      const input: EmbedInput = { text: ['Hello', 'world', 'test'] };
      expect(embedTask.validate?.(input)).toBe(true);
    });

    it('should reject empty string', () => {
      const input: EmbedInput = { text: '' };
      expect(embedTask.validate?.(input)).toBe(false);
    });

    it('should reject array with empty strings', () => {
      const input: EmbedInput = { text: ['Hello', '', 'world'] };
      expect(embedTask.validate?.(input)).toBe(false);
    });

    it('should reject missing text field', () => {
      const input = {} as EmbedInput;
      expect(embedTask.validate?.(input)).toBe(false);
    });

    it('should reject non-string types', () => {
      const input = { text: 123 } as any;
      expect(embedTask.validate?.(input)).toBe(false);
    });

    it('should reject array with non-strings', () => {
      const input = { text: ['Hello', 123, 'world'] } as any;
      expect(embedTask.validate?.(input)).toBe(false);
    });
  });

  describe('execution', () => {
    it('should generate embedding for single text', async () => {
      const { generateEmbeddings } = await import('../lib/ai/openai');
      const input: EmbedInput = { text: 'Hello world' };

      const result = await embedTask.execute(input);

      expect(result.embeddings).toHaveLength(1);
      expect(result.embeddings[0]).toHaveLength(1536);
      expect(result.count).toBe(1);
      expect(generateEmbeddings).toHaveBeenCalledWith(['Hello world']);
    });

    it('should generate embeddings for multiple texts', async () => {
      const { generateEmbeddings } = await import('../lib/ai/openai');
      const input: EmbedInput = { text: ['Hello', 'world', 'test'] };

      const result = await embedTask.execute(input);

      expect(result.embeddings).toHaveLength(3);
      expect(result.embeddings[0]).toHaveLength(1536);
      expect(result.count).toBe(3);
      expect(generateEmbeddings).toHaveBeenCalledWith(['Hello', 'world', 'test']);
    });

    it('should handle long text', async () => {
      const longText = 'a'.repeat(10000);
      const input: EmbedInput = { text: longText };

      const result = await embedTask.execute(input);

      expect(result.embeddings).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it('should handle batch of texts', async () => {
      const texts = Array.from({ length: 50 }, (_, i) => `Text ${i}`);
      const input: EmbedInput = { text: texts };

      const result = await embedTask.execute(input);

      expect(result.embeddings).toHaveLength(50);
      expect(result.count).toBe(50);
    });
  });

  describe('retry configuration', () => {
    it('should have retry configuration', () => {
      expect(embedTask.retry).toBeDefined();
      expect(embedTask.retry?.maxRetries).toBe(3);
      expect(embedTask.retry?.retryDelay).toBe(1000);
      expect(embedTask.retry?.exponentialBackoff).toBe(true);
    });
  });

  describe('timeout configuration', () => {
    it('should have timeout configuration', () => {
      expect(embedTask.timeout).toBeDefined();
      expect(embedTask.timeout).toBe(30000); // 30 seconds
    });
  });

  describe('task metadata', () => {
    it('should have correct name', () => {
      expect(embedTask.name).toBe('embed');
    });

    it('should have description', () => {
      expect(embedTask.description).toBeDefined();
      expect(embedTask.description.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should propagate OpenAI errors', async () => {
      const { generateEmbeddings } = await import('../lib/ai/openai');
      vi.mocked(generateEmbeddings).mockRejectedValueOnce(
        new Error('OpenAI API error')
      );

      const input: EmbedInput = { text: 'Hello world' };

      await expect(embedTask.execute(input)).rejects.toThrow('OpenAI API error');
    });
  });
});
