import api from './api';
import type {
  CreateVoteRequest,
  CreateVoteResponse,
  DeleteVoteResponse,
  VoteCountResponse,
  GetMyVoteResponse,
  GetProjectVotesResponse,
  QueryVotesRequest,
  QueryVotesResponse,
} from '@/types/votes';
import { VoteEntityType, VoteType, VoterDto } from '@/types/votes';

/**
 * Create or update a vote
 * POST /votes
 */
export const createVote = async (
  data: CreateVoteRequest
): Promise<CreateVoteResponse> => {
  const res = await api.post('/votes', data);
  return res.data;
};

/**
 * Remove a vote
 * DELETE /votes/:projectId/:entityType
 */
export const deleteVote = async (
  projectId: string,
  entityType: VoteEntityType
): Promise<DeleteVoteResponse> => {
  const res = await api.delete(`/votes/${projectId}/${entityType}`);
  return res.data;
};

/**
 * Get vote counts for a project and entity type
 * GET /votes/count/:projectId/:entityType
 */
export const getVoteCounts = async (
  projectId: string,
  entityType: VoteEntityType
): Promise<VoteCountResponse> => {
  const res = await api.get(`/votes/count/${projectId}/${entityType}`);
  return res.data;
};

/**
 * Get the current user's vote for a project and entity type
 * GET /votes/my-vote/:projectId/:entityType
 */
export const getMyVote = async (
  projectId: string,
  entityType: VoteEntityType
): Promise<GetMyVoteResponse> => {
  const res = await api.get(`/votes/my-vote/${projectId}/${entityType}`);
  return res.data;
};

/**
 * Get all votes for a project with optional filtering
 * GET /votes/project/:projectId
 */
export const getProjectVotes = async (
  projectId: string,
  options: {
    limit?: number;
    offset?: number;
    entityType?: VoteEntityType;
    voteType?: VoteType;
    userId?: string;
    includeVoters?: boolean;
  } = {}
): Promise<GetProjectVotesResponse> => {
  const params = new URLSearchParams();

  // Pagination parameters
  if (options.limit !== undefined) {
    params.append('limit', options.limit.toString());
  }
  if (options.offset !== undefined) {
    params.append('offset', options.offset.toString());
  }

  // Filter parameters
  if (options.entityType) {
    params.append('entityType', options.entityType);
  }
  if (options.voteType) {
    params.append('voteType', options.voteType);
  }
  if (options.userId) {
    params.append('userId', options.userId);
  }

  // Include voters parameter
  if (options.includeVoters) {
    params.append('includeVoters', 'true');
  }

  const queryString = params.toString();
  const url = queryString
    ? `/votes/project/${projectId}?${queryString}`
    : `/votes/project/${projectId}`;

  const res = await api.get(url);
  return res.data;
};

/**
 * Query votes with filters
 * GET /votes
 */
export const queryVotes = async (
  filters: QueryVotesRequest = {}
): Promise<QueryVotesResponse> => {
  const params = new URLSearchParams();

  if (filters.projectId) {
    params.append('projectId', filters.projectId);
  }

  if (filters.entityType) {
    params.append('entityType', filters.entityType);
  }

  if (filters.voteType) {
    params.append('voteType', filters.voteType);
  }

  if (filters.userId) {
    params.append('userId', filters.userId);
  }

  if (filters.page) {
    params.append('page', filters.page.toString());
  }

  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }

  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }

  if (filters.sortOrder) {
    params.append('sortOrder', filters.sortOrder);
  }

  const queryString = params.toString();
  const url = queryString ? `/votes?${queryString}` : '/votes';

  const res = await api.get(url);
  return res.data;
};

/**
 * Get vote counts for crowdfunding campaign (specific endpoint)
 * GET /votes/count/project-id/CROWDFUNDING_CAMPAIGN
 */
export const getCrowdfundingVoteCounts = async (
  projectId: string
): Promise<VoteCountResponse> => {
  const res = await api.get(`/votes/count/${projectId}/CROWDFUNDING_CAMPAIGN`);
  return res.data;
};

/**
 * Vote on a crowdfunding campaign (convenience method)
 * POST /votes with CROWDFUNDING_CAMPAIGN entity type
 */
export const voteOnCrowdfundingCampaign = async (
  projectId: string,
  voteType: 'UPVOTE' | 'DOWNVOTE'
): Promise<CreateVoteResponse> => {
  return createVote({
    projectId,
    entityType: VoteEntityType.CROWDFUNDING_CAMPAIGN,
    voteType: voteType as any,
  });
};

/**
 * Vote on a hackathon submission (convenience method)
 * POST /votes with HACKATHON_SUBMISSION entity type
 */
export const voteOnHackathonSubmission = async (
  projectId: string,
  voteType: 'UPVOTE' | 'DOWNVOTE'
): Promise<CreateVoteResponse> => {
  return createVote({
    projectId,
    entityType: VoteEntityType.HACKATHON_SUBMISSION,
    voteType: voteType as any,
  });
};

/**
 * Vote on a grant proposal (convenience method)
 * POST /votes with GRANT entity type
 */
export const voteOnGrant = async (
  projectId: string,
  voteType: 'UPVOTE' | 'DOWNVOTE'
): Promise<CreateVoteResponse> => {
  return createVote({
    projectId,
    entityType: VoteEntityType.GRANT,
    voteType: voteType as any,
  });
};

/**
 * Vote on a regular project (convenience method)
 * POST /votes with PROJECT entity type
 */
export const voteOnProject = async (
  projectId: string,
  voteType: 'UPVOTE' | 'DOWNVOTE'
): Promise<CreateVoteResponse> => {
  return createVote({
    projectId,
    entityType: VoteEntityType.PROJECT,
    voteType: voteType as any,
  });
};

/**
 * Get votes for a specific entity type within a project
 * GET /votes/project/:projectId?entityType=:entityType
 */
export const getProjectVotesByEntityType = async (
  projectId: string,
  entityType: VoteEntityType,
  options: {
    limit?: number;
    offset?: number;
    voteType?: VoteType;
    userId?: string;
    includeVoters?: boolean;
  } = {}
): Promise<GetProjectVotesResponse> => {
  return getProjectVotes(projectId, {
    ...options,
    entityType,
  });
};

/**
 * Get upvotes for a project and entity type
 * GET /votes/project/:projectId?entityType=:entityType&voteType=UPVOTE
 */
export const getProjectUpvotes = async (
  projectId: string,
  entityType: VoteEntityType,
  options: {
    limit?: number;
    offset?: number;
    userId?: string;
    includeVoters?: boolean;
  } = {}
): Promise<GetProjectVotesResponse> => {
  return getProjectVotes(projectId, {
    ...options,
    entityType,
    voteType: VoteType.UPVOTE,
  });
};

/**
 * Get downvotes for a project and entity type
 * GET /votes/project/:projectId?entityType=:entityType&voteType=DOWNVOTE
 */
export const getProjectDownvotes = async (
  projectId: string,
  entityType: VoteEntityType,
  options: {
    limit?: number;
    offset?: number;
    userId?: string;
    includeVoters?: boolean;
  } = {}
): Promise<GetProjectVotesResponse> => {
  return getProjectVotes(projectId, {
    ...options,
    entityType,
    voteType: VoteType.DOWNVOTE,
  });
};

/**
 * Get votes by a specific user for a project
 * GET /votes/project/:projectId?userId=:userId
 */
export const getUserVotesForProject = async (
  projectId: string,
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    entityType?: VoteEntityType;
    voteType?: VoteType;
    includeVoters?: boolean;
  } = {}
): Promise<GetProjectVotesResponse> => {
  return getProjectVotes(projectId, {
    ...options,
    userId,
  });
};

/**
 * Get comprehensive voter data for a project
 * GET /votes/project/:projectId?includeVoters=true
 */
export const getProjectVoters = async (
  projectId: string,
  entityType: VoteEntityType = VoteEntityType.CROWDFUNDING_CAMPAIGN,
  options: {
    limit?: number;
    offset?: number;
    voteType?: VoteType;
    userId?: string;
  } = {}
): Promise<{
  success: boolean;
  data: {
    voters: VoterDto[];
    voteCounts: VoteCountResponse;
  };
}> => {
  const response = await getProjectVotes(projectId, {
    ...options,
    entityType,
    includeVoters: true,
  });

  return response as any;
};
