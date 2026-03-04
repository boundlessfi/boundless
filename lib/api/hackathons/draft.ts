// Hackathon Draft Operations
import api from '../api';
import { ApiResponse, PaginatedResponse } from '../types';
import type { HackathonDraft, Hackathon } from '@/types/hackathon';

// Response Types
export interface CreateDraftResponse extends ApiResponse<HackathonDraft> {
  success: true;
  data: HackathonDraft;
  message: string;
}

export interface UpdateDraftResponse extends ApiResponse<HackathonDraft> {
  success: true;
  data: HackathonDraft;
  message: string;
}

export interface GetDraftResponse extends ApiResponse<HackathonDraft> {
  success: true;
  data: HackathonDraft;
  message: string;
}

export interface PreviewDraftResponse extends ApiResponse<Hackathon> {
  success: true;
  data: Hackathon;
  message: string;
}

export interface GetDraftsResponse extends PaginatedResponse<HackathonDraft> {
  success: true;
}

export interface PublishHackathonResponse extends ApiResponse<Hackathon> {
  success: true;
  data: Hackathon;
  message: string;
}

export interface DeleteHackathonResponse extends ApiResponse<null> {
  success: true;
  message: string;
  data: null;
}

/**
 * Initialize a new hackathon draft
 */
export const initializeDraft = async (
  organizationId: string
): Promise<CreateDraftResponse> => {
  const res = await api.post(
    `organizations/${organizationId}/hackathons/draft`
  );
  return res.data as CreateDraftResponse;
};

/**
 * Update a specific step in hackathon draft
 */
export const updateDraftStep = async (
  organizationId: string,
  draftId: string,
  step: string,
  data: any,
  autoSave?: boolean
) => {
  const res = await api.patch<ApiResponse<UpdateDraftResponse>>(
    `/organizations/${organizationId}/hackathons/draft/${draftId}`,
    {
      step,
      data,
      autoSave,
    }
  );

  return res.data;
};

/**
 * Publish a hackathon draft
 */
export const publishDraft = async (
  draftId: string,
  organizationId: string
): Promise<PublishHackathonResponse> => {
  const res = await api.put<ApiResponse<PublishHackathonResponse>>(
    `/organizations/${organizationId}/hackathons/draft/${draftId}/publish`
  );

  return res.data.data as PublishHackathonResponse;
};

/**
 * Delete Draft Hackathon
 */
export const deleteDraft = async (
  draftId: string,
  organizationId: string
): Promise<DeleteHackathonResponse> => {
  const res = await api.delete<DeleteHackathonResponse>(
    `/organizations/${organizationId}/hackathons/draft/${draftId}`
  );

  if (res.status === 204) {
    return { success: true, message: 'Deleted successfully', data: null };
  }

  return res.data as DeleteHackathonResponse;
};

/**
 * Get a single hackathon draft by ID
 */
export const getDraft = async (
  organizationId: string,
  draftId: string
): Promise<GetDraftResponse> => {
  const res = await api.get<ApiResponse<GetDraftResponse>>(
    `/organizations/${organizationId}/hackathons/draft/${draftId}`
  );

  return res.data.data as GetDraftResponse;
};

/**
 * Get all hackathon drafts for an organization
 */
export const getDrafts = async (
  organizationId: string,
  page = 1,
  limit = 10
): Promise<GetDraftsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await api.get<ApiResponse<GetDraftsResponse>>(
    `/organizations/${organizationId}/hackathons/drafts?${params.toString()}`
  );

  return res.data as GetDraftsResponse;
};
