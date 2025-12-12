/**
 * Document ingestion task - Process and store documents in vector store
 */

import type { Task } from './types';
import { processDocument } from '../lib/rag/document-processor';
import { generateEmbeddings } from '../lib/ai/openai';
import { getVectorStore } from '../lib/rag/vector-store';

export interface IngestionInput {
  content: string;
  filepath: string;
  options?: {
    maxChunkSize?: number;
    minChunkSize?: number;
    overlap?: number;
  };
}

export interface IngestionOutput {
  filepath: string;
  chunksProcessed: number;
  vectorsStored: number;
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

export const ingestionTask: Task<IngestionInput, IngestionOutput> = {
  name: 'ingestion',
  description: 'Process document and store in vector database',

  validate: (input) => {
    if (!input.content || typeof input.content !== 'string') {
      return false;
    }
    if (!input.filepath || typeof input.filepath !== 'string') {
      return false;
    }
    return input.content.trim().length > 0;
  },

  execute: async (input) => {
    console.log(`[ingestionTask] Processing document: ${input.filepath}`);

    const errors: string[] = [];
    let vectorsStored = 0;

    try {
      // 1. Process document into chunks
      const processed = processDocument(
        input.content,
        input.filepath,
        input.options
      );

      console.log(
        `[ingestionTask] Created ${processed.totalChunks} chunks from ${input.filepath}`
      );

      // 2. Generate embeddings for all chunks
      const textsToEmbed = processed.chunks.map((chunk) => chunk.content);
      const embeddings = await generateEmbeddings(textsToEmbed);

      console.log(`[ingestionTask] Generated ${embeddings.length} embeddings`);

      // 3. Store in vector database
      const vectorStore = getVectorStore();

      for (let i = 0; i < processed.chunks.length; i++) {
        const chunk = processed.chunks[i];
        const embedding = embeddings[i];

        try {
          await vectorStore.add(
            chunk.id,
            embedding,
            chunk.content,
            chunk.metadata
          );
          vectorsStored++;
        } catch (error) {
          errors.push(
            `Failed to store chunk ${chunk.id}: ${error.message}`
          );
        }
      }

      const status: 'success' | 'partial' | 'failed' =
        vectorsStored === processed.totalChunks
          ? 'success'
          : vectorsStored > 0
          ? 'partial'
          : 'failed';

      console.log(
        `[ingestionTask] Stored ${vectorsStored}/${processed.totalChunks} vectors (${status})`
      );

      return {
        filepath: input.filepath,
        chunksProcessed: processed.totalChunks,
        vectorsStored,
        status,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error(`[ingestionTask] Error processing ${input.filepath}:`, error);
      throw error;
    }
  },

  retry: {
    maxRetries: 1,
    retryDelay: 5000,
    exponentialBackoff: false,
  },

  timeout: 120000, // 2 minutes
};
