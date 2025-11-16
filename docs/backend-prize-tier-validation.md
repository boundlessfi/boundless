# Backend Prize Tier Validation Implementation Guide

## Problem

The backend API endpoint `POST /organizations/:orgId/hackathons/:hackathonId/rewards/milestones` is failing with:

```
"No prize tier found for rank 2. Please configure prize tiers for this hackathon."
```

This happens because prize tiers in the database have `position` values like:

- "1st Place"
- "2nd Place"
- "3rd Place"

But the backend validation is likely doing a strict comparison that doesn't parse these formats correctly.

## Solution

The backend needs to parse the `position` field to extract the numeric rank, similar to how the frontend does it.

## Implementation

### Step 1: Add the Utility Function

Copy the `extractRankFromPosition` function from `/lib/utils/prize-tier-matcher.ts` to your backend codebase.

**For Node.js/TypeScript Backend:**

```typescript
/**
 * Extract rank number from position string
 * Handles formats like "1st Place", "2nd", "3", "Third Place", etc.
 */
function extractRankFromPosition(
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
```

**For Python Backend:**

```python
import re
from typing import Optional

def extract_rank_from_position(position: Optional[str]) -> Optional[int]:
    """
    Extract rank number from position string.
    Handles formats like "1st Place", "2nd", "3", "Third Place", etc.
    """
    if not position:
        return None

    # Remove "Place" and trim, convert to lowercase
    cleaned = position.lower().replace('place', '').strip()

    # Try to extract number directly (e.g., "2", "2nd", "2nd place")
    number_match = re.match(r'^(\d+)', cleaned)
    if number_match:
        return int(number_match.group(1))

    # Handle ordinal formats: "1st", "2nd", "3rd", "4th", etc.
    ordinal_match = re.match(r'^(\d+)(st|nd|rd|th)', cleaned)
    if ordinal_match:
        return int(ordinal_match.group(1))

    # Handle word formats: "first", "second", "third", etc.
    word_map = {
        'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5,
        'sixth': 6, 'seventh': 7, 'eighth': 8, 'ninth': 9, 'tenth': 10,
        'eleventh': 11, 'twelfth': 12, 'thirteenth': 13, 'fourteenth': 14, 'fifteenth': 15
    }

    for word, num in word_map.items():
        if word in cleaned:
            return num

    return None
```

### Step 2: Update the Validation Logic

In your `createWinnerMilestones` endpoint handler, update the prize tier validation:

**Before (incorrect):**

```typescript
// ❌ This won't work with "2nd Place" format
const prizeTier = hackathon.rewards.prizeTiers.find(
  tier => tier.position === rank.toString()
);
```

**After (correct):**

```typescript
// ✅ This correctly parses "2nd Place" to match rank 2
const prizeTier = hackathon.rewards.prizeTiers.find(tier => {
  const tierRank = extractRankFromPosition(tier.position);
  return tierRank === winner.rank;
});

if (!prizeTier) {
  throw new Error(
    `No prize tier found for rank ${winner.rank}. ` +
      `Please configure a prize tier with position matching rank ${winner.rank} ` +
      `(e.g., "${winner.rank}${winner.rank === 1 ? 'st' : winner.rank === 2 ? 'nd' : winner.rank === 3 ? 'rd' : 'th'} Place").`
  );
}
```

### Step 3: Complete Validation Example

Here's a complete example of how to validate winners in the backend:

```typescript
async function createWinnerMilestones(
  organizationId: string,
  hackathonId: string,
  winners: Array<{ participantId: string; rank: number; walletAddress: string }>
) {
  // 1. Fetch hackathon with prize tiers
  const hackathon =
    await Hackathon.findById(hackathonId).populate('rewards.prizeTiers');

  if (!hackathon) {
    throw new Error('Hackathon not found');
  }

  // 2. Validate each winner has a matching prize tier
  const missingRanks: number[] = [];

  for (const winner of winners) {
    const prizeTier = hackathon.rewards.prizeTiers.find(tier => {
      const tierRank = extractRankFromPosition(tier.position);
      return tierRank === winner.rank;
    });

    if (!prizeTier) {
      missingRanks.push(winner.rank);
    }
  }

  if (missingRanks.length > 0) {
    const ranksStr = missingRanks
      .map(
        r => `${r}${r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th'}`
      )
      .join(', ');

    throw new Error(
      `No prize tier found for rank${missingRanks.length > 1 ? 's' : ''} ${ranksStr}. ` +
        `Please configure prize tiers for this hackathon.`
    );
  }

  // 3. Continue with milestone creation...
  // ... rest of your implementation
}
```

## Testing

Test with these position formats:

- ✅ "1st Place" → matches rank 1
- ✅ "2nd Place" → matches rank 2
- ✅ "3rd Place" → matches rank 3
- ✅ "1st" → matches rank 1
- ✅ "2" → matches rank 2
- ✅ "First Place" → matches rank 1
- ✅ "Second" → matches rank 2

## Files to Update

1. Add `extractRankFromPosition` utility function to your backend utilities
2. Update the `createWinnerMilestones` endpoint handler to use this function
3. Update error messages to be more descriptive

## Reference

See `/lib/utils/prize-tier-matcher.ts` in the frontend codebase for the complete implementation with additional helper functions.
