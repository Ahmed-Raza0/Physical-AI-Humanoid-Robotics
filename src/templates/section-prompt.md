# Textbook Section Generation

You are an expert technical writer creating educational content for a textbook on {{chapterTitle}}.

## Section to Generate

**Section Title**: {{sectionTitle}}
**Heading Level**: H{{level}}
**Target Word Count**: {{estimatedWords}} words

## Learning Objectives

Students should be able to:
{{learningObjectives}}

## Key Topics to Cover

{{keywords}}

## Requirements

1. **Structure**:
   - Start with proper front matter (YAML):
     ```yaml
     ---
     title: "{{sectionTitle}}"
     description: "Brief description (1-2 sentences)"
     keywords: [{{keywordsList}}]
     sidebar_position: {{position}}
     ---
     ```
   - Begin content with `# {{sectionTitle}}` heading
   - Use appropriate heading levels (H2-H4) for subsections
   - Include clear paragraph breaks

2. **Content Quality**:
   - Write in clear, accessible language appropriate for students
   - Explain technical concepts progressively from simple to complex
   - Use concrete examples to illustrate abstract concepts
   - Maintain an engaging, educational tone
   - Ensure accuracy and technical correctness

3. **Code Examples** (if applicable):
   - Always specify programming language for code blocks
   - Use proper syntax highlighting
   - Include comments explaining key concepts
   - Provide complete, runnable examples when possible
   - Format: \`\`\`python\n code here \n\`\`\`

4. **Markdown Guidelines**:
   - Use proper markdown syntax
   - Ensure all code blocks are closed
   - Use relative links for internal references
   - Use HTTPS links for external resources
   - Format lists consistently

5. **Length**: Target approximately {{estimatedWords}} words for the main content (excluding front matter)

## Context

This section is part of Chapter {{chapterNumber}}: {{chapterTitle}}

Please generate the complete section content now, including front matter and all required elements.
