#!/usr/bin/env node

/**
 * CLI for textbook generation
 */

import { Generator } from '../generator/Generator';
import { loadChapters, loadChapter, validateChapters } from '../utils/ChapterLoader';
import { ChapterSpec } from '../types/models';
import * as path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Main CLI handler
async function main() {
  try {
    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey && (command === 'generate' || command === 'preview')) {
      console.error('Error: ANTHROPIC_API_KEY environment variable is required');
      console.error('Set it in your .env file or export it:');
      console.error('  export ANTHROPIC_API_KEY=sk-ant-...');
      process.exit(1);
    }

    switch (command) {
      case 'generate':
        await handleGenerate(apiKey!);
        break;

      case 'validate':
        await handleValidate();
        break;

      case 'preview':
        await handlePreview(apiKey!);
        break;

      case 'init':
        await handleInit();
        break;

      default:
        printHelp();
        process.exit(command ? 1 : 0);
    }
  } catch (error) {
    console.error(`\nError: ${(error as Error).message}`);
    process.exit(1);
  }
}

/**
 * Handle generate command
 */
async function handleGenerate(apiKey: string) {
  const chapterId = args[1];

  if (!chapterId) {
    console.error('Error: Chapter ID required');
    console.error('Usage: npm run generate -- <chapter-id>');
    console.error('Example: npm run generate -- chapter1-introduction');
    process.exit(1);
  }

  console.log(`\n📚 Textbook Generator`);
  console.log(`${'='.repeat(60)}\n`);

  // Load chapters configuration
  const configPath = path.join(process.cwd(), 'src/config/chapters.json');
  const chapters = await loadChapters(configPath);

  // Find requested chapter
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    console.error(`Error: Chapter '${chapterId}' not found in configuration`);
    console.error(`Available chapters:`);
    chapters.forEach((c) => console.error(`  - ${c.id}: ${c.title}`));
    process.exit(1);
  }

  console.log(`Chapter: ${chapter.title}`);
  console.log(`Sections: ${chapter.sections.length}`);
  console.log(`Target words: ${chapter.estimatedWords}\n`);

  // Create generator
  const generator = new Generator(apiKey, {
    outputDir: 'my-ai-textbook/docs',
    templateDir: 'src/templates',
  });

  // Estimate cost
  const estimatedCost = generator.estimateChapterCost(chapter);
  console.log(`Estimated cost: $${estimatedCost.toFixed(4)}\n`);

  // Generate chapter
  console.log('Starting generation...\n');
  const result = await generator.generateChapter(chapter);

  // Print results
  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n✓ Generation Complete!`);
  console.log(`\nStatus: ${result.status.toUpperCase()}`);
  console.log(`Sections generated: ${result.sections.size}/${chapter.sections.length}`);
  console.log(`Total tokens: ${result.totalTokens.toLocaleString()}`);
  console.log(`Actual cost: $${result.totalCost.toFixed(4)}`);
  console.log(`Duration: ${(result.durationMs / 1000).toFixed(1)}s`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered:`);
    result.errors.forEach((err) => {
      console.log(`  - ${err.sectionId}: ${err.message}`);
    });
  }

  console.log(`\n${'='.repeat(60)}\n`);

  // Exit with error code if failed
  if (result.status === 'failed') {
    process.exit(1);
  }
}

/**
 * Handle validate command
 */
async function handleValidate() {
  const configPath = args[1] || path.join(process.cwd(), 'src/config/chapters.json');

  console.log(`\n📋 Validating: ${configPath}\n`);

  // Load chapters
  const chapters = await loadChapters(configPath);

  // Validate
  const validation = validateChapters(chapters);

  // Calculate stats
  const totalSections = chapters.reduce((sum, c) => sum + c.sections.length, 0);
  const totalWords = chapters.reduce((sum, c) => sum + c.estimatedWords, 0);

  // Print results
  console.log(`Chapters: ${chapters.length}`);
  console.log(`Sections: ${totalSections}`);
  console.log(`Estimated total words: ${totalWords.toLocaleString()}\n`);

  if (validation.warnings.length > 0) {
    console.log(`⚠️  Warnings:`);
    validation.warnings.forEach((w) => console.log(`  - ${w}`));
    console.log();
  }

  if (validation.valid) {
    console.log(`✓ Configuration is valid!\n`);
    process.exit(0);
  } else {
    console.log(`✗ Validation failed:\n`);
    validation.errors.forEach((e) => console.log(`  - ${e}`));
    console.log();
    process.exit(1);
  }
}

/**
 * Handle preview command
 */
async function handlePreview(apiKey: string) {
  const chapterId = args[1];

  if (!chapterId) {
    console.error('Error: Chapter ID required');
    console.error('Usage: npm run preview -- <chapter-id>');
    process.exit(1);
  }

  // Load chapters
  const configPath = path.join(process.cwd(), 'src/config/chapters.json');
  const chapters = await loadChapters(configPath);

  // Find chapter
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    console.error(`Error: Chapter '${chapterId}' not found`);
    process.exit(1);
  }

  // Create generator and preview
  const generator = new Generator(apiKey, {
    dryRun: true,
  });

  generator.previewPrompts(chapter);
}

/**
 * Handle init command (placeholder)
 */
async function handleInit() {
  console.log('\n📝 Interactive chapter specification setup');
  console.log('\nThis feature is coming soon!');
  console.log('For now, manually create src/config/chapters.json\n');
  console.log('See the example in the repository for the correct format.\n');
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
📚 Textbook Generator CLI

Usage:
  npm run <command> -- [arguments]

Commands:
  generate <chapter-id>     Generate content for a specific chapter
  validate [config-path]    Validate chapter configuration file
  preview <chapter-id>      Preview prompts without generating
  init                      Create chapter configuration interactively

Examples:
  npm run generate -- chapter1-introduction
  npm run validate -- src/config/chapters.json
  npm run preview -- chapter1-introduction

Environment:
  ANTHROPIC_API_KEY    Claude API key (required for generate/preview)
`);
}

// Run CLI
main().catch((error) => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
