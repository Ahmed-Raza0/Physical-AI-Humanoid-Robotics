/**
 * Document processing and chunking utilities for RAG system
 */

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    chapterTitle?: string;
    section?: string;
    startLine?: number;
    endLine?: number;
  };
  wordCount: number;
}

export interface ProcessedDocument {
  source: string;
  chunks: DocumentChunk[];
  totalChunks: number;
}

/**
 * Split text into semantic chunks
 * Strategy: Split by paragraphs, combine small ones, split large ones
 */
export function chunkText(
  text: string,
  options: {
    maxChunkSize?: number;
    minChunkSize?: number;
    overlap?: number;
  } = {}
): string[] {
  const {
    maxChunkSize = 800, // Max words per chunk
    minChunkSize = 200, // Min words per chunk
    overlap = 100, // Overlap words between chunks
  } = options;

  // Split by double newlines (paragraphs)
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  let currentChunk = '';
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.split(/\s+/).length;

    // If adding this paragraph would exceed max size, start a new chunk
    if (currentWordCount + paragraphWords > maxChunkSize && currentWordCount > 0) {
      chunks.push(currentChunk.trim());

      // Create overlap by keeping last N words
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-overlap);
      currentChunk = overlapWords.join(' ') + '\n\n' + paragraph;
      currentWordCount = overlapWords.length + paragraphWords;
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      currentWordCount += paragraphWords;
    }

    // If current chunk is large enough and we've added content, finalize it
    if (currentWordCount >= minChunkSize * 1.5) {
      // Allow some buffer
      chunks.push(currentChunk.trim());
      currentChunk = '';
      currentWordCount = 0;
    }
  }

  // Add remaining content
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((chunk) => chunk.split(/\s+/).length >= minChunkSize / 2);
}

/**
 * Extract metadata from markdown document
 */
export function extractMetadata(content: string, filepath: string): {
  title?: string;
  chapter?: string;
  section?: string;
} {
  const metadata: {
    title?: string;
    chapter?: string;
    section?: string;
  } = {};

  // Extract title from first h1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    metadata.title = h1Match[1].trim();
  }

  // Extract chapter from filename
  const chapterMatch = filepath.match(/chapter(\d+)/i);
  if (chapterMatch) {
    metadata.chapter = `Chapter ${chapterMatch[1]}`;
  }

  return metadata;
}

/**
 * Process a markdown document into chunks
 */
export function processDocument(
  content: string,
  filepath: string,
  options?: {
    maxChunkSize?: number;
    minChunkSize?: number;
    overlap?: number;
  }
): ProcessedDocument {
  const metadata = extractMetadata(content, filepath);

  // Clean the content
  const cleanedContent = content
    // Remove frontmatter
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    // Remove code blocks for chunking (we'll keep them in actual content)
    .replace(/```[\s\S]*?```/g, (match) => {
      // Keep code blocks but mark them
      return `[CODE BLOCK: ${match.length} chars]`;
    });

  // Create chunks
  const textChunks = chunkText(cleanedContent, options);

  // Create document chunks with IDs and metadata
  const chunks: DocumentChunk[] = textChunks.map((chunk, index) => {
    const wordCount = chunk.split(/\s+/).length;

    return {
      id: `${filepath.replace(/\\/g, '/').replace(/\.md$/, '')}-chunk-${index}`,
      content: chunk,
      metadata: {
        source: filepath,
        chapterTitle: metadata.title,
        section: metadata.chapter,
      },
      wordCount,
    };
  });

  return {
    source: filepath,
    chunks,
    totalChunks: chunks.length,
  };
}

/**
 * Clean and normalize text for better embedding quality
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\S\r\n]+/g, ' ') // Remove excessive spaces
    .trim();
}

/**
 * Calculate text statistics
 */
export function getTextStats(text: string): {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
} {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  return {
    characters: text.length,
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
  };
}
