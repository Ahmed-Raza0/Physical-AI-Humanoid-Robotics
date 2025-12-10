# Implementation Plan: Textbook Generation with AI

**Branch**: `main` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/main/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Automated content generation system for the "Physical AI & Humanoid Robotics — Essentials" Docusaurus textbook using Claude API. The system provides a TypeScript library with CLI interface to generate educational content for 6 chapters, each with multiple sections. Uses structured prompt engineering with section-by-section generation for better quality control and token efficiency. See [research.md](./research.md) for detailed technical decisions.

## Technical Context

**Language/Version**: TypeScript 5.6.2 / Node.js 20+
**Primary Dependencies**: @anthropic-ai/sdk (Claude API), Docusaurus 3.9.2, zod (validation)
**Storage**: File-based markdown in `docs/` directory + JSON logs
**Testing**: Jest with @types/jest, contract tests for API, integration tests for generation flow
**Target Platform**: Node.js 20+ on developer machines + CI/CD (not browser-facing)
**Project Type**: Single project (library + CLI) - library-first architecture per constitution
**Performance Goals**: 1 chapter (2500 words) in <30s, 6 chapters in <5min, max 100K tokens/chapter
**Constraints**: Claude API rate limits (50 req/min), max 5000 words/chapter, preserve existing navigation
**Scale/Scope**: 6 chapters, ~15-20 sections total, single textbook (Physical AI & Humanoid Robotics)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ⚠️ PENDING (Constitution not yet filled in - template placeholders present)

**Notes**:
- Constitution file (`.specify/memory/constitution.md`) contains only placeholders
- No specific principles to validate against yet
- Once constitution is established, re-evaluate against:
  - Library-first principle (design supports this - see data-model.md)
  - CLI interface principle (design supports this - see contracts/cli-interface.md)
  - Test-first requirements (will implement with Jest - see research.md)
  - Any domain-specific constraints

**Recommendation**: Establish constitution principles before Phase 2 (tasks generation) to ensure compliance gates are enforceable.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
D:\New folder\my-ai-textbook/
├── .env                         # API key (gitignored)
├── .gitignore
├── package.json                 # Add dependencies: @anthropic-ai/sdk, zod, jest
├── tsconfig.json
├── src/                         # Generator library (NEW)
│   ├── generator/
│   │   ├── Generator.ts         # Main orchestrator
│   │   ├── PromptBuilder.ts     # Constructs prompts from templates
│   │   ├── ContentValidator.ts  # Validates generated markdown
│   │   ├── ClaudeClient.ts      # API wrapper with retry/rate limiting
│   │   ├── FileWriter.ts        # Writes to docs/ with safety checks
│   │   └── errors.ts            # Error classes
│   ├── cli/
│   │   └── index.ts             # CLI entry point (generate/validate/preview/init)
│   ├── templates/
│   │   ├── section-prompt.md    # Template for section generation
│   │   └── code-example-prompt.md
│   ├── config/
│   │   └── chapters.json        # Chapter specifications
│   ├── types/
│   │   └── models.ts            # TypeScript types for data model
│   ├── utils/
│   │   ├── ChapterLoader.ts     # Load chapter specs from JSON
│   │   └── CostEstimator.ts     # Estimate API costs
│   └── index.ts                 # Public API exports
├── tests/                       # Test suite (NEW)
│   ├── unit/
│   │   ├── Generator.test.ts
│   │   ├── PromptBuilder.test.ts
│   │   ├── ContentValidator.test.ts
│   │   └── ClaudeClient.test.ts
│   ├── integration/
│   │   ├── generation-flow.test.ts
│   │   └── file-writing.test.ts
│   └── mocks/
│       └── claude-responses.ts
├── my-ai-textbook/              # Docusaurus project (EXISTING)
│   ├── docs/                    # Content destination
│   │   ├── chapter1-introduction.md       (GENERATED)
│   │   ├── chapter2-humanoid-robotics.md  (GENERATED)
│   │   ├── chapter3-ros2-fundamentals.md  (GENERATED)
│   │   └── ...
│   ├── docusaurus.config.ts
│   ├── sidebars.ts
│   ├── package.json
│   └── ...
├── logs/                        # Generation logs (NEW, gitignored)
│   └── generation-YYYY-MM-DD.json
└── specs/                       # Planning artifacts (EXISTING)
    └── main/
        ├── spec.md
        ├── plan.md              # This file
        ├── research.md
        ├── data-model.md
        ├── quickstart.md
        └── contracts/
            ├── cli-interface.md
            └── library-api.md
```

**Structure Decision**: Single project (library + CLI) following Option 1. The generator is a development tool, not user-facing, so it lives at repository root in `src/` alongside the Docusaurus project in `my-ai-textbook/`. This keeps the codebase simple while maintaining clear separation between the generator library and the generated content.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations identified.** Design follows single project structure with library-first + CLI pattern. No unnecessary abstractions introduced. See [research.md](./research.md) for rationale on each technical decision.

## Phase 0 Output: Research (Completed)

See [research.md](./research.md) for:
- All technical decisions with rationale
- Alternatives considered for each choice
- Best practices for Claude API integration
- Security considerations (API key management, content validation)
- Integration points with existing Docusaurus project

**Status**: ✅ All unknowns from Technical Context resolved

## Phase 1 Output: Design Artifacts (Completed)

### Data Model
See [data-model.md](./data-model.md) for:
- 7 core entities: ChapterSpec, Section, GenerationPrompt, GeneratedContent, GenerationResult, GenerationError, GenerationConfig
- Entity relationships and state transitions
- Zod validation schemas
- Security constraints and error recovery strategies

### API Contracts
See [contracts/](./contracts/) for:
- **CLI Interface** ([cli-interface.md](./contracts/cli-interface.md)): 4 commands (generate, validate, preview, init) with full I/O specifications
- **Library API** ([library-api.md](./contracts/library-api.md)): 5 core modules (Generator, PromptBuilder, ContentValidator, ClaudeClient, FileWriter) with TypeScript interfaces

### Quick Start Guide
See [quickstart.md](./quickstart.md) for:
- 5-minute setup instructions
- Common usage patterns
- Troubleshooting guide
- Cost estimates

## Next Steps

This planning phase is complete. The following artifacts are ready:
1. ✅ Technical research with all decisions documented
2. ✅ Complete data model with validation schemas
3. ✅ CLI and library API contracts
4. ✅ Developer quickstart guide
5. ✅ Project structure defined

**To proceed to implementation**:
1. Run `/sp.tasks` to generate actionable task list from this plan
2. Ensure constitution is established for compliance gates
3. Begin implementation following TDD approach (per research.md)

## Design Review Checklist

- [x] All Technical Context unknowns resolved in research.md
- [x] Data model covers all entities from feature requirements
- [x] API contracts specify inputs, outputs, errors for all operations
- [x] Security considerations addressed (API keys, validation, no injection vectors)
- [x] Performance goals quantified (30s per chapter, 5min for all 6)
- [x] Integration points with Docusaurus identified
- [x] Error handling and retry strategies defined
- [x] Testing approach specified (Jest, unit + integration)
- [x] Project structure follows single-project pattern
- [ ] Constitution compliance verified (pending constitution creation)

**Recommendation**: This plan is ready for task generation. Consider establishing constitution principles before proceeding to ensure gates are enforceable during implementation.
