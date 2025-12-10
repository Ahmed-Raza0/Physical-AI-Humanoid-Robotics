/**
 * Unit tests for FileWriter
 * Tests file operations and safety checks
 */

import { FileWriter } from '../../src/generator/FileWriter';
import { GeneratedContent } from '../../src/types/models';
import { FileOperationError } from '../../src/generator/errors';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
jest.mock('fs/promises');

describe('FileWriter', () => {
  let writer: FileWriter;
  const mockOutputDir = '/test/output';
  let mockContent: GeneratedContent;

  beforeEach(() => {
    jest.clearAllMocks();
    writer = new FileWriter(mockOutputDir);

    mockContent = {
      markdown: `---
title: "Test Chapter"
description: "Test description"
keywords: ["test"]
sidebar_position: 1
---

# Test Chapter

This is test content.`,
      metadata: {
        title: 'Test Chapter',
        description: 'Test description',
        keywords: ['test'],
        sidebar_position: 1,
      },
      tokensUsed: 1000,
      thinkingTokens: 500,
      generatedAt: new Date(),
      modelVersion: 'claude-sonnet-4-20250514',
    };
  });

  describe('constructor', () => {
    it('should create writer with valid output directory', () => {
      expect(writer).toBeInstanceOf(FileWriter);
    });

    it('should throw error for empty output directory', () => {
      expect(() => new FileWriter('')).toThrow(FileOperationError);
    });

    it('should normalize output directory path', () => {
      const writerWithTrailingSlash = new FileWriter('/test/output/');
      expect(writerWithTrailingSlash).toBeInstanceOf(FileWriter);
    });
  });

  describe('writeChapter', () => {
    it('should write content to file', async () => {
      const mockWriteFile = jest.fn().mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock) = mockWriteFile;
      (fs.existsSync as jest.Mock) = jest.fn().mockReturnValue(true);

      await writer.writeChapter('chapter1-intro.md', mockContent);

      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('chapter1-intro.md'),
        expect.stringContaining('# Test Chapter'),
        'utf-8'
      );
    });

    it('should create output directory if it does not exist', async () => {
      const mockMkdir = jest.fn().mockResolvedValue(undefined);
      const mockWriteFile = jest.fn().mockResolvedValue(undefined);
      (fs.promises.mkdir as jest.Mock) = mockMkdir;
      (fs.promises.writeFile as jest.Mock) = mockWriteFile;
      (fs.existsSync as jest.Mock) = jest.fn().mockReturnValue(false);

      await writer.writeChapter('chapter1-intro.md', mockContent);

      expect(mockMkdir).toHaveBeenCalledWith(expect.anything(), { recursive: true });
    });

    it('should sanitize file path to prevent directory traversal', async () => {
      const mockWriteFile = jest.fn().mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock) = mockWriteFile;
      (fs.existsSync as jest.Mock) = jest.fn().mockReturnValue(true);

      await expect(
        writer.writeChapter('../../../etc/passwd', mockContent)
      ).rejects.toThrow(FileOperationError);
    });

    it('should reject absolute paths in filename', async () => {
      await expect(writer.writeChapter('/etc/passwd', mockContent)).rejects.toThrow(
        FileOperationError
      );
    });

    it('should handle write errors gracefully', async () => {
      const mockWriteFile = jest
        .fn()
        .mockRejectedValue(new Error('Permission denied'));
      (fs.promises.writeFile as jest.Mock) = mockWriteFile;
      (fs.existsSync as jest.Mock) = jest.fn().mockReturnValue(true);

      await expect(writer.writeChapter('test.md', mockContent)).rejects.toThrow(
        FileOperationError
      );
    });

    it('should preserve markdown formatting', async () => {
      let writtenContent = '';
      const mockWriteFile = jest.fn().mockImplementation((_path, content) => {
        writtenContent = content;
        return Promise.resolve();
      });
      (fs.promises.writeFile as jest.Mock) = mockWriteFile;
      (fs.existsSync as jest.Mock) = jest.fn().mockReturnValue(true);

      await writer.writeChapter('test.md', mockContent);

      expect(writtenContent).toContain('---');
      expect(writtenContent).toContain('# Test Chapter');
      expect(writtenContent).toContain('This is test content.');
    });
  });

  describe('writeLog', () => {
    it('should write generation log to JSON file', async () => {
      const mockWriteFile = jest.fn().mockResolvedValue(undefined);
      const mockMkdir = jest.fn().mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock) = mockWriteFile;
      (fs.promises.mkdir as jest.Mock) = mockMkdir;
      (fs.existsSync as jest.Mock) = jest.fn().mockReturnValue(false);

      const logData = {
        chapterId: 'chapter1-intro',
        timestamp: new Date().toISOString(),
        tokensUsed: 1000,
        success: true,
      };

      await writer.writeLog('generation-2025-01-01.json', logData);

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('.json'),
        expect.stringContaining('chapter1-intro'),
        'utf-8'
      );
    });

    it('should format JSON with proper indentation', async () => {
      let writtenContent = '';
      const mockWriteFile = jest.fn().mockImplementation((_path, content) => {
        writtenContent = content;
        return Promise.resolve();
      });
      const mockMkdir = jest.fn().mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock) = mockWriteFile;
      (fs.promises.mkdir as jest.Mock) = mockMkdir;
      (fs.existsSync as jest.Mock) = jest.fn().mockReturnValue(false);

      await writer.writeLog('test.json', { test: 'data' });

      const parsed = JSON.parse(writtenContent);
      expect(parsed.test).toBe('data');
      expect(writtenContent).toContain('\n'); // Should be formatted
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      (fs.promises.access as jest.Mock) = jest.fn().mockResolvedValue(undefined);

      const exists = await writer.fileExists('existing-file.md');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      (fs.promises.access as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('File not found'));

      const exists = await writer.fileExists('missing-file.md');
      expect(exists).toBe(false);
    });
  });

  describe('deleteFile', () => {
    it('should delete existing file', async () => {
      const mockUnlink = jest.fn().mockResolvedValue(undefined);
      (fs.promises.unlink as jest.Mock) = mockUnlink;
      (fs.promises.access as jest.Mock) = jest.fn().mockResolvedValue(undefined);

      await writer.deleteFile('file-to-delete.md');

      expect(mockUnlink).toHaveBeenCalledWith(
        expect.stringContaining('file-to-delete.md')
      );
    });

    it('should throw error when deleting non-existent file', async () => {
      (fs.promises.access as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error('File not found'));

      await expect(writer.deleteFile('missing.md')).rejects.toThrow(FileOperationError);
    });

    it('should prevent deleting files outside output directory', async () => {
      await expect(writer.deleteFile('../../../etc/passwd')).rejects.toThrow(
        FileOperationError
      );
    });
  });

  describe('backupFile', () => {
    it('should create backup of existing file', async () => {
      const mockCopyFile = jest.fn().mockResolvedValue(undefined);
      const mockAccess = jest.fn().mockResolvedValue(undefined);
      (fs.promises.copyFile as jest.Mock) = mockCopyFile;
      (fs.promises.access as jest.Mock) = mockAccess;

      await writer.backupFile('original.md');

      expect(mockCopyFile).toHaveBeenCalledWith(
        expect.stringContaining('original.md'),
        expect.stringContaining('original.md.backup')
      );
    });

    it('should append timestamp to backup filename', async () => {
      const mockCopyFile = jest.fn().mockResolvedValue(undefined);
      const mockAccess = jest.fn().mockResolvedValue(undefined);
      (fs.promises.copyFile as jest.Mock) = mockCopyFile;
      (fs.promises.access as jest.Mock) = mockAccess;

      await writer.backupFile('test.md', true);

      expect(mockCopyFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/test\.md\.\d+\.backup$/)
      );
    });
  });

  describe('safety checks', () => {
    it('should reject filenames with null bytes', async () => {
      await expect(writer.writeChapter('file\x00.md', mockContent)).rejects.toThrow(
        FileOperationError
      );
    });

    it('should reject very long filenames', async () => {
      const longName = 'a'.repeat(300) + '.md';
      await expect(writer.writeChapter(longName, mockContent)).rejects.toThrow(
        FileOperationError
      );
    });

    it('should only allow markdown file extensions', async () => {
      await expect(writer.writeChapter('file.txt', mockContent)).rejects.toThrow(
        FileOperationError
      );
    });

    it('should allow .md and .mdx extensions', async () => {
      const mockWriteFile = jest.fn().mockResolvedValue(undefined);
      (fs.promises.writeFile as jest.Mock) = mockWriteFile;
      (fs.existsSync as jest.Mock) = jest.fn().mockReturnValue(true);

      await writer.writeChapter('test.md', mockContent);
      await writer.writeChapter('test.mdx', mockContent);

      expect(mockWriteFile).toHaveBeenCalledTimes(2);
    });
  });
});
