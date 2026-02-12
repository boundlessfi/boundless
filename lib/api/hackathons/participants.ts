import api from '../api';
import { ApiResponse } from '../types';
import {
  Participant,
  ParticipantsData,
  ParticipantSubmission,
  CreateSubmissionRequest,
  VoteSubmissionRequest,
} from '@/types/hackathon';

// ============================================
// Response Types
// ============================================

export interface RegisterForHackathonResponse extends ApiResponse<Participant> {
  success: true;
  data: Participant;
  message: string;
}

export interface LeaveHackathonResponse extends ApiResponse<{
  teamCleanedUp: boolean;
  teamId?: string;
}> {
  success: true;
  data: {
    teamCleanedUp: boolean;
    teamId?: string;
  };
  message: string;
}

export interface CheckRegistrationStatusResponse extends ApiResponse<Participant | null> {
  success: true;
  data: Participant | null;
  message: string;
}

export interface GetParticipantsResponse extends ApiResponse<ParticipantsData> {
  success: true;
}

export interface CreateSubmissionResponse extends ApiResponse<ParticipantSubmission> {
  success: true;
  data: ParticipantSubmission;
  message: string;
}

export interface UpdateSubmissionResponse extends ApiResponse<ParticipantSubmission> {
  success: true;
  data: ParticipantSubmission;
  message: string;
}

export interface GetMySubmissionResponse extends ApiResponse<ParticipantSubmission | null> {
  success: true;
  data: ParticipantSubmission | null;
  message: string;
}

export interface GetSubmissionDetailsResponse extends ApiResponse<ParticipantSubmission> {
  success: true;
  data: ParticipantSubmission;
  message: string;
}

export interface VoteSubmissionResponse extends ApiResponse<{
  votes: number;
  hasVoted: boolean;
}> {
  success: true;
  data: { votes: number; hasVoted: boolean };
  message: string;
}

export interface RemoveVoteResponse extends ApiResponse<{ votes: number }> {
  success: true;
  data: { votes: number };
  message: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Register for a hackathon
 * Supports both slug-based (public) and organization/hackathon ID (authenticated) endpoints
 */
export const registerForHackathon = async (
  hackathonSlugOrId: string,
  organizationId?: string
): Promise<RegisterForHackathonResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/join`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `/hackathons/${hackathonSlugOrId}/join`;
  }

  const res = await api.post(url);
  return res.data;
};

/**
 * Leave a hackathon
 * Supports both slug-based (public) and organization/hackathon ID (authenticated) endpoints
 */
export const leaveHackathon = async (
  hackathonSlugOrId: string,
  organizationId?: string
): Promise<LeaveHackathonResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/leave`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `/hackathons/${hackathonSlugOrId}/leave`;
  }

  const res = await api.delete(url);
  return res.data;
};

/**
 * Check registration status for a hackathon
 * Returns participant data if registered, null otherwise
 */
export const checkRegistrationStatus = async (
  hackathonSlugOrId: string,
  organizationId?: string
): Promise<CheckRegistrationStatusResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/register/status`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `/hackathons/${hackathonSlugOrId}/register/status`;
  }

  const res = await api.get(url);
  return res.data;
};

/**
 * Get participants for a hackathon
 */
export const getParticipants = async (
  organizationId: string,
  hackathonId: string,
  page = 1,
  limit = 10,
  filters?: {
    status?: 'submitted' | 'not_submitted' | 'shortlisted' | 'disqualified';
    type?: 'individual' | 'team';
    search?: string;
  }
): Promise<GetParticipantsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status) {
    params.append('status', filters.status);
  }

  if (filters?.type) {
    params.append('type', filters.type);
  }

  if (filters?.search) {
    params.append('search', filters.search);
  }

  const res = await api.get<ApiResponse<ParticipantsData>>(
    `/organizations/${organizationId}/hackathons/${hackathonId}/participants?${params.toString()}`
  );

  return res.data as GetParticipantsResponse;
};

/**
 * Create a submission for a hackathon
 * Supports both slug-based (public) and organization/hackathon ID (authenticated) endpoints
 */
export const createSubmission = async (
  hackathonSlugOrId: string,
  data: Omit<CreateSubmissionRequest, 'hackathonId' | 'organizationId'>,
  organizationId?: string
): Promise<CreateSubmissionResponse> => {
  // Backend uses /hackathons/submissions with hackathonId in body
  const submissionData: CreateSubmissionRequest = {
    ...data,
    hackathonId: hackathonSlugOrId,
    organizationId: organizationId || '',
    participationType: data.participationType || 'INDIVIDUAL',
    links: data.links || [],
  };

  const res = await api.post('/hackathons/submissions', submissionData);
  return res.data;
};

/**
 * Update a submission for a hackathon
 */
export const updateSubmission = async (
  submissionId: string,
  data: Partial<Omit<CreateSubmissionRequest, 'hackathonId' | 'organizationId'>>
): Promise<UpdateSubmissionResponse> => {
  // Backend uses /hackathons/submissions/:submissionId with PATCH
  const res = await api.patch(`/hackathons/submissions/${submissionId}`, data);
  return res.data;
};

/**
 * Get current user's submission for a hackathon
 * Returns submission if exists, null otherwise
 */
export const getMySubmission = async (
  hackathonSlugOrId: string
): Promise<GetMySubmissionResponse> => {
  // Backend uses /hackathons/:id/my-submission
  const res = await api.get(`/hackathons/${hackathonSlugOrId}/my-submission`);
  return res.data;
};

/**
 * Get submission details by ID
 * Returns full submission with votes and comments
 */
export const getSubmissionDetails = async (
  submissionId: string
): Promise<GetSubmissionDetailsResponse> => {
  // Backend uses /hackathons/submissions/:submissionId
  const res = await api.get(`/hackathons/submissions/${submissionId}`);
  return res.data;
};

/**
 * Vote on a submission (upvote or downvote)
 */
export const upvoteSubmission = async (
  hackathonSlugOrId: string,
  submissionId: string,
  data: VoteSubmissionRequest,
  organizationId?: string
): Promise<VoteSubmissionResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/submissions/${submissionId}/vote`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `/hackathons/${hackathonSlugOrId}/submissions/${submissionId}/vote`;
  }

  const res = await api.post(url, data);
  return res.data;
};

/**
 * Remove vote from a submission
 */
export const removeVote = async (
  hackathonSlugOrId: string,
  submissionId: string,
  organizationId?: string
): Promise<RemoveVoteResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/submissions/${submissionId}/vote`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `/hackathons/${hackathonSlugOrId}/submissions/${submissionId}/vote`;
  }

  const res = await api.delete(url);
  return res.data;
};
