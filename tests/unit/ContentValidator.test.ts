/**
 * Unit tests for ContentValidator
 * Tests markdown validation and content quality checks
 */

import { ContentValidator } from '../../src/generator/ContentValidator';
import { GeneratedContent } from '../../src/types/models';
import { ValidationError } from '../../src/generator/errors';

describe('ContentValidator', () => {
  let validator: ContentValidator;

  beforeEach(() => {
    validator = new ContentValidator();
  });

  describe('validateMarkdown', () => {
    it('should validate well-formed markdown', () => {
      const markdown = `---
title: "Test Section"
description: "Test description"
keywords: ["test", "markdown"]
sidebar_position: 1
---

# Test Section

This is a valid markdown section with proper structure.

## Subsection

Content here.`;

      expect(() => validator.validateMarkdown(markdown)).not.toThrow();
    });

    it('should reject markdown without front matter', () => {
      const markdown = `# Test Section

No front matter here.`;

      expect(() => validator.validateMarkdown(markdown)).toThrow(ValidationError);
    });

    it('should reject markdown with unclosed code blocks', () => {
      const markdown = `---
title: "Test"
---

# Test

\`\`\`python
def hello():
    print("Hello")
`;

      expect(() => validator.validateMarkdown(markdown)).toThrow(ValidationError);
    });

    it('should require at least one heading', () => {
      const markdown = `---
title: "Test"
---

Just some text without any headings.`;

      expect(() => validator.validateMarkdown(markdown)).toThrow(ValidationError);
    });

    it('should validate code blocks have language specified', () => {
      const markdown = `---
title: "Test"
---

# Test

\`\`\`
code without language
\`\`\``;

      expect(() => validator.validateMarkdown(markdown)).toThrow(ValidationError);
    });

    it('should accept code blocks with language', () => {
      const markdown = `---
title: "Test"
description: "Test description"
keywords: ["test"]
sidebar_position: 1
---

# Test

This is a test section with enough content to pass validation requirements.

\`\`\`python
print("Hello")
\`\`\``;

      expect(() => validator.validateMarkdown(markdown)).not.toThrow();
    });

    it('should reject markdown that is too short', () => {
      const markdown = `---
title: "Test"
---

# Test

Hi.`;

      expect(() => validator.validateMarkdown(markdown)).toThrow(ValidationError);
    });

    it('should validate multiple code blocks', () => {
      const markdown = `---
title: "Test"
description: "Test description"
keywords: ["test"]
sidebar_position: 1
---

# Test

This section demonstrates multiple code blocks with different programming languages.

\`\`\`python
print("Hello")
\`\`\`

Some text explaining the code above and introducing the next example.

\`\`\`javascript
console.log("Hello");
\`\`\``;

      expect(() => validator.validateMarkdown(markdown)).not.toThrow();
    });
  });

  describe('validateFrontMatter', () => {
    it('should validate complete front matter', () => {
      const markdown = `---
title: "Test Section"
description: "A comprehensive test"
keywords: ["test", "validation"]
sidebar_position: 1
---

# Content`;

      const frontMatter = validator.extractFrontMatter(markdown);
      expect(() => validator.validateFrontMatter(frontMatter)).not.toThrow();
    });

    it('should reject front matter without title', () => {
      const frontMatter = {
        description: 'Test',
        keywords: ['test'],
        sidebar_position: 1,
      };

      expect(() => validator.validateFrontMatter(frontMatter)).toThrow(ValidationError);
    });

    it('should reject front matter without description', () => {
      const frontMatter = {
        title: 'Test',
        keywords: ['test'],
        sidebar_position: 1,
      };

      expect(() => validator.validateFrontMatter(frontMatter)).toThrow(ValidationError);
    });

    it('should require keywords array', () => {
      const frontMatter = {
        title: 'Test',
        description: 'Test desc',
        sidebar_position: 1,
      };

      expect(() => validator.validateFrontMatter(frontMatter)).toThrow(ValidationError);
    });

    it('should validate sidebar_position is a number', () => {
      const frontMatter = {
        title: 'Test',
        description: 'Test desc',
        keywords: ['test'],
        sidebar_position: 'invalid',
      };

      expect(() => validator.validateFrontMatter(frontMatter)).toThrow(ValidationError);
    });
  });

  describe('validateGeneratedContent', () => {
    it('should validate complete generated content', () => {
      const content: GeneratedContent = {
        markdown: `---
title: "Test"
description: "Test description"
keywords: ["test"]
sidebar_position: 1
---

# Test Section

This is valid content with sufficient length to pass the minimum character requirement for markdown validation. The content must be at least 100 characters.`,
        metadata: {
          title: 'Test',
          description: 'Test description',
          keywords: ['test'],
          sidebar_position: 1,
        },
        tokensUsed: 1500,
        thinkingTokens: 500,
        generatedAt: new Date(),
        modelVersion: 'claude-sonnet-4-20250514',
      };

      expect(() => validator.validateGeneratedContent(content)).not.toThrow();
    });

    it('should reject content with zero tokens', () => {
      const content: GeneratedContent = {
        markdown: `---
title: "Test"
---

# Test

Content here.`,
        metadata: {
          title: 'Test',
          description: 'Test',
          keywords: ['test'],
          sidebar_position: 1,
        },
        tokensUsed: 0,
        thinkingTokens: 0,
        generatedAt: new Date(),
        modelVersion: 'claude-sonnet-4-20250514',
      };

      expect(() => validator.validateGeneratedContent(content)).toThrow(ValidationError);
    });

    it('should reject content with invalid model version', () => {
      const content: GeneratedContent = {
        markdown: `---
title: "Test"
---

# Test

Content here.`,
        metadata: {
          title: 'Test',
          description: 'Test',
          keywords: ['test'],
          sidebar_position: 1,
        },
        tokensUsed: 1000,
        thinkingTokens: 500,
        generatedAt: new Date(),
        modelVersion: '',
      };

      expect(() => validator.validateGeneratedContent(content)).toThrow(ValidationError);
    });
  });

  describe('extractFrontMatter', () => {
    it('should extract front matter from markdown', () => {
      const markdown = `---
title: "Test"
description: "Description"
keywords: ["key1", "key2"]
sidebar_position: 2
---

# Content`;

      const frontMatter = validator.extractFrontMatter(markdown);

      expect(frontMatter.title).toBe('Test');
      expect(frontMatter.description).toBe('Description');
      expect(frontMatter.keywords).toEqual(['key1', 'key2']);
      expect(frontMatter.sidebar_position).toBe(2);
    });

    it('should handle missing front matter', () => {
      const markdown = `# No front matter

Just content.`;

      expect(() => validator.extractFrontMatter(markdown)).toThrow(ValidationError);
    });

    it('should parse YAML front matter correctly', () => {
      const markdown = `---
title: "Complex: Title with Colon"
description: |
  Multi-line
  description
keywords:
  - item1
  - item2
sidebar_position: 1
---

# Content`;

      const frontMatter = validator.extractFrontMatter(markdown);

      expect(frontMatter.title).toContain('Complex');
      expect(frontMatter.keywords).toContain('item1');
    });
  });

  describe('checkCodeBlockSyntax', () => {
    it('should validate Python code syntax', async () => {
      const code = `def hello():
    print("Hello, world!")

hello()`;

      const isValid = await validator.checkCodeBlockSyntax(code, 'python');
      expect(isValid).toBe(true);
    });

    it('should detect invalid Python syntax', async () => {
      const code = `def hello(
    print("Missing closing parenthesis"`;

      const isValid = await validator.checkCodeBlockSyntax(code, 'python');
      expect(isValid).toBe(false);
    });

    it('should validate JavaScript code syntax', async () => {
      const code = `function hello() {
  console.log("Hello");
}`;

      const isValid = await validator.checkCodeBlockSyntax(code, 'javascript');
      expect(isValid).toBe(true);
    });

    it('should skip validation for unsupported languages', async () => {
      const code = `arbitrary code`;

      const isValid = await validator.checkCodeBlockSyntax(code, 'plaintext');
      expect(isValid).toBe(true); // Should skip validation, not fail
    });
  });

  describe('validateLinks', () => {
    it('should allow HTTPS links', () => {
      const markdown = `---
title: "Test"
---

# Test

Check out [this link](https://example.com).`;

      expect(() => validator.validateLinks(markdown)).not.toThrow();
    });

    it('should allow relative links', () => {
      const markdown = `---
title: "Test"
---

# Test

See [other page](./other-page.md).`;

      expect(() => validator.validateLinks(markdown)).not.toThrow();
    });

    it('should reject javascript: protocol links', () => {
      const markdown = `---
title: "Test"
---

# Test

Bad [link](javascript:alert('xss')).`;

      expect(() => validator.validateLinks(markdown)).toThrow(ValidationError);
    });

    it('should reject file: protocol links', () => {
      const markdown = `---
title: "Test"
---

# Test

Bad [link](file:///etc/passwd).`;

      expect(() => validator.validateLinks(markdown)).toThrow(ValidationError);
    });
  });

  describe('getValidationErrors', () => {
    it('should return empty array for valid content', () => {
      const markdown = `---
title: "Test"
description: "Test"
keywords: ["test"]
sidebar_position: 1
---

# Test

This is valid content with sufficient length to pass the minimum character requirement. We need to ensure that the content is at least 100 characters long after removing the front matter.`;

      const errors = validator.getValidationErrors(markdown);
      expect(errors).toEqual([]);
    });

    it('should return multiple errors for invalid content', () => {
      const markdown = `# No front matter

\`\`\`
code without language
\`\`\`

Bad [link](javascript:alert(1)).`;

      const errors = validator.getValidationErrors(markdown);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should provide descriptive error messages', () => {
      const markdown = `# Invalid

Too short.`;

      const errors = validator.getValidationErrors(markdown);
      expect(errors.some((e) => e.includes('front matter'))).toBe(true);
    });
  });
});
