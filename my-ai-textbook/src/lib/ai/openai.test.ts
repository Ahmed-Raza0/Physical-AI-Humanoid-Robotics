/**
 * Tests for OpenAI utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cosineSimilarity } from './openai';

// Mock OpenAI and env modules
vi.mock('openai');
vi.mock('../utils/env', () => ({
  env: {
    OPENAI_API_KEY: 'test-api-key',
    OPENAI_MODEL: 'gpt-4-turbo-preview',
    OPENAI_EMBEDDING_MODEL: 'text-embedding-3-small',
  },
}));

describe('OpenAI utilities', () => {
  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity for identical vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2, 3];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it('should calculate cosine similarity for orthogonal vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(0.0, 5);
    });

    it('should calculate cosine similarity for opposite vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [-1, -2, -3];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(-1.0, 5);
    });

    it('should calculate cosine similarity for similar vectors', () => {
      const vec1 = [1, 2, 3, 4, 5];
      const vec2 = [1, 2, 3, 4, 6];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeGreaterThan(0.9);
      expect(similarity).toBeLessThan(1.0);
    });

    it('should throw error for vectors of different lengths', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2];
      expect(() => cosineSimilarity(vec1, vec2)).toThrow(
        'Vectors must have the same length'
      );
    });

    it('should handle empty vectors', () => {
      const vec1: number[] = [];
      const vec2: number[] = [];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(isNaN(similarity)).toBe(true);
    });

    it('should handle zero vectors', () => {
      const vec1 = [0, 0, 0];
      const vec2 = [0, 0, 0];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(isNaN(similarity)).toBe(true);
    });

    it('should calculate similarity for high-dimensional vectors', () => {
      const dim = 1536; // Typical embedding dimension
      const vec1 = Array.from({ length: dim }, (_, i) => Math.sin(i));
      const vec2 = Array.from({ length: dim }, (_, i) => Math.sin(i + 0.1));
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeGreaterThan(0.8);
      expect(similarity).toBeLessThanOrEqual(1.0);
    });
  });

  describe('module configuration', () => {
    it('should have OpenAI utilities available', () => {
      // Verify that the cosineSimilarity function is exported and working
      const vec1 = [1, 0];
      const vec2 = [1, 0];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(1.0, 5);
    });
  });
});
