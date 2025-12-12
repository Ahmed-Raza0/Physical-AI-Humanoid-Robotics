/**
 * Embedding generation task
 */

import type { Task } from './types';
import { generateEmbedding, generateEmbeddings } from '../lib/ai/openai';

export interface EmbedInput {
  text: string | string[];
}

export interface EmbedOutput {
  embeddings: number[][];
  count: number;
}

export const embedTask: Task<EmbedInput, EmbedOutput> = {
  name: 'embed',
  description: 'Generate embeddings for text using OpenAI',

  validate: (input) => {
    if (!input.text) {
      return false;
    }
    if (Array.isArray(input.text)) {
      return input.text.every(t => typeof t === 'string' && t.length > 0);
    }
    return typeof input.text === 'string' && input.text.length > 0;
  },

  execute: async (input) => {
    const texts = Array.isArray(input.text) ? input.text : [input.text];

    console.log(`[embedTask] Generating embeddings for ${texts.length} text(s)`);

    const embeddings = await generateEmbeddings(texts);

    return {
      embeddings,
      count: embeddings.length,
    };
  },

  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
  },

  timeout: 30000, // 30 seconds
};
