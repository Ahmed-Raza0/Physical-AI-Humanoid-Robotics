/**
 * PromptBuilder - Constructs prompts for Claude API using templates
 */

import * as fs from 'fs';
import * as path from 'path';
import { ChapterSpec, Section, GenerationPrompt } from '../types/models';
import { TemplateError } from './errors';
import { estimateTokensFromWords } from '../utils/CostEstimator';

export class PromptBuilder {
  private templateCache: Map<string, string> = new Map();
  private templateDir: string;

  constructor(templateDir?: string) {
    this.templateDir = templateDir || path.join(__dirname, '../templates');
  }

  /**
   * Builds a prompt for generating a single section
   */
  buildSectionPrompt(section: Section, chapter: ChapterSpec): GenerationPrompt {
    const template = this.getSectionTemplate(section, chapter);

    // Calculate token limits based on word count
    const estimatedOutputTokens = estimateTokensFromWords(section.estimatedWords);
    const maxTokens = Math.min(Math.max(estimatedOutputTokens * 2, 2000), 16000);

    return {
      type: 'section',
      template,
      systemPrompt: this.getSystemPrompt('section'),
      maxTokens,
      thinkingTokens: 5000,
      temperature: 0.7,
    };
  }

  /**
   * Builds a prompt for generating an entire chapter
   */
  buildChapterPrompt(chapter: ChapterSpec): GenerationPrompt {
    const template = this.getChapterTemplate(chapter);

    // Higher token limits for full chapters
    const estimatedOutputTokens = estimateTokensFromWords(chapter.estimatedWords);
    const maxTokens = Math.min(Math.max(estimatedOutputTokens * 2, 8000), 32000);

    return {
      type: 'chapter',
      template,
      systemPrompt: this.getSystemPrompt('chapter'),
      maxTokens,
      thinkingTokens: 10000,
      temperature: 0.7,
    };
  }

  /**
   * Builds a prompt for generating a code example
   */
  buildCodeExamplePrompt(section: Section, language: string): GenerationPrompt {
    const template = this.getCodeExampleTemplate(section, language);

    return {
      type: 'code-example',
      template,
      systemPrompt: this.getSystemPrompt('code-example'),
      maxTokens: 4000,
      thinkingTokens: 2000,
      temperature: 0.5,
    };
  }

  /**
   * Loads a template from file system
   */
  async loadTemplate(templateName: string): Promise<string> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const templatePath = path.join(this.templateDir, templateName);

    try {
      const content = await fs.promises.readFile(templatePath, 'utf-8');
      this.templateCache.set(templateName, content);
      return content;
    } catch (error) {
      throw new TemplateError(
        `Failed to load template: ${(error as Error).message}`,
        templatePath
      );
    }
  }

  /**
   * Renders a template with variables
   */
  renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;

    // Replace all placeholders
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      let replacement: string;

      if (Array.isArray(value)) {
        // Format arrays as bullet points
        replacement = value.map((item) => `- ${item}`).join('\n');
      } else if (typeof value === 'object') {
        replacement = JSON.stringify(value);
      } else {
        replacement = String(value);
      }

      rendered = rendered.replace(new RegExp(placeholder, 'g'), replacement);
    }

    return rendered;
  }

  /**
   * Validates a prompt
   */
  validatePrompt(prompt: GenerationPrompt): void {
    const errors: string[] = [];

    if (!prompt.template || prompt.template.trim().length === 0) {
      errors.push('Prompt template cannot be empty');
    }

    if (prompt.maxTokens <= 0 || prompt.maxTokens > 200000) {
      errors.push('Max tokens must be between 1 and 200000');
    }

    if (prompt.temperature < 0 || prompt.temperature > 1) {
      errors.push('Temperature must be between 0 and 1');
    }

    if (errors.length > 0) {
      throw new TemplateError(errors.join('; '));
    }
  }

  /**
   * Gets system prompt for a prompt type
   */
  getSystemPrompt(type: 'section' | 'chapter' | 'code-example'): string {
    const basePrompt = `You are an expert technical writer and educator creating high-quality textbook content.

Your writing should be:
- Clear and accessible to students
- Technically accurate and precise
- Well-structured with logical flow
- Engaging and educational
- Professional in tone

Always follow markdown best practices and include proper front matter.`;

    const typeSpecificPrompts: Record<string, string> = {
      section: `${basePrompt}

Focus on creating a well-structured section that teaches the specified concepts effectively. Include examples where appropriate and ensure the content matches the target word count.`,

      chapter: `${basePrompt}

Create a comprehensive chapter that covers all specified sections cohesively. Ensure smooth transitions between sections and a consistent level of detail throughout.`,

      'code-example': `${basePrompt}

Generate clear, well-commented code examples that illustrate the concepts being taught. Use best practices for the specified programming language and ensure code is complete and runnable.`,
    };

    return typeSpecificPrompts[type] || basePrompt;
  }

  /**
   * Gets section template with variables filled in
   */
  private getSectionTemplate(section: Section, chapter: ChapterSpec): string {
    // For now, build template inline (can be loaded from file later)
    const variables = {
      chapterTitle: chapter.title,
      chapterNumber: chapter.number,
      sectionTitle: section.title,
      level: section.level,
      estimatedWords: section.estimatedWords,
      learningObjectives: section.learningObjectives,
      keywords: section.keywords,
      keywordsList: section.keywords.map((k) => `"${k}"`).join(', '),
      position: chapter.sections.indexOf(section) + 1,
    };

    const template = `# Textbook Section Generation

You are creating educational content for Chapter ${variables.chapterNumber}: ${variables.chapterTitle}.

## Section to Generate

**Section Title**: ${variables.sectionTitle}
**Heading Level**: H${variables.level}
**Target Word Count**: ${variables.estimatedWords} words

## Learning Objectives

Students should be able to:
${variables.learningObjectives.map((obj) => `- ${obj}`).join('\n')}

## Key Topics to Cover

${variables.keywords.map((kw) => `- ${kw}`).join('\n')}

## Requirements

1. **Structure**:
   - Start with YAML front matter containing title, description, keywords, and sidebar_position
   - Begin content with \`# ${variables.sectionTitle}\` heading
   - Use appropriate heading levels (H2-H4) for subsections
   - Include clear paragraph breaks

2. **Content Quality**:
   - Write in clear, accessible language
   - Explain concepts progressively from simple to complex
   - Use concrete examples
   - Maintain an engaging, educational tone

3. **Code Examples** (if needed):
   - Specify programming language for all code blocks
   - Include explanatory comments
   - Use proper syntax highlighting

4. **Markdown Guidelines**:
   - Ensure all code blocks are properly closed
   - Use relative links for internal references
   - Use HTTPS links for external resources

5. **Length**: Target approximately ${variables.estimatedWords} words

Please generate the complete section now with front matter and all required elements.`;

    return template;
  }

  /**
   * Gets chapter template with variables filled in
   */
  private getChapterTemplate(chapter: ChapterSpec): string {
    const sectionsText = chapter.sections
      .map(
        (section, idx) =>
          `${idx + 1}. ${section.title} (~${section.estimatedWords} words)\n   Learning objectives: ${section.learningObjectives.join(', ')}`
      )
      .join('\n\n');

    return `# Textbook Chapter Generation

Create a comprehensive textbook chapter with the following specifications:

**Chapter Number**: ${chapter.number}
**Chapter Title**: ${chapter.title}
**Target Word Count**: ${chapter.estimatedWords} words

## Sections to Include

${sectionsText}

## Requirements

1. Include YAML front matter with chapter metadata
2. Begin with chapter introduction
3. Include all sections with smooth transitions
4. Maintain consistent depth and detail
5. End with chapter summary or conclusion

Generate the complete chapter now.`;
  }

  /**
   * Gets code example template
   */
  private getCodeExampleTemplate(section: Section, language: string): string {
    return `# Code Example Generation

Generate a code example for:

**Section**: ${section.title}
**Programming Language**: ${language}

## Requirements

1. Use ${language} with proper syntax
2. Include explanatory comments
3. Make code self-contained and runnable
4. Use meaningful variable/function names
5. Format as: \`\`\`${language}\ncode here\n\`\`\`

Generate the complete code example now.`;
  }
}
