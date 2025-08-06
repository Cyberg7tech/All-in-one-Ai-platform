// Text chunking utilities for RAG and embeddings

export interface ChunkOptions {
  size?: number;
  overlap?: number;
  separators?: string[];
  preserveStructure?: boolean;
}

/**
 * Split text into chunks with optional overlap
 */
export function chunk(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200,
  separators: string[] = ['\n\n', '\n', '. ', '! ', '? ', ', ', ' ']
): string[] {
  if (!text || text.length === 0) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);

    // If we're not at the end of the text, try to find a good breaking point
    if (end < text.length) {
      let bestBreakPoint = end;

      // Look for separators within the last portion of the chunk
      const searchStart = Math.max(start, end - 200);

      for (const separator of separators) {
        const lastIndex = text.lastIndexOf(separator, end);
        if (lastIndex > searchStart) {
          bestBreakPoint = lastIndex + separator.length;
          break;
        }
      }

      end = bestBreakPoint;
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start position with overlap consideration
    start = Math.max(start + 1, end - overlap);

    // Avoid infinite loop
    if (start >= end && end === text.length) break;
  }

  return chunks;
}

/**
 * Smart chunking that preserves document structure
 */
export function smartChunk(text: string, options: ChunkOptions = {}): string[] {
  const {
    size = 1000,
    overlap = 200,
    separators = ['\n\n', '\n', '. ', '! ', '? ', ', ', ' '],
    preserveStructure = true,
  } = options;

  if (!preserveStructure) {
    return chunk(text, size, overlap, separators);
  }

  // Try to preserve document structure by first splitting on major sections
  const majorSeparators = ['\n\n\n', '\n\n', '\n'];
  const sections: string[] = [];

  const currentText = text;

  for (const separator of majorSeparators) {
    if (currentText.includes(separator)) {
      const parts = currentText.split(separator);
      sections.push(...parts.filter((part) => part.trim().length > 0));
      break;
    }
  }

  if (sections.length === 0) {
    sections.push(text);
  }

  const chunks: string[] = [];

  for (const section of sections) {
    if (section.length <= size) {
      chunks.push(section.trim());
    } else {
      const sectionChunks = chunk(section, size, overlap, separators);
      chunks.push(...sectionChunks);
    }
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Extract key sentences from text
 */
export function extractKeySentences(text: string, maxSentences: number = 5): string[] {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length <= maxSentences) {
    return sentences;
  }

  // Simple scoring based on length and position
  const scoredSentences = sentences.map((sentence, index) => ({
    sentence,
    score: sentence.length * (1 - index / sentences.length),
  }));

  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map((item) => item.sentence);
}

/**
 * Clean and normalize text
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/[^\w\s.!?,;:\-()]/g, '')
    .trim();
}

/**
 * Extract keywords from text using simple frequency analysis
 */
export function extractKeywords(text: string, maxKeywords: number = 10, minLength: number = 3): string[] {
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'this',
    'that',
    'these',
    'those',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
  ]);

  const words = normalizeText(text.toLowerCase())
    .split(/\s+/)
    .filter((word) => word.length >= minLength && !stopWords.has(word) && /^[a-zA-Z]+$/.test(word));

  const frequency: Record<string, number> = {};

  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Calculate text similarity using simple word overlap
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(normalizeText(text1.toLowerCase()).split(/\s+/));
  const words2 = new Set(normalizeText(text2.toLowerCase()).split(/\s+/));

  const intersection = new Set(Array.from(words1).filter((word) => words2.has(word)));
  const union = new Set([...Array.from(words1), ...Array.from(words2)]);

  return intersection.size / union.size;
}

/**
 * Truncate text to a specific length while preserving word boundaries
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength - suffix.length);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + suffix;
  }

  return truncated + suffix;
}

/**
 * Count tokens (approximate)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Split text to fit within token limits
 */
export function splitByTokenLimit(text: string, maxTokens: number = 1000, overlap: number = 100): string[] {
  const maxChars = maxTokens * 4; // Rough conversion
  const overlapChars = overlap * 4;

  return chunk(text, maxChars, overlapChars);
}

/**
 * Extract text between delimiters
 */
export function extractBetween(text: string, startDelimiter: string, endDelimiter: string): string[] {
  const results: string[] = [];
  let searchStart = 0;

  while (searchStart < text.length) {
    const start = text.indexOf(startDelimiter, searchStart);
    if (start === -1) break;

    const end = text.indexOf(endDelimiter, start + startDelimiter.length);
    if (end === -1) break;

    const extracted = text.slice(start + startDelimiter.length, end);
    results.push(extracted.trim());

    searchStart = end + endDelimiter.length;
  }

  return results;
}

/**
 * Generate text summary using extractive approach
 */
export function extractiveSummary(text: string, maxSentences: number = 3): string {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (sentences.length <= maxSentences) {
    return sentences.join('. ') + '.';
  }

  // Score sentences by position and length
  const scoredSentences = sentences.map((sentence, index) => {
    const positionScore = 1 - index / sentences.length;
    const lengthScore = Math.min(sentence.length / 100, 1);
    const score = positionScore * 0.6 + lengthScore * 0.4;

    return { sentence, score, originalIndex: index };
  });

  const selectedSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.originalIndex - b.originalIndex);

  return selectedSentences.map((item) => item.sentence).join('. ') + '.';
}

/**
 * Format text for display (remove extra whitespace, etc.)
 */
export function formatForDisplay(text: string): string {
  return text
    .replace(/\t/g, '    ') // Convert tabs to spaces
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
    .trim();
}
