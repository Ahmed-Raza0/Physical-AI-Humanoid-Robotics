/**
 * Utility for estimating API costs based on token usage
 * Pricing based on Claude API pricing as of 2025
 */

import { ChapterSpec, Section } from '../types/models';

/**
 * Pricing structure for Claude models (USD per million tokens)
 * Based on Anthropic API pricing as of January 2025
 */
export interface ModelPricing {
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  thinkingCostPerMillion: number;
}

/**
 * Known Claude model pricing
 * Updated: January 2025
 */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-sonnet-4-20250514': {
    inputCostPerMillion: 3.0,
    outputCostPerMillion: 15.0,
    thinkingCostPerMillion: 3.0,
  },
  'claude-opus-4-20250514': {
    inputCostPerMillion: 15.0,
    outputCostPerMillion: 75.0,
    thinkingCostPerMillion: 15.0,
  },
  'claude-haiku-4-20250514': {
    inputCostPerMillion: 0.8,
    outputCostPerMillion: 4.0,
    thinkingCostPerMillion: 0.8,
  },
  // Fallback for unknown models (use Sonnet pricing)
  default: {
    inputCostPerMillion: 3.0,
    outputCostPerMillion: 15.0,
    thinkingCostPerMillion: 3.0,
  },
};

/**
 * Estimates token count based on word count
 * Rule of thumb: 1 token ≈ 0.75 words (English text)
 */
export function estimateTokensFromWords(wordCount: number): number {
  return Math.ceil(wordCount / 0.75);
}

/**
 * Estimates word count from token count
 */
export function estimateWordsFromTokens(tokenCount: number): number {
  return Math.floor(tokenCount * 0.75);
}

/**
 * Estimates input tokens for a section generation prompt
 * Includes system prompt, section metadata, and context
 */
export function estimateInputTokensForSection(section: Section): number {
  // System prompt: ~500 tokens
  const systemPromptTokens = 500;

  // Section metadata (title, objectives, keywords): ~100 tokens
  const metadataTokens = 100;

  // Learning objectives: ~50 tokens each
  const objectivesTokens = section.learningObjectives.length * 50;

  // Keywords: ~10 tokens each
  const keywordsTokens = section.keywords.length * 10;

  return systemPromptTokens + metadataTokens + objectivesTokens + keywordsTokens;
}

/**
 * Estimates output tokens for a section
 * Based on estimated word count
 */
export function estimateOutputTokensForSection(section: Section): number {
  return estimateTokensFromWords(section.estimatedWords);
}

/**
 * Estimates thinking tokens for a section
 * Typically a fixed budget per section
 */
export function estimateThinkingTokensForSection(_section: Section): number {
  // Default thinking budget: 5000 tokens per section
  return 5000;
}

/**
 * Calculates cost for a given token usage
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  thinkingTokens: number,
  model: string
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING.default;

  const inputCost = (inputTokens / 1_000_000) * pricing.inputCostPerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputCostPerMillion;
  const thinkingCost =
    (thinkingTokens / 1_000_000) * pricing.thinkingCostPerMillion;

  return inputCost + outputCost + thinkingCost;
}

/**
 * Estimates cost for generating a single section
 */
export function estimateSectionCost(section: Section, model: string): number {
  const inputTokens = estimateInputTokensForSection(section);
  const outputTokens = estimateOutputTokensForSection(section);
  const thinkingTokens = estimateThinkingTokensForSection(section);

  return calculateCost(inputTokens, outputTokens, thinkingTokens, model);
}

/**
 * Estimates cost for generating an entire chapter
 */
export function estimateChapterCost(
  chapter: ChapterSpec,
  model: string
): number {
  return chapter.sections.reduce(
    (total, section) => total + estimateSectionCost(section, model),
    0
  );
}

/**
 * Estimates cost for generating multiple chapters
 */
export function estimateTotalCost(
  chapters: ChapterSpec[],
  model: string
): number {
  return chapters.reduce(
    (total, chapter) => total + estimateChapterCost(chapter, model),
    0
  );
}

/**
 * Generates a cost breakdown for a chapter
 */
export interface CostBreakdown {
  chapterId: string;
  sections: {
    sectionId: string;
    inputTokens: number;
    outputTokens: number;
    thinkingTokens: number;
    totalTokens: number;
    cost: number;
  }[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalThinkingTokens: number;
  totalTokens: number;
  totalCost: number;
}

/**
 * Creates a detailed cost breakdown for a chapter
 */
export function createCostBreakdown(
  chapter: ChapterSpec,
  model: string
): CostBreakdown {
  const sections = chapter.sections.map((section) => {
    const inputTokens = estimateInputTokensForSection(section);
    const outputTokens = estimateOutputTokensForSection(section);
    const thinkingTokens = estimateThinkingTokensForSection(section);
    const totalTokens = inputTokens + outputTokens + thinkingTokens;
    const cost = calculateCost(inputTokens, outputTokens, thinkingTokens, model);

    return {
      sectionId: section.id,
      inputTokens,
      outputTokens,
      thinkingTokens,
      totalTokens,
      cost,
    };
  });

  const totalInputTokens = sections.reduce(
    (sum, s) => sum + s.inputTokens,
    0
  );
  const totalOutputTokens = sections.reduce(
    (sum, s) => sum + s.outputTokens,
    0
  );
  const totalThinkingTokens = sections.reduce(
    (sum, s) => sum + s.thinkingTokens,
    0
  );
  const totalTokens =
    totalInputTokens + totalOutputTokens + totalThinkingTokens;
  const totalCost = sections.reduce((sum, s) => sum + s.cost, 0);

  return {
    chapterId: chapter.id,
    sections,
    totalInputTokens,
    totalOutputTokens,
    totalThinkingTokens,
    totalTokens,
    totalCost,
  };
}

/**
 * Formats cost as USD string
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}

/**
 * Formats token count with commas
 */
export function formatTokens(tokens: number): string {
  return tokens.toLocaleString();
}
