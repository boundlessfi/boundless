// Rewards and Escrow Types

export interface AssignRanksRequest {
  ranks: Array<{
    participantId: string;
    rank: number;
  }>;
}

export interface AssignRanksResponse {
  success: true;
  data: {
    updated: number;
    participants: Array<{
      id: string;
      rank: number;
      projectName: string;
    }>;
  };
  message: string;
}

export interface HackathonEscrowData {
  hackathonId?: string;
  contractId: string;
  escrowAddress: string;
  transactionHash?: string;
  totalFunds?: string;
  balance: number; // Added for UI compatibility
  currency?: string;
  status?: 'active' | 'completed' | 'cancelled';
  isFunded?: boolean; // Added for UI compatibility
  canUpdate?: boolean; // Added for UI compatibility
  createdAt?: string;
  updatedAt?: string;
  milestones?: Array<{
    id?: string;
    winnerId?: string;
    rank?: number;
    amount: string | number;
    status: 'pending' | 'released' | 'disputed' | string;
    description?: string;
    receiver?: string;
    evidence?: string;
    flags?: {
      approved: boolean;
      disputed: boolean;
      released: boolean;
      resolved: boolean;
    };
  }>;
}

export interface CreateWinnerMilestonesRequest {
  winners: Array<{
    participantId: string;
    rank: number;
    prizeAmount: string;
  }>;
}

export interface CreateWinnerMilestonesResponse {
  success: true;
  data: {
    milestones: Array<{
      id: string;
      winnerId: string;
      rank: number;
      amount: string;
      status: string;
    }>;
    transactionHash: string;
  };
  message: string;
}
