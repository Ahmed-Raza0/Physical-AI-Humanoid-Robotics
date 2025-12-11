/**
 * ContentValidator - Validates markdown content and ensures quality
 */

import { GeneratedContent } from '../types/models';
import { ValidationError } from './errors';

export class ContentValidator {
  /**
   * Validates markdown content
   */
  validateMarkdown(markdown: string): void {
    const errors: string[] = [];

    // Check for front matter
    if (!markdown.match(/^---\n[\s\S]*?\n---/)) {
      errors.push('Markdown must include YAML front matter at the beginning');
    }

    // Check minimum length (excluding front matter)
    const contentWithoutFrontMatter = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
    if (contentWithoutFrontMatter.length < 100) {
      errors.push('Markdown content is too short (minimum 100 characters)');
    }

    // Check for at least one heading
    if (!markdown.match(/^#{1,6}\s+.+$/m)) {
      errors.push('Markdown must contain at least one heading');
    }

    // Check for unclosed code blocks
    const codeBlockMatches = markdown.match(/```/g);
    if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
      errors.push('Markdown contains unclosed code blocks');
    }

    // Check code blocks have language specified
    // Match opening code blocks (``` at start of line)
    // We need to find code blocks that don't have a language specifier
    const lines = markdown.split('\n');
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this line starts a code block
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          // This is an opening block
          const languageSpecifier = line.trim().substring(3).trim();
          if (languageSpecifier.length === 0) {
            errors.push('All code blocks must specify a language (e.g., ```python)');
            break;
          }
          inCodeBlock = true;
        } else {
          // This is a closing block
          inCodeBlock = false;
        }
      }
    }

    // Validate links
    try {
      this.validateLinks(markdown);
    } catch (e) {
      errors.push((e as Error).message);
    }

    if (errors.length > 0) {
      throw new ValidationError('Markdown validation failed', errors);
    }
  }

  /**
   * Validates front matter
   */
  validateFrontMatter(frontMatter: any): void {
    const errors: string[] = [];

    if (!frontMatter.title) {
      errors.push('Front matter must include title');
    }

    if (!frontMatter.description) {
      errors.push('Front matter must include description');
    }

    if (!Array.isArray(frontMatter.keywords)) {
      errors.push('Front matter must include keywords array');
    }

    if (typeof frontMatter.sidebar_position !== 'number') {
      errors.push('Front matter must include sidebar_position as number');
    }

    if (errors.length > 0) {
      throw new ValidationError('Front matter validation failed', errors);
    }
  }

  /**
   * Validates generated content
   */
  validateGeneratedContent(content: GeneratedContent): void {
    const errors: string[] = [];

    // Validate markdown
    try {
      this.validateMarkdown(content.markdown);
    } catch (e) {
      if (e instanceof ValidationError) {
        errors.push(...e.validationErrors);
      }
    }

    // Validate metadata
    try {
      this.validateFrontMatter(content.metadata);
    } catch (e) {
      if (e instanceof ValidationError) {
        errors.push(...e.validationErrors);
      }
    }

    // Validate tokens
    if (content.tokensUsed <= 0) {
      errors.push('Tokens used must be greater than 0');
    }

    // Validate model version
    if (!content.modelVersion || content.modelVersion.length === 0) {
      errors.push('Model version must be specified');
    }

    if (errors.length > 0) {
      throw new ValidationError('Generated content validation failed', errors);
    }
  }

  /**
   * Extracts front matter from markdown
   */
  extractFrontMatter(markdown: string): any {
    const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);

    if (!frontMatterMatch) {
      throw new ValidationError('No front matter found in markdown');
    }

    const frontMatterText = frontMatterMatch[1];
    const frontMatter: any = {};

    // Parse YAML (simple key-value parsing)
    const titleMatch = frontMatterText.match(/title:\s*["'](.+?)["']/);
    const descMatch = frontMatterText.match(/description:\s*["'](.+?)["']/);
    const keywordsMatch = frontMatterText.match(/keywords:\s*\[(.*?)\]/);
    const posMatch = frontMatterText.match(/sidebar_position:\s*(\d+)/);

    // Support multi-line description
    const multilineDescMatch = frontMatterText.match(/description:\s*\|\n([\s\S]*?)(?=\n\w+:|$)/);

    if (titleMatch) frontMatter.title = titleMatch[1];
    if (descMatch) frontMatter.description = descMatch[1];
    if (multilineDescMatch) {
      frontMatter.description = multilineDescMatch[1].trim().replace(/\n/g, ' ');
    }

    if (keywordsMatch) {
      const keywordsStr = keywordsMatch[1];
      // Handle both inline and multi-line keywords
      frontMatter.keywords = keywordsStr
        .split(',')
        .map((k) => k.trim().replace(/["'\-\s]/g, ''))
        .filter((k) => k.length > 0);
    } else {
      // Try multi-line keywords
      const multilineKeywords = frontMatterText.match(/keywords:\s*\n(\s+-\s+.+\n)+/);
      if (multilineKeywords) {
        frontMatter.keywords = multilineKeywords[0]
          .split('\n')
          .filter((line) => line.trim().startsWith('-'))
          .map((line) => line.replace(/^\s*-\s*/, '').trim());
      }
    }

    if (posMatch) frontMatter.sidebar_position = parseInt(posMatch[1], 10);

    return frontMatter;
  }

  /**
   * Validates code block syntax (basic check)
   */
  async checkCodeBlockSyntax(code: string, language: string): Promise<boolean> {
    // For now, just do basic validation
    // In production, you might use language-specific parsers

    if (language === 'plaintext' || language === 'text') {
      return true; // Skip validation for plain text
    }

    // Basic checks for common languages
    if (language === 'python') {
      // Check for unclosed parentheses, brackets, braces
      const opens = (code.match(/[({[]/g) || []).length;
      const closes = (code.match(/[)}\]]/g) || []).length;
      if (opens !== closes) {
        return false;
      }
    }

    if (language === 'javascript' || language === 'typescript') {
      // Check for unclosed braces
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        return false;
      }
    }

    // Default: assume valid
    return true;
  }

  /**
   * Validates links in markdown
   */
  validateLinks(markdown: string): void {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const errors: string[] = [];

    let match;
    while ((match = linkRegex.exec(markdown)) !== null) {
      const url = match[2];

      // Reject dangerous protocols
      if (url.startsWith('javascript:')) {
        errors.push(`Dangerous link protocol detected: javascript: in "${match[0]}"`);
      }

      if (url.startsWith('file:')) {
        errors.push(`Dangerous link protocol detected: file: in "${match[0]}"`);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Link validation failed', errors);
    }
  }

  /**
   * Gets all validation errors without throwing
   */
  getValidationErrors(markdown: string): string[] {
    const errors: string[] = [];

    try {
      this.validateMarkdown(markdown);
    } catch (e) {
      if (e instanceof ValidationError) {
        errors.push(...e.validationErrors);
      } else {
        errors.push((e as Error).message);
      }
    }

    return errors;
  }
}
