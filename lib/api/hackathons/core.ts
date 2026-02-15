import api from '../api';
import { ApiResponse, ErrorResponse } from '../types';
import { Hackathon, HackathonCategory } from '@/types/hackathon';

// ============================================
// Response Type Interfaces
// ============================================

export interface GetHackathonResponse extends ApiResponse<Hackathon> {
  success: true;
  data: Hackathon;
  message: string;
}

export interface DeleteHackathonResponse extends ApiResponse<null> {
  success: true;
  data: null;
  message: string;
}

export interface HackathonsData {
  hackathons: Hackathon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    organizationId?: string;
    status?: string;
    category?: string;
    search?: string;
  };
}

export interface GetHackathonsResponse extends ApiResponse<HackathonsData> {
  success: true;
}

export interface UpdateHackathonResponse extends ApiResponse<Hackathon> {
  success: true;
  data: Hackathon;
  message: string;
}

export interface HackathonStatistics {
  participantsCount: number;
  submissionsCount: number;
  activeJudges: number;
  completedMilestones: number;
}

export interface HackathonStatisticsResponse extends ApiResponse<HackathonStatistics> {
  success: true;
  data: HackathonStatistics;
  message: string;
}

export interface TimeSeriesDataPoint {
  date: string; // ISO date string
  count: number;
}

export interface HackathonTimeSeriesData {
  submissions: {
    daily: TimeSeriesDataPoint[];
    weekly: TimeSeriesDataPoint[];
  };
  participants: {
    daily: TimeSeriesDataPoint[];
    weekly: TimeSeriesDataPoint[];
  };
}

export interface HackathonTimeSeriesResponse extends ApiResponse<HackathonTimeSeriesData> {
  success: true;
  data: HackathonTimeSeriesData;
  message: string;
}

export interface PublicHackathonsListData {
  hackathons: Hackathon[];
  hasMore: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface PublicHackathonsListResponse extends ApiResponse<PublicHackathonsListData> {
  success: true;
}

export interface PublicHackathonsListFilters {
  page?: number;
  limit?: number;
  status?: 'upcoming' | 'ongoing' | 'ended';
  category?: string;
  search?: string;
  sort?: 'latest' | 'oldest' | 'participants' | 'prize' | 'deadline';
  featured?: boolean;
}

// ============================================
// Request Types
// ============================================

export type UpdateHackathonRequest = Partial<Hackathon>;

// ============================================
// CRUD Functions
// ============================================

/**
 * Get a single hackathon by ID
 */
export const getHackathon = async (
  hackathonId: string
): Promise<GetHackathonResponse> => {
  const res = await api.get(`/hackathons/${hackathonId}`);
  return res.data as GetHackathonResponse;
};

/**
 * Get all published hackathons
 */
export const getHackathons = async (
  page = 1,
  limit = 10,
  filters?: {
    status?: 'published' | 'ongoing' | 'completed' | 'cancelled';
    category?: HackathonCategory;
    search?: string;
    organizationId?: string; // Optional organization filter
  }
): Promise<GetHackathonsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.status) {
    params.append('status', filters.status);
  }

  if (filters?.category) {
    params.append('category', filters.category);
  }

  if (filters?.search) {
    params.append('search', filters.search);
  }

  if (filters?.organizationId) {
    params.append('organizationId', filters.organizationId);
  }

  const res = await api.get(`/hackathons?${params.toString()}`);

  return res.data;
};

/**
 * Get a single hackathon by slug
 */
export const GetHackathonBySlug = async (
  slug: string
): Promise<GetHackathonResponse> => {
  const res = await api.get(`/hackathons/s/${slug}`);
  return res.data as GetHackathonResponse;
};

/**
 * Update an existing published hackathon
 */
export const updateHackathon = async (
  hackathonId: string,
  data: UpdateHackathonRequest
): Promise<UpdateHackathonResponse> => {
  const res = await api.put(`/hackathons/${hackathonId}`, data);

  return {
    success: true,
    data: res.data,
    message: 'Hackathon updated successfully',
    meta: {
      timestamp: new Date().toISOString(),
      requestId: '',
    },
  };
};

/**
 * Delete a hackathon
 */
export const deleteHackathon = async (
  hackathonId: string
): Promise<DeleteHackathonResponse> => {
  const res = await api.delete(`/hackathons/${hackathonId}`);
  return res.data;
};

/**
 * Get hackathon statistics
 */
export const getHackathonStatistics = async (
  organizationId: string,
  hackathonId: string
): Promise<HackathonStatisticsResponse> => {
  const res = await api.get(
    `/organizations/${organizationId}/hackathons/${hackathonId}/statistics`
  );
  return res.data;
};

/**
 * Get hackathon time-series analytics data
 */
export const getHackathonTimeSeries = async (
  organizationId: string,
  hackathonId: string,
  granularity?: 'daily' | 'weekly'
): Promise<HackathonTimeSeriesResponse> => {
  const params = new URLSearchParams();
  if (granularity) {
    params.append('granularity', granularity);
  }
  const queryString = params.toString();
  const url = `/organizations/${organizationId}/hackathons/${hackathonId}/analytics${
    queryString ? `?${queryString}` : ''
  }`;
  const res = await api.get(url);
  return res.data;
};

/**
 * Get public list of hackathons (no authentication required)
 * This endpoint provides server-side filtering, sorting, and pagination
 */
export const getPublicHackathonsList = async (
  filters: PublicHackathonsListFilters = {}
): Promise<PublicHackathonsListData> => {
  const params = new URLSearchParams();

  if (filters.page !== undefined) {
    params.append('page', filters.page.toString());
  }
  if (filters.limit !== undefined) {
    params.append('limit', filters.limit.toString());
  }
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.category) {
    params.append('category', filters.category);
  }
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.sort) {
    params.append('sort', filters.sort);
  }
  if (filters.featured !== undefined) {
    params.append('featured', filters.featured.toString());
  }

  const queryString = params.toString();
  const url = `/hackathons${queryString ? `?${queryString}` : ''}`;

  const res = await api.get<PublicHackathonsListResponse>(url);

  return (
    res.data.data || {
      hackathons: [],
      hasMore: false,
      total: 0,
      currentPage: 1,
      totalPages: 0,
    }
  );
};

// ============================================
// Utility Functions
// ============================================

/**
 * Error handling utilities
 */
export const isHackathonError = (error: unknown): error is ErrorResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    'statusCode' in error
  );
};

export const handleHackathonError = (error: unknown): never => {
  if (isHackathonError(error)) {
    throw new Error(`${error.message} (${error.statusCode})`);
  }
  throw new Error('An unexpected error occurred');
};

/**
 * Type guards for runtime type checking
 */
export const isHackathon = (obj: unknown): obj is Hackathon => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'organizationId' in obj &&
    'information' in obj &&
    'timeline' in obj &&
    'participation' in obj &&
    'rewards' in obj &&
    'judging' in obj &&
    'collaboration' in obj
  );
};

export const isHackathonDraft = (obj: unknown): obj is any => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'organizationId' in obj &&
    'status' in obj &&
    (obj as any).status === 'draft'
  );
};

export const isCreateDraftRequest = (obj: unknown): obj is any => {
  return typeof obj === 'object' && obj !== null;
};

export const isPublishHackathonRequest = (obj: unknown): obj is any => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'information' in obj &&
    'timeline' in obj &&
    'participation' in obj &&
    'rewards' in obj &&
    'judging' in obj &&
    'collaboration' in obj
  );
};
