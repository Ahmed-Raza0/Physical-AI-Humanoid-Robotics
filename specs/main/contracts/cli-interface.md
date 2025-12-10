# CLI Interface Contract

**Feature**: textbook-generation
**Date**: 2025-12-10

## Overview

Command-line interface for generating textbook content using Claude API. Follows text in/out protocol (stdin/args → stdout, errors → stderr).

## Commands

### 1. `generate`

Generate content for one or more chapters.

**Usage**:
```bash
npm run generate -- [options] [chapterIds...]

# Examples
npm run generate -- chapter1-introduction
npm run generate -- chapter1-introduction chapter2-humanoid-robotics
npm run generate -- --all
npm run generate -- --dry-run chapter1-introduction
```

**Arguments**:
- `chapterIds`: Space-separated chapter IDs (e.g., `chapter1-introduction`)
  - Pattern: `^chapter\d+-[\w-]+$`
  - If omitted, requires `--all` flag

**Options**:
- `--all`: Generate all chapters (1-6)
- `--dry-run`: Validate and preview without writing files
- `--force`: Overwrite existing content without confirmation
- `--output <dir>`: Custom output directory (default: `my-ai-textbook/docs`)
- `--template <dir>`: Custom prompt template directory
- `--config <file>`: Custom chapter spec JSON file
- `--verbose`: Enable debug logging
- `--json`: Output results as JSON to stdout
- `--model <name>`: Override Claude model (default: claude-sonnet-4-20250514)
- `--max-tokens <n>`: Override max tokens per request (default: 16000)

**Exit Codes**:
- `0`: All chapters generated successfully
- `1`: Some chapters failed (partial success)
- `2`: All chapters failed
- `3`: Validation error (invalid arguments/config)
- `4`: API authentication error
- `5`: Rate limit exceeded

**Output Format (Human-Readable)**:
```
Generating chapters: chapter1-introduction, chapter2-humanoid-robotics

[1/2] Chapter 1: Introduction to Physical AI
  ├─ Section: What is Physical AI? (387 words, 1,245 tokens)
  ├─ Section: History and Evolution (512 words, 1,678 tokens)
  └─ Section: Applications Today (423 words, 1,354 tokens)
  ✓ Generated successfully (2,487 words, 4,277 tokens, $0.08)
  → Written to my-ai-textbook/docs/chapter1-introduction.md

[2/2] Chapter 2: Humanoid Robotics Fundamentals
  ├─ Section: What is a Humanoid Robot? (395 words, 1,289 tokens)
  ✗ Section: Key Components (ERROR: Rate limit exceeded, retry in 30s)

⚠ Partial success: 1/2 chapters completed
✓ Total tokens: 4,277
✓ Total cost: $0.08
✗ Errors: 1 section failed
```

**Output Format (JSON)**:
```json
{
  "status": "partial",
  "results": [
    {
      "chapterId": "chapter1-introduction",
      "status": "success",
      "sections": 3,
      "totalWords": 2487,
      "totalTokens": 4277,
      "cost": 0.08,
      "filePath": "my-ai-textbook/docs/chapter1-introduction.md"
    },
    {
      "chapterId": "chapter2-humanoid-robotics",
      "status": "failed",
      "sections": 1,
      "errors": [
        {
          "sectionId": "key-components",
          "errorType": "rate_limit",
          "message": "Rate limit exceeded, retry in 30s",
          "retryable": true
        }
      ]
    }
  ],
  "summary": {
    "totalChapters": 2,
    "successful": 1,
    "failed": 1,
    "totalTokens": 4277,
    "totalCost": 0.08,
    "durationMs": 12340
  }
}
```

**Errors to stderr**:
```
ERROR: Invalid chapter ID 'chapter7-invalid' (must be chapter1-chapter6)
ERROR: API key not found. Set ANTHROPIC_API_KEY environment variable
ERROR: Rate limit exceeded. Retry after 2025-12-10T15:30:00Z
```

### 2. `validate`

Validate chapter specification files without generating content.

**Usage**:
```bash
npm run validate -- [options] <configFile>

# Example
npm run validate -- src/config/chapters.json
npm run validate -- --verbose src/config/chapters.json
```

**Arguments**:
- `configFile`: Path to chapter spec JSON file

**Options**:
- `--verbose`: Show detailed validation errors
- `--json`: Output results as JSON

**Exit Codes**:
- `0`: Valid configuration
- `1`: Validation failed

**Output Format (Human-Readable)**:
```
Validating: src/config/chapters.json

✓ Schema valid
✓ All 6 chapters defined
✓ All section IDs unique
✓ Total estimated words: 15,230 (within target)
⚠ Warning: Chapter 3 has only 2 sections (recommended: 3-5)

Validation successful with 1 warning
```

**Output Format (JSON)**:
```json
{
  "valid": true,
  "chapters": 6,
  "sections": 18,
  "totalWords": 15230,
  "warnings": [
    {
      "chapterId": "chapter3-ros2-fundamentals",
      "message": "Only 2 sections (recommended: 3-5)"
    }
  ],
  "errors": []
}
```

### 3. `preview`

Preview prompts that would be sent to Claude API without making requests.

**Usage**:
```bash
npm run preview -- [options] <chapterId> [sectionId]

# Examples
npm run preview -- chapter1-introduction
npm run preview -- chapter1-introduction what-is-physical-ai
npm run preview -- --show-system chapter1-introduction
```

**Arguments**:
- `chapterId`: Chapter ID to preview
- `sectionId`: (Optional) Specific section ID to preview

**Options**:
- `--show-system`: Include system prompt in output
- `--show-config`: Include API configuration
- `--json`: Output as JSON

**Exit Codes**:
- `0`: Preview generated
- `1`: Invalid chapter/section ID

**Output Format**:
```
Preview: Chapter 1, Section "What is Physical AI?"

System Prompt (truncated):
  You are an expert technical writer creating educational content...

User Prompt:
  Generate a comprehensive section on "What is Physical AI?" for a
  university-level textbook on Physical AI and Humanoid Robotics.

  Learning Objectives:
  - Define Physical AI and its key characteristics
  - Distinguish Physical AI from traditional AI systems

  Keywords to cover: embodied AI, robotics, sensors, actuators

  Target length: 400 words
  Include code examples: No

API Configuration:
  Model: claude-sonnet-4-20250514
  Max tokens: 16000
  Thinking tokens: 10000
  Temperature: 0.7
```

### 4. `init`

Initialize a new chapter specification file interactively.

**Usage**:
```bash
npm run init -- [options]

# Example
npm run init
npm run init -- --output custom-chapters.json
```

**Options**:
- `--output <file>`: Output file path (default: `src/config/chapters.json`)
- `--non-interactive`: Use default values (for CI/CD)

**Exit Codes**:
- `0`: Initialization successful
- `1`: User cancelled or error occurred

**Interactive Prompts**:
```
Chapter Specification Generator
================================

How many chapters? (1-10): 6

Chapter 1
---------
Title: Introduction to Physical AI
Number of sections: 3

  Section 1 title: What is Physical AI?
  Estimated words (default 400): 400
  Learning objectives (comma-separated): Define Physical AI, Distinguish from traditional AI
  Keywords (comma-separated): embodied AI, robotics, sensors
  Include code example? (y/n): n

  Section 2 title: History and Evolution
  ...

✓ Configuration saved to src/config/chapters.json
```

## Environment Variables

Required:
- `ANTHROPIC_API_KEY`: Claude API key (format: `sk-ant-...`)

Optional:
- `TEXTBOOK_OUTPUT_DIR`: Override default output directory
- `TEXTBOOK_TEMPLATE_DIR`: Override default template directory
- `TEXTBOOK_LOG_LEVEL`: Log level (debug|info|warn|error, default: info)
- `TEXTBOOK_MAX_RETRIES`: Max retry attempts (default: 3)
- `TEXTBOOK_RATE_LIMIT`: Max concurrent requests (default: 5)

## Error Handling

### Common Errors

**1. Missing API Key**
```
ERROR: ANTHROPIC_API_KEY environment variable not set

Solution: Export your API key:
  export ANTHROPIC_API_KEY=sk-ant-...
```

**2. Invalid Chapter ID**
```
ERROR: Invalid chapter ID 'chapter7-invalid'
  Expected pattern: ^chapter\d+-[\w-]+$
  Valid range: chapter1 through chapter6

Solution: Use a valid chapter ID:
  npm run generate -- chapter1-introduction
```

**3. Rate Limit Exceeded**
```
ERROR: Rate limit exceeded (429 Too Many Requests)
  Retry after: 2025-12-10T15:30:00Z

Solution: Wait 30 seconds and retry, or reduce --max-concurrent option
```

**4. Validation Failure**
```
ERROR: Generated content failed validation
  Issue: Unclosed code block at line 45

Solution: Retry generation or manually fix the markdown
```

## Non-Interactive Usage (CI/CD)

Suitable for automated pipelines:

```bash
# Set API key
export ANTHROPIC_API_KEY=sk-ant-...

# Generate all chapters with JSON output
npm run generate -- --all --json --force > generation-result.json

# Check exit code
if [ $? -eq 0 ]; then
  echo "Generation successful"
else
  echo "Generation failed"
  exit 1
fi

# Parse JSON result
cat generation-result.json | jq '.summary.totalCost'
```

## Logging

Logs written to:
- `stdout`: Progress updates, success messages, JSON output (if `--json`)
- `stderr`: Errors, warnings
- `my-ai-textbook/logs/generation-YYYY-MM-DD.json`: Detailed generation logs (if `--verbose`)

Log format (JSON):
```json
{
  "timestamp": "2025-12-10T15:23:45.123Z",
  "level": "info",
  "message": "Generating chapter1-introduction",
  "chapterId": "chapter1-introduction",
  "tokens": 1245,
  "cost": 0.023
}
```
