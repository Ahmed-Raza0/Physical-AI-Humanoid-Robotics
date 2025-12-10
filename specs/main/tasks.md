---
description: "Task list for textbook-generation feature implementation"
---

# Tasks: Textbook Generation with AI

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included based on testing requirements in plan.md (Jest, contract tests, integration tests)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## User Stories Summary

- **US1 (P1)**: Generate single chapter content using Claude API 🎯 MVP
- **US2 (P2)**: Validate chapter specifications before generation
- **US3 (P3)**: Preview generation prompts without API calls
- **US4 (P4)**: Interactive chapter specification setup

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create root-level directory structure: src/, tests/, logs/
- [X] T002 Update package.json with dependencies: @anthropic-ai/sdk, zod
- [X] T003 Update package.json with dev dependencies: jest, ts-jest, @types/jest, @types/node
- [X] T004 [P] Create tsconfig.json for TypeScript compilation
- [X] T005 [P] Add .env to .gitignore and create .env.example template
- [X] T006 [P] Create logs/ directory and add to .gitignore
- [X] T007 [P] Configure Jest in jest.config.js for TypeScript
- [X] T008 Add npm scripts to package.json: build, test, generate, validate, preview, init

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 [P] Create TypeScript types for data model in src/types/models.ts (ChapterSpec, Section, GeneratedContent, etc.)
- [X] T010 [P] Create error classes in src/generator/errors.ts (GeneratorError, APIError, RateLimitError, ValidationError, etc.)
- [X] T011 [P] Create ChapterLoader utility in src/utils/ChapterLoader.ts
- [X] T012 [P] Create CostEstimator utility in src/utils/CostEstimator.ts
- [X] T013 Create Zod schemas for validation in src/types/schemas.ts (ChapterSpecSchema, SectionSchema, GeneratedContentSchema)
- [X] T014 Create mock Claude responses in tests/mocks/claude-responses.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Generate Single Chapter Content (Priority: P1) 🎯 MVP

**Goal**: Generate markdown content for a single chapter using Claude API and write to docs/ directory

**Independent Test**: Run `npm run generate -- chapter1-introduction` and verify:
- Markdown file created at my-ai-textbook/docs/chapter1-introduction.md
- Content includes proper front matter, headings, and sections
- Generation logs written to logs/generation-YYYY-MM-DD.json

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T015 [P] [US1] Unit test for ClaudeClient API integration in tests/unit/ClaudeClient.test.ts
- [ ] T016 [P] [US1] Unit test for PromptBuilder template rendering in tests/unit/PromptBuilder.test.ts
- [ ] T017 [P] [US1] Unit test for ContentValidator markdown validation in tests/unit/ContentValidator.test.ts
- [ ] T018 [P] [US1] Unit test for FileWriter file operations in tests/unit/FileWriter.test.ts
- [ ] T019 [US1] Integration test for end-to-end chapter generation in tests/integration/generation-flow.test.ts

### Implementation for User Story 1

- [ ] T020 [P] [US1] Implement ClaudeClient with retry logic and rate limiting in src/generator/ClaudeClient.ts
- [ ] T021 [P] [US1] Create prompt templates in src/templates/section-prompt.md
- [ ] T022 [US1] Implement PromptBuilder for constructing Claude prompts in src/generator/PromptBuilder.ts (depends on T021)
- [ ] T023 [P] [US1] Implement ContentValidator for markdown validation in src/generator/ContentValidator.ts
- [ ] T024 [P] [US1] Implement FileWriter for writing to docs/ with safety checks in src/generator/FileWriter.ts
- [ ] T025 [US1] Implement Generator orchestrator in src/generator/Generator.ts (depends on T020, T022, T023, T024)
- [ ] T026 [US1] Implement CLI generate command in src/cli/index.ts (depends on T025)
- [ ] T027 [US1] Create example chapter specification in src/config/chapters.json
- [ ] T028 [US1] Add error handling and logging to Generator
- [ ] T029 [US1] Export public API in src/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - can generate a single chapter end-to-end

---

## Phase 4: User Story 2 - Validate Chapter Specifications (Priority: P2)

**Goal**: Validate chapter specification JSON files before generation to catch errors early

**Independent Test**: Run `npm run validate -- src/config/chapters.json` and verify:
- Valid config shows success message with statistics
- Invalid config shows detailed validation errors
- Exit codes: 0 for valid, 1 for invalid

### Tests for User Story 2

- [ ] T030 [P] [US2] Unit test for ChapterLoader JSON parsing in tests/unit/ChapterLoader.test.ts
- [ ] T031 [US2] Integration test for validate command in tests/integration/validation.test.ts

### Implementation for User Story 2

- [ ] T032 [US2] Implement validation logic in ContentValidator (extend existing class from US1)
- [ ] T033 [US2] Implement CLI validate command in src/cli/index.ts
- [ ] T034 [US2] Add validation error reporting with line numbers and suggestions

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Preview Generation Prompts (Priority: P3)

**Goal**: Preview prompts that will be sent to Claude API without making actual API calls (for debugging and transparency)

**Independent Test**: Run `npm run preview -- chapter1-introduction` and verify:
- System prompt displayed
- User prompt displayed with section details
- API configuration shown (model, tokens, temperature)
- No API calls made (check logs)

### Tests for User Story 3

- [ ] T035 [US3] Integration test for preview command in tests/integration/preview.test.ts

### Implementation for User Story 3

- [ ] T036 [US3] Implement preview mode in PromptBuilder (add method to expose prompts without sending)
- [ ] T037 [US3] Implement CLI preview command in src/cli/index.ts
- [ ] T038 [US3] Add formatting for human-readable prompt display

**Checkpoint**: All three user stories (1, 2, 3) should now be independently functional

---

## Phase 6: User Story 4 - Interactive Chapter Specification Setup (Priority: P4)

**Goal**: Create chapter specification JSON interactively through CLI prompts (improves developer onboarding)

**Independent Test**: Run `npm run init` and verify:
- Interactive prompts for chapter count, titles, sections
- Generated chapters.json file is valid (passes validation from US2)
- Can immediately use generated config with generate command (US1)

### Tests for User Story 4

- [ ] T039 [US4] Integration test for init command with mocked user input in tests/integration/init.test.ts

### Implementation for User Story 4

- [ ] T040 [US4] Add interactive prompt library to dependencies (e.g., inquirer or prompts)
- [ ] T041 [US4] Implement interactive prompts for chapter configuration in src/cli/init.ts
- [ ] T042 [US4] Implement CLI init command in src/cli/index.ts
- [ ] T043 [US4] Add validation before writing (reuse ContentValidator from US2)
- [ ] T044 [US4] Add --non-interactive flag for CI/CD with defaults

**Checkpoint**: All user stories (1, 2, 3, 4) should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T045 [P] Add JSDoc comments to all public API methods in src/index.ts and src/generator/*.ts
- [ ] T046 [P] Create README.md at repository root with quickstart instructions
- [ ] T047 [P] Add code-example-prompt.md template in src/templates/ for sections with code
- [ ] T048 Run full test suite and ensure >80% code coverage
- [ ] T049 Add --json output flag to all CLI commands for machine-readable output
- [ ] T050 Add --verbose flag to all CLI commands for debug logging
- [ ] T051 Test all commands from quickstart.md scenarios
- [ ] T052 Performance optimization: implement streaming for large chapter generation
- [ ] T053 Add batch generation support (--all flag) to generate command

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent (uses ContentValidator differently than US1)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent (reuses PromptBuilder from US1 but read-only)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent (but should test integration with US1/US2)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models/utilities before core classes
- Core classes before CLI commands
- Implementation before error handling/logging
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T004, T005, T006, T007)
- All Foundational tasks marked [P] can run in parallel (T009, T010, T011, T012)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel (e.g., T015-T018 for US1)
- Implementation tasks marked [P] within a story can run in parallel (e.g., T020, T021, T023, T024 for US1)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all unit tests for User Story 1 together:
Task T015: "Unit test for ClaudeClient API integration in tests/unit/ClaudeClient.test.ts"
Task T016: "Unit test for PromptBuilder template rendering in tests/unit/PromptBuilder.test.ts"
Task T017: "Unit test for ContentValidator markdown validation in tests/unit/ContentValidator.test.ts"
Task T018: "Unit test for FileWriter file operations in tests/unit/FileWriter.test.ts"

# Launch all independent implementation tasks together:
Task T020: "Implement ClaudeClient in src/generator/ClaudeClient.ts"
Task T021: "Create prompt templates in src/templates/section-prompt.md"
Task T023: "Implement ContentValidator in src/generator/ContentValidator.ts"
Task T024: "Implement FileWriter in src/generator/FileWriter.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T014) - CRITICAL
3. Complete Phase 3: User Story 1 (T015-T029)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Run: `npm run generate -- chapter1-introduction`
   - Verify: Markdown file created with valid content
   - Verify: Tests pass (`npm test`)
5. Deploy/demo if ready (working textbook generator!)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP Ready!** (Can generate chapters)
3. Add User Story 2 → Test independently → Deploy (Added validation)
4. Add User Story 3 → Test independently → Deploy (Added preview)
5. Add User Story 4 → Test independently → Deploy (Added interactive setup)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T014)
2. Once Foundational is done:
   - Developer A: User Story 1 (T015-T029) - Core generation
   - Developer B: User Story 2 (T030-T034) - Validation
   - Developer C: User Story 3 (T035-T038) - Preview
   - Developer D: User Story 4 (T039-T044) - Init
3. Stories complete and integrate independently
4. Team reconvenes for Polish (T045-T053)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail (RED) before implementing (GREEN)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- File paths follow plan.md structure: single project with src/ at root
- All API calls should use ClaudeClient (no direct SDK usage elsewhere)
- All file writes should use FileWriter (no direct fs usage elsewhere)
- All validation should use ContentValidator (centralized validation logic)

---

## Task Count Summary

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 6 tasks
- **Phase 3 (US1 - Generate)**: 15 tasks (5 tests + 10 implementation)
- **Phase 4 (US2 - Validate)**: 4 tasks (2 tests + 2 implementation)
- **Phase 5 (US3 - Preview)**: 4 tasks (1 test + 3 implementation)
- **Phase 6 (US4 - Init)**: 6 tasks (1 test + 5 implementation)
- **Phase 7 (Polish)**: 9 tasks

**Total**: 53 tasks

**MVP Scope (US1 only)**: 29 tasks (T001-T029)
**Parallel opportunities**: 18 tasks marked [P]
