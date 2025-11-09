import api from './api';
import { ApiResponse, ErrorResponse, PaginatedResponse } from './types';

// Enums matching backend models
export enum HackathonCategory {
  DEFI = 'DeFi',
  NFTS = 'NFTs',
  DAOS = 'DAOs',
  LAYER_2 = 'Layer 2',
  CROSS_CHAIN = 'Cross-chain',
  WEB3_GAMING = 'Web3 Gaming',
  SOCIAL_TOKENS = 'Social Tokens',
  INFRASTRUCTURE = 'Infrastructure',
  PRIVACY = 'Privacy',
  SUSTAINABILITY = 'Sustainability',
  REAL_WORLD_ASSETS = 'Real World Assets',
  OTHER = 'Other',
}

export enum ParticipantType {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
  TEAM_OR_INDIVIDUAL = 'team_or_individual',
}

export enum VenueType {
  VIRTUAL = 'virtual',
  PHYSICAL = 'physical',
}

// Information Tab Types
export interface HackathonVenue {
  type: VenueType;
  country?: string;
  state?: string;
  city?: string;
  venueName?: string;
  venueAddress?: string;
}

export interface HackathonInformation {
  title: string;
  banner: string;
  description: string;
  category: HackathonCategory;
  venue: HackathonVenue;
}

// Timeline Tab Types
export interface HackathonPhase {
  name: string;
  startDate: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
  description?: string;
}

export interface HackathonTimeline {
  startDate: string; // ISO 8601 date
  submissionDeadline: string; // ISO 8601 date
  judgingDate: string; // ISO 8601 date
  winnerAnnouncementDate: string; // ISO 8601 date
  timezone: string;
  phases?: HackathonPhase[];
}

// Participation Tab Types
export interface SubmissionRequirements {
  requireGithub?: boolean;
  requireDemoVideo?: boolean;
  requireOtherLinks?: boolean;
}

export interface TabVisibility {
  detailsTab?: boolean;
  scheduleTab?: boolean;
  rulesTab?: boolean;
  rewardTab?: boolean;
  announcementsTab?: boolean;
  partnersTab?: boolean;
  joinATeamTab?: boolean;
  projectsTab?: boolean;
  participantsTab?: boolean;
}

export interface HackathonParticipation {
  participantType: ParticipantType;
  teamMin?: number;
  teamMax?: number;
  about?: string;
  submissionRequirements?: SubmissionRequirements;
  tabVisibility?: TabVisibility;
}

// Rewards Tab Types
export interface PrizeTier {
  position: string;
  amount: number;
  currency?: string;
  description?: string;
  passMark?: number; // 0-100
}

export interface HackathonRewards {
  prizeTiers: PrizeTier[];
}

// Judging Tab Types
export interface JudgingCriterion {
  title: string;
  weight: number; // 0-100
  description?: string;
}

export interface HackathonJudging {
  criteria: JudgingCriterion[];
}

// Collaboration Tab Types
export interface SponsorPartner {
  sponsorName: string;
  sponsorLogo: string;
  partnerLink: string;
}

export interface HackathonCollaboration {
  contactEmail: string;
  telegram?: string;
  discord?: string;
  socialLinks?: string[];
  sponsorsPartners?: SponsorPartner[];
}

// Complete Hackathon Data Structure
export interface HackathonData {
  information: HackathonInformation;
  timeline: HackathonTimeline;
  participation: HackathonParticipation;
  rewards: HackathonRewards;
  judging: HackathonJudging;
  collaboration: HackathonCollaboration;
}

// Draft Types
export interface HackathonDraft extends HackathonData {
  _id: string;
  organizationId: string;
  status: 'draft';
  createdAt: string;
  updatedAt: string;
}

// Published Hackathon Types
export interface Hackathon extends HackathonData {
  _id: string;
  organizationId: string;
  status: 'published' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Request Types
export type CreateDraftRequest = Partial<HackathonData>;

export type UpdateDraftRequest = Partial<HackathonData>;

export type PublishHackathonRequest = HackathonData;

export type UpdateHackathonRequest = Partial<HackathonData>;

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

export interface GetDraftsResponse extends PaginatedResponse<HackathonDraft> {
  success: true;
  data: HackathonDraft[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PublishHackathonResponse extends ApiResponse<Hackathon> {
  success: true;
  data: Hackathon;
  message: string;
}

export interface UpdateHackathonResponse extends ApiResponse<Hackathon> {
  success: true;
  data: Hackathon;
  message: string;
}

export interface GetHackathonResponse extends ApiResponse<Hackathon> {
  success: true;
  data: Hackathon;
  message: string;
}

export interface GetHackathonsResponse extends PaginatedResponse<Hackathon> {
  success: true;
  data: Hackathon[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Create a new hackathon draft
 */
export const createDraft = async (
  organizationId: string,
  data: CreateDraftRequest
): Promise<CreateDraftResponse> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/drafts`,
    data
  );
  return res.data;
};

/**
 * Update an existing hackathon draft
 */
export const updateDraft = async (
  organizationId: string,
  draftId: string,
  data: UpdateDraftRequest
): Promise<UpdateDraftResponse> => {
  const res = await api.put(
    `/organizations/${organizationId}/hackathons/drafts/${draftId}`,
    data
  );
  return res.data;
};

/**
 * Get a single hackathon draft by ID
 */
export const getDraft = async (
  organizationId: string,
  draftId: string
): Promise<GetDraftResponse> => {
  const res = await api.get(
    `/organizations/${organizationId}/hackathons/drafts/${draftId}`
  );
  return res.data;
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

  const res = await api.get(
    `/organizations/${organizationId}/hackathons/drafts?${params.toString()}`
  );
  return res.data;
};

/**
 * Publish a hackathon draft (creates a published hackathon)
 */
export const publishHackathon = async (
  organizationId: string,
  data: PublishHackathonRequest
): Promise<PublishHackathonResponse> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons`,
    data
  );
  return res.data;
};

/**
 * Update an existing published hackathon
 */
export const updateHackathon = async (
  organizationId: string,
  hackathonId: string,
  data: UpdateHackathonRequest
): Promise<UpdateHackathonResponse> => {
  const res = await api.put(
    `/organizations/${organizationId}/hackathons/${hackathonId}`,
    data
  );
  return res.data;
};

/**
 * Get a single hackathon by ID
 */
export const getHackathon = async (
  organizationId: string,
  hackathonId: string
): Promise<GetHackathonResponse> => {
  const res = await api.get(
    `/organizations/${organizationId}/hackathons/${hackathonId}`
  );
  return res.data;
};

/**
 * Get all hackathons for an organization
 */
export const getHackathons = async (
  organizationId: string,
  page = 1,
  limit = 10,
  filters?: {
    status?: 'published' | 'ongoing' | 'completed' | 'cancelled';
    category?: HackathonCategory;
    search?: string;
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

  const res = await api.get(
    `/organizations/${organizationId}/hackathons?${params.toString()}`
  );
  return res.data;
};

// Error handling utilities
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

// Type guards for runtime type checking
export const isHackathon = (obj: unknown): obj is Hackathon => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_id' in obj &&
    'organizationId' in obj &&
    'information' in obj &&
    'timeline' in obj &&
    'participation' in obj &&
    'rewards' in obj &&
    'judging' in obj &&
    'collaboration' in obj
  );
};

export const isHackathonDraft = (obj: unknown): obj is HackathonDraft => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_id' in obj &&
    'organizationId' in obj &&
    'status' in obj &&
    (obj as HackathonDraft).status === 'draft'
  );
};

export const isCreateDraftRequest = (
  obj: unknown
): obj is CreateDraftRequest => {
  return typeof obj === 'object' && obj !== null;
};

export const isPublishHackathonRequest = (
  obj: unknown
): obj is PublishHackathonRequest => {
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
