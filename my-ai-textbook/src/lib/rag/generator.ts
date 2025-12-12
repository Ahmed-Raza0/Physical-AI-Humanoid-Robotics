/**
 * RAG Response Generator - Generate answers using LLM with retrieved context
 */

import { generateChatCompletion } from '../ai/openai';
import type { RetrievalResult } from './retriever';

export interface GenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  includeSources?: boolean;
}

export interface GeneratedResponse {
  answer: string;
  sources: Array<{
    title: string;
    source: string;
  }>;
  tokensUsed?: number;
  retrievedChunks: number;
}

/**
 * Default system prompt for the RAG chatbot
 */
const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant for a Physical AI and Humanoid Robotics textbook. Your role is to answer questions based on the provided context from the textbook.

Guidelines:
1. Answer questions accurately using ONLY the information from the provided context
2. If the context doesn't contain enough information, say so clearly
3. Be concise but thorough in your explanations
4. Use technical terms appropriately and explain them when necessary
5. If asked about code, provide clear examples when available in the context
6. Reference specific sections or chapters when relevant
7. For complex topics, break down the explanation into steps
8. If the question is unclear, ask for clarification

Important: Do NOT make up information. If you're unsure or the context doesn't cover the topic, admit it and suggest where the user might find more information.`;

/**
 * Generate an answer using the LLM with retrieved context
 */
export async function generateAnswer(
  query: string,
  retrievalResult: RetrievalResult,
  options: GenerationOptions = {}
): Promise<GeneratedResponse> {
  const {
    model = 'gpt-4-turbo-preview',
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    includeSources = true,
  } = options;

  // Build the user message with context
  const userMessage = buildUserMessage(query, retrievalResult.context);

  console.log('[Generator] Generating response with LLM...');
  console.log(`[Generator] Context length: ${retrievalResult.context.length} chars`);
  console.log(`[Generator] Retrieved chunks: ${retrievalResult.results.length}`);

  try {
    // Call OpenAI API
    const answer = await generateChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      {
        model,
        temperature,
        maxTokens,
      }
    );

    // Optional: Add source citations to the answer
    let finalAnswer = answer;
    if (includeSources && retrievalResult.sources.length > 0) {
      finalAnswer += '\n\n' + formatSources(retrievalResult.sources);
    }

    return {
      answer: finalAnswer,
      sources: retrievalResult.sources,
      retrievedChunks: retrievalResult.results.length,
    };
  } catch (error) {
    console.error('[Generator] Error generating response:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Build the user message with context
 */
function buildUserMessage(query: string, context: string): string {
  return `Context from the textbook:
${context}

---

Question: ${query}

Please answer the question based on the context provided above. If the context doesn't contain enough information to answer fully, please say so.`;
}

/**
 * Format sources for display
 */
function formatSources(sources: Array<{ title: string; source: string }>): string {
  if (sources.length === 0) {
    return '';
  }

  const sourceList = sources
    .map((s, i) => `${i + 1}. ${s.title}`)
    .join('\n');

  return `**Sources:**\n${sourceList}`;
}

/**
 * Generate a follow-up question based on the conversation
 */
export async function generateFollowUpQuestions(
  query: string,
  answer: string,
  count: number = 3
): Promise<string[]> {
  const prompt = `Based on this Q&A pair, suggest ${count} relevant follow-up questions that the user might want to ask:

Q: ${query}
A: ${answer}

Generate ${count} follow-up questions (one per line):`;

  try {
    const response = await generateChatCompletion(
      [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates relevant follow-up questions.',
        },
        { role: 'user', content: prompt },
      ],
      {
        temperature: 0.8,
        maxTokens: 200,
      }
    );

    // Parse questions from response
    const questions = response
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((q) => q.endsWith('?'))
      .slice(0, count);

    return questions;
  } catch (error) {
    console.error('[Generator] Error generating follow-up questions:', error);
    return [];
  }
}

/**
 * Summarize a long text using the LLM
 */
export async function summarizeText(
  text: string,
  maxLength: number = 200
): Promise<string> {
  const prompt = `Summarize the following text in ${maxLength} words or less:

${text}`;

  try {
    const summary = await generateChatCompletion(
      [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise summaries.',
        },
        { role: 'user', content: prompt },
      ],
      {
        temperature: 0.5,
        maxTokens: maxLength * 2, // Rough estimate
      }
    );

    return summary;
  } catch (error) {
    console.error('[Generator] Error summarizing text:', error);
    return text.substring(0, maxLength) + '...';
  }
}

/**
 * Check if a query is relevant to the textbook topics
 */
export async function isRelevantQuery(query: string): Promise<boolean> {
  const prompt = `Is this question related to Physical AI, Humanoid Robotics, ROS 2, or robotics in general? Answer with only "yes" or "no".

Question: ${query}`;

  try {
    const response = await generateChatCompletion(
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.3,
        maxTokens: 10,
      }
    );

    return response.toLowerCase().includes('yes');
  } catch (error) {
    console.error('[Generator] Error checking query relevance:', error);
    return true; // Default to allowing the query
  }
}

/**
 * Rephrase user query for better retrieval
 */
export async function rephraseQuery(query: string): Promise<string> {
  const prompt = `Rephrase this question to be more clear and specific for searching a robotics textbook:

Original: ${query}

Rephrased:`;

  try {
    const rephrased = await generateChatCompletion(
      [
        {
          role: 'system',
          content: 'You rephrase questions to be clearer and more specific.',
        },
        { role: 'user', content: prompt },
      ],
      {
        temperature: 0.5,
        maxTokens: 100,
      }
    );

    return rephrased.trim();
  } catch (error) {
    console.error('[Generator] Error rephrasing query:', error);
    return query; // Fall back to original query
  }
}
