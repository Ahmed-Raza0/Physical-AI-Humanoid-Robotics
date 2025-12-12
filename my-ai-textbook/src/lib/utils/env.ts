/**
 * Environment variable utilities
 */

export function getEnv(key: string, defaultValue?: string): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue || '';
  }
  return defaultValue || '';
}

export function requireEnv(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

export const env = {
  // OpenAI
  OPENAI_API_KEY: getEnv('OPENAI_API_KEY'),
  OPENAI_MODEL: getEnv('OPENAI_MODEL', 'gpt-4-turbo-preview'),
  OPENAI_EMBEDDING_MODEL: getEnv('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small'),

  // Auth
  AUTH_SECRET: getEnv('AUTH_SECRET'),
  AUTH_URL: getEnv('AUTH_URL', 'http://localhost:3000'),

  // App
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  IS_PRODUCTION: getEnv('NODE_ENV') === 'production',
};
