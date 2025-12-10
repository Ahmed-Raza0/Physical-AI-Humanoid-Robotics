/**
 * Zod schemas for runtime validation
 * Based on specs/main/data-model.md validation rules
 */

import { z } from 'zod';

/**
 * Schema for Section validation
 */
export const SectionSchema = z.object({
  id: z.string().min(1, 'Section ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must not exceed 100 characters'),
  level: z.number().int().min(2, 'Level must be at least 2 (H2)').max(4, 'Level must not exceed 4 (H4)'),
  estimatedWords: z.number().int().min(100, 'Estimated words must be at least 100').max(1500, 'Estimated words must not exceed 1500').default(400),
  learningObjectives: z.array(z.string()).min(1, 'At least one learning objective is required').max(5, 'Maximum 5 learning objectives allowed'),
  keywords: z.array(z.string()).max(10, 'Maximum 10 keywords allowed').default([]),
  includeCodeExample: z.boolean().default(false),
});

/**
 * Schema for ChapterSpec validation
 */
export const ChapterSpecSchema = z.object({
  id: z.string().regex(/^chapter\d+-[\w-]+$/, 'Chapter ID must match pattern: chapter{number}-{slug}'),
  number: z.number().int().min(1, 'Chapter number must be at least 1').max(6, 'Chapter number must not exceed 6'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must not exceed 100 characters'),
  filePath: z.string().min(1, 'File path is required'),
  sections: z.array(SectionSchema).min(1, 'At least one section is required'),
  estimatedWords: z.number().int().min(500, 'Estimated words must be at least 500').max(5000, 'Estimated words must not exceed 5000').default(2500),
  status: z.enum(['draft', 'generated', 'reviewed', 'published']).default('draft'),
});

/**
 * Schema for ContentMetadata validation
 */
export const ContentMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  keywords: z.array(z.string()),
  sidebar_position: z.number().int().positive('Sidebar position must be positive'),
});

/**
 * Schema for GeneratedContent validation
 */
export const GeneratedContentSchema = z.object({
  markdown: z.string().min(100, 'Markdown content must be at least 100 characters'),
  metadata: ContentMetadataSchema,
  tokensUsed: z.number().int().positive('Tokens used must be positive'),
  thinkingTokens: z.number().int().nonnegative('Thinking tokens must be non-negative'),
  generatedAt: z.date(),
  modelVersion: z.string().min(1, 'Model version is required'),
});

/**
 * Schema for GenerationPrompt validation
 */
export const GenerationPromptSchema = z.object({
  type: z.enum(['chapter', 'section', 'code-example']),
  template: z.string().min(1, 'Template is required'),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  maxTokens: z.number().int().min(1000, 'Max tokens must be at least 1000').max(200000, 'Max tokens must not exceed 200000').default(16000),
  thinkingTokens: z.number().int().min(0, 'Thinking tokens must be non-negative').max(10000, 'Thinking tokens must not exceed 10000').default(10000),
  temperature: z.number().min(0.0, 'Temperature must be at least 0.0').max(1.0, 'Temperature must not exceed 1.0').default(0.7),
});

/**
 * Schema for GenerationError validation
 */
export const GenerationErrorSchema = z.object({
  sectionId: z.string(),
  errorType: z.enum(['api_error', 'validation_error', 'rate_limit', 'timeout']),
  message: z.string().min(1, 'Error message is required'),
  retryable: z.boolean(),
  originalError: z.instanceof(Error).optional(),
  timestamp: z.date(),
});

/**
 * Schema for GenerationResult validation
 */
export const GenerationResultSchema = z.object({
  chapterId: z.string(),
  status: z.enum(['success', 'partial', 'failed']),
  sections: z.instanceof(Map<string, z.infer<typeof GeneratedContentSchema>>),
  errors: z.array(GenerationErrorSchema),
  totalTokens: z.number().int().nonnegative('Total tokens must be non-negative'),
  totalCost: z.number().nonnegative('Total cost must be non-negative'),
  startedAt: z.date(),
  completedAt: z.date(),
  durationMs: z.number().positive('Duration must be positive'),
}).refine(
  (data) => {
    if (data.status === 'success') {
      return data.sections.size > 0 && data.errors.length === 0;
    }
    if (data.status === 'partial') {
      return data.sections.size > 0;
    }
    if (data.status === 'failed') {
      return data.errors.length > 0;
    }
    return true;
  },
  {
    message: 'Generation result status must match sections and errors',
  }
);

/**
 * Schema for GenerationConfig validation
 */
export const GenerationConfigSchema = z.object({
  apiKey: z.string().startsWith('sk-ant-', 'API key must start with sk-ant-'),
  model: z.string().min(1, 'Model name is required'),
  maxConcurrentRequests: z.number().int().min(1, 'Max concurrent requests must be at least 1').max(10, 'Max concurrent requests must not exceed 10').default(5),
  retryAttempts: z.number().int().min(0, 'Retry attempts must be non-negative').max(5, 'Retry attempts must not exceed 5').default(3),
  retryDelayMs: z.number().int().positive('Retry delay must be positive').default(1000),
  outputDir: z.string().min(1, 'Output directory is required'),
  templateDir: z.string().min(1, 'Template directory is required'),
  dryRun: z.boolean().default(false),
});

/**
 * Schema for chapter configuration file (chapters.json)
 */
export const ChaptersConfigSchema = z.object({
  chapters: z.array(ChapterSpecSchema),
  metadata: z.object({
    title: z.string().optional(),
    version: z.string().optional(),
    updatedAt: z.string().optional(),
  }).optional(),
});

/**
 * Schema for ValidationResult
 */
export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  stats: z.object({
    totalChapters: z.number().int().nonnegative(),
    totalSections: z.number().int().nonnegative(),
    estimatedTotalWords: z.number().int().nonnegative(),
  }),
});

/**
 * Type inference helpers
 */
export type SectionSchemaType = z.infer<typeof SectionSchema>;
export type ChapterSpecSchemaType = z.infer<typeof ChapterSpecSchema>;
export type GeneratedContentSchemaType = z.infer<typeof GeneratedContentSchema>;
export type GenerationConfigSchemaType = z.infer<typeof GenerationConfigSchema>;
export type ChaptersConfigSchemaType = z.infer<typeof ChaptersConfigSchema>;
export type ValidationResultSchemaType = z.infer<typeof ValidationResultSchema>;
