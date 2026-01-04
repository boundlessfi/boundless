// Vote Types and Enums
export enum VoteType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE',
}

export enum VoteEntityType {
  PROJECT = 'PROJECT',
  CROWDFUNDING_CAMPAIGN = 'CROWDFUNDING_CAMPAIGN',
  HACKATHON_SUBMISSION = 'HACKATHON_SUBMISSION',
  GRANT = 'GRANT',
}

// Vote Model
export interface Vote {
  id: string;
  userId: string;
  projectId: string;
  entityType: VoteEntityType;
  voteType: VoteType;
  createdAt: string;
  updatedAt: string;
}

// Vote Request/Response Types
export interface CreateVoteRequest {
  projectId: string;
  entityType: VoteEntityType;
  voteType: VoteType;
}

export interface CreateVoteResponse {
  success: boolean;
  data: Vote;
  message: string;
}

export interface DeleteVoteRequest {
  projectId: string;
  entityType: VoteEntityType;
}

export interface DeleteVoteResponse {
  success: boolean;
  message: string;
}

export interface VoteCountResponse {
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  userVote?: VoteType | null;
}

export interface GetMyVoteResponse {
  success: boolean;
  data: Vote | null;
  message: string;
}

export interface GetProjectVotesResponse {
  success: boolean;
  data:
    | Vote[]
    | {
        votes: Vote[];
        total: number;
        limit: number;
        offset: number;
      }
    | {
        voters: VoterDto[];
        voteCounts: VoteCountResponse;
      };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface QueryVotesRequest {
  projectId?: string;
  entityType?: VoteEntityType;
  voteType?: VoteType;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface QueryVotesResponse {
  success: boolean;
  data: Vote[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Enhanced Vote Statistics with Voters
export interface VoterDto {
  id: string;
  userId: string;
  voteType: VoteType;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
}

export interface VoteStatsWithVoters {
  projectId: string;
  entityType: VoteEntityType;
  voteCounts: VoteCountResponse;
  voters: VoterDto[];
  lastVoteAt?: string;
}

// Vote Statistics Types
export interface VoteStats {
  projectId: string;
  entityType: VoteEntityType;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  lastVoteAt?: string;
}

export interface ProjectVoteSummary {
  projectId: string;
  votes: {
    PROJECT?: VoteStats;
    CROWDFUNDING_CAMPAIGN?: VoteStats;
    HACKATHON_SUBMISSION?: VoteStats;
    GRANT?: VoteStats;
  };
}
