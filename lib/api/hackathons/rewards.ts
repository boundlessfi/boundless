import api from '../api';
import { ApiResponse } from '../types';

// Fee estimate (GET /api/hackathons/fee-estimate?totalPool=...)
export interface FeeEstimateData {
  totalPool: number;
  feeRate: number;
  feeRatePercent: number;
  feeAmount: number;
  totalFunds: number;
  feeLabel: string;
}

export interface GetFeeEstimateResponse {
  success: boolean;
  message: string;
  data: FeeEstimateData;
}

const MIN_POOL_FOR_FEE = 5;

/**
 * Get platform fee estimate for a given total prize pool (USDC).
 * Backend returns 400 if totalPool is missing, invalid, or below minimum (5 USDC).
 */
export const getFeeEstimate = async (
  totalPool: number
): Promise<FeeEstimateData> => {
  if (totalPool < MIN_POOL_FOR_FEE) {
    throw new Error('totalPool below minimum');
  }
  const res = await api.get<GetFeeEstimateResponse>('hackathons/fee-estimate', {
    params: { totalPool: String(totalPool) },
  });
  if (!res.data?.data) throw new Error('Invalid fee estimate response');
  return res.data.data;
};

// Rewards API Request/Response Types
export interface AssignRanksRequest {
  ranks: Array<{
    participantId: string;
    rank: number;
  }>;
}

export interface AssignRanksResponse {
  success: boolean;
  message: string;
  data: {
    updated: number;
  };
}

export interface HackathonEscrowData {
  contractId: string;
  escrowAddress: string;
  balance: number;
  milestones: Array<{
    description: string;
    amount: number;
    receiver: string;
    status: string;
    evidence: string;
    flags?: {
      approved: boolean;
      disputed: boolean;
      released: boolean;
      resolved: boolean;
    };
  }>;
  isFunded: boolean;
  canUpdate: boolean;
}

export interface GetHackathonEscrowResponse extends ApiResponse<HackathonEscrowData> {
  success: true;
  data: HackathonEscrowData;
  message: string;
}

export interface CreateWinnerMilestonesRequest {
  winners: Array<{
    participantId: string;
    rank: number;
    walletAddress: string;
    amount?: number;
    currency?: string;
  }>;
}

export interface CreateWinnerMilestonesResponse {
  success: boolean;
  message: string;
  data: {
    transactionHash?: string;
    milestonesCreated: number;
  };
}

/**
 * Assign ranks to submissions
 */
export const assignRanks = async (
  organizationId: string,
  hackathonId: string,
  data: AssignRanksRequest
): Promise<AssignRanksResponse> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/rewards/ranks`,
    data
  );
  return res.data;
};

/**
 * Get hackathon escrow details
 */
export const getHackathonEscrow = async (
  organizationId: string,
  hackathonId: string
): Promise<GetHackathonEscrowResponse> => {
  const res = await api.get(
    `/organizations/${organizationId}/hackathons/${hackathonId}/escrow`
  );
  return res.data;
};

/**
 * Create winner milestones in escrow
 */
export const createWinnerMilestones = async (
  organizationId: string,
  hackathonId: string,
  data: CreateWinnerMilestonesRequest
): Promise<CreateWinnerMilestonesResponse> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/rewards/milestones`,
    data
  );
  return res.data;
};
