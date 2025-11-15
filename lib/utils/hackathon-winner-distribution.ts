import { MultiReleaseEscrow } from '@trustless-work/escrow';
import { createWinnerMilestone } from './hackathon-escrow';

/**
 * Winner data structure
 */
export interface Winner {
  position: string;
  amount: number;
  walletAddress: string;
}

/**
 * Validation result for escrow update
 */
export interface EscrowValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Prepare winner milestones from winner data
 * Maps winners to milestone payloads for Update Escrow API
 * @param winners - Array of winners with position, amount, and wallet address
 * @returns Array of milestone payloads
 */
export const prepareWinnerMilestones = (
  winners: Winner[]
): Array<{ description: string; amount: number; receiver: string }> => {
  if (!winners || winners.length === 0) {
    return [];
  }

  return winners.map(winner => {
    // Validate winner data
    if (!winner.walletAddress || !winner.walletAddress.trim()) {
      throw new Error(`Invalid wallet address for ${winner.position}`);
    }

    if (!winner.amount || winner.amount <= 0) {
      throw new Error(`Invalid amount for ${winner.position}`);
    }

    if (!winner.position || !winner.position.trim()) {
      throw new Error('Position is required for winner');
    }

    return createWinnerMilestone(
      winner.position,
      winner.amount,
      winner.walletAddress.trim()
    );
  });
};

// /**
//  * Validate Stellar address format
//  * @param address - Stellar address to validate
//  * @returns true if valid, false otherwise
//  */
// const isValidStellarAddress = (address: string): boolean => {
//   // Stellar addresses start with G and are 56 characters long
//   const stellarAddressRegex = /^G[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{55}$/;
//   return stellarAddressRegex.test(address);
// };

/**
 * Validate escrow can be updated
 * Checks escrow state before allowing milestone addition
 * @param escrow - Current escrow data
 * @returns Validation result with errors if any
 */
export const validateEscrowCanBeUpdated = (
  escrow: MultiReleaseEscrow | null
): EscrowValidationResult => {
  const errors: string[] = [];

  if (!escrow) {
    errors.push('Escrow not found');
    return { isValid: false, errors };
  }

  // Check if escrow is funded
  if (!escrow.balance || escrow.balance === 0) {
    errors.push('Escrow is not funded. Please fund the escrow first.');
  }

  // Check if any milestones are approved
  const hasApprovedMilestones =
    escrow.milestones?.some(milestone => milestone.flags?.approved === true) ||
    false;

  if (hasApprovedMilestones) {
    errors.push(
      'Cannot update escrow: Some milestones are already approved. Escrow cannot be updated after milestones are approved.'
    );
  }

  // Check if escrow is in dispute (flags may not exist on MultiReleaseEscrow type)
  interface EscrowWithFlags extends MultiReleaseEscrow {
    flags?: {
      disputed?: boolean;
    };
  }
  const escrowWithFlags = escrow as EscrowWithFlags;
  if (escrowWithFlags.flags?.disputed === true) {
    errors.push(
      'Cannot update escrow: Escrow is in dispute. Please resolve the dispute first.'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate winner data
 * @param winners - Array of winners to validate
 * @returns Validation result with errors if any
 */
export const validateWinners = (winners: Winner[]): EscrowValidationResult => {
  const errors: string[] = [];

  if (!winners || winners.length === 0) {
    errors.push('At least one winner is required');
    return { isValid: false, errors };
  }

  // Check for duplicate wallet addresses
  const addresses = winners.map(w => w.walletAddress.trim().toLowerCase());
  const uniqueAddresses = new Set(addresses);
  if (addresses.length !== uniqueAddresses.size) {
    errors.push(
      'Duplicate wallet addresses found. Each winner must have a unique address.'
    );
  }

  // Validate each winner
  winners.forEach((winner, index) => {
    if (!winner.position || !winner.position.trim()) {
      errors.push(`Winner ${index + 1}: Position is required`);
    }

    if (!winner.amount || winner.amount <= 0) {
      errors.push(`Winner ${index + 1}: Amount must be greater than zero`);
    }

    // if (!winner.walletAddress || !winner.walletAddress.trim()) {
    //   errors.push(`Winner ${index + 1}: Wallet address is required`);
    // } else if (!isValidStellarAddress(winner.walletAddress.trim())) {
    //   errors.push(
    //     `Winner ${index + 1}: Invalid Stellar address format. Address must start with G and be 56 characters long.`
    //   );
    // }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
