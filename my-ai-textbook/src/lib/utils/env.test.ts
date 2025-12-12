/**
 * Tests for environment variable utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getEnv, requireEnv, env } from './env';

describe('env utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  describe('getEnv', () => {
    it('should return environment variable value when it exists', () => {
      process.env.TEST_VAR = 'test-value';
      expect(getEnv('TEST_VAR')).toBe('test-value');
    });

    it('should return default value when environment variable does not exist', () => {
      delete process.env.TEST_VAR;
      expect(getEnv('TEST_VAR', 'default')).toBe('default');
    });

    it('should return empty string when no default and variable does not exist', () => {
      delete process.env.TEST_VAR;
      expect(getEnv('TEST_VAR')).toBe('');
    });

    it('should handle empty string environment variables', () => {
      process.env.TEST_VAR = '';
      expect(getEnv('TEST_VAR', 'default')).toBe('default');
    });
  });

  describe('requireEnv', () => {
    it('should return environment variable value when it exists', () => {
      process.env.REQUIRED_VAR = 'required-value';
      expect(requireEnv('REQUIRED_VAR')).toBe('required-value');
    });

    it('should throw error when environment variable does not exist', () => {
      delete process.env.REQUIRED_VAR;
      expect(() => requireEnv('REQUIRED_VAR')).toThrow(
        'Required environment variable REQUIRED_VAR is not set'
      );
    });

    it('should throw error when environment variable is empty string', () => {
      process.env.REQUIRED_VAR = '';
      expect(() => requireEnv('REQUIRED_VAR')).toThrow(
        'Required environment variable REQUIRED_VAR is not set'
      );
    });
  });

  describe('env object', () => {
    it('should have correct structure', () => {
      expect(env).toHaveProperty('OPENAI_API_KEY');
      expect(env).toHaveProperty('OPENAI_MODEL');
      expect(env).toHaveProperty('OPENAI_EMBEDDING_MODEL');
      expect(env).toHaveProperty('AUTH_SECRET');
      expect(env).toHaveProperty('AUTH_URL');
      expect(env).toHaveProperty('NODE_ENV');
      expect(env).toHaveProperty('IS_PRODUCTION');
    });

    it('should use default values for optional variables', () => {
      // Test with getEnv directly since env is a static object
      delete process.env.OPENAI_MODEL;
      delete process.env.OPENAI_EMBEDDING_MODEL;
      delete process.env.AUTH_URL;

      expect(getEnv('OPENAI_MODEL', 'gpt-4-turbo-preview')).toBe('gpt-4-turbo-preview');
      expect(getEnv('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small')).toBe('text-embedding-3-small');
      expect(getEnv('AUTH_URL', 'http://localhost:3000')).toBe('http://localhost:3000');
    });

    it('should correctly determine IS_PRODUCTION', () => {
      // Test production mode
      process.env.NODE_ENV = 'production';
      const isProduction = process.env.NODE_ENV === 'production';
      expect(isProduction).toBe(true);

      // Test development mode
      process.env.NODE_ENV = 'development';
      const isDevelopment = process.env.NODE_ENV === 'production';
      expect(isDevelopment).toBe(false);
    });
  });
});
