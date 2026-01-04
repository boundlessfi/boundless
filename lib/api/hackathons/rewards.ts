import api from '../api';
import { ApiResponse } from '../types';

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
