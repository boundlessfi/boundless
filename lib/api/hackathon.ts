import { api } from './api';
import { SubmissionCardProps, ParticipantsResponse } from '@/types/hackathon';
import {
  GetHackathonResponse,
  Hackathon,
  GetHackathonWinnersResponse,
  HackathonWinner,
  GetHackathonAnalyticsResponse,
} from '@/lib/api/hackathons';

export interface HackathonListResponse {
  success: boolean;
  data: {
    hackathons: Hackathon[];
    hasMore: boolean;
    total: number;
    currentPage: number;
    totalPages: number;
  };
  message: string;
}

export interface HackathonResponse {
  success: boolean;
  data: Hackathon;
  message: string;
}

export interface SubmissionsResponse {
  success: boolean;
  data: {
    submissions: SubmissionCardProps[];
    hasMore: boolean;
    total: number;
    currentPage: number;
    totalPages: number;
  };
  message: string;
}

// @deprecated Use GetCommentsResponse from @/types/comment instead
export interface DiscussionsResponse {
  success: boolean;
  data: any[]; // Use Comment[] from @/types/comment instead
  message: string;
}

// API functions remain the same...
export const getHackathons = async (): Promise<HackathonListResponse> => {
  const response = await api.get<HackathonListResponse>('/hackathons');
  return response.data;
};

export const getHackathon = async (
  slug: string
): Promise<GetHackathonResponse> => {
  const res = await api.get(`/hackathons/s/${slug}`);

  return res.data as GetHackathonResponse;
};

// Get featured hackathons
export const getFeaturedHackathons =
  async (): Promise<HackathonListResponse> => {
    const response = await api.get<HackathonListResponse>(
      '/hackathons?featured=true'
    );
    return response.data;
  };

// Get participants for a hackathon
export const getHackathonParticipants = async (
  slug: string,
  params?: { page?: number; limit?: number; status?: string }
): Promise<ParticipantsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const response = await api.get<ParticipantsResponse>(
    `/hackathons/${slug}/participants?${queryParams.toString()}`
  );
  return response.data;
};

export const getHackathonAnalytics = async (
  organizationId: string,
  hackathonId: string
): Promise<GetHackathonAnalyticsResponse> => {
  const url = `/organizations/${organizationId}/hackathons/${hackathonId}/analytics`;
  const res = await api.get<GetHackathonAnalyticsResponse>(url);
  return res.data;
};

// Get submissions for a hackathon
export const getHackathonSubmissions = async (
  slug: string,
  params?: { page?: number; limit?: number; status?: string; sort?: string }
): Promise<SubmissionsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.sort) queryParams.append('sort', params.sort);

  const response = await api.get<SubmissionsResponse>(
    `/hackathons/${slug}/submissions?${queryParams.toString()}`
  );
  return response.data;
};

// Get winners for a hackathon
export const getHackathonWinners = async (
  idOrSlug: string
): Promise<GetHackathonWinnersResponse> => {
  const response = await api.get<GetHackathonWinnersResponse>(
    `/hackathons/${idOrSlug}/winners`
  );
  return response.data;
};
