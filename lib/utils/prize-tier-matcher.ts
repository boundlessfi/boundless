/**
 * Prize Tier Position Matcher
 *
 * Shared utility for matching prize tier positions with ranks.
 * This can be used by both frontend and backend to ensure consistent validation.
 *
 * Backend Implementation Guide:
 * Copy this function to your backend codebase and use it when validating
 * prize tiers against winner ranks in the createWinnerMilestones endpoint.
 */

/**
 * Extract rank number from position string
 * Handles formats like "1st Place", "2nd", "3", "Third Place", etc.
 *
 * @param position - Position string (e.g., "2nd Place", "2", "2nd")
 * @returns Rank number or null if not found
 *
 * @example
 * extractRankFromPosition("2nd Place") // returns 2
 * extractRankFromPosition("2nd") // returns 2
 * extractRankFromPosition("2") // returns 2
 * extractRankFromPosition("Second Place") // returns 2
 */
export function extractRankFromPosition(
  position: string | undefined | null
): number | null {
  if (!position) return null;

  // Remove "Place" and trim, convert to lowercase
  const cleaned = position.toLowerCase().replace(/place/g, '').trim();

  // Try to extract number directly (e.g., "2", "2nd", "2nd place")
  const numberMatch = cleaned.match(/^(\d+)/);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }

  // Handle ordinal formats: "1st", "2nd", "3rd", "4th", etc.
  const ordinalMatch = cleaned.match(/^(\d+)(st|nd|rd|th)/);
  if (ordinalMatch) {
    return parseInt(ordinalMatch[1], 10);
  }

  // Handle word formats: "first", "second", "third", etc.
  const wordMap: Record<string, number> = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12,
    thirteenth: 13,
    fourteenth: 14,
    fifteenth: 15,
  };

  for (const [word, num] of Object.entries(wordMap)) {
    if (cleaned.includes(word)) {
      return num;
    }
  }

  return null;
}

/**
 * Check if a prize tier matches a given rank
 *
 * @param prizeTier - Prize tier object with position field
 * @param rank - Rank number to match
 * @returns true if the prize tier position matches the rank
 *
 * @example
 * const tier = { position: "2nd Place", amount: 5000, currency: "USDC" };
 * matchesRank(tier, 2) // returns true
 * matchesRank(tier, 1) // returns false
 */
export function matchesRank(
  prizeTier: { position: string },
  rank: number
): boolean {
  const tierRank = extractRankFromPosition(prizeTier.position);
  return tierRank === rank;
}

/**
 * Find prize tier for a given rank
 *
 * @param prizeTiers - Array of prize tiers
 * @param rank - Rank number to find
 * @returns Prize tier that matches the rank, or null if not found
 *
 * @example
 * const tiers = [
 *   { position: "1st Place", amount: 10000 },
 *   { position: "2nd Place", amount: 5000 }
 * ];
 * findPrizeTierForRank(tiers, 2) // returns { position: "2nd Place", amount: 5000 }
 */
export function findPrizeTierForRank<T extends { position: string }>(
  prizeTiers: T[],
  rank: number
): T | null {
  return prizeTiers.find(tier => matchesRank(tier, rank)) || null;
}

/**
 * Validate that prize tiers exist for all given ranks
 *
 * @param prizeTiers - Array of prize tiers
 * @param ranks - Array of rank numbers to validate
 * @returns Object with validation result and missing ranks
 *
 * @example
 * const tiers = [
 *   { position: "1st Place", amount: 10000 },
 *   { position: "2nd Place", amount: 5000 }
 * ];
 * validatePrizeTiersForRanks(tiers, [1, 2, 3])
 * // returns { valid: false, missingRanks: [3] }
 */
export function validatePrizeTiersForRanks(
  prizeTiers: Array<{ position: string }>,
  ranks: number[]
): { valid: boolean; missingRanks: number[] } {
  const missingRanks: number[] = [];

  ranks.forEach(rank => {
    const hasTier = prizeTiers.some(tier => matchesRank(tier, rank));
    if (!hasTier) {
      missingRanks.push(rank);
    }
  });

  return {
    valid: missingRanks.length === 0,
    missingRanks: [...new Set(missingRanks)].sort((a, b) => a - b),
  };
}
