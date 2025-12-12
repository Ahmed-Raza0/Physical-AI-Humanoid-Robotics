/**
 * RAG Chat API Endpoint
 * POST /api/chat - Send a message and get an AI response with RAG
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { retrieveContext } from '../../lib/rag/retriever';
import { generateAnswer } from '../../lib/rag/generator';

export interface ChatRequest {
  message: string;
  options?: {
    topK?: number;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ChatResponse {
  success: boolean;
  answer?: string;
  sources?: Array<{
    title: string;
    source: string;
  }>;
  retrievedChunks?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    const { message, options } = req.body as ChatRequest;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
    }

    console.log(`[API /chat] Received message: "${message.substring(0, 50)}..."`);

    // 1. Retrieve relevant context
    const retrieval = await retrieveContext(message, {
      topK: options?.topK || 5,
      minScore: 0.5,
    });

    console.log(`[API /chat] Retrieved ${retrieval.results.length} chunks`);

    // 2. Generate answer using LLM with context
    const response = await generateAnswer(message, retrieval, {
      temperature: options?.temperature || 0.7,
      maxTokens: options?.maxTokens || 1000,
      includeSources: true,
    });

    console.log(`[API /chat] Generated answer (${response.answer.length} chars)`);

    // 3. Return response
    return res.status(200).json({
      success: true,
      answer: response.answer,
      sources: response.sources,
      retrievedChunks: response.retrievedChunks,
    });
  } catch (error) {
    console.error('[API /chat] Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

// Configure API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
