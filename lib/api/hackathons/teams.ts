import api from '../api';
import { ApiResponse, PaginatedResponse } from '../types';

// Team Recruitment Post Types
export interface TeamRecruitmentPost {
  id: string;
  hackathonId: string;
  organizationId: string;
  createdBy: {
    userId: string;
    name: string;
    avatar?: string;
    username: string;
  };
  projectName: string;
  projectDescription: string;
  lookingFor: Array<{
    role: string;
    skills?: string[];
  }>;
  currentTeamSize: number;
  maxTeamSize: number;
  contactMethod: 'email' | 'telegram' | 'discord' | 'github' | 'other';
  contactInfo: string;
  status: 'active' | 'filled' | 'closed' | 'open';
  createdAt: string;
  updatedAt: string;
  views?: number;
  contactCount?: number;
}

export interface CreateTeamPostRequest {
  projectName: string;
  projectDescription: string;
  lookingFor: Array<{
    role: string;
    skills?: string[];
  }>;
  currentTeamSize: number;
  maxTeamSize: number;
  contactMethod: 'email' | 'telegram' | 'discord' | 'github' | 'other';
  contactInfo: string;
}

export interface UpdateTeamPostRequest extends Partial<CreateTeamPostRequest> {
  status?: 'active' | 'filled' | 'closed' | 'open';
}

export interface GetTeamPostsOptions {
  page?: number;
  limit?: number;
  role?: string;
  skill?: string;
  status?: 'active' | 'filled' | 'closed' | 'all' | 'open';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetTeamPostsResponse extends PaginatedResponse<TeamRecruitmentPost> {
  success: true;
}

export interface GetTeamPostDetailsResponse extends ApiResponse<TeamRecruitmentPost> {
  success: true;
  data: TeamRecruitmentPost;
  message: string;
}

export interface CreateTeamPostResponse extends ApiResponse<TeamRecruitmentPost> {
  success: true;
  data: TeamRecruitmentPost;
  message: string;
}

export interface UpdateTeamPostResponse extends ApiResponse<TeamRecruitmentPost> {
  success: true;
  data: TeamRecruitmentPost;
  message: string;
}

export interface DeleteTeamPostResponse extends ApiResponse<null> {
  success: true;
  data: null;
  message: string;
}

export interface TrackContactClickResponse extends ApiResponse<null> {
  success: true;
  data: null;
  message: string;
}

export interface AcceptTeamInvitationRequest {
  token: string;
}

export interface AcceptTeamInvitationResponse extends ApiResponse<{
  message: string;
  teamName: string;
}> {
  success: true;
  data: {
    message: string;
    teamName: string;
  };
  message: string;
}

/**
 * Create a team recruitment post
 */
export const createTeamPost = async (
  hackathonSlugOrId: string,
  data: CreateTeamPostRequest,
  organizationId?: string
): Promise<CreateTeamPostResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/team-posts`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/team-posts`;
  }

  const res = await api.post(url, data);
  return res.data;
};

/**
 * Get team recruitment posts with filters
 */
export const getTeamPosts = async (
  hackathonSlugOrId: string,
  options?: GetTeamPostsOptions,
  organizationId?: string
): Promise<GetTeamPostsResponse> => {
  const params = new URLSearchParams();

  if (options?.page) {
    params.append('page', options.page.toString());
  }
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }
  if (options?.role) {
    params.append('role', options.role);
  }
  if (options?.skill) {
    params.append('skill', options.skill);
  }
  if (options?.status && options.status !== 'all') {
    params.append('status', options.status);
  }
  if (options?.search) {
    params.append('search', options.search);
  }
  if (options?.sortBy) {
    params.append('sortBy', options.sortBy);
  }
  if (options?.sortOrder) {
    params.append('sortOrder', options.sortOrder);
  }

  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/team-posts?${params.toString()}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/team-posts?${params.toString()}`;
  }

  const res = await api.get(url);
  return res.data;
};

/**
 * Get team recruitment post details
 */
export const getTeamPostDetails = async (
  hackathonSlugOrId: string,
  postId: string,
  organizationId?: string
): Promise<GetTeamPostDetailsResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/team-posts/${postId}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/team-posts/${postId}`;
  }

  const res = await api.get(url);
  return res.data;
};

/**
 * Update a team recruitment post
 */
export const updateTeamPost = async (
  hackathonSlugOrId: string,
  postId: string,
  data: UpdateTeamPostRequest,
  organizationId?: string
): Promise<UpdateTeamPostResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/team-posts/${postId}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/team-posts/${postId}`;
  }

  const res = await api.put(url, data);
  return res.data;
};

/**
 * Delete/close a team recruitment post
 */
export const deleteTeamPost = async (
  hackathonSlugOrId: string,
  postId: string,
  organizationId?: string
): Promise<DeleteTeamPostResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/team-posts/${postId}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/team-posts/${postId}`;
  }

  const res = await api.delete(url);
  return res.data;
};

/**
 * Track contact click (optional analytics)
 */
export const trackContactClick = async (
  hackathonSlugOrId: string,
  postId: string,
  organizationId?: string
): Promise<TrackContactClickResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/team-posts/${postId}/contact`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/team-posts/${postId}/contact`;
  }

  const res = await api.post(url);
  return res.data;
};

/**
 * Accept team invitation
 */
export const acceptTeamInvitation = async (
  hackathonSlugOrId: string,
  data: AcceptTeamInvitationRequest,
  organizationId?: string
): Promise<AcceptTeamInvitationResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/team/accept`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `hackathons/${hackathonSlugOrId}/team/accept`;
  }

  const res = await api.post(url, data);
  return res.data;
};
