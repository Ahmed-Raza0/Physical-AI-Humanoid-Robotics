import { useMemo } from 'react';

export interface ReadingTimeResult {
  text: string;
  minutes: number;
  time: number; // in milliseconds
  words: number;
}

/**
 * Calculate reading time for text content
 * Average reading speed: 200-250 words per minute
 * @param content - Text content to analyze
 * @param wordsPerMinute - Reading speed (default: 225)
 * @returns ReadingTimeResult object
 */
export const useReadingTime = (
  content: string,
  wordsPerMinute: number = 225
): ReadingTimeResult => {
  return useMemo(() => {
    if (!content) {
      return {
        text: '< 1 min read',
        minutes: 0,
        time: 0,
        words: 0,
      };
    }

    // Remove HTML tags and extra whitespace
    const plainText = content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Count words
    const words = plainText.split(/\s+/).filter(Boolean).length;

    // Calculate reading time
    const minutes = Math.ceil(words / wordsPerMinute);
    const time = minutes * 60 * 1000; // Convert to milliseconds

    // Format text
    let text: string;
    if (minutes < 1) {
      text = '< 1 min read';
    } else if (minutes === 1) {
      text = '1 min read';
    } else {
      text = `${minutes} min read`;
    }

    return {
      text,
      minutes,
      time,
      words,
    };
  }, [content, wordsPerMinute]);
};

export default useReadingTime;
