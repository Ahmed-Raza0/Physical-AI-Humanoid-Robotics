/**
 * Generator - Main orchestrator for chapter generation
 */

import { ClaudeClient, ClaudeClientOptions } from './ClaudeClient';
import { PromptBuilder } from './PromptBuilder';
import { ContentValidator } from './ContentValidator';
import { FileWriter } from './FileWriter';
import {
  ChapterSpec,
  GenerationConfig,
  GenerationResult,
  GenerationError,
  GeneratedContent,
} from '../types/models';
import { estimateSectionCost, estimateChapterCost } from '../utils/CostEstimator';
import { GeneratorError, toGenerationError } from './errors';

export interface GeneratorOptions {
  outputDir?: string;
  templateDir?: string;
  dryRun?: boolean;
  retryAttempts?: number;
  maxConcurrentRequests?: number;
  model?: string;
}

export class Generator {
  private claudeClient: ClaudeClient;
  private promptBuilder: PromptBuilder;
  private contentValidator: ContentValidator;
  private fileWriter: FileWriter;
  private config: Required<GeneratorOptions>;

  constructor(apiKey: string, options: GeneratorOptions = {}) {
    // Set default configuration
    this.config = {
      outputDir: options.outputDir || 'my-ai-textbook/docs',
      templateDir: options.templateDir || 'src/templates',
      dryRun: options.dryRun ?? false,
      retryAttempts: options.retryAttempts ?? 3,
      maxConcurrentRequests: options.maxConcurrentRequests ?? 5,
      model: options.model || 'claude-sonnet-4-20250514',
    };

    // Initialize dependencies
    const clientOptions: ClaudeClientOptions = {
      maxConcurrentRequests: this.config.maxConcurrentRequests,
      retryAttempts: this.config.retryAttempts,
      model: this.config.model,
    };

    this.claudeClient = new ClaudeClient(apiKey, clientOptions);
    this.promptBuilder = new PromptBuilder(this.config.templateDir);
    this.contentValidator = new ContentValidator();
    this.fileWriter = new FileWriter(this.config.outputDir);
  }

  /**
   * Generates content for an entire chapter
   */
  async generateChapter(chapter: ChapterSpec): Promise<GenerationResult> {
    const result: GenerationResult = {
      chapterId: chapter.id,
      status: 'success',
      sections: new Map(),
      errors: [],
      totalTokens: 0,
      totalCost: 0,
      startedAt: new Date(),
      completedAt: new Date(),
      durationMs: 0,
    };

    const startTime = Date.now();

    // Generate each section
    for (const section of chapter.sections) {
      try {
        console.log(`Generating section: ${section.title}...`);

        // Build prompt
        const prompt = this.promptBuilder.buildSectionPrompt(section, chapter);

        // Generate content
        const generatedContent = await this.claudeClient.generateContent(prompt);

        // Validate content
        this.contentValidator.validateGeneratedContent(generatedContent);

        // Store in result
        result.sections.set(section.id, generatedContent);
        result.totalTokens += generatedContent.tokensUsed;

        console.log(
          `✓ Generated ${section.title} (${generatedContent.tokensUsed} tokens)`
        );
      } catch (error) {
        const generationError: GenerationError = {
          sectionId: section.id,
          errorType: this.classifyErrorType(error),
          message: (error as Error).message,
          retryable: (error as GeneratorError).retryable ?? false,
          originalError: error as Error,
          timestamp: new Date(),
        };

        result.errors.push(generationError);
        console.error(`✗ Failed to generate ${section.title}: ${generationError.message}`);
      }
    }

    // Determine final status
    if (result.sections.size === 0) {
      result.status = 'failed';
    } else if (result.errors.length > 0) {
      result.status = 'partial';
    } else {
      result.status = 'success';
    }

    // Calculate cost
    result.totalCost = estimateChapterCost(chapter, this.config.model);

    // Calculate duration
    const endTime = Date.now();
    result.completedAt = new Date();
    result.durationMs = endTime - startTime;

    // Write output files (unless dry run or failed completely)
    if (!this.config.dryRun && result.sections.size > 0) {
      await this.writeChapterFile(chapter, result);
      await this.writeGenerationLog(chapter, result);
    }

    return result;
  }

  /**
   * Writes combined chapter content to file
   */
  private async writeChapterFile(
    chapter: ChapterSpec,
    result: GenerationResult
  ): Promise<void> {
    // Combine all sections into one markdown file
    const sections = Array.from(result.sections.values());

    if (sections.length === 0) {
      return;
    }

    // Use first section's metadata as base
    const firstSection = sections[0];
    const combinedMetadata = {
      ...firstSection.metadata,
      title: chapter.title,
      description: `Chapter ${chapter.number}: ${chapter.title}`,
    };

    // Combine markdown (remove individual front matters, keep content)
    const combinedMarkdown = sections
      .map((section) => {
        // Remove front matter from each section
        return section.markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
      })
      .join('\n\n');

    // Create front matter for combined chapter
    const frontMatter = `---
title: "${combinedMetadata.title}"
description: "${combinedMetadata.description}"
keywords: [${combinedMetadata.keywords.map((k) => `"${k}"`).join(', ')}]
sidebar_position: ${chapter.number}
---

`;

    const finalContent: GeneratedContent = {
      markdown: frontMatter + combinedMarkdown,
      metadata: combinedMetadata,
      tokensUsed: result.totalTokens,
      thinkingTokens: 0,
      generatedAt: new Date(),
      modelVersion: firstSection.modelVersion,
    };

    const filename = `${chapter.id}.md`;
    await this.fileWriter.writeChapter(filename, finalContent);

    console.log(`\n✓ Wrote chapter to ${filename}`);
  }

  /**
   * Writes generation log
   */
  private async writeGenerationLog(
    chapter: ChapterSpec,
    result: GenerationResult
  ): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const logFilename = `generation-${date}.json`;

    const logEntry = {
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      timestamp: result.completedAt.toISOString(),
      status: result.status,
      sectionsGenerated: result.sections.size,
      totalSections: chapter.sections.length,
      errors: result.errors.map((e) => ({
        sectionId: e.sectionId,
        errorType: e.errorType,
        message: e.message,
      })),
      totalTokens: result.totalTokens,
      estimatedCost: result.totalCost,
      durationMs: result.durationMs,
      model: this.config.model,
    };

    await this.fileWriter.writeLog(logFilename, logEntry);
    console.log(`✓ Wrote generation log to logs/${logFilename}`);
  }

  /**
   * Classifies error type
   */
  private classifyErrorType(
    error: unknown
  ): 'api_error' | 'validation_error' | 'rate_limit' | 'timeout' {
    const errorStr = String(error);

    if (errorStr.includes('rate_limit') || errorStr.includes('RateLimitError')) {
      return 'rate_limit';
    }

    if (errorStr.includes('timeout') || errorStr.includes('TimeoutError')) {
      return 'timeout';
    }

    if (errorStr.includes('validation') || errorStr.includes('ValidationError')) {
      return 'validation_error';
    }

    return 'api_error';
  }

  /**
   * Estimates cost for a chapter before generation
   */
  estimateChapterCost(chapter: ChapterSpec): number {
    return estimateChapterCost(chapter, this.config.model);
  }

  /**
   * Previews prompts without generating (for debugging)
   */
  previewPrompts(chapter: ChapterSpec): void {
    console.log(`\n=== Prompts for Chapter: ${chapter.title} ===\n`);

    chapter.sections.forEach((section, idx) => {
      const prompt = this.promptBuilder.buildSectionPrompt(section, chapter);

      console.log(`\n--- Section ${idx + 1}: ${section.title} ---`);
      console.log(`\nSystem Prompt:\n${prompt.systemPrompt}`);
      console.log(`\nUser Prompt:\n${prompt.template}`);
      console.log(`\nConfiguration:`);
      console.log(`  Max Tokens: ${prompt.maxTokens}`);
      console.log(`  Thinking Tokens: ${prompt.thinkingTokens}`);
      console.log(`  Temperature: ${prompt.temperature}`);
      console.log(`\n${'='.repeat(80)}\n`);
    });
  }
}
