# Library API Contract

**Feature**: textbook-generation
**Date**: 2025-12-10

## Overview

TypeScript/Node.js library for programmatic content generation. Supports standalone usage or integration into other tools.

## Core Modules

### 1. Generator

Main orchestrator for content generation.

**Module**: `src/generator/Generator.ts`

**Interface**:
```typescript
interface GeneratorConfig {
  apiKey: string;
  model?: string;
  maxConcurrentRequests?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
  outputDir?: string;
  templateDir?: string;
  dryRun?: boolean;
  onProgress?: (event: ProgressEvent) => void;
}

interface ProgressEvent {
  type: 'chapter_start' | 'section_start' | 'section_complete' | 'chapter_complete' | 'error';
  chapterId: string;
  sectionId?: string;
  progress?: { current: number; total: number };
  data?: GeneratedContent | GenerationError;
}

class Generator {
  constructor(config: GeneratorConfig);

  // Generate single chapter
  async generateChapter(spec: ChapterSpec): Promise<GenerationResult>;

  // Generate multiple chapters with concurrency control
  async generateChapters(specs: ChapterSpec[]): Promise<GenerationResult[]>;

  // Generate single section (for granular control)
  async generateSection(
    chapterContext: ChapterSpec,
    section: Section
  ): Promise<GeneratedContent>;

  // Validate configuration
  validateConfig(): ValidationResult;

  // Estimate cost before generation
  estimateCost(specs: ChapterSpec[]): CostEstimate;
}
```

**Usage Example**:
```typescript
import { Generator, ChapterSpec } from 'textbook-generator';

const generator = new Generator({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-20250514',
  maxConcurrentRequests: 5,
  retryAttempts: 3,
  outputDir: 'my-ai-textbook/docs',
  onProgress: (event) => {
    console.log(`[${event.type}] ${event.chapterId}`);
  }
});

const chapter: ChapterSpec = {
  id: 'chapter1-introduction',
  number: 1,
  title: 'Introduction to Physical AI',
  filePath: 'my-ai-textbook/docs/chapter1-introduction.md',
  sections: [
    {
      id: 'what-is-physical-ai',
      title: 'What is Physical AI?',
      level: 2,
      estimatedWords: 400,
      learningObjectives: ['Define Physical AI'],
      keywords: ['embodied AI', 'robotics'],
      includeCodeExample: false
    }
  ],
  estimatedWords: 2500,
  status: 'draft'
};

const result = await generator.generateChapter(chapter);

if (result.status === 'success') {
  console.log(`Generated ${result.totalTokens} tokens`);
  console.log(`Estimated cost: $${result.totalCost}`);
} else {
  console.error('Generation failed:', result.errors);
}
```

**Error Handling**:
```typescript
try {
  const result = await generator.generateChapter(chapter);
} catch (error) {
  if (error instanceof APIError) {
    console.error('API error:', error.message);
    console.error('Status:', error.statusCode);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.issues);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited, retry after:', error.retryAfter);
  } else {
    throw error;
  }
}
```

### 2. PromptBuilder

Constructs prompts for Claude API from templates and data.

**Module**: `src/generator/PromptBuilder.ts`

**Interface**:
```typescript
interface PromptTemplate {
  type: 'chapter' | 'section' | 'code-example';
  template: string;
  systemPrompt: string;
  maxTokens: number;
  thinkingTokens: number;
  temperature: number;
}

class PromptBuilder {
  constructor(templateDir: string);

  // Load template by type
  loadTemplate(type: PromptTemplate['type']): PromptTemplate;

  // Build prompt for section generation
  buildSectionPrompt(
    chapterContext: ChapterSpec,
    section: Section
  ): {
    system: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    maxTokens: number;
    thinkingTokens: number;
    temperature: number;
  };

  // Build prompt for code example
  buildCodeExamplePrompt(
    context: string,
    language: string,
    requirements: string[]
  ): { system: string; messages: any[]; };
}
```

**Usage Example**:
```typescript
import { PromptBuilder } from 'textbook-generator';

const builder = new PromptBuilder('src/templates');
const template = builder.loadTemplate('section');

const prompt = builder.buildSectionPrompt(chapterSpec, section);

// prompt.system: "You are an expert technical writer..."
// prompt.messages: [{ role: 'user', content: '...' }]
// prompt.maxTokens: 16000
```

### 3. ContentValidator

Validates generated markdown content.

**Module**: `src/generator/ContentValidator.ts`

**Interface**:
```typescript
interface ValidationIssue {
  severity: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
  rule: string;
}

interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

class ContentValidator {
  // Validate markdown structure
  validateMarkdown(content: string): ValidationResult;

  // Validate code blocks (syntax check)
  validateCodeBlocks(content: string): ValidationResult;

  // Validate front matter
  validateFrontMatter(metadata: Record<string, any>): ValidationResult;

  // Validate against schema
  validateGenerated(content: GeneratedContent): ValidationResult;

  // Check for common issues
  checkLinks(content: string): ValidationResult;
  checkHeadings(content: string): ValidationResult;
}
```

**Usage Example**:
```typescript
import { ContentValidator } from 'textbook-generator';

const validator = new ContentValidator();

const markdownResult = validator.validateMarkdown(generated.markdown);
if (!markdownResult.valid) {
  console.error('Markdown validation failed:');
  markdownResult.issues.forEach(issue => {
    console.error(`  ${issue.severity}: ${issue.message} (${issue.rule})`);
  });
}

const codeResult = validator.validateCodeBlocks(generated.markdown);
if (!codeResult.valid) {
  console.warn('Code block issues found:');
  codeResult.issues.forEach(issue => {
    console.warn(`  Line ${issue.line}: ${issue.message}`);
  });
}
```

### 4. ClaudeClient

Wrapper for Anthropic SDK with retry logic and rate limiting.

**Module**: `src/generator/ClaudeClient.ts`

**Interface**:
```typescript
interface ClaudeClientConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
  retryDelayMs: number;
  maxConcurrentRequests: number;
}

interface ClaudeRequest {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens: number;
  thinkingTokens?: number;
  temperature?: number;
}

interface ClaudeResponse {
  content: string;
  tokensUsed: number;
  thinkingTokens: number;
  modelVersion: string;
  stopReason: 'end_turn' | 'max_tokens' | 'stop_sequence';
}

class ClaudeClient {
  constructor(config: ClaudeClientConfig);

  // Send request with automatic retry
  async generate(request: ClaudeRequest): Promise<ClaudeResponse>;

  // Send request with streaming
  async generateStream(
    request: ClaudeRequest,
    onChunk: (chunk: string) => void
  ): Promise<ClaudeResponse>;

  // Check API key validity
  async validateApiKey(): Promise<boolean>;

  // Get current rate limit status
  getRateLimitStatus(): {
    remaining: number;
    resetAt: Date;
  };
}
```

**Usage Example**:
```typescript
import { ClaudeClient } from 'textbook-generator';

const client = new ClaudeClient({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-20250514',
  maxRetries: 3,
  retryDelayMs: 1000,
  maxConcurrentRequests: 5
});

// Validate API key before use
const isValid = await client.validateApiKey();
if (!isValid) {
  throw new Error('Invalid API key');
}

// Generate content
const response = await client.generate({
  system: 'You are an expert technical writer.',
  messages: [{ role: 'user', content: 'Write about Physical AI.' }],
  maxTokens: 16000,
  thinkingTokens: 10000,
  temperature: 0.7
});

console.log(`Generated ${response.tokensUsed} tokens`);
console.log(response.content);
```

**Streaming Example**:
```typescript
let fullContent = '';

await client.generateStream(
  {
    system: 'You are an expert technical writer.',
    messages: [{ role: 'user', content: 'Write about Physical AI.' }],
    maxTokens: 16000
  },
  (chunk) => {
    fullContent += chunk;
    process.stdout.write(chunk); // Live output
  }
);

console.log('\nGeneration complete!');
```

### 5. FileWriter

Handles writing generated content to filesystem with safety checks.

**Module**: `src/generator/FileWriter.ts`

**Interface**:
```typescript
interface WriteOptions {
  overwrite?: boolean;
  createBackup?: boolean;
  dryRun?: boolean;
}

interface WriteResult {
  success: boolean;
  filePath: string;
  backupPath?: string;
  bytesWritten: number;
}

class FileWriter {
  constructor(outputDir: string);

  // Write chapter to file
  async writeChapter(
    chapterId: string,
    content: GeneratedContent,
    options?: WriteOptions
  ): Promise<WriteResult>;

  // Write multiple chapters
  async writeChapters(
    results: Map<string, GeneratedContent>,
    options?: WriteOptions
  ): Promise<WriteResult[]>;

  // Create backup of existing file
  async createBackup(filePath: string): Promise<string>;

  // Restore from backup
  async restoreBackup(backupPath: string): Promise<void>;
}
```

**Usage Example**:
```typescript
import { FileWriter } from 'textbook-generator';

const writer = new FileWriter('my-ai-textbook/docs');

const result = await writer.writeChapter(
  'chapter1-introduction',
  generatedContent,
  {
    overwrite: false,
    createBackup: true,
    dryRun: false
  }
);

if (result.success) {
  console.log(`Written to ${result.filePath}`);
  if (result.backupPath) {
    console.log(`Backup created at ${result.backupPath}`);
  }
} else {
  console.error('Write failed');
}
```

## Error Classes

**Module**: `src/generator/errors.ts`

```typescript
// Base error
class GeneratorError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'GeneratorError';
  }
}

// API-related errors
class APIError extends GeneratorError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: any
  ) {
    super(message, 'API_ERROR');
  }
}

class RateLimitError extends APIError {
  constructor(
    message: string,
    public readonly retryAfter: Date
  ) {
    super(message, 429);
    this.code = 'RATE_LIMIT';
  }
}

class AuthenticationError extends APIError {
  constructor(message: string) {
    super(message, 401);
    this.code = 'AUTH_ERROR';
  }
}

// Validation errors
class ValidationError extends GeneratorError {
  constructor(
    message: string,
    public readonly issues: ValidationIssue[]
  ) {
    super(message, 'VALIDATION_ERROR');
  }
}

// File I/O errors
class FileWriteError extends GeneratorError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly originalError: Error
  ) {
    super(message, 'FILE_WRITE_ERROR');
  }
}
```

## Utilities

### ChapterLoader

**Module**: `src/utils/ChapterLoader.ts`

```typescript
class ChapterLoader {
  // Load chapter specs from JSON file
  static async loadFromFile(filePath: string): Promise<ChapterSpec[]>;

  // Load chapter specs from directory (auto-discover)
  static async loadFromDirectory(dir: string): Promise<ChapterSpec[]>;

  // Parse chapter spec from object
  static parse(data: unknown): ChapterSpec;
}
```

### CostEstimator

**Module**: `src/utils/CostEstimator.ts`

```typescript
interface CostEstimate {
  estimatedTokens: number;
  estimatedCost: number;
  breakdown: Array<{
    chapterId: string;
    tokens: number;
    cost: number;
  }>;
}

class CostEstimator {
  // Estimate tokens based on word count
  static estimateTokens(words: number): number;

  // Calculate cost based on tokens
  static calculateCost(tokens: number, model: string): number;

  // Estimate total cost for chapters
  static estimateChaptersCost(specs: ChapterSpec[]): CostEstimate;
}
```

## Type Exports

**Module**: `src/index.ts`

```typescript
// Main exports
export { Generator, GeneratorConfig, ProgressEvent } from './generator/Generator';
export { PromptBuilder, PromptTemplate } from './generator/PromptBuilder';
export { ContentValidator, ValidationResult, ValidationIssue } from './generator/ContentValidator';
export { ClaudeClient, ClaudeClientConfig, ClaudeRequest, ClaudeResponse } from './generator/ClaudeClient';
export { FileWriter, WriteOptions, WriteResult } from './generator/FileWriter';

// Data model exports
export type {
  ChapterSpec,
  Section,
  GenerationPrompt,
  GeneratedContent,
  GenerationResult,
  GenerationError,
  GenerationConfig
} from './types/models';

// Error exports
export {
  GeneratorError,
  APIError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  FileWriteError
} from './generator/errors';

// Utility exports
export { ChapterLoader } from './utils/ChapterLoader';
export { CostEstimator, CostEstimate } from './utils/CostEstimator';
```

## Testing Interfaces

**Module**: `src/testing/mocks.ts`

```typescript
// Mock Claude client for testing
class MockClaudeClient extends ClaudeClient {
  constructor(responses: Map<string, ClaudeResponse>);

  // Override to return predefined responses
  async generate(request: ClaudeRequest): Promise<ClaudeResponse>;
}

// Test helper to create chapter specs
function createTestChapterSpec(overrides?: Partial<ChapterSpec>): ChapterSpec;

// Test helper to create mock responses
function createMockResponse(content: string, tokens?: number): ClaudeResponse;
```

## Package.json Scripts

```json
{
  "scripts": {
    "generate": "node dist/cli/index.js generate",
    "validate": "node dist/cli/index.js validate",
    "preview": "node dist/cli/index.js preview",
    "init": "node dist/cli/index.js init",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```
