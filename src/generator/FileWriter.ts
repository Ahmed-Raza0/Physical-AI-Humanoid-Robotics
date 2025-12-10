/**
 * FileWriter - Handles file operations with safety checks
 */

import * as fs from 'fs';
import * as path from 'path';
import { GeneratedContent } from '../types/models';
import { FileOperationError } from './errors';

export class FileWriter {
  private outputDir: string;

  constructor(outputDir: string) {
    if (!outputDir || outputDir.trim().length === 0) {
      throw new FileOperationError(
        'Output directory cannot be empty',
        '',
        'create',
        false
      );
    }

    this.outputDir = path.normalize(outputDir);
  }

  /**
   * Writes chapter content to markdown file
   */
  async writeChapter(filename: string, content: GeneratedContent): Promise<void> {
    // Security checks
    this.validateFilename(filename);

    const fullPath = path.join(this.outputDir, filename);

    // Ensure output directory exists
    await this.ensureDirectoryExists(this.outputDir);

    try {
      await fs.promises.writeFile(fullPath, content.markdown, 'utf-8');
    } catch (error) {
      throw new FileOperationError(
        `Failed to write file: ${(error as Error).message}`,
        fullPath,
        'write',
        false
      );
    }
  }

  /**
   * Writes generation log to JSON file
   */
  async writeLog(filename: string, logData: any): Promise<void> {
    const logsDir = path.join(this.outputDir, '../logs');
    await this.ensureDirectoryExists(logsDir);

    const fullPath = path.join(logsDir, filename);

    try {
      const jsonContent = JSON.stringify(logData, null, 2);
      await fs.promises.writeFile(fullPath, jsonContent, 'utf-8');
    } catch (error) {
      throw new FileOperationError(
        `Failed to write log file: ${(error as Error).message}`,
        fullPath,
        'write',
        false
      );
    }
  }

  /**
   * Checks if file exists
   */
  async fileExists(filename: string): Promise<boolean> {
    const fullPath = path.join(this.outputDir, filename);

    try {
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deletes a file
   */
  async deleteFile(filename: string): Promise<void> {
    this.validateFilename(filename);

    const fullPath = path.join(this.outputDir, filename);

    // Check file exists
    if (!(await this.fileExists(filename))) {
      throw new FileOperationError(
        `File does not exist: ${filename}`,
        fullPath,
        'delete',
        false
      );
    }

    try {
      await fs.promises.unlink(fullPath);
    } catch (error) {
      throw new FileOperationError(
        `Failed to delete file: ${(error as Error).message}`,
        fullPath,
        'delete',
        false
      );
    }
  }

  /**
   * Creates a backup of existing file
   */
  async backupFile(filename: string, addTimestamp: boolean = false): Promise<void> {
    const fullPath = path.join(this.outputDir, filename);

    // Check file exists
    if (!(await this.fileExists(filename))) {
      throw new FileOperationError(
        `Cannot backup non-existent file: ${filename}`,
        fullPath,
        'read',
        false
      );
    }

    let backupPath: string;
    if (addTimestamp) {
      const timestamp = Date.now();
      backupPath = `${fullPath}.${timestamp}.backup`;
    } else {
      backupPath = `${fullPath}.backup`;
    }

    try {
      await fs.promises.copyFile(fullPath, backupPath);
    } catch (error) {
      throw new FileOperationError(
        `Failed to create backup: ${(error as Error).message}`,
        fullPath,
        'read',
        false
      );
    }
  }

  /**
   * Ensures directory exists, creates if needed
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      try {
        await fs.promises.mkdir(dirPath, { recursive: true });
      } catch (error) {
        throw new FileOperationError(
          `Failed to create directory: ${(error as Error).message}`,
          dirPath,
          'create',
          false
        );
      }
    }
  }

  /**
   * Validates filename for security
   */
  private validateFilename(filename: string): void {
    // Reject empty filenames
    if (!filename || filename.trim().length === 0) {
      throw new FileOperationError(
        'Filename cannot be empty',
        filename,
        'write',
        false
      );
    }

    // Reject absolute paths
    if (path.isAbsolute(filename)) {
      throw new FileOperationError(
        'Filename must be relative, not absolute',
        filename,
        'write',
        false
      );
    }

    // Reject directory traversal attempts
    const normalized = path.normalize(filename);
    if (normalized.includes('..') || normalized.startsWith('/') || normalized.startsWith('\\')) {
      throw new FileOperationError(
        'Filename contains directory traversal',
        filename,
        'write',
        false
      );
    }

    // Reject null bytes
    if (filename.includes('\x00')) {
      throw new FileOperationError(
        'Filename contains null bytes',
        filename,
        'write',
        false
      );
    }

    // Reject very long filenames
    if (filename.length > 255) {
      throw new FileOperationError(
        'Filename is too long (max 255 characters)',
        filename,
        'write',
        false
      );
    }

    // Only allow markdown extensions
    const ext = path.extname(filename).toLowerCase();
    if (ext !== '.md' && ext !== '.mdx') {
      throw new FileOperationError(
        'Only .md and .mdx file extensions are allowed',
        filename,
        'write',
        false
      );
    }
  }
}
