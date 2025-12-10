/**
 * Core data models for textbook generation
 * Based on specs/main/data-model.md
 */

/**
 * Represents a section within a chapter
 */
export interface Section {
  id: string;
  title: string;
  level: number; // 2-4 for H2-H4
  estimatedWords: number;
  learningObjectives: string[];
  keywords: string[];
  includeCodeExample: boolean;
}

/**
 * Represents a chapter in the textbook
 */
export interface ChapterSpec {
  id: string;
  number: number; // 1-6
  title: string;
  filePath: string;
  sections: Section[];
  estimatedWords: number;
  status: 'draft' | 'generated' | 'reviewed' | 'published';
}

/**
 * Template for constructing prompts to Claude API
 */
export interface GenerationPrompt {
  type: 'chapter' | 'section' | 'code-example';
  template: string;
  systemPrompt: string;
  maxTokens: number;
  thinkingTokens: number;
  temperature: number;
}

/**
 * Metadata for generated content (front matter)
 */
export interface ContentMetadata {
  title: string;
  description: string;
  keywords: string[];
  sidebar_position: number;
}

/**
 * Output from Claude API after generation
 */
export interface GeneratedContent {
  markdown: string;
  metadata: ContentMetadata;
  tokensUsed: number;
  thinkingTokens: number;
  generatedAt: Date;
  modelVersion: string;
}

/**
 * Captures failures during generation
 */
export interface GenerationError {
  sectionId: string;
  errorType: 'api_error' | 'validation_error' | 'rate_limit' | 'timeout';
  message: string;
  retryable: boolean;
  originalError?: Error;
  timestamp: Date;
}

/**
 * Aggregates generation outcomes for a chapter
 */
export interface GenerationResult {
  chapterId: string;
  status: 'success' | 'partial' | 'failed';
  sections: Map<string, GeneratedContent>;
  errors: GenerationError[];
  totalTokens: number;
  totalCost: number;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
}

/**
 * Global configuration for content generation
 */
export interface GenerationConfig {
  apiKey: string;
  model: string;
  maxConcurrentRequests: number;
  retryAttempts: number;
  retryDelayMs: number;
  outputDir: string;
  templateDir: string;
  dryRun: boolean;
}

/**
 * Options for generating a single chapter
 */
export interface GenerateOptions {
  chapterId: string;
  config?: Partial<GenerationConfig>;
  preview?: boolean;
  verbose?: boolean;
}

/**
 * Options for validating chapter specifications
 */
export interface ValidateOptions {
  configPath: string;
  verbose?: boolean;
}

/**
 * Validation result for chapter specifications
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalChapters: number;
    totalSections: number;
    estimatedTotalWords: number;
  };
}
