/* eslint-disable @typescript-eslint/no-unused-vars */
import { CrowdfundingProject, Crowdfunding } from '@/types/project';
import api from './api';
import {
  ProjectInitRequest,
  CreateCrowdfundingProjectRequest,
  CreateCrowdfundingProjectResponse,
  PrepareCrowdfundingProjectResponse,
  ConfirmCrowdfundingProjectRequest,
  ConfirmCrowdfundingProjectResponse,
  GetCrowdfundingProjectsResponse,
  UpdateCrowdfundingProjectRequest,
  UpdateCrowdfundingProjectResponse,
  DeleteCrowdfundingProjectResponse,
  FundCrowdfundingProjectRequest,
  FundCrowdfundingProjectResponse,
  PrepareFundingRequest,
  PrepareFundingResponse,
  ConfirmFundingRequest,
  ConfirmFundingResponse,
  VoteResponse,
  GetProjectVotesRequest,
  GetProjectVotesResponse,
  RemoveVoteResponse,
} from './types';

export const initProject = async (data: ProjectInitRequest) => {
  const res = await api.post('/projects', data);
  return res;
};

export const getProjects = async (
  page = 1,
  limit = 9,
  filters?: {
    status?: string;
    owner?: string;
  }
): Promise<{
  projects: CrowdfundingProject[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }

  if (filters?.owner) {
    params.append('owner', filters.owner);
  }

  const res = await api.get(`/projects?${params.toString()}`);
  return res.data.data;
};

export const getProjectDetails = async (_projectId: string) => {
  const res = await api.get(`/projects/${_projectId}`);
  return res.data.data;
};

export const deleteProject = async (_projectId: string) => {
  const res = await api.delete(`/projects/${_projectId}`);
  return res.data.data;
};

export const updateProject = async (
  _projectId: string,
  data: ProjectInitRequest
) => {
  const res = await api.put(`/projects/${_projectId}`, data);
  return res.data.data;
};

export const launchCampaign = async (_projectId: string) => {
  console.log('launchCampaign', _projectId);
  // Mock implementation for now
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Campaign launched successfully',
        data: {
          campaignId: 'launched-campaign-123',
          shareLink: 'https://boundlessfi.xyz/campaigns/launched-campaign-123',
        },
      });
    }, 2000);
  });
};

export const generateCampaignLink = async (_projectId: string) => {
  // Mock implementation for now
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          shareLink: 'https://boundlessfi.xyz/campaigns/' + _projectId,
        },
      });
    }, 500);
  });
};

/**
 * Create a crowdfunding project
 * Frontend handles all blockchain transactions and provides escrow data
 * @param data - Project data including escrowId, transactionHash, and validateMilestones
 */
export const createCrowdfundingProject = async (
  data: CreateCrowdfundingProjectRequest
): Promise<CreateCrowdfundingProjectResponse> => {
  const res = await api.post('/crowdfunding', data);
  return res.data;
};

/**
 * @deprecated This endpoint no longer exists in the backend.
 * All blockchain transactions are now handled in the frontend.
 * Use createCrowdfundingProject directly with contractId, escrowAddress, and transactionHash.
 */
export const prepareCrowdfundingProject = async (
  data: CreateCrowdfundingProjectRequest
): Promise<PrepareCrowdfundingProjectResponse> => {
  console.log('prepareCrowdfundingProject', data);
  throw new Error(
    'prepareCrowdfundingProject is deprecated. All blockchain transactions should be handled in the frontend. Use createCrowdfundingProject with contractId, escrowAddress, and transactionHash.'
  );
};

/**
 * @deprecated This endpoint no longer exists in the backend.
 * All blockchain transactions are now handled in the frontend.
 * Use createCrowdfundingProject directly with contractId, escrowAddress, and transactionHash.
 */
export const confirmCrowdfundingProject = async (
  data: ConfirmCrowdfundingProjectRequest
): Promise<ConfirmCrowdfundingProjectResponse> => {
  console.log('confirmCrowdfundingProject', data);
  throw new Error(
    'confirmCrowdfundingProject is deprecated. All blockchain transactions should be handled in the frontend. Use createCrowdfundingProject with contractId, escrowAddress, and transactionHash.'
  );
};

// Crowdfunding Project API Functions

/**
 * Get all crowdfunding projects with pagination and filtering
 */
export const getCrowdfundingProjects = async (
  page = 1,
  limit = 10,
  filters?: {
    category?: string;
    status?: string;
    minFundingGoal?: string;
    maxFundingGoal?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
  }
): Promise<GetCrowdfundingProjectsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.category) {
    params.append('category', filters.category);
  }

  if (filters?.status) {
    params.append('status', filters.status);
  }

  if (filters?.minFundingGoal) {
    params.append('minFundingGoal', filters.minFundingGoal);
  }

  if (filters?.maxFundingGoal) {
    params.append('maxFundingGoal', filters.maxFundingGoal);
  }

  if (filters?.sortBy) {
    params.append('sortBy', filters.sortBy);
  }

  if (filters?.sortOrder) {
    params.append('sortOrder', filters.sortOrder);
  }

  if (filters?.search) {
    params.append('search', filters.search);
  }

  const queryString = params.toString();
  const url = queryString ? `/crowdfunding?${queryString}` : '/crowdfunding';

  const res = await api.get(url);
  return res.data;
};

/**
 * Get a single crowdfunding project by ID
 */
export const getCrowdfundingProject = async (
  projectId: string
): Promise<Crowdfunding> => {
  const res = await api.get(`/crowdfunding/${projectId}`);
  console.log(res);
  return res.data.data;
};

/**
 * Update a crowdfunding project
 */
export const updateCrowdfundingProject = async (
  projectId: string,
  data: UpdateCrowdfundingProjectRequest
): Promise<UpdateCrowdfundingProjectResponse> => {
  const res = await api.put(`/crowdfunding/${projectId}`, data);
  return res.data;
};

/**
 * Delete a crowdfunding project
 */
export const deleteCrowdfundingProject = async (
  projectId: string
): Promise<DeleteCrowdfundingProjectResponse> => {
  const res = await api.delete(`/crowdfunding/projects/${projectId}`);
  return res.data;
};

/**
 * Fund a crowdfunding project
 * Frontend handles all blockchain transactions and provides transaction hash
 * @param projectId - The ID of the project to fund
 * @param data - Funding data including amount and transactionHash
 */
export const fundCrowdfundingProject = async (
  projectId: string,
  data: FundCrowdfundingProjectRequest
): Promise<FundCrowdfundingProjectResponse> => {
  const res = await api.post(`/crowdfunding/projects/${projectId}/fund`, data);
  return res.data;
};

/**
 * @deprecated This endpoint no longer exists in the backend.
 * All blockchain transactions are now handled in the frontend.
 * Use fundCrowdfundingProject directly with amount and transactionHash.
 */
export const prepareProjectFunding = async (
  projectId: string,
  data: PrepareFundingRequest
): Promise<PrepareFundingResponse> => {
  console.log('prepareProjectFunding', projectId, data);
  throw new Error(
    'prepareProjectFunding is deprecated. All blockchain transactions should be handled in the frontend. Use fundCrowdfundingProject with amount and transactionHash.'
  );
};

/**
 * @deprecated This endpoint no longer exists in the backend.
 * All blockchain transactions are now handled in the frontend.
 * Use fundCrowdfundingProject directly with amount and transactionHash.
 */
export const confirmProjectFunding = async (
  projectId: string,
  data: ConfirmFundingRequest
): Promise<ConfirmFundingResponse> => {
  console.log('confirmProjectFunding', projectId, data);
  throw new Error(
    'confirmProjectFunding is deprecated. All blockchain transactions should be handled in the frontend. Use fundCrowdfundingProject with amount and transactionHash.'
  );
};
export const voteProject = async (
  projectId: string,
  value: 1 | -1 = 1
): Promise<VoteResponse> => {
  const res = await api.post(`/projects/${projectId}/vote`, { value });
  return res.data;
};

/**
 * Get votes for a project with pagination and filtering
 */
export const getProjectVotes = async (
  projectId: string,
  params?: GetProjectVotesRequest
): Promise<GetProjectVotesResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }

  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  if (params?.voteType) {
    queryParams.append('voteType', params.voteType);
  }

  const queryString = queryParams.toString();
  const url = queryString
    ? `/projects/${projectId}/votes?${queryString}`
    : `/projects/${projectId}/votes`;

  const res = await api.get(url);
  return res.data;
};

/**
 * Remove user's vote from a project
 */
export const removeProjectVote = async (
  projectId: string
): Promise<RemoveVoteResponse> => {
  const res = await api.delete(`/projects/${projectId}/vote`);
  return res.data;
};

export const contributeToProject = async (
  projectId: string,
  data: FundCrowdfundingProjectRequest
): Promise<FundCrowdfundingProjectResponse> => {
  const res = await api.post(`/crowdfunding/${projectId}/contribute`, data);
  return res.data;
};
