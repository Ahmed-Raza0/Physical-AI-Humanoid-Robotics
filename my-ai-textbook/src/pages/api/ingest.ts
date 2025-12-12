/**
 * Document Ingestion API Endpoint
 * POST /api/ingest - Trigger document ingestion from docs folder
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { taskRunner } from '../../tasks/TaskRunner';
import { ingestionTask } from '../../tasks/ingestion-task';
import { getVectorStore } from '../../lib/rag/vector-store';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface IngestRequest {
  action: 'ingest' | 'clear' | 'stats';
  filepath?: string; // Optional: ingest specific file
}

export interface IngestResponse {
  success: boolean;
  message?: string;
  stats?: {
    filesProcessed?: number;
    chunksProcessed?: number;
    vectorsStored?: number;
    totalVectors?: number;
    dimensions?: number;
    memoryUsageMB?: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IngestResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    const { action, filepath } = req.body as IngestRequest;

    const vectorStore = getVectorStore();

    // Handle different actions
    switch (action) {
      case 'clear':
        await vectorStore.clear();
        return res.status(200).json({
          success: true,
          message: 'Vector store cleared successfully',
          stats: vectorStore.getStats(),
        });

      case 'stats':
        return res.status(200).json({
          success: true,
          stats: vectorStore.getStats(),
        });

      case 'ingest':
        console.log('[API /ingest] Starting document ingestion...');

        const docsPath = path.join(process.cwd(), 'docs');

        // Get all markdown files
        const files = filepath
          ? [filepath]
          : await getMarkdownFiles(docsPath);

        console.log(`[API /ingest] Found ${files.length} markdown files`);

        let totalChunks = 0;
        let totalVectors = 0;
        const results = [];

        // Process each file
        for (const file of files) {
          try {
            const fullPath = filepath || path.join(docsPath, file);
            const content = await fs.readFile(fullPath, 'utf-8');

            // Run ingestion task
            const result = await taskRunner.executeTask(
              ingestionTask,
              {
                content,
                filepath: file,
              }
            );

            if (result.success && result.data) {
              totalChunks += result.data.chunksProcessed;
              totalVectors += result.data.vectorsStored;
              results.push(result.data);
            }

            console.log(
              `[API /ingest] Processed ${file}: ${result.data?.chunksProcessed} chunks`
            );
          } catch (error) {
            console.error(`[API /ingest] Error processing ${file}:`, error);
            results.push({
              filepath: file,
              status: 'failed',
              error: error.message,
            });
          }
        }

        const stats = vectorStore.getStats();

        console.log('[API /ingest] Ingestion complete');
        console.log(`[API /ingest] Total chunks: ${totalChunks}`);
        console.log(`[API /ingest] Total vectors: ${totalVectors}`);

        return res.status(200).json({
          success: true,
          message: `Successfully ingested ${files.length} documents`,
          stats: {
            filesProcessed: files.length,
            chunksProcessed: totalChunks,
            vectorsStored: totalVectors,
            ...stats,
          },
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use "ingest", "clear", or "stats"',
        });
    }
  } catch (error) {
    console.error('[API /ingest] Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * Recursively get all markdown files from a directory
 */
async function getMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string, baseDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath, baseDir);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relativePath = path.relative(baseDir, fullPath);
        files.push(relativePath);
      }
    }
  }

  await walk(dir, dir);
  return files;
}

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
