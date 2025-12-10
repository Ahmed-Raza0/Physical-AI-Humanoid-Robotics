# Research: Textbook Generation with AI

**Feature**: textbook-generation
**Date**: 2025-12-10
**Status**: Phase 0 Complete

## Overview

This feature enables automated generation of educational textbook content for the "Physical AI & Humanoid Robotics — Essentials" Docusaurus site using Claude AI API.

## Technical Decisions

### Language/Version
**Decision**: TypeScript 5.6.2 / Node.js 20+
**Rationale**:
- Already used by Docusaurus project (see my-ai-textbook/package.json:30, tsconfig.json)
- Type safety for API integrations and content generation
- Node.js 20+ required by Docusaurus (package.json:44-46)
**Alternatives Considered**:
- Python: Would require separate runtime, breaking Docusaurus integration
- JavaScript: Less type safety for complex content generation pipelines

### Primary Dependencies
**Decision**:
- `@anthropic-ai/sdk` for Claude API integration
- Existing Docusaurus 3.9.2 ecosystem
- `zod` for content validation/schema
**Rationale**:
- Official Anthropic SDK provides best Claude API support
- Docusaurus already installed (package.json:18-19)
- Zod ensures generated content matches required structure
**Alternatives Considered**:
- Direct HTTP calls: More brittle, lacks retry/streaming support
- OpenAI API: Different capabilities, project already uses Claude config (config/claude_api_config.json)

### Storage
**Decision**: File-based markdown in `docs/` directory
**Rationale**:
- Docusaurus serves content from filesystem (docusaurus.config.ts:44)
- Version control for generated content
- No database overhead for static site
**Alternatives Considered**:
- Database: Unnecessary complexity for static content
- Git submodules: Complicates monorepo structure

### Testing
**Decision**:
- Jest for unit tests (content validation, API mocking)
- Integration tests for chapter generation flow
- Manual review for content quality
**Rationale**:
- Jest standard in TypeScript/Node ecosystem
- Can mock Claude API for deterministic tests
- AI-generated content requires human validation
**Alternatives Considered**:
- Vitest: Less ecosystem maturity in Docusaurus community
- No testing: Risky for API integrations and content pipelines

### Target Platform
**Decision**: Node.js 20+ on developer machines + CI/CD
**Rationale**:
- Matches Docusaurus build environment (package.json:44-46)
- Content generation runs during development/CI, not runtime
**Alternatives Considered**:
- Browser-based: API key exposure risk, performance issues
- Serverless functions: Adds deployment complexity for dev tool

### Project Type
**Decision**: Single project (library + CLI)
**Rationale**:
- Content generation is a development tool, not user-facing
- Fits library-first + CLI interface pattern from constitution
- Integrates with existing Docusaurus monorepo
**Alternatives Considered**:
- Separate microservice: Over-engineering for dev tooling
- Docusaurus plugin: Less flexible for standalone CLI usage

### Performance Goals
**Decision**:
- Generate 1 chapter (2000-3000 words) in <30 seconds
- Support batch generation of 6 chapters in <5 minutes
- Max 100K tokens per chapter for cost control
**Rationale**:
- Acceptable developer experience for content creation
- Claude API streaming reduces perceived latency
- Token limits prevent runaway costs
**Alternatives Considered**:
- Real-time generation: Unnecessary for dev workflow
- Unlimited tokens: Cost risk, content bloat

### Constraints
**Decision**:
- API rate limits: 50 requests/min (Claude API default)
- Max chapter size: 5000 words
- Preserve existing chapter structure (chapter1-6 naming)
**Rationale**:
- Stay within Claude API free tier limits
- Maintain focus/readability per chapter
- Don't break existing navigation (docusaurus.config.ts:75, sidebars.ts)
**Alternatives Considered**:
- No rate limiting: Risk of API throttling
- Unlimited chapter size: Reduces pedagogical quality

### Scale/Scope
**Decision**:
- 6 chapters (existing structure in docs/)
- ~15-20 sections total across chapters
- Single textbook scope (Physical AI & Humanoid Robotics)
**Rationale**:
- Matches current chapter1-6 files in docs/
- Manageable scope for initial implementation
- Focused domain expertise
**Alternatives Considered**:
- Multi-textbook platform: Scope creep beyond current need
- Unlimited chapters: Harder to maintain quality/coherence

## Content Generation Strategy

### Approach
**Decision**: Structured prompt engineering with section-by-section generation
**Rationale**:
- Break chapters into sections for better Claude API control
- Use extended thinking (config/claude_api_config.json:3-7) for deeper reasoning
- Maintain consistent tone/style across sections
**Alternatives Considered**:
- Single prompt per chapter: Less control, higher hallucination risk
- RAG with external sources: Adds complexity, may not fit Physical AI domain

### Quality Assurance
**Decision**:
- Schema validation for markdown structure
- Automated checks for code block syntax
- Manual review workflow before publishing
**Rationale**:
- Catch formatting issues automatically
- Ensure code examples are syntactically valid
- Human judgment needed for technical accuracy
**Alternatives Considered**:
- Fully automated: Risky for technical content accuracy
- No validation: Breaks Docusaurus builds

## Integration Points

### Existing System
- Docusaurus config: `my-ai-textbook/docusaurus.config.ts`
- Chapter files: `my-ai-textbook/docs/chapter*.md`
- Sidebars: `my-ai-textbook/sidebars.ts`
- Claude config: `my-ai-textbook/config/claude_api_config.json`

### New Components
- Content generation library: `src/generator/`
- CLI interface: `src/cli/`
- Prompt templates: `src/templates/`
- Validation schemas: `src/schemas/`

## Security Considerations

### API Key Management
**Decision**: Environment variables + `.env` file (gitignored)
**Rationale**:
- Prevents accidental key commits
- Standard practice in Node.js ecosystem
- Supports CI/CD secret injection
**Alternatives Considered**:
- Config file: Risk of committing secrets
- Encrypted storage: Over-engineering for dev tool

### Content Safety
**Decision**:
- No user input in prompts (prevents injection)
- Validate Claude responses against schema
- Review all generated content before publish
**Rationale**:
- Eliminates prompt injection vectors
- Ensures generated content is safe/appropriate
**Alternatives Considered**:
- No validation: Risk of malformed/inappropriate content
- Automated content moderation: Adds complexity

## Open Questions (Resolved)

All initial unknowns from Technical Context have been researched and decided above. Ready to proceed to Phase 1 design.

## References

- Anthropic Claude API Docs: https://docs.anthropic.com/claude/docs
- Docusaurus Configuration: https://docusaurus.io/docs/configuration
- Extended Thinking: https://docs.anthropic.com/claude/docs/extended-thinking
