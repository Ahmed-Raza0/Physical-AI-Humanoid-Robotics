/**
 * Utility for loading and validating chapter specifications
 */

import * as fs from 'fs';
import * as path from 'path';
import { ChapterSpec } from '../types/models';
import { ChapterSpecSchema, ChaptersConfigSchema } from '../types/schemas';
import { ValidationError, FileOperationError } from '../generator/errors';

/**
 * Loads a single chapter specification from a JSON file
 */
export async function loadChapter(filePath: string): Promise<ChapterSpec> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new FileOperationError(
        `Chapter file not found: ${filePath}`,
        filePath,
        'read',
        false
      );
    }

    // Read file content
    const content = await fs.promises.readFile(filePath, 'utf-8');

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      throw new ValidationError(
        `Invalid JSON in chapter file: ${filePath}`,
        [(parseError as Error).message]
      );
    }

    // Validate against schema
    const result = ChapterSpecSchema.safeParse(parsed);
    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new ValidationError(
        `Chapter specification validation failed for ${filePath}`,
        errors
      );
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof FileOperationError) {
      throw error;
    }
    throw new FileOperationError(
      `Failed to load chapter from ${filePath}: ${(error as Error).message}`,
      filePath,
      'read',
      false
    );
  }
}

/**
 * Loads multiple chapters from a chapters.json configuration file
 */
export async function loadChapters(configPath: string): Promise<ChapterSpec[]> {
  try {
    // Check if file exists
    if (!fs.existsSync(configPath)) {
      throw new FileOperationError(
        `Configuration file not found: ${configPath}`,
        configPath,
        'read',
        false
      );
    }

    // Read file content
    const content = await fs.promises.readFile(configPath, 'utf-8');

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      throw new ValidationError(
        `Invalid JSON in configuration file: ${configPath}`,
        [(parseError as Error).message]
      );
    }

    // Validate against schema
    const result = ChaptersConfigSchema.safeParse(parsed);
    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new ValidationError(
        `Chapters configuration validation failed for ${configPath}`,
        errors
      );
    }

    return result.data.chapters;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof FileOperationError) {
      throw error;
    }
    throw new FileOperationError(
      `Failed to load chapters from ${configPath}: ${(error as Error).message}`,
      configPath,
      'read',
      false
    );
  }
}

/**
 * Finds a chapter by ID in a list of chapters
 */
export function findChapterById(
  chapters: ChapterSpec[],
  chapterId: string
): ChapterSpec | undefined {
  return chapters.find((chapter) => chapter.id === chapterId);
}

/**
 * Validates that chapter file paths are unique
 */
export function validateUniqueFilePaths(chapters: ChapterSpec[]): string[] {
  const errors: string[] = [];
  const seenPaths = new Set<string>();

  for (const chapter of chapters) {
    const normalizedPath = path.normalize(chapter.filePath);
    if (seenPaths.has(normalizedPath)) {
      errors.push(
        `Duplicate file path detected: ${chapter.filePath} (chapter: ${chapter.id})`
      );
    }
    seenPaths.add(normalizedPath);
  }

  return errors;
}

/**
 * Validates that chapter IDs are unique
 */
export function validateUniqueIds(chapters: ChapterSpec[]): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const chapter of chapters) {
    if (seenIds.has(chapter.id)) {
      errors.push(`Duplicate chapter ID detected: ${chapter.id}`);
    }
    seenIds.add(chapter.id);
  }

  return errors;
}

/**
 * Validates that chapter numbers are sequential and unique
 */
export function validateChapterNumbers(chapters: ChapterSpec[]): string[] {
  const errors: string[] = [];
  const seenNumbers = new Set<number>();

  for (const chapter of chapters) {
    if (seenNumbers.has(chapter.number)) {
      errors.push(
        `Duplicate chapter number detected: ${chapter.number} (chapter: ${chapter.id})`
      );
    }
    seenNumbers.add(chapter.number);
  }

  // Check if numbers are sequential (1, 2, 3, ...)
  const sortedNumbers = Array.from(seenNumbers).sort((a, b) => a - b);
  for (let i = 0; i < sortedNumbers.length; i++) {
    if (sortedNumbers[i] !== i + 1) {
      errors.push(
        `Chapter numbers are not sequential. Expected ${i + 1}, found ${sortedNumbers[i]}`
      );
      break;
    }
  }

  return errors;
}

/**
 * Performs comprehensive validation on a list of chapters
 */
export function validateChapters(chapters: ChapterSpec[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate unique IDs
  errors.push(...validateUniqueIds(chapters));

  // Validate unique file paths
  errors.push(...validateUniqueFilePaths(chapters));

  // Validate chapter numbers
  errors.push(...validateChapterNumbers(chapters));

  // Check for empty sections in any chapter
  for (const chapter of chapters) {
    if (chapter.sections.length === 0) {
      errors.push(`Chapter ${chapter.id} has no sections`);
    }

    // Check for duplicate section IDs within a chapter
    const sectionIds = new Set<string>();
    for (const section of chapter.sections) {
      if (sectionIds.has(section.id)) {
        errors.push(
          `Duplicate section ID '${section.id}' in chapter ${chapter.id}`
        );
      }
      sectionIds.add(section.id);
    }

    // Warning: Check if estimated words is significantly different from sum of sections
    const totalSectionWords = chapter.sections.reduce(
      (sum, section) => sum + section.estimatedWords,
      0
    );
    const difference = Math.abs(chapter.estimatedWords - totalSectionWords);
    if (difference > 500) {
      warnings.push(
        `Chapter ${chapter.id}: Estimated words (${chapter.estimatedWords}) differs significantly from section total (${totalSectionWords})`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
