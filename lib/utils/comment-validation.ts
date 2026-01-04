import { ValidationResult, ContentValidationRules } from '@/types/comment';

/**
 * Default validation rules for comments
 */
export const COMMENT_VALIDATION_RULES: ContentValidationRules = {
  minLength: 1,
  maxLength: 2000,
  maxLinks: 3,
  prohibitedPatterns: [
    /buy now/i,
    /click here/i,
    /act now/i,
    /limited time/i,
    /guaranteed/i,
    /100% free/i,
    /make money fast/i,
    /work from home/i,
    /earn \$\d+/i,
    /casino/i,
    /lottery/i,
    /viagra/i,
    /pharmacy/i,
  ],
};

/**
 * Validate comment content against rules
 */
export function validateCommentContent(
  content: string,
  rules: ContentValidationRules = COMMENT_VALIDATION_RULES
): ValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (content.length < rules.minLength) {
    errors.push(
      `Comment must be at least ${rules.minLength} character(s) long`
    );
  }

  // Check maximum length
  if (content.length > rules.maxLength) {
    errors.push(`Comment cannot exceed ${rules.maxLength} characters`);
  }

  // Check for too many links
  const linkCount = (content.match(/https?:\/\/[^\s]+/gi) || []).length;
  if (linkCount > rules.maxLinks) {
    errors.push(`Comment cannot contain more than ${rules.maxLinks} links`);
  }

  // Check for prohibited patterns (spam detection)
  const hasSpam = rules.prohibitedPatterns.some(pattern =>
    pattern.test(content)
  );

  if (hasSpam) {
    errors.push('Comment contains prohibited content or spam-like patterns');
  }

  // Check for excessive capitalization (shouting)
  const uppercaseRatio =
    (content.match(/[A-Z]/g) || []).length / content.length;
  if (uppercaseRatio > 0.7 && content.length > 10) {
    errors.push('Comment contains too many uppercase letters');
  }

  // Check for excessive repetition
  const words = content.toLowerCase().split(/\s+/);
  const wordCounts = words.reduce(
    (acc, word) => {
      if (word.length > 3) {
        // Only check words longer than 3 chars
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const hasExcessiveRepetition = Object.values(wordCounts).some(
    count => count > 5
  );
  if (hasExcessiveRepetition) {
    errors.push('Comment contains excessive word repetition');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize comment content (remove potentially harmful content)
 */
export function sanitizeCommentContent(content: string): string {
  // Remove script tags
  content = content.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Remove HTML tags
  content = content.replace(/<[^>]*>/g, '');

  // Remove excessive whitespace
  content = content.replace(/\s+/g, ' ').trim();

  // Remove zero-width characters
  content = content.replace(/[\u200B-\u200D\uFEFF]/g, '');

  return content;
}

/**
 * Check if content contains potentially harmful patterns
 */
export function checkContentSafety(content: string): {
  isSafe: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for potentially harmful links
  const links = content.match(/https?:\/\/[^\s]+/gi) || [];
  links.forEach(link => {
    try {
      const url = new URL(link.toLowerCase());
      // Check for suspicious domains
      const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co'];
      if (suspiciousDomains.some(domain => url.hostname.includes(domain))) {
        warnings.push(
          'Shortened URLs detected - these may hide malicious content'
        );
      }
    } catch {
      // Invalid URL, ignore
    }
  });

  // Check for excessive punctuation
  const punctuationCount = (content.match(/[!?]{2,}/g) || []).length;
  if (punctuationCount > 3) {
    warnings.push('Excessive punctuation detected');
  }

  return {
    isSafe: warnings.length === 0,
    warnings,
  };
}

/**
 * Get reading time estimate for content
 */
export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Format content for display (handle mentions, links, etc.)
 */
export function formatCommentContent(content: string): string {
  // Convert URLs to links
  content = content.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600">$1</a>'
  );

  // Convert @mentions to links (if user system supports it)
  content = content.replace(
    /(@\w+)/g,
    '<span class="text-blue-500 font-medium">$1</span>'
  );

  return content;
}

/**
 * Truncate content for previews
 */
export function truncateContent(
  content: string,
  maxLength: number = 150
): string {
  if (content.length <= maxLength) return content;

  return content.substring(0, maxLength).trim() + '...';
}
