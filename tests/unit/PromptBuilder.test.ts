/**
 * Unit tests for PromptBuilder
 * Tests template rendering and prompt construction
 */

import { PromptBuilder } from '../../src/generator/PromptBuilder';
import { ChapterSpec, Section } from '../../src/types/models';
import { TemplateError } from '../../src/generator/errors';

describe('PromptBuilder', () => {
  let builder: PromptBuilder;
  let mockSection: Section;
  let mockChapter: ChapterSpec;

  beforeEach(() => {
    builder = new PromptBuilder();

    mockSection = {
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
    };

    mockChapter = {
      id: 'chapter1-introduction',
      number: 1,
      title: 'Introduction to Physical AI',
      filePath: 'my-ai-textbook/docs/chapter1-introduction.md',
      sections: [mockSection],
      estimatedWords: 2500,
      status: 'draft',
    };
  });

  describe('buildSectionPrompt', () => {
    it('should build a complete prompt for a section', () => {
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);

      expect(prompt).toBeDefined();
      expect(prompt.type).toBe('section');
      expect(prompt.template).toContain('What is Physical AI?');
      expect(prompt.systemPrompt).toBeDefined();
      expect(prompt.maxTokens).toBeGreaterThan(0);
      expect(prompt.temperature).toBeGreaterThan(0);
    });

    it('should include section title in prompt', () => {
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);

      expect(prompt.template).toContain('What is Physical AI?');
    });

    it('should include learning objectives in prompt', () => {
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);

      expect(prompt.template).toContain('Define Physical AI and its key characteristics');
      expect(prompt.template).toContain('Distinguish Physical AI from traditional AI systems');
    });

    it('should include keywords in prompt', () => {
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);

      expect(prompt.template).toContain('embodied AI');
      expect(prompt.template).toContain('robotics');
      expect(prompt.template).toContain('sensors');
      expect(prompt.template).toContain('actuators');
    });

    it('should include chapter context in prompt', () => {
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);

      expect(prompt.template).toContain('Introduction to Physical AI');
    });

    it('should set appropriate token limits based on word count', () => {
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);

      // For 400 words, should allocate reasonable token count
      expect(prompt.maxTokens).toBeGreaterThan(1000);
      expect(prompt.maxTokens).toBeLessThan(10000);
    });

    it('should handle section with code example flag', () => {
      mockSection.includeCodeExample = true;
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);

      expect(prompt.template).toContain('code');
    });

    it('should handle empty keywords array', () => {
      mockSection.keywords = [];
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);

      expect(prompt).toBeDefined();
    });

    it('should handle minimal learning objectives', () => {
      mockSection.learningObjectives = ['Single objective'];
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);

      expect(prompt.template).toContain('Single objective');
    });
  });

  describe('buildChapterPrompt', () => {
    it('should build a prompt for entire chapter', () => {
      const prompt = builder.buildChapterPrompt(mockChapter);

      expect(prompt).toBeDefined();
      expect(prompt.type).toBe('chapter');
      expect(prompt.template).toContain('Introduction to Physical AI');
    });

    it('should include all sections in chapter prompt', () => {
      const additionalSection: Section = {
        id: 'history-evolution',
        title: 'History and Evolution',
        level: 2,
        estimatedWords: 500,
        learningObjectives: ['Trace the development of Physical AI'],
        keywords: ['timeline', 'milestones'],
        includeCodeExample: false,
      };

      mockChapter.sections.push(additionalSection);
      const prompt = builder.buildChapterPrompt(mockChapter);

      expect(prompt.template).toContain('What is Physical AI?');
      expect(prompt.template).toContain('History and Evolution');
    });

    it('should set higher token limits for chapter prompts', () => {
      const prompt = builder.buildChapterPrompt(mockChapter);

      // Chapter prompts should have higher token limits than sections
      expect(prompt.maxTokens).toBeGreaterThan(5000);
    });
  });

  describe('buildCodeExamplePrompt', () => {
    it('should build a prompt for code example', () => {
      const prompt = builder.buildCodeExamplePrompt(mockSection, 'python');

      expect(prompt).toBeDefined();
      expect(prompt.type).toBe('code-example');
      expect(prompt.template).toContain('python');
    });

    it('should include section context in code example prompt', () => {
      const prompt = builder.buildCodeExamplePrompt(mockSection, 'typescript');

      expect(prompt.template).toContain('What is Physical AI?');
      expect(prompt.template).toContain('typescript');
    });

    it('should support different programming languages', () => {
      const languages = ['python', 'typescript', 'javascript', 'rust', 'go'];

      languages.forEach((lang) => {
        const prompt = builder.buildCodeExamplePrompt(mockSection, lang);
        expect(prompt.template).toContain(lang);
      });
    });
  });

  describe('loadTemplate', () => {
    it('should load template from file system', async () => {
      const template = await builder.loadTemplate('section-prompt.md');

      expect(template).toBeDefined();
      expect(typeof template).toBe('string');
      expect(template.length).toBeGreaterThan(0);
    });

    it('should throw TemplateError for missing template', async () => {
      await expect(builder.loadTemplate('nonexistent-template.md')).rejects.toThrow(
        TemplateError
      );
    });

    it('should cache loaded templates', async () => {
      const template1 = await builder.loadTemplate('section-prompt.md');
      const template2 = await builder.loadTemplate('section-prompt.md');

      // Should return same reference (cached)
      expect(template1).toBe(template2);
    });
  });

  describe('renderTemplate', () => {
    it('should replace placeholders in template', () => {
      const template = 'Hello {{name}}, welcome to {{place}}!';
      const variables = { name: 'Alice', place: 'Wonderland' };

      const rendered = builder.renderTemplate(template, variables);

      expect(rendered).toBe('Hello Alice, welcome to Wonderland!');
    });

    it('should handle multiple occurrences of same placeholder', () => {
      const template = '{{name}} said {{name}} is {{name}}';
      const variables = { name: 'Bob' };

      const rendered = builder.renderTemplate(template, variables);

      expect(rendered).toBe('Bob said Bob is Bob');
    });

    it('should handle missing variables gracefully', () => {
      const template = 'Hello {{name}}';
      const variables = {};

      const rendered = builder.renderTemplate(template, variables);

      // Should leave placeholder or use empty string
      expect(rendered).toBeDefined();
    });

    it('should handle array values', () => {
      const template = 'Items: {{items}}';
      const variables = { items: ['apple', 'banana', 'cherry'] };

      const rendered = builder.renderTemplate(template, variables);

      expect(rendered).toContain('apple');
      expect(rendered).toContain('banana');
      expect(rendered).toContain('cherry');
    });

    it('should escape special markdown characters if needed', () => {
      const template = 'Code: {{code}}';
      const variables = { code: '`const x = 1;`' };

      const rendered = builder.renderTemplate(template, variables);

      expect(rendered).toContain('const x = 1');
    });
  });

  describe('validatePrompt', () => {
    it('should validate a well-formed prompt', () => {
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);

      expect(() => builder.validatePrompt(prompt)).not.toThrow();
    });

    it('should reject prompt with empty template', () => {
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);
      prompt.template = '';

      expect(() => builder.validatePrompt(prompt)).toThrow(TemplateError);
    });

    it('should reject prompt with invalid token count', () => {
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);
      prompt.maxTokens = -100;

      expect(() => builder.validatePrompt(prompt)).toThrow(TemplateError);
    });

    it('should reject prompt with invalid temperature', () => {
      const prompt = builder.buildSectionPrompt(mockSection, mockChapter);
      prompt.temperature = 2.0;

      expect(() => builder.validatePrompt(prompt)).toThrow(TemplateError);
    });
  });

  describe('getSystemPrompt', () => {
    it('should return appropriate system prompt for section type', () => {
      const systemPrompt = builder.getSystemPrompt('section');

      expect(systemPrompt).toBeDefined();
      expect(systemPrompt.length).toBeGreaterThan(0);
      expect(systemPrompt).toContain('textbook');
    });

    it('should return different prompts for different types', () => {
      const sectionPrompt = builder.getSystemPrompt('section');
      const chapterPrompt = builder.getSystemPrompt('chapter');
      const codePrompt = builder.getSystemPrompt('code-example');

      expect(sectionPrompt).not.toBe(chapterPrompt);
      expect(sectionPrompt).not.toBe(codePrompt);
      expect(chapterPrompt).not.toBe(codePrompt);
    });

    it('should include quality guidelines in system prompt', () => {
      const systemPrompt = builder.getSystemPrompt('section');

      expect(systemPrompt.toLowerCase()).toContain('clear');
      expect(systemPrompt.toLowerCase()).toMatch(/quality|accurate|educational/);
    });
  });
});
