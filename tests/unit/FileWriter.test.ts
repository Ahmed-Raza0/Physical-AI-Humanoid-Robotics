/**
 * Unit tests for FileWriter
 * Tests file operations and safety checks
 */

import { FileWriter } from '../../src/generator/FileWriter';
import { GeneratedContent } from '../../src/types/models';
import { FileOperationError } from '../../src/generator/errors';
import * as path from 'path';

// Mock fs module with proper structure
jest.mock('fs', () => {
  const mockWriteFile = jest.fn();
  const mockMkdir = jest.fn();
  const mockAccess = jest.fn();
  const mockUnlink = jest.fn();
  const mockCopyFile = jest.fn();
  const mockExistsSync = jest.fn();

  return {
    promises: {
      writeFile: mockWriteFile,
      mkdir: mockMkdir,
      access: mockAccess,
      unlink: mockUnlink,
      copyFile: mockCopyFile,
    },
    existsSync: mockExistsSync,
  };
});

// Get references to the mocked functions
const fs = require('fs');
const mockWriteFile = fs.promises.writeFile as jest.Mock;
const mockMkdir = fs.promises.mkdir as jest.Mock;
const mockAccess = fs.promises.access as jest.Mock;
const mockUnlink = fs.promises.unlink as jest.Mock;
const mockCopyFile = fs.promises.copyFile as jest.Mock;
const mockExistsSync = fs.existsSync as jest.Mock;

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
      mockWriteFile.mockResolvedValue(undefined);
      mockExistsSync.mockReturnValue(true);

      await writer.writeChapter('chapter1-intro.md', mockContent);

      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('chapter1-intro.md'),
        expect.stringContaining('# Test Chapter'),
        'utf-8'
      );
    });

    it('should create output directory if it does not exist', async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);
      mockExistsSync.mockReturnValue(false);

      await writer.writeChapter('chapter1-intro.md', mockContent);

      expect(mockMkdir).toHaveBeenCalledWith(expect.anything(), { recursive: true });
    });

    it('should sanitize file path to prevent directory traversal', async () => {
      mockWriteFile.mockResolvedValue(undefined);
      mockExistsSync.mockReturnValue(true);

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
      mockWriteFile.mockRejectedValue(new Error('Permission denied'));
      mockExistsSync.mockReturnValue(true);

      await expect(writer.writeChapter('test.md', mockContent)).rejects.toThrow(
        FileOperationError
      );
    });

    it('should preserve markdown formatting', async () => {
      let writtenContent = '';
      mockWriteFile.mockImplementation((_path, content) => {
        writtenContent = content;
        return Promise.resolve();
      });
      mockExistsSync.mockReturnValue(true);

      await writer.writeChapter('test.md', mockContent);

      expect(writtenContent).toContain('---');
      expect(writtenContent).toContain('# Test Chapter');
      expect(writtenContent).toContain('This is test content.');
    });
  });

  describe('writeLog', () => {
    it('should write generation log to JSON file', async () => {
      mockWriteFile.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);
      mockExistsSync.mockReturnValue(false);

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
      mockWriteFile.mockImplementation((_path, content) => {
        writtenContent = content;
        return Promise.resolve();
      });
      mockMkdir.mockResolvedValue(undefined);
      mockExistsSync.mockReturnValue(false);

      await writer.writeLog('test.json', { test: 'data' });

      const parsed = JSON.parse(writtenContent);
      expect(parsed.test).toBe('data');
      expect(writtenContent).toContain('\n'); // Should be formatted
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      mockAccess.mockResolvedValue(undefined);

      const exists = await writer.fileExists('existing-file.md');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      mockAccess.mockRejectedValue(new Error('File not found'));

      const exists = await writer.fileExists('missing-file.md');
      expect(exists).toBe(false);
    });
  });

  describe('deleteFile', () => {
    it('should delete existing file', async () => {
      mockUnlink.mockResolvedValue(undefined);
      mockAccess.mockResolvedValue(undefined);

      await writer.deleteFile('file-to-delete.md');

      expect(mockUnlink).toHaveBeenCalledWith(
        expect.stringContaining('file-to-delete.md')
      );
    });

    it('should throw error when deleting non-existent file', async () => {
      mockAccess.mockRejectedValue(new Error('File not found'));

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
      mockCopyFile.mockResolvedValue(undefined);
      mockAccess.mockResolvedValue(undefined);

      await writer.backupFile('original.md');

      expect(mockCopyFile).toHaveBeenCalledWith(
        expect.stringContaining('original.md'),
        expect.stringContaining('original.md.backup')
      );
    });

    it('should append timestamp to backup filename', async () => {
      mockCopyFile.mockResolvedValue(undefined);
      mockAccess.mockResolvedValue(undefined);

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
      mockWriteFile.mockResolvedValue(undefined);
      mockExistsSync.mockReturnValue(true);

      await writer.writeChapter('test.md', mockContent);
      await writer.writeChapter('test.mdx', mockContent);

      expect(mockWriteFile).toHaveBeenCalledTimes(2);
    });
  });
});
