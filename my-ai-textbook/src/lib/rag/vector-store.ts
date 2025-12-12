/**
 * In-memory vector store with cosine similarity search
 * Supports persistence to/from JSON file
 */

import { cosineSimilarity } from '../ai/openai';
import type { DocumentChunk } from './document-processor';

export interface VectorEntry {
  id: string;
  embedding: number[];
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number; // Cosine similarity score (0-1)
}

export interface VectorStoreStats {
  totalVectors: number;
  dimensions: number;
  memoryUsageMB: number;
}

export class VectorStore {
  private vectors: Map<string, VectorEntry> = new Map();
  private readonly dimensions: number = 1536; // OpenAI text-embedding-3-small

  constructor() {}

  /**
   * Add a single vector to the store
   */
  async add(
    id: string,
    embedding: number[],
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    if (embedding.length !== this.dimensions) {
      throw new Error(
        `Invalid embedding dimensions: expected ${this.dimensions}, got ${embedding.length}`
      );
    }

    this.vectors.set(id, {
      id,
      embedding,
      content,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Add multiple vectors in batch
   */
  async addBatch(entries: Array<{
    id: string;
    embedding: number[];
    content: string;
    metadata?: Record<string, any>;
  }>): Promise<void> {
    for (const entry of entries) {
      await this.add(
        entry.id,
        entry.embedding,
        entry.content,
        entry.metadata || {}
      );
    }
  }

  /**
   * Semantic search using cosine similarity
   */
  async search(
    queryEmbedding: number[],
    topK: number = 5,
    filter?: (metadata: Record<string, any>) => boolean
  ): Promise<SearchResult[]> {
    if (queryEmbedding.length !== this.dimensions) {
      throw new Error(
        `Invalid query embedding dimensions: expected ${this.dimensions}, got ${queryEmbedding.length}`
      );
    }

    const results: SearchResult[] = [];

    // Calculate similarity for all vectors
    for (const [id, entry] of this.vectors) {
      // Apply filter if provided
      if (filter && !filter(entry.metadata)) {
        continue;
      }

      const similarity = cosineSimilarity(queryEmbedding, entry.embedding);

      results.push({
        id,
        content: entry.content,
        metadata: entry.metadata,
        score: similarity,
      });
    }

    // Sort by similarity (descending) and return top K
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * Get vector by ID
   */
  async get(id: string): Promise<VectorEntry | undefined> {
    return this.vectors.get(id);
  }

  /**
   * Delete vector by ID
   */
  async delete(id: string): Promise<boolean> {
    return this.vectors.delete(id);
  }

  /**
   * Delete all vectors matching a prefix (e.g., all chunks from a document)
   */
  async deleteByPrefix(prefix: string): Promise<number> {
    let deleted = 0;
    for (const [id] of this.vectors) {
      if (id.startsWith(prefix)) {
        this.vectors.delete(id);
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * Clear all vectors
   */
  async clear(): Promise<void> {
    this.vectors.clear();
  }

  /**
   * Get total number of vectors
   */
  size(): number {
    return this.vectors.size;
  }

  /**
   * Get all vector IDs
   */
  getAllIds(): string[] {
    return Array.from(this.vectors.keys());
  }

  /**
   * Check if vector exists
   */
  has(id: string): boolean {
    return this.vectors.has(id);
  }

  /**
   * Get store statistics
   */
  getStats(): VectorStoreStats {
    const entries = Array.from(this.vectors.values());
    const memoryUsageMB =
      (entries.reduce((sum, entry) => {
        // Rough estimate: 4 bytes per float + metadata
        return sum + entry.embedding.length * 4 + JSON.stringify(entry.metadata).length;
      }, 0)) /
      (1024 * 1024);

    return {
      totalVectors: this.vectors.size,
      dimensions: this.dimensions,
      memoryUsageMB: parseFloat(memoryUsageMB.toFixed(2)),
    };
  }

  /**
   * Export vectors to JSON (for persistence)
   */
  toJSON(): string {
    const data = Array.from(this.vectors.entries()).map(([id, entry]) => ({
      id,
      embedding: entry.embedding,
      content: entry.content,
      metadata: entry.metadata,
      timestamp: entry.timestamp.toISOString(),
    }));

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import vectors from JSON
   */
  fromJSON(json: string): void {
    try {
      const data = JSON.parse(json);

      if (!Array.isArray(data)) {
        throw new Error('Invalid JSON format: expected array');
      }

      this.vectors.clear();

      for (const item of data) {
        if (!item.id || !item.embedding || !item.content) {
          console.warn('Skipping invalid entry:', item.id);
          continue;
        }

        this.vectors.set(item.id, {
          id: item.id,
          embedding: item.embedding,
          content: item.content,
          metadata: item.metadata || {},
          timestamp: new Date(item.timestamp || Date.now()),
        });
      }

      console.log(`Loaded ${this.vectors.size} vectors from JSON`);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }

  /**
   * Save vectors to file (Node.js only)
   */
  async saveToFile(filepath: string): Promise<void> {
    if (typeof window !== 'undefined') {
      throw new Error('saveToFile is only available in Node.js environment');
    }

    const fs = await import('fs/promises');
    const json = this.toJSON();
    await fs.writeFile(filepath, json, 'utf-8');
    console.log(`Saved ${this.vectors.size} vectors to ${filepath}`);
  }

  /**
   * Load vectors from file (Node.js only)
   */
  async loadFromFile(filepath: string): Promise<void> {
    if (typeof window !== 'undefined') {
      throw new Error('loadFromFile is only available in Node.js environment');
    }

    const fs = await import('fs/promises');
    const json = await fs.readFile(filepath, 'utf-8');
    this.fromJSON(json);
  }

  /**
   * Find duplicate or near-duplicate vectors
   */
  async findDuplicates(threshold: number = 0.99): Promise<Array<{ id1: string; id2: string; similarity: number }>> {
    const duplicates: Array<{ id1: string; id2: string; similarity: number }> = [];
    const entries = Array.from(this.vectors.entries());

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [id1, entry1] = entries[i];
        const [id2, entry2] = entries[j];

        const similarity = cosineSimilarity(entry1.embedding, entry2.embedding);

        if (similarity >= threshold) {
          duplicates.push({ id1, id2, similarity });
        }
      }
    }

    return duplicates;
  }
}

// Singleton instance
let vectorStoreInstance: VectorStore | null = null;

/**
 * Get the singleton vector store instance
 */
export function getVectorStore(): VectorStore {
  if (!vectorStoreInstance) {
    vectorStoreInstance = new VectorStore();
  }
  return vectorStoreInstance;
}

/**
 * Reset the vector store (for testing)
 */
export function resetVectorStore(): void {
  vectorStoreInstance = null;
}
