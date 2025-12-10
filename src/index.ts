/**
 * Textbook Generator - Public API
 *
 * A library for generating AI-powered textbook content using Claude API
 */

// Core generator
export { Generator, GeneratorOptions } from './generator/Generator';
export { ClaudeClient, ClaudeClientOptions } from './generator/ClaudeClient';
export { PromptBuilder } from './generator/PromptBuilder';
export { ContentValidator } from './generator/ContentValidator';
export { FileWriter } from './generator/FileWriter';

// Types
export {
  ChapterSpec,
  Section,
  GenerationPrompt,
  GeneratedContent,
  GenerationResult,
  GenerationError,
  GenerationConfig,
  GenerateOptions,
  ValidateOptions,
  ValidationResult,
  ContentMetadata,
} from './types/models';

// Utilities
export {
  loadChapter,
  loadChapters,
  findChapterById,
  validateChapters,
  validateUniqueIds,
  validateUniqueFilePaths,
  validateChapterNumbers,
} from './utils/ChapterLoader';

export {
  estimateTokensFromWords,
  estimateWordsFromTokens,
  estimateInputTokensForSection,
  estimateOutputTokensForSection,
  estimateThinkingTokensForSection,
  estimateSectionCost,
  estimateChapterCost,
  estimateTotalCost,
  calculateCost,
  createCostBreakdown,
  formatCost,
  formatTokens,
  MODEL_PRICING,
  ModelPricing,
  CostBreakdown,
} from './utils/CostEstimator';

// Errors
export {
  GeneratorError,
  APIError,
  RateLimitError,
  ValidationError,
  FileOperationError,
  TimeoutError,
  ConfigurationError,
  TemplateError,
  isRetryableError,
  getErrorMessage,
  toGenerationError,
} from './generator/errors';

// Schemas (for runtime validation)
export {
  ChapterSpecSchema,
  SectionSchema,
  GeneratedContentSchema,
  GenerationPromptSchema,
  GenerationConfigSchema,
  ChaptersConfigSchema,
  ValidationResultSchema,
} from './types/schemas';
