# Quickstart: Textbook Generation

**Feature**: textbook-generation
**Last Updated**: 2025-12-10

## Prerequisites

- Node.js 20+ installed
- Anthropic API key (get one at https://console.anthropic.com/)
- Existing Docusaurus project (already set up in `my-ai-textbook/`)

## 5-Minute Setup

### 1. Install Dependencies

From the repository root:

```bash
cd my-ai-textbook
npm install
```

This installs the Docusaurus dependencies. Next, install the textbook generator dependencies:

```bash
npm install @anthropic-ai/sdk zod
npm install --save-dev jest ts-jest @types/jest
```

### 2. Set API Key

Create a `.env` file in the repository root:

```bash
# D:\New folder\my-ai-textbook\.env
ANTHROPIC_API_KEY=sk-ant-api03-...your-key-here...
```

Add `.env` to `.gitignore` if not already there:

```bash
echo ".env" >> .gitignore
```

### 3. Generate Your First Chapter

From the repository root:

```bash
npm run generate -- chapter1-introduction
```

Expected output:
```
Generating chapter: chapter1-introduction

[1/1] Chapter 1: Introduction to Physical AI
  ├─ Section: What is Physical AI? (387 words, 1,245 tokens)
  ├─ Section: History and Evolution (512 words, 1,678 tokens)
  └─ Section: Applications Today (423 words, 1,354 tokens)
  ✓ Generated successfully (2,487 words, 4,277 tokens, $0.08)
  → Written to my-ai-textbook/docs/chapter1-introduction.md

✓ Generation complete
✓ Total tokens: 4,277
✓ Estimated cost: $0.08
```

### 4. Preview the Result

Start the Docusaurus dev server:

```bash
cd my-ai-textbook
npm start
```

Open http://localhost:3000 and navigate to the Textbook section to see your generated chapter!

## Common Tasks

### Generate All Chapters

```bash
npm run generate -- --all
```

This generates all 6 chapters sequentially. Estimated time: ~5 minutes, cost: ~$0.50.

### Generate Multiple Specific Chapters

```bash
npm run generate -- chapter1-introduction chapter2-humanoid-robotics chapter3-ros2-fundamentals
```

### Preview Before Generating

See what prompts will be sent to Claude without making API calls:

```bash
npm run preview -- chapter1-introduction
```

### Validate Configuration

Check your chapter spec file for errors:

```bash
npm run validate -- src/config/chapters.json
```

### Dry Run (No File Writes)

Generate content but don't write to files (useful for testing):

```bash
npm run generate -- --dry-run chapter1-introduction
```

### Force Overwrite Existing Content

By default, the generator asks for confirmation before overwriting. Skip the prompt:

```bash
npm run generate -- --force chapter1-introduction
```

## Project Structure

After setup, your project will look like:

```
my-ai-textbook/
├─ .env                          # API key (DO NOT COMMIT)
├─ package.json                  # Updated with new dependencies
├─ src/                          # Generator source code (to be created)
│  ├─ generator/
│  │  ├─ Generator.ts
│  │  ├─ PromptBuilder.ts
│  │  ├─ ContentValidator.ts
│  │  ├─ ClaudeClient.ts
│  │  └─ FileWriter.ts
│  ├─ cli/
│  │  └─ index.ts
│  ├─ templates/
│  │  ├─ section-prompt.md
│  │  └─ code-example-prompt.md
│  ├─ config/
│  │  └─ chapters.json
│  └─ types/
│     └─ models.ts
├─ my-ai-textbook/               # Docusaurus project
│  ├─ docs/
│  │  ├─ chapter1-introduction.md      # Generated!
│  │  ├─ chapter2-humanoid-robotics.md
│  │  └─ ...
│  ├─ docusaurus.config.ts
│  └─ ...
└─ specs/                        # Planning artifacts
   └─ main/
      ├─ spec.md
      ├─ plan.md
      ├─ research.md
      ├─ data-model.md
      ├─ quickstart.md            # You are here
      └─ contracts/
```

## Configuration

### Chapter Specification

Create `src/config/chapters.json`:

```json
[
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
]
```

Or use the interactive initializer:

```bash
npm run init
```

### Prompt Templates

Create `src/templates/section-prompt.md`:

```markdown
You are an expert technical writer creating educational content for a university-level textbook titled "Physical AI & Humanoid Robotics — Essentials".

Generate a comprehensive section on "{{SECTION_TITLE}}" for Chapter {{CHAPTER_NUMBER}}: {{CHAPTER_TITLE}}.

**Learning Objectives**:
{{#LEARNING_OBJECTIVES}}
- {{.}}
{{/LEARNING_OBJECTIVES}}

**Keywords to Cover**: {{KEYWORDS}}

**Target Length**: {{ESTIMATED_WORDS}} words

**Requirements**:
- Write in clear, accessible academic prose
- Include concrete examples and analogies
- {{#INCLUDE_CODE}}Include a practical code example in Python or C++{{/INCLUDE_CODE}}
- Use proper markdown formatting with headings, lists, and emphasis
- Include a brief summary at the end

**Constraints**:
- Do not use first-person pronouns
- Avoid marketing language or hype
- Cite concepts, not specific papers (this is a textbook, not a research paper)
- Keep code examples concise and well-commented

Generate the section content now.
```

## Troubleshooting

### "ANTHROPIC_API_KEY not set"

**Solution**: Ensure `.env` file exists in repository root with your API key:

```bash
cat .env
# Should show: ANTHROPIC_API_KEY=sk-ant-...
```

Load the environment variable:

```bash
export $(cat .env | xargs)  # Linux/Mac
# OR
source .env                  # If using direnv
```

### "Rate limit exceeded"

**Solution**: The free tier has limits. Wait 30-60 seconds and retry, or reduce concurrency:

```bash
npm run generate -- --max-concurrent 2 chapter1-introduction
```

### "Invalid chapter ID"

**Solution**: Chapter IDs must follow the pattern `chapter1-` through `chapter6-` followed by a slug. Examples:
- Valid: `chapter1-introduction`, `chapter2-humanoid-robotics`
- Invalid: `chapter7-advanced`, `intro`, `chapter-1-intro`

### "Validation failed: Unclosed code block"

**Solution**: The generated content has a markdown syntax error. Options:
1. Retry generation: `npm run generate -- --force chapter1-introduction`
2. Manually fix the markdown in `my-ai-textbook/docs/chapter1-introduction.md`

### "Permission denied" when writing files

**Solution**: Check write permissions on the output directory:

```bash
ls -la my-ai-textbook/docs/
chmod u+w my-ai-textbook/docs/  # If needed
```

## Next Steps

1. **Customize Prompts**: Edit `src/templates/section-prompt.md` to adjust tone, style, or requirements
2. **Add Code Examples**: Set `includeCodeExample: true` in chapter specs for sections that need code
3. **Review Generated Content**: Always review AI-generated content for technical accuracy
4. **Iterate**: Regenerate sections that need improvement with `--force` flag
5. **Publish**: Build the Docusaurus site with `cd my-ai-textbook && npm run build`

## Estimated Costs

Based on Claude Sonnet 4 pricing (as of 2025-12):
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

Approximate costs:
- Single chapter (2500 words): $0.06 - $0.10
- All 6 chapters (15,000 words): $0.40 - $0.60
- Extended thinking adds ~20% token overhead

**Tip**: Use `--dry-run` and preview to estimate costs before generating.

## Support

- **Documentation**: See `specs/main/plan.md` for architecture details
- **API Reference**: See `specs/main/contracts/` for CLI and library interfaces
- **Issues**: Check generation logs in `my-ai-textbook/logs/`

## Example Workflow

```bash
# 1. Set up environment
export ANTHROPIC_API_KEY=sk-ant-...

# 2. Initialize chapter specs
npm run init

# 3. Validate configuration
npm run validate -- src/config/chapters.json

# 4. Preview first chapter
npm run preview -- chapter1-introduction

# 5. Generate first chapter
npm run generate -- chapter1-introduction

# 6. Review and iterate
cd my-ai-textbook
npm start
# Review at http://localhost:3000

# 7. Regenerate if needed
npm run generate -- --force chapter1-introduction

# 8. Generate remaining chapters
npm run generate -- --all

# 9. Build for production
cd my-ai-textbook
npm run build

# 10. Deploy
npm run deploy  # Or your preferred deployment method
```
