import { InitializeMultiReleaseEscrowPayload } from '@trustless-work/escrow';
import { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';

/**
 * USDC trustline address for Stellar network
 */
const USDC_TRUSTLINE_ADDRESS =
  'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA';

/**
 * Platform fee percentage (4% as per plan)
 */
export const PLATFORM_FEE = 4;

/**
 * Minimal amount for placeholder milestone (1 USDC = 10000000 with 7 decimals)
 */
const PLACEHOLDER_MILESTONE_AMOUNT = 1;

/**
 * Boundless platform wallet address
 * This address will act as approver and release signer to reduce user transactions
 * Should be set via environment variable: NEXT_PUBLIC_BOUNDLESS_PLATFORM_ADDRESS
 */
const BOUNDLESS_PLATFORM_ADDRESS =
  process.env.NEXT_PUBLIC_BOUNDLESS_PLATFORM_ADDRESS ||
  'GA4XJQJTKVQZXYW5CYM77CD5E7CX7FJLVDSIWZAV6FEIBFZNRKSWWTFN'; // Fallback to empty string if not configured

/**
 * Get Boundless platform wallet address
 * @returns The Boundless platform wallet address
 * @throws Error if not configured
 */
export const getBoundlessPlatformAddress = (): string => {
  if (!BOUNDLESS_PLATFORM_ADDRESS) {
    throw new Error(
      'Boundless platform address not configured. Please set NEXT_PUBLIC_BOUNDLESS_PLATFORM_ADDRESS environment variable.'
    );
  }
  return BOUNDLESS_PLATFORM_ADDRESS;
};

/**
 * Extract rank number from position string
 * Handles formats like "1st Place", "2nd", "3", "Third Place", etc.
 * @param position - Position string (e.g., "2nd Place", "2", "2nd")
 * @returns Rank number or null if not found
 */
export const extractRankFromPosition = (
  position: string | undefined | null
): number | null => {
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
};

/**
 * Calculate total prize pool amount from prize tiers
 * Converts prize amounts to Stellar format (7 decimals)
 * @param rewards - Rewards form data containing prize tiers
 * @returns Total amount in Stellar format (with 7 decimals)
 */
export const calculateTotalPrizeAmount = (rewards: RewardsFormData): number => {
  if (!rewards.prizeTiers || rewards.prizeTiers.length === 0) {
    return 0;
  }

  return rewards.prizeTiers.reduce((total, tier) => {
    const amount = parseFloat(tier.prizeAmount || '0');

    return total + amount;
  }, 0);
};

/**
 * Create a placeholder milestone for initial escrow
 * This milestone will be replaced/added to with winner milestones after judging
 * @param organizationAddress - Organization wallet address (receiver)
 * @returns Milestone payload for placeholder
 */
export const createPlaceholderMilestone = (
  organizationAddress: string
): { description: string; amount: number; receiver: string } => {
  return {
    description: 'Hackathon Prize Pool - Placeholder',
    amount: PLACEHOLDER_MILESTONE_AMOUNT, // 1 USDC
    receiver: organizationAddress,
  };
};

/**
 * Create winner milestone payload (used after judging)
 * @param position - Prize position (e.g., "1st Place")
 * @param amount - Prize amount in Stellar format
 * @param winnerAddress - Winner's wallet address
 * @returns Milestone payload for winner
 */
export const createWinnerMilestone = (
  position: string,
  amount: number,
  winnerAddress: string
): { description: string; amount: number; receiver: string } => {
  return {
    description: `${position} Prize`,
    amount: amount,
    receiver: winnerAddress,
  };
};

/**
 * Create hackathon escrow payload with placeholder milestone
 * @param params - Parameters for escrow creation
 * @returns Escrow payload ready for Trustless Work
 */
export const createHackathonEscrow = (params: {
  signer: string;
  organizationAddress: string;
  hackathonTitle: string;
  hackathonDescription: string;
  rewards: RewardsFormData;
  engagementId?: string;
}): InitializeMultiReleaseEscrowPayload => {
  const {
    signer,
    organizationAddress,
    hackathonTitle,
    hackathonDescription,
    engagementId,
  } = params;

  // Validate Boundless platform address is configured
  if (!BOUNDLESS_PLATFORM_ADDRESS) {
    throw new Error(
      'Boundless platform address not configured. Please set NEXT_PUBLIC_BOUNDLESS_PLATFORM_ADDRESS environment variable.'
    );
  }

  // Create placeholder milestone
  const placeholderMilestone = createPlaceholderMilestone(organizationAddress);

  // Generate engagement ID if not provided
  const finalEngagementId =
    engagementId ||
    `hackathon-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  return {
    signer,
    engagementId: finalEngagementId,
    title: hackathonTitle,
    description: hackathonDescription,
    platformFee: PLATFORM_FEE,
    trustline: {
      address: USDC_TRUSTLINE_ADDRESS,
    },
    roles: {
      // Service Provider = Organizer (can update milestones, add evidence, raise disputes)
      serviceProvider: organizationAddress,

      // Approver = Boundless (validates milestones, approves work)
      approver: BOUNDLESS_PLATFORM_ADDRESS,

      // Release Signer = Boundless (triggers fund release after approval)
      releaseSigner: BOUNDLESS_PLATFORM_ADDRESS,

      // Platform Address = Boundless (collects platform fees)
      platformAddress: BOUNDLESS_PLATFORM_ADDRESS,

      // Dispute Resolver = Boundless (resolves conflicts)
      disputeResolver: BOUNDLESS_PLATFORM_ADDRESS,
    },
    milestones: [placeholderMilestone],
  };
};

/**
 * Calculate platform fee amount from total prize pool
 * @param totalPrizePool - Total prize pool amount
 * @param platformFeePercentage - Platform fee percentage (default: PLATFORM_FEE)
 * @returns Platform fee amount
 */
export const calculatePlatformFeeAmount = (
  totalPrizePool: number,
  platformFeePercentage: number = PLATFORM_FEE
): number => {
  return (totalPrizePool * platformFeePercentage) / 100;
};

/**
 * Calculate total funding amount including platform fee
 * This ensures winners receive full prize amounts after platform fee deduction
 * @param rewards - Rewards form data containing prize tiers
 * @param platformFeePercentage - Platform fee percentage (default: PLATFORM_FEE)
 * @returns Total amount including platform fee
 */
export const calculateTotalFundingWithPlatformFee = (
  rewards: RewardsFormData,
  platformFeePercentage: number = PLATFORM_FEE
): number => {
  const totalPrizePool = calculateTotalPrizeAmount(rewards);
  const platformFee = calculatePlatformFeeAmount(
    totalPrizePool,
    platformFeePercentage
  );
  return totalPrizePool + platformFee;
};

/**
 * Get total prize pool amount for funding (including platform fee)
 * This is the amount that will be locked in escrow
 * @param rewards - Rewards form data containing prize tiers
 * @returns Total amount including platform fee
 */
export const getTotalPrizePoolForFunding = (
  rewards: RewardsFormData
): number => {
  return calculateTotalFundingWithPlatformFee(rewards);
};
