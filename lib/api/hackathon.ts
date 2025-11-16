import { api } from './api';
import {
  Hackathon,
  Participant,
  SubmissionCardProps,
  Discussion,
} from '@/types/hackathon';

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

export interface ParticipantsResponse {
  success: boolean;
  data: {
    participants: Participant[];
    hasMore: boolean;
    total: number;
    currentPage: number;
    totalPages: number;
  };
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

export interface DiscussionsResponse {
  success: boolean;
  data: Discussion[];
  message: string;
}

// API functions remain the same...
export const getHackathons = async (): Promise<HackathonListResponse> => {
  const response = await api.get<HackathonListResponse>('/hackathons');
  return response.data;
};

// Get single hackathon by slug
export const getHackathon = async (
  slug: string
): Promise<HackathonResponse> => {
  const response = await api.get<HackathonResponse>(`/hackathons/${slug}`);
  return response.data;
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

// Get discussions for a hackathon (you'll need to implement this endpoint)
// export const getHackathonDiscussions = async (hackathonId: string): Promise<DiscussionsResponse> => {
//   const response = await api.get(`/hackathons/${hackathonId}/discussions`);
//   return response.data;
// };
