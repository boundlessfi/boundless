import api from '../api';
import { ApiResponse, PaginatedResponse } from '../types';
import { Hackathon, Participant } from '@/types/hackathon';

// Team Member Type
export interface TeamMember {
  userId: string;
  username: string;
  name: string;
  role: string;
  image?: string;
  joinedAt: string;
}

// Team Role Type (for tracking hired status)
export interface TeamRole {
  skill: string;
  hired: boolean;
}

// Team Recruitment Post Types
export interface TeamRecruitmentPost {
  id: string;
  hackathonId: string;
  organizationId: string;
  teamName: string;
  description: string;
  lookingFor: string[];
  rolesStatus?: TeamRole[]; // Track hired status for each role
  isOpen: boolean;
  leaderId: string;
  maxSize: number;
  memberCount: number;
  members: TeamMember[];
  contactMethod?: 'email' | 'telegram' | 'discord' | 'github' | 'other';
  contactInfo: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  contactCount?: number;
}

export interface CreateTeamPostRequest {
  teamName: string;
  description: string;
  lookingFor: string[];
  maxSize: number;
  contactMethod: 'email' | 'telegram' | 'discord' | 'github' | 'other';
  contactInfo: string;
}

export interface UpdateTeamPostRequest extends Partial<CreateTeamPostRequest> {
  isOpen?: boolean;
}

export interface GetTeamPostsOptions {
  page?: number;
  limit?: number;
  role?: string;
  skill?: string;
  status?: 'active' | 'filled' | 'closed' | 'open' | 'all';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetTeamPostsResponse extends PaginatedResponse<TeamRecruitmentPost> {
  success: true;
  data: TeamRecruitmentPost[]; // Overriding base to match backend structure if needed, but PaginatedResponse handles T[]
}

// Re-defining for clarity as PaginatedResponse<T> is ApiResponse<T[]>
export interface GetTeamsResponse extends ApiResponse<{
  teams: TeamRecruitmentPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
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
 * Get team recruitment posts with filters
 */
export const getTeamPosts = async (
  hackathonSlugOrId: string,
  options?: GetTeamPostsOptions,
  organizationId?: string
): Promise<GetTeamsResponse> => {
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
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/teams?${params.toString()}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/teams?${params.toString()}`;
  }

  const res = await api.get(url);
  return res.data;
};

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
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/teams`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/teams`;
  }

  const res = await api.post(url, data);
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
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/teams/${postId}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/teams/${postId}`;
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
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/teams/${postId}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/teams/${postId}`;
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
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/teams/${postId}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/teams/${postId}`;
  }

  const res = await api.delete(url);
  return res.data;
};

/**
 * Get current user's team for a hackathon
 */
export const getMyTeam = async (
  hackathonSlugOrId: string,
  organizationId?: string
): Promise<ApiResponse<TeamRecruitmentPost | null>> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/my-team`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/my-team`;
  }

  const res = await api.get(url);

  if (res.data.success && res.data.data) {
    let teamData: TeamRecruitmentPost | null = null;

    if (Array.isArray(res.data.data)) {
      if (res.data.data.length > 0) {
        teamData = res.data.data[0] as TeamRecruitmentPost;
      }
    } else {
      teamData = res.data.data as TeamRecruitmentPost;
    }

    return {
      ...res.data,
      data: teamData,
    };
  }

  return {
    ...res.data,
    data: null,
  };
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
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/teams/${postId}/contact`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/teams/${postId}/contact`;
  }

  const res = await api.post(url);
  return res.data;
};

/**
 * Accept team invitation (Legacy Token-based)
 */
export const acceptTeamInvitationToken = async (
  hackathonSlugOrId: string,
  data: AcceptTeamInvitationRequest,
  organizationId?: string
): Promise<AcceptTeamInvitationResponse> => {
  let url: string;

  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/team/accept`;
  } else {
    url = `hackathons/${hackathonSlugOrId}/team/accept`;
  }

  const res = await api.post(url, data);
  return res.data;
};

// Toggle Role Hired Status Types
export interface ToggleRoleHiredRequest {
  skill: string;
}

export interface ToggleRoleHiredResponse extends ApiResponse<{
  role: string;
  hired: boolean;
}> {
  success: true;
  data: {
    role: string;
    hired: boolean;
  };
  message: string;
}

/**
 * Toggle whether a role has been filled (hired) or is still open
 * Only team leaders can toggle role status
 */
export const toggleRoleHired = async (
  hackathonSlugOrId: string,
  teamId: string,
  data: ToggleRoleHiredRequest,
  organizationId?: string
): Promise<ToggleRoleHiredResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/teams/${teamId}/roles/toggle-hired`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/teams/${teamId}/roles/toggle-hired`;
  }

  const res = await api.patch(url, data);
  return res.data;
};
