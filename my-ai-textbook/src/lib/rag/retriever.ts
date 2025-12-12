/**
 * RAG Retrieval system - Semantic search and context formatting
 */

import { generateEmbedding } from '../ai/openai';
import { getVectorStore, type SearchResult } from './vector-store';

export interface RetrievalResult {
  query: string;
  results: SearchResult[];
  context: string;
  sources: Array<{
    title: string;
    source: string;
  }>;
}

export interface RetrievalOptions {
  topK?: number;
  minScore?: number;
  includeMetadata?: boolean;
  filter?: (metadata: Record<string, any>) => boolean;
}

/**
 * Retrieve relevant context for a user query
 */
export async function retrieveContext(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const {
    topK = 5,
    minScore = 0.5,
    includeMetadata = true,
    filter,
  } = options;

  // 1. Generate embedding for the query
  console.log(`[Retriever] Embedding query: "${query.substring(0, 50)}..."`);
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search vector store
  const vectorStore = getVectorStore();
  const searchResults = await vectorStore.search(queryEmbedding, topK, filter);

  // 3. Filter by minimum score
  const filteredResults = searchResults.filter(
    (result) => result.score >= minScore
  );

  console.log(
    `[Retriever] Found ${filteredResults.length} relevant chunks (min score: ${minScore})`
  );

  // 4. Format context
  const context = formatContext(filteredResults, includeMetadata);

  // 5. Extract sources
  const sources = extractSources(filteredResults);

  return {
    query,
    results: filteredResults,
    context,
    sources,
  };
}

/**
 * Format search results into a context string for the LLM
 */
export function formatContext(
  results: SearchResult[],
  includeMetadata: boolean = true
): string {
  if (results.length === 0) {
    return 'No relevant context found in the knowledge base.';
  }

  const contextParts = results.map((result, index) => {
    let part = `[Context ${index + 1}`;

    if (includeMetadata && result.metadata.chapterTitle) {
      part += ` - ${result.metadata.chapterTitle}`;
    }

    part += `] (Relevance: ${(result.score * 100).toFixed(1)}%)\n`;
    part += result.content;

    return part;
  });

  return contextParts.join('\n\n---\n\n');
}

/**
 * Extract unique sources from search results
 */
export function extractSources(
  results: SearchResult[]
): Array<{ title: string; source: string }> {
  const sourcesMap = new Map<string, { title: string; source: string }>();

  for (const result of results) {
    const source = result.metadata.source;
    if (source && !sourcesMap.has(source)) {
      sourcesMap.set(source, {
        title: result.metadata.chapterTitle || source,
        source,
      });
    }
  }

  return Array.from(sourcesMap.values());
}

/**
 * Rerank results using a simple heuristic (optional enhancement)
 * Considers: similarity score, recency, source diversity
 */
export function rerankResults(
  results: SearchResult[],
  weights: {
    similarity?: number;
    recency?: number;
    diversity?: number;
  } = {}
): SearchResult[] {
  const {
    similarity = 0.7,
    recency = 0.2,
    diversity = 0.1,
  } = weights;

  // Track source diversity
  const sourceCounts = new Map<string, number>();

  const rankedResults = results.map((result, index) => {
    const source = result.metadata.source || '';

    // Calculate diversity score (penalize repeated sources)
    const sourceCount = sourceCounts.get(source) || 0;
    sourceCounts.set(source, sourceCount + 1);
    const diversityScore = 1 / (1 + sourceCount);

    // Calculate recency score (newer is better, but we don't have timestamps)
    const recencyScore = 1 - index / results.length;

    // Combine scores
    const finalScore =
      result.score * similarity +
      recencyScore * recency +
      diversityScore * diversity;

    return {
      ...result,
      score: finalScore,
    };
  });

  return rankedResults.sort((a, b) => b.score - a.score);
}

/**
 * Expand query with synonyms or related terms (optional enhancement)
 */
export function expandQuery(query: string): string[] {
  // Simple expansion - can be enhanced with NLP
  const queries = [query];

  // Add lowercase variant
  if (query !== query.toLowerCase()) {
    queries.push(query.toLowerCase());
  }

  return queries;
}

/**
 * Hybrid search: Combine semantic search with keyword matching
 */
export async function hybridSearch(
  query: string,
  options: RetrievalOptions & {
    semanticWeight?: number;
    keywordWeight?: number;
  } = {}
): Promise<RetrievalResult> {
  const {
    topK = 5,
    semanticWeight = 0.7,
    keywordWeight = 0.3,
  } = options;

  // Get semantic search results
  const semanticResults = await retrieveContext(query, {
    ...options,
    topK: topK * 2, // Get more results to filter
  });

  // Simple keyword matching (can be enhanced)
  const keywords = query.toLowerCase().split(/\s+/);
  const keywordScores = new Map<string, number>();

  for (const result of semanticResults.results) {
    const content = result.content.toLowerCase();
    let keywordScore = 0;

    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        keywordScore += 1 / keywords.length;
      }
    }

    keywordScores.set(result.id, keywordScore);
  }

  // Combine scores
  const hybridResults = semanticResults.results.map((result) => {
    const keywordScore = keywordScores.get(result.id) || 0;
    const combinedScore =
      result.score * semanticWeight + keywordScore * keywordWeight;

    return {
      ...result,
      score: combinedScore,
    };
  });

  // Re-sort and limit
  const topResults = hybridResults
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return {
    query,
    results: topResults,
    context: formatContext(topResults),
    sources: extractSources(topResults),
  };
}

/**
 * Multi-query retrieval: Generate multiple queries and merge results
 */
export async function multiQueryRetrieval(
  queries: string[],
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const { topK = 5 } = options;

  // Retrieve for each query
  const allResults = await Promise.all(
    queries.map((q) => retrieveContext(q, { ...options, topK: Math.ceil(topK / queries.length) * 2 }))
  );

  // Merge and deduplicate results
  const resultsMap = new Map<string, SearchResult>();

  for (const retrieval of allResults) {
    for (const result of retrieval.results) {
      if (!resultsMap.has(result.id) || resultsMap.get(result.id)!.score < result.score) {
        resultsMap.set(result.id, result);
      }
    }
  }

  // Sort by score and limit
  const mergedResults = Array.from(resultsMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return {
    query: queries.join(' | '),
    results: mergedResults,
    context: formatContext(mergedResults),
    sources: extractSources(mergedResults),
  };
}
