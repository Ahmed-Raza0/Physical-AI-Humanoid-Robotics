# Data Model: Textbook Generation

**Feature**: textbook-generation
**Date**: 2025-12-10

## Core Entities

### 1. ChapterSpec

Represents a chapter in the textbook with metadata for generation.

**Fields**:
- `id`: string (e.g., "chapter1-introduction")
- `number`: number (1-6)
- `title`: string (e.g., "Introduction to Physical AI")
- `filePath`: string (absolute path to markdown file)
- `sections`: Section[] (ordered list of sections)
- `estimatedWords`: number (target word count, default 2000-3000)
- `status`: "draft" | "generated" | "reviewed" | "published"

**Validation**:
- `id` must match pattern `^chapter\d+-[\w-]+$`
- `number` must be 1-6
- `title` must be 3-100 characters
- `estimatedWords` must be 500-5000
- `sections` must have at least 1 section

**Relationships**:
- Has many `Section`
- References `GenerationResult` when generated

### 2. Section

Represents a logical section within a chapter.

**Fields**:
- `id`: string (e.g., "intro-what-is-physical-ai")
- `title`: string (e.g., "What is Physical AI?")
- `level`: number (2-4, for heading level H2-H4)
- `estimatedWords`: number (target word count, default 300-500)
- `learningObjectives`: string[] (what reader should learn)
- `keywords`: string[] (key terms to cover)
- `includeCodeExample`: boolean (whether to include code)

**Validation**:
- `title` must be 3-100 characters
- `level` must be 2-4 (H1 reserved for chapter title)
- `estimatedWords` must be 100-1500
- `learningObjectives` must have 1-5 items
- `keywords` must have 0-10 items

**Relationships**:
- Belongs to one `ChapterSpec`
- References `GeneratedContent` when generated

### 3. GenerationPrompt

Template for constructing prompts to Claude API.

**Fields**:
- `type`: "chapter" | "section" | "code-example"
- `template`: string (prompt template with placeholders)
- `systemPrompt`: string (system message for Claude)
- `maxTokens`: number (max response tokens, default 16000)
- `thinkingTokens`: number (extended thinking budget, default 10000)
- `temperature`: number (0.0-1.0, default 0.7)

**Validation**:
- `template` must contain required placeholders based on `type`
- `maxTokens` must be 1000-200000
- `thinkingTokens` must be 0-10000
- `temperature` must be 0.0-1.0

**State Transitions**:
- Constructed from template + data
- Sent to Claude API
- Response parsed into `GeneratedContent`

### 4. GeneratedContent

Output from Claude API after generation.

**Fields**:
- `markdown`: string (generated markdown content)
- `metadata`: object (front matter data)
  - `title`: string
  - `description`: string
  - `keywords`: string[]
  - `sidebar_position`: number
- `tokensUsed`: number (total tokens consumed)
- `thinkingTokens`: number (extended thinking tokens used)
- `generatedAt`: Date (ISO timestamp)
- `modelVersion`: string (e.g., "claude-sonnet-4-20250514")

**Validation**:
- `markdown` must be valid markdown (no unclosed code blocks)
- `markdown` must contain at least one heading
- `markdown` code blocks must have language specified
- `tokensUsed` must be > 0
- `modelVersion` must match known Claude models

**Relationships**:
- Belongs to one `Section` or `ChapterSpec`
- Stored in `GenerationResult`

### 5. GenerationResult

Aggregates generation outcomes for a chapter.

**Fields**:
- `chapterId`: string (references ChapterSpec)
- `status`: "success" | "partial" | "failed"
- `sections`: Map<string, GeneratedContent> (section ID -> content)
- `errors`: GenerationError[] (any failures)
- `totalTokens`: number (sum across all sections)
- `totalCost`: number (estimated USD cost)
- `startedAt`: Date
- `completedAt`: Date
- `durationMs`: number

**Validation**:
- `status` = "success" requires all sections present
- `status` = "partial" requires at least one section
- `status` = "failed" requires non-empty `errors`
- `totalTokens` must equal sum of section tokens
- `durationMs` must be > 0

**State Transitions**:
1. Initialize with `status: "pending"`
2. Update to `status: "success" | "partial" | "failed"` after generation
3. Persist to filesystem or report to user

### 6. GenerationError

Captures failures during generation.

**Fields**:
- `sectionId`: string (which section failed)
- `errorType`: "api_error" | "validation_error" | "rate_limit" | "timeout"
- `message`: string (human-readable error)
- `retryable`: boolean (can retry this operation)
- `originalError`: Error (underlying exception)
- `timestamp`: Date

**Validation**:
- `message` must be non-empty
- `errorType` must be one of known types

### 7. GenerationConfig

Global configuration for content generation.

**Fields**:
- `apiKey`: string (Claude API key from env)
- `model`: string (default "claude-sonnet-4-20250514")
- `maxConcurrentRequests`: number (rate limiting, default 5)
- `retryAttempts`: number (default 3)
- `retryDelayMs`: number (exponential backoff base, default 1000)
- `outputDir`: string (path to docs/, default "my-ai-textbook/docs")
- `templateDir`: string (path to prompt templates)
- `dryRun`: boolean (generate but don't write files, default false)

**Validation**:
- `apiKey` must start with "sk-ant-"
- `model` must be known Claude model
- `maxConcurrentRequests` must be 1-10
- `retryAttempts` must be 0-5
- `outputDir` must exist
- `templateDir` must exist

## Data Flow

```
1. Load ChapterSpec (from config or file)
   ↓
2. For each Section in chapter:
   ↓
3. Construct GenerationPrompt from template + section data
   ↓
4. Send to Claude API (with rate limiting)
   ↓
5. Receive GeneratedContent
   ↓
6. Validate markdown structure
   ↓
7. Add to GenerationResult
   ↓
8. Write to filesystem (docs/chapterN-*.md)
   ↓
9. Return GenerationResult to caller
```

## Persistence

### File Storage
- Generated content: `my-ai-textbook/docs/chapter*.md`
- Generation logs: `my-ai-textbook/logs/generation-YYYY-MM-DD.json`
- Prompt templates: `src/templates/*.md`
- Chapter specs: `src/config/chapters.json`

### Schema Validation

Use Zod schemas for runtime validation:

```typescript
// ChapterSpecSchema
const ChapterSpecSchema = z.object({
  id: z.string().regex(/^chapter\d+-[\w-]+$/),
  number: z.number().int().min(1).max(6),
  title: z.string().min(3).max(100),
  filePath: z.string(),
  sections: z.array(SectionSchema).min(1),
  estimatedWords: z.number().int().min(500).max(5000).default(2500),
  status: z.enum(["draft", "generated", "reviewed", "published"]),
});

// SectionSchema
const SectionSchema = z.object({
  id: z.string(),
  title: z.string().min(3).max(100),
  level: z.number().int().min(2).max(4),
  estimatedWords: z.number().int().min(100).max(1500).default(400),
  learningObjectives: z.array(z.string()).min(1).max(5),
  keywords: z.array(z.string()).max(10).default([]),
  includeCodeExample: z.boolean().default(false),
});

// GeneratedContentSchema
const GeneratedContentSchema = z.object({
  markdown: z.string().min(100),
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    sidebar_position: z.number().int(),
  }),
  tokensUsed: z.number().int().positive(),
  thinkingTokens: z.number().int().nonnegative(),
  generatedAt: z.date(),
  modelVersion: z.string(),
});
```

## Security Constraints

### Input Validation
- All user-provided chapter/section data must be validated against schemas
- File paths must be sanitized to prevent directory traversal
- No user input allowed in prompt templates (prevents injection)

### Output Validation
- Generated markdown must pass syntax validation
- Code blocks must be syntactically valid (use language-specific parsers)
- Links must be relative or HTTPS (no javascript: or file: protocols)

### API Key Protection
- API key stored in environment variable (`ANTHROPIC_API_KEY`)
- Never log full API key (only last 4 chars)
- Validate key format before API calls

## Error Recovery

### Retry Strategy
- Rate limit errors (429): Exponential backoff 1s, 2s, 4s, 8s
- Timeout errors: Retry up to 3 times with same delay
- API errors (500): Retry up to 2 times
- Validation errors: No retry, log and continue

### Partial Success Handling
- If 4/6 sections generate successfully, save partial result
- Mark chapter status as "partial"
- Report which sections failed for manual retry

## Example Data

### Chapter Spec Example
```json
{
  "id": "chapter1-introduction",
  "number": 1,
  "title": "Introduction to Physical AI",
  "filePath": "my-ai-textbook/docs/chapter1-introduction.md",
  "sections": [
    {
      "id": "what-is-physical-ai",
      "title": "What is Physical AI?",
      "level": 2,
      "estimatedWords": 400,
      "learningObjectives": [
        "Define Physical AI and its key characteristics",
        "Distinguish Physical AI from traditional AI systems"
      ],
      "keywords": ["embodied AI", "robotics", "sensors", "actuators"],
      "includeCodeExample": false
    },
    {
      "id": "history-evolution",
      "title": "History and Evolution",
      "level": 2,
      "estimatedWords": 500,
      "learningObjectives": [
        "Trace the development of Physical AI from early robotics to modern systems"
      ],
      "keywords": ["timeline", "milestones", "industrial robots"],
      "includeCodeExample": false
    }
  ],
  "estimatedWords": 2500,
  "status": "draft"
}
```
