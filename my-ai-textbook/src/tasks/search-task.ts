/**
 * Semantic search task - Find relevant documents
 */

import type { Task } from './types';
import { retrieveContext, type RetrievalOptions } from '../lib/rag/retriever';

export interface SearchInput {
  query: string;
  options?: RetrievalOptions;
}

export interface SearchOutput {
  query: string;
  results: Array<{
    id: string;
    content: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  context: string;
  sources: Array<{
    title: string;
    source: string;
  }>;
  totalResults: number;
}

export const searchTask: Task<SearchInput, SearchOutput> = {
  name: 'search',
  description: 'Perform semantic search on document knowledge base',

  validate: (input) => {
    if (!input.query || typeof input.query !== 'string') {
      return false;
    }
    return input.query.trim().length > 0;
  },

  execute: async (input) => {
    console.log(`[searchTask] Searching for: "${input.query}"`);

    const retrieval = await retrieveContext(input.query, input.options);

    return {
      query: retrieval.query,
      results: retrieval.results,
      context: retrieval.context,
      sources: retrieval.sources,
      totalResults: retrieval.results.length,
    };
  },

  retry: {
    maxRetries: 2,
    retryDelay: 1000,
    exponentialBackoff: false,
  },

  timeout: 30000, // 30 seconds
};
