/**
 * Integration test for end-to-end chapter generation flow
 * Tests the complete workflow from chapter spec to generated markdown file
 */

import { Generator } from '../../src/generator/Generator';
import { ChapterSpec } from '../../src/types/models';
import { FileWriter } from '../../src/generator/FileWriter';
import { ClaudeClient } from '../../src/generator/ClaudeClient';
import { PromptBuilder } from '../../src/generator/PromptBuilder';
import { ContentValidator } from '../../src/generator/ContentValidator';
import * as fs from 'fs';
import * as path from 'path';
import { MOCK_SECTION_RESPONSE } from '../mocks/claude-responses';

// Mock file system
jest.mock('fs');
jest.mock('fs/promises');

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk');

describe('Generation Flow Integration', () => {
  const testOutputDir = path.join(__dirname, '../tmp/test-output');
  let generator: Generator;
  let mockChapterSpec: ChapterSpec;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock file system
    (fs.existsSync as jest.Mock) = jest.fn().mockReturnValue(true);
    (fs.promises.mkdir as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (fs.promises.writeFile as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (fs.promises.readFile as jest.Mock) = jest.fn().mockResolvedValue('template content');

    // Create test chapter specification
    mockChapterSpec = {
      id: 'chapter1-introduction',
      number: 1,
      title: 'Introduction to Physical AI',
      filePath: 'my-ai-textbook/docs/chapter1-introduction.md',
      sections: [
        {
          id: 'what-is-physical-ai',
          title: 'What is Physical AI?',
          level: 2,
          estimatedWords: 400,
          learningObjectives: [
            'Define Physical AI and its key characteristics',
            'Distinguish Physical AI from traditional AI systems',
          ],
          keywords: ['embodied AI', 'robotics', 'sensors', 'actuators'],
          includeCodeExample: false,
        },
        {
          id: 'history-evolution',
          title: 'History and Evolution',
          level: 2,
          estimatedWords: 500,
          learningObjectives: [
            'Trace the development of Physical AI from early robotics',
          ],
          keywords: ['timeline', 'milestones'],
          includeCodeExample: false,
        },
      ],
      estimatedWords: 2500,
      status: 'draft',
    };

    // Initialize generator with dependencies
    const apiKey = 'sk-ant-test-key';
    generator = new Generator(apiKey, {
      outputDir: testOutputDir,
      templateDir: path.join(__dirname, '../../src/templates'),
      dryRun: false,
      retryAttempts: 2,
    });
  });

  describe('End-to-end chapter generation', () => {
    it('should generate a complete chapter from specification', async () => {
      // Mock Claude API response
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      // Generate chapter
      const result = await generator.generateChapter(mockChapterSpec);

      // Verify result
      expect(result.status).toBe('success');
      expect(result.sections.size).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.totalTokens).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);

      // Verify file was written
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });

    it('should generate all sections in sequence', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      await generator.generateChapter(mockChapterSpec);

      // Should call Claude API once per section
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should validate generated content before writing', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const validateSpy = jest.spyOn(
        (generator as any).contentValidator,
        'validateMarkdown'
      );

      await generator.generateChapter(mockChapterSpec);

      // Should validate each section
      expect(validateSpy).toHaveBeenCalledTimes(2);
    });

    it('should write generation log after completion', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      await generator.generateChapter(mockChapterSpec);

      // Should write both markdown file and log file
      const writeFileCalls = (fs.promises.writeFile as jest.Mock).mock.calls;
      expect(writeFileCalls.length).toBeGreaterThanOrEqual(2);

      // Check that log file was written
      const logWritten = writeFileCalls.some((call) =>
        call[0].includes('generation-')
      );
      expect(logWritten).toBe(true);
    });

    it('should calculate accurate token counts and costs', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const result = await generator.generateChapter(mockChapterSpec);

      // Verify token calculation
      expect(result.totalTokens).toBe(
        MOCK_SECTION_RESPONSE.usage.input_tokens +
          MOCK_SECTION_RESPONSE.usage.output_tokens
      );

      // Verify cost is calculated
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('should track generation duration', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const result = await generator.generateChapter(mockChapterSpec);

      expect(result.startedAt).toBeInstanceOf(Date);
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(result.durationMs).toBeGreaterThan(0);
      expect(result.completedAt.getTime()).toBeGreaterThanOrEqual(
        result.startedAt.getTime()
      );
    });
  });

  describe('Partial success handling', () => {
    it('should handle partial success when some sections fail', async () => {
      const mockCreate = jest
        .fn()
        .mockResolvedValueOnce(MOCK_SECTION_RESPONSE)
        .mockRejectedValueOnce(new Error('API error'));

      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const result = await generator.generateChapter(mockChapterSpec);

      expect(result.status).toBe('partial');
      expect(result.sections.size).toBe(1); // Only first section succeeded
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should continue processing after section failure', async () => {
      const mockCreate = jest
        .fn()
        .mockRejectedValueOnce(new Error('First section fails'))
        .mockResolvedValueOnce(MOCK_SECTION_RESPONSE);

      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const result = await generator.generateChapter(mockChapterSpec);

      // Should still process second section
      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(result.sections.size).toBe(1); // Second section succeeded
    });

    it('should write partial results to file', async () => {
      const mockCreate = jest
        .fn()
        .mockResolvedValueOnce(MOCK_SECTION_RESPONSE)
        .mockRejectedValueOnce(new Error('API error'));

      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      await generator.generateChapter(mockChapterSpec);

      // Should still write file even with partial success
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should return failed status when all sections fail', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API error'));

      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const result = await generator.generateChapter(mockChapterSpec);

      expect(result.status).toBe('failed');
      expect(result.sections.size).toBe(0);
      expect(result.errors.length).toBe(2); // Both sections failed
    });

    it('should capture detailed error information', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('Specific API error'));

      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const result = await generator.generateChapter(mockChapterSpec);

      expect(result.errors[0].message).toContain('Specific API error');
      expect(result.errors[0].sectionId).toBe('what-is-physical-ai');
    });

    it('should not write file when all sections fail', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API error'));

      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      await generator.generateChapter(mockChapterSpec);

      // Should not write markdown file, only log
      const writeFileCalls = (fs.promises.writeFile as jest.Mock).mock.calls;
      const markdownWritten = writeFileCalls.some(
        (call) => call[0].includes('.md') && !call[0].includes('generation-')
      );
      expect(markdownWritten).toBe(false);
    });
  });

  describe('Dry run mode', () => {
    it('should not write files in dry run mode', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const dryRunGenerator = new Generator('sk-ant-test-key', {
        outputDir: testOutputDir,
        templateDir: path.join(__dirname, '../../src/templates'),
        dryRun: true,
      });

      (dryRunGenerator as any).claudeClient.anthropic = {
        messages: { create: mockCreate },
      };

      await dryRunGenerator.generateChapter(mockChapterSpec);

      // Should not write any files in dry run
      expect(fs.promises.writeFile).not.toHaveBeenCalled();
    });

    it('should still validate content in dry run mode', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);

      const dryRunGenerator = new Generator('sk-ant-test-key', {
        outputDir: testOutputDir,
        templateDir: path.join(__dirname, '../../src/templates'),
        dryRun: true,
      });

      (dryRunGenerator as any).claudeClient.anthropic = {
        messages: { create: mockCreate },
      };

      const validateSpy = jest.spyOn(
        (dryRunGenerator as any).contentValidator,
        'validateMarkdown'
      );

      await dryRunGenerator.generateChapter(mockChapterSpec);

      expect(validateSpy).toHaveBeenCalled();
    });
  });

  describe('Component integration', () => {
    it('should use PromptBuilder to construct prompts', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const buildSpy = jest.spyOn(
        (generator as any).promptBuilder,
        'buildSectionPrompt'
      );

      await generator.generateChapter(mockChapterSpec);

      expect(buildSpy).toHaveBeenCalledTimes(2);
    });

    it('should use ClaudeClient for API calls', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const generateSpy = jest.spyOn(
        (generator as any).claudeClient,
        'generateContent'
      );

      await generator.generateChapter(mockChapterSpec);

      expect(generateSpy).toHaveBeenCalledTimes(2);
    });

    it('should use FileWriter for output', async () => {
      const mockCreate = jest.fn().mockResolvedValue(MOCK_SECTION_RESPONSE);
      (generator as any).claudeClient.anthropic = { messages: { create: mockCreate } };

      const writeSpy = jest.spyOn((generator as any).fileWriter, 'writeChapter');

      await generator.generateChapter(mockChapterSpec);

      expect(writeSpy).toHaveBeenCalled();
    });
  });
});
