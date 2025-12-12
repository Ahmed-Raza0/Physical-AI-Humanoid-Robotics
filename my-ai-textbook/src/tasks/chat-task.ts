/**
 * Chat completion task - Generate AI chat responses
 */

import type { Task } from './types';
import { generateChatCompletion } from '../lib/ai/openai';

export interface ChatInput {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ChatOutput {
  response: string;
  model: string;
  tokensUsed?: number;
}

export const chatTask: Task<ChatInput, ChatOutput> = {
  name: 'chat',
  description: 'Generate AI chat completion using OpenAI',

  validate: (input) => {
    if (!input.messages || !Array.isArray(input.messages)) {
      return false;
    }
    if (input.messages.length === 0) {
      return false;
    }
    return input.messages.every(
      (msg) =>
        msg.role && msg.content && ['system', 'user', 'assistant'].includes(msg.role)
    );
  },

  execute: async (input) => {
    console.log(`[chatTask] Generating response for ${input.messages.length} messages`);

    const response = await generateChatCompletion(input.messages, input.options);

    return {
      response,
      model: input.options?.model || 'gpt-4-turbo-preview',
    };
  },

  retry: {
    maxRetries: 2,
    retryDelay: 2000,
    exponentialBackoff: true,
  },

  timeout: 60000, // 60 seconds
};
