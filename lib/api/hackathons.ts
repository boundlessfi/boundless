import api, { type RequestConfig } from './api';
import { ApiResponse, ErrorResponse, PaginatedResponse } from './types';
import { Discussion } from '@/types/hackathon';

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
  tagline: string;
  description: string;
  categories: HackathonCategory[]; // New format (array of categories)
  slug: string;
  venue?: HackathonVenue;
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
  participantsTab?: boolean;
  resourcesTab?: boolean;
  submissionTab?: boolean;
  announcementsTab?: boolean;
  discussionTab?: boolean;
  winnersTab?: boolean;
  sponsorsTab?: boolean;
  joinATeamTab?: boolean;
  rulesTab?: boolean;
}

export interface HackathonParticipation {
  participantType?: ParticipantType;
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
  title: string;
  contractId?: string;
  escrowAddress?: string;
  transactionHash?: string;
  escrowDetails?: object;
}

// Published Hackathon Types
export interface Hackathon extends HackathonData {
  _id: string;
  organizationId: string;
  status: 'published' | 'ongoing' | 'completed' | 'cancelled' | 'draft';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  title: string;
  contractId?: string;
  escrowAddress?: string;
  transactionHash?: string;
  escrowDetails?: object;
}

// Request Types
export type CreateDraftRequest = Partial<HackathonData>;

export type UpdateDraftRequest = Partial<HackathonData>;

export interface PublishHackathonRequest extends HackathonData {
  draftId?: string;
  contractId?: string;
  escrowAddress?: string;
  transactionHash?: string;
  escrowDetails?: object;
}

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

export interface PreviewDraftResponse extends ApiResponse<PublicHackathon> {
  success: true;
  data: PublicHackathon;
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

export interface DeleteHackathonResponse extends ApiResponse<null> {
  success: true;
  data: null;
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

// Statistics and Analytics Types
export interface HackathonStatistics {
  participantsCount: number;
  submissionsCount: number;
  activeJudges: number;
  completedMilestones: number;
}

export interface HackathonStatisticsResponse
  extends ApiResponse<HackathonStatistics> {
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

export interface HackathonTimeSeriesResponse
  extends ApiResponse<HackathonTimeSeriesData> {
  success: true;
  data: HackathonTimeSeriesData;
  message: string;
}

// Participant Types
export interface ParticipantTeamMember {
  userId: string;
  name: string;
  username: string;
  role: string;
  avatar?: string;
}

export interface ParticipantVote {
  _id: string;
  userId: string;
  user: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string;
    };
    email: string;
  };
  value: number;
  createdAt: string;
}

export interface ParticipantComment {
  _id: string;
  userId: string;
  user: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string;
    };
    email: string;
  };
  content: string;
  reactionCounts?: {
    LIKE?: number;
    DISLIKE?: number;
    HELPFUL?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantSubmission {
  _id: string;
  projectName: string;
  category: string;
  description: string;
  logo?: string;
  videoUrl?: string;
  introduction?: string;
  links?: Array<{ type: string; url: string }>;
  votes: number | ParticipantVote[]; // Can be a number or array of vote objects
  comments: number | ParticipantComment[]; // Can be a number or array of comment objects
  submissionDate: string;
  status: 'submitted' | 'shortlisted' | 'disqualified';
  disqualificationReason?: string | null;
  reviewedBy?: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string;
    };
    email: string;
  } | null;
  reviewedAt?: string | null;
}

export interface Participant {
  _id: string;
  userId: string;
  hackathonId: string;
  organizationId: string;
  user: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string;
    };
    email: string;
  };
  socialLinks?: {
    github?: string;
    telegram?: string;
    twitter?: string;
    email?: string;
  };
  participationType: 'individual' | 'team';
  teamId?: string;
  teamName?: string;
  teamMembers?: ParticipantTeamMember[];
  submission?: ParticipantSubmission;
  registeredAt: string;
  submittedAt?: string;
}

export interface GetParticipantsResponse
  extends PaginatedResponse<Participant> {
  success: true;
  data: Participant[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RegisterForHackathonRequest {
  participationType: 'individual' | 'team';
  teamName?: string;
  teamMembers?: string[];
}

export interface RegisterForHackathonResponse extends ApiResponse<Participant> {
  success: true;
  data: Participant;
  message: string;
}

export interface CheckRegistrationStatusResponse
  extends ApiResponse<Participant | null> {
  success: true;
  data: Participant | null;
  message: string;
}

export interface CreateSubmissionRequest {
  projectName: string;
  category: string;
  description: string;
  logo?: string;
  videoUrl?: string;
  introduction?: string;
  links?: Array<{ type: string; url: string }>;
}

export interface UpdateSubmissionRequest extends CreateSubmissionRequest {
  submissionId: string;
}

export interface CreateSubmissionResponse
  extends ApiResponse<ParticipantSubmission> {
  success: true;
  data: ParticipantSubmission;
  message: string;
}

export interface UpdateSubmissionResponse
  extends ApiResponse<ParticipantSubmission> {
  success: true;
  data: ParticipantSubmission;
  message: string;
}

export interface GetMySubmissionResponse
  extends ApiResponse<ParticipantSubmission | null> {
  success: true;
  data: ParticipantSubmission | null;
  message: string;
}

export interface GetSubmissionDetailsResponse
  extends ApiResponse<ParticipantSubmission> {
  success: true;
  data: ParticipantSubmission;
  message: string;
}

export interface VoteSubmissionRequest {
  value: 1 | -1; // 1 for upvote, -1 for downvote
}

export interface VoteSubmissionResponse
  extends ApiResponse<{ votes: number; hasVoted: boolean }> {
  success: true;
  data: { votes: number; hasVoted: boolean };
  message: string;
}

export interface RemoveVoteResponse extends ApiResponse<{ votes: number }> {
  success: true;
  data: { votes: number };
  message: string;
}

// Judging API Types
export interface CriterionScore {
  criterionTitle: string;
  score: number; // 0-100
}

export interface JudgeScore {
  _id: string;
  judge: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      username: string;
      avatar?: string;
    };
    email: string;
  };
  scores: CriterionScore[];
  weightedScore: number;
  notes?: string;
  judgedAt: string;
  updatedAt: string;
}

export interface JudgingSubmission {
  participant: {
    _id: string;
    userId: string;
    hackathonId: string;
    organizationId: string;
    user: {
      _id: string;
      profile: {
        firstName: string;
        lastName: string;
        username: string;
        avatar?: string;
      };
      email: string;
    };
    participationType: 'individual' | 'team';
    teamId?: string;
    teamName?: string;
  };
  submission: {
    _id: string;
    projectName: string;
    category: string;
    description: string;
    logo?: string;
    videoUrl?: string;
    introduction?: string;
    links?: Array<{ type: string; url: string }>;
    submissionDate: string;
    status: 'shortlisted';
    rank?: number;
  };
  criteria: JudgingCriterion[];
  scores: JudgeScore[];
  averageScore: number | null;
  judgeCount: number;
}

export interface SubmissionScoresResponse {
  participant: {
    _id: string;
    userId: string;
    hackathonId: string;
    organizationId: string;
    user: {
      _id: string;
      profile: {
        firstName: string;
        lastName: string;
        username: string;
        avatar?: string;
      };
      email: string;
    };
    participationType: 'individual' | 'team';
    teamId?: string;
    teamName?: string;
    submission: {
      _id: string;
      projectName: string;
      category: string;
      description: string;
      logo?: string;
      videoUrl?: string;
      introduction?: string;
      links?: Array<{ type: string; url: string }>;
      submissionDate: string;
      status: 'shortlisted';
    };
  };
  criteria: JudgingCriterion[];
  scores: JudgeScore[];
  statistics: {
    averageScore: number | null;
    minScore: number | null;
    maxScore: number | null;
    judgeCount: number;
  };
}

export interface GradeSubmissionRequest {
  scores: CriterionScore[];
  notes?: string;
}

export interface GradeSubmissionResponse {
  submission: {
    _id: string;
    projectName: string;
    category: string;
    status: 'shortlisted';
  };
  score: {
    _id: string;
    weightedScore: number;
    scores: CriterionScore[];
    judgedBy: {
      _id: string;
      profile: {
        firstName: string;
        lastName: string;
        username: string;
        avatar?: string;
      };
      email: string;
    };
    notes?: string;
    judgedAt: string;
  };
  allScores: JudgeScore[];
  averageScore: number;
}

export interface GetJudgingSubmissionsResponse
  extends PaginatedResponse<JudgingSubmission> {
  success: true;
  data: JudgingSubmission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message: string;
}

export interface GetSubmissionScoresResponse
  extends ApiResponse<SubmissionScoresResponse> {
  success: true;
  data: SubmissionScoresResponse;
  message: string;
}

export interface SubmitGradeResponse
  extends ApiResponse<GradeSubmissionResponse> {
  success: true;
  data: GradeSubmissionResponse;
  message: string;
}

// Rewards API Types
export interface AssignRanksRequest {
  ranks: Array<{
    participantId: string;
    rank: number;
  }>;
}

export interface AssignRanksResponse {
  success: boolean;
  message: string;
  data: {
    updated: number;
  };
}

export interface HackathonEscrowData {
  contractId: string;
  escrowAddress: string;
  balance: number;
  milestones: Array<{
    description: string;
    amount: number;
    receiver: string;
    status: string;
    evidence: string;
    flags?: {
      approved: boolean;
      disputed: boolean;
      released: boolean;
      resolved: boolean;
    };
  }>;
  isFunded: boolean;
  canUpdate: boolean;
}

export interface GetHackathonEscrowResponse
  extends ApiResponse<HackathonEscrowData> {
  success: true;
  data: HackathonEscrowData;
  message: string;
}

export interface CreateWinnerMilestonesRequest {
  winners: Array<{
    participantId: string;
    rank: number;
    walletAddress: string;
    amount?: number;
    currency?: string;
  }>;
}

export interface CreateWinnerMilestonesResponse {
  success: boolean;
  message: string;
  data: {
    transactionHash?: string;
    milestonesCreated: number;
  };
}

// Public Hackathons List API Types
export interface PublicHackathon {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  imageUrl: string;
  status: 'upcoming' | 'ongoing' | 'ended';
  participants: number;
  totalPrizePool: string;
  deadline: string;
  categories: string[];
  startDate: string;
  endDate: string;
  organizer: string;
  featured: boolean;
  resources: string[];
  venue?: {
    type: 'virtual' | 'physical';
    country?: string;
    state?: string;
    city?: string;
    venueName?: string;
    venueAddress?: string;
  };
  participantType?: 'individual' | 'team' | 'team_or_individual';
}

export interface PublicHackathonsListData {
  hackathons: PublicHackathon[];
  hasMore: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface PublicHackathonsListResponse
  extends ApiResponse<PublicHackathonsListData> {
  success: true;
  data: PublicHackathonsListData;
  message: string;
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

/**
 * Flat API response structure (before transformation)
 */
interface FlatHackathonData {
  _id?: string;
  organizationId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  title?: string;
  contractId?: string;
  escrowAddress?: string;
  transactionHash?: string;
  escrowDetails?: object;
  // Flat fields that map to nested structure
  banner?: string;
  tagline?: string;
  description?: string;
  categories?: HackathonCategory[]; // New format
  venue?: HackathonVenue;
  startDate?: string;
  submissionDeadline?: string;
  judgingDate?: string;
  winnerAnnouncementDate?: string;
  timezone?: string;
  phases?: HackathonPhase[];
  participantType?: string | ParticipantType;
  teamMin?: number;
  teamMax?: number;
  about?: string;
  submissionRequirements?: SubmissionRequirements;
  tabVisibility?: TabVisibility;
  prizeTiers?: PrizeTier[];
  criteria?: JudgingCriterion[];
  contactEmail?: string;
  telegram?: string;
  discord?: string;
  socialLinks?: string[];
  sponsorsPartners?: SponsorPartner[];
  // Nested structure (if already transformed)
  information?: HackathonInformation;
  timeline?: HackathonTimeline;
  participation?: HackathonParticipation;
  rewards?: HackathonRewards;
  judging?: HackathonJudging;
  collaboration?: HackathonCollaboration;
  slug: string;
}

/**
 * Transform flat API response to nested Hackathon structure
 */
const transformHackathonResponse = (
  flatData: FlatHackathonData | Hackathon
): Hackathon => {
  // Check if data is already in nested format
  if (
    'information' in flatData &&
    flatData.information &&
    'timeline' in flatData &&
    flatData.timeline &&
    'participation' in flatData &&
    flatData.participation
  ) {
    return flatData as Hackathon;
  }

  // Type guard: if it's already a Hackathon, return it
  if ('information' in flatData) {
    return flatData as Hackathon;
  }

  // Now we know it's FlatHackathonData, transform from flat to nested structure
  const flat = flatData as FlatHackathonData;
  return {
    _id: flat._id || '',
    organizationId: flat.organizationId || '',
    status: (flat.status as Hackathon['status']) || 'draft',
    createdAt: flat.createdAt || '',
    updatedAt: flat.updatedAt || '',
    publishedAt: flat.publishedAt,
    title: flat.title || '',
    contractId: flat.contractId,
    escrowAddress: flat.escrowAddress,
    transactionHash: flat.transactionHash,
    escrowDetails: flat.escrowDetails,
    information: {
      title: flat.title || '',
      banner: flat.banner || '',
      description: flat.description || '',
      tagline: flat.tagline || '',
      slug: flat.slug || '',
      // Support both new format (categories) and legacy format (category)
      categories: Array.isArray(flat.categories)
        ? (flat.categories as HackathonCategory[])
        : [HackathonCategory.OTHER],
      venue: flat.venue,
    },
    timeline: {
      startDate: flat.startDate || '',
      submissionDeadline: flat.submissionDeadline || '',
      judgingDate: flat.judgingDate || '',
      winnerAnnouncementDate: flat.winnerAnnouncementDate || '',
      timezone: flat.timezone || 'UTC',
      phases: flat.phases || [],
    },
    participation: {
      participantType: flat.participantType as ParticipantType | undefined,
      teamMin: flat.teamMin,
      teamMax: flat.teamMax,
      about: flat.about,
      submissionRequirements: flat.submissionRequirements,
      tabVisibility: flat.tabVisibility,
    },
    rewards: {
      prizeTiers: flat.prizeTiers || [],
    },
    judging: {
      criteria: flat.criteria || [],
    },
    collaboration: {
      contactEmail: flat.contactEmail || '',
      telegram: flat.telegram,
      discord: flat.discord,
      socialLinks: flat.socialLinks || [],
      sponsorsPartners: flat.sponsorsPartners || [],
    },
  };
};

/**
 * Transform flat API response to nested HackathonDraft structure
 */
const transformDraftResponse = (
  flatData: FlatHackathonData | HackathonDraft
): HackathonDraft => {
  const hackathon = transformHackathonResponse(flatData);
  return {
    ...hackathon,
    status: 'draft' as const,
  };
};

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

  // Transform flat response to nested structure
  const transformedData = transformDraftResponse(res.data.data);

  return {
    ...res.data,
    data: transformedData,
  };
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

  // Transform flat response to nested structure
  const transformedData = transformDraftResponse(res.data.data);

  return {
    ...res.data,
    data: transformedData,
  };
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

  // Transform flat response to nested structure
  const transformedData = transformDraftResponse(res.data.data);

  return {
    ...res.data,
    data: transformedData,
  };
};

/**
 * Preview a hackathon draft (returns data in published hackathon format)
 */
export const previewDraft = async (
  organizationId: string,
  draftId: string
): Promise<PreviewDraftResponse> => {
  const res = await api.get(
    `/organizations/${organizationId}/hackathons/drafts/${draftId}/preview`
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

  // Transform flat responses to nested structure
  const transformedData = Array.isArray(res.data.data)
    ? res.data.data.map((item: FlatHackathonData | HackathonDraft) =>
        transformDraftResponse(item)
      )
    : [];

  return {
    ...res.data,
    data: transformedData,
  };
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

  // Transform flat response to nested structure
  const transformedData = transformHackathonResponse(res.data.data);

  return {
    ...res.data,
    data: transformedData,
  };
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

  // Transform flat response to nested structure
  const transformedData = transformHackathonResponse(res.data.data);

  return {
    ...res.data,
    data: transformedData,
  };
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

  // Transform flat response to nested structure
  const transformedData = transformHackathonResponse(res.data.data);

  return {
    ...res.data,
    data: transformedData,
  };
};

/**
 * Delete a hackathon
 */
export const deleteHackathon = async (
  organizationId: string,
  hackathonId: string
): Promise<DeleteHackathonResponse> => {
  const res = await api.delete(
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

  // Transform flat responses to nested structure
  const transformedData = Array.isArray(res.data.data)
    ? res.data.data.map((item: FlatHackathonData | Hackathon) =>
        transformHackathonResponse(item)
      )
    : [];

  return {
    ...res.data,
    data: transformedData,
  };
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
 * Shortlist a submission for judging
 */
export const shortlistSubmission = async (
  organizationId: string,
  hackathonId: string,
  participantId: string
): Promise<ApiResponse<Participant>> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/participants/${participantId}/shortlist`
  );
  return res.data;
};

/**
 * Disqualify a submission with optional comment
 */
export const disqualifySubmission = async (
  organizationId: string,
  hackathonId: string,
  participantId: string,
  comment?: string
): Promise<ApiResponse<Participant>> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/participants/${participantId}/disqualify`,
    comment ? { comment } : {}
  );
  return res.data;
};

/**
 * Get shortlisted submissions for judging
 */
export const getJudgingSubmissions = async (
  organizationId: string,
  hackathonId: string,
  page = 1,
  limit = 10
): Promise<GetJudgingSubmissionsResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const res = await api.get(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/submissions?${params.toString()}`
  );
  return res.data;
};

/**
 * Submit or update grade for a shortlisted submission
 */
export const submitGrade = async (
  organizationId: string,
  hackathonId: string,
  participantId: string,
  data: GradeSubmissionRequest
): Promise<SubmitGradeResponse> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/submissions/${participantId}/grade`,
    data
  );
  return res.data;
};

/**
 * Get all scores for a specific submission
 */
export const getSubmissionScores = async (
  organizationId: string,
  hackathonId: string,
  participantId: string
): Promise<GetSubmissionScoresResponse> => {
  const res = await api.get(
    `/organizations/${organizationId}/hackathons/${hackathonId}/judging/submissions/${participantId}/scores`
  );
  return res.data;
};

/**
 * Assign ranks to submissions
 */
export const assignRanks = async (
  organizationId: string,
  hackathonId: string,
  data: AssignRanksRequest
): Promise<AssignRanksResponse> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/rewards/ranks`,
    data
  );
  return res.data;
};

/**
 * Get hackathon escrow details
 */
export const getHackathonEscrow = async (
  organizationId: string,
  hackathonId: string
): Promise<GetHackathonEscrowResponse> => {
  const res = await api.get(
    `/organizations/${organizationId}/hackathons/${hackathonId}/escrow`
  );
  return res.data;
};

/**
 * Create winner milestones in escrow
 */
export const createWinnerMilestones = async (
  organizationId: string,
  hackathonId: string,
  data: CreateWinnerMilestonesRequest
): Promise<CreateWinnerMilestonesResponse> => {
  const res = await api.post(
    `/organizations/${organizationId}/hackathons/${hackathonId}/rewards/milestones`,
    data
  );
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
    status?: 'submitted' | 'not_submitted';
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

  const res = await api.get(
    `/organizations/${organizationId}/hackathons/${hackathonId}/participants?${params.toString()}`
  );

  // Handle nested data structure: { success: true, data: { data: [...], pagination: {...} } }
  const responseData = res.data;

  // If data is nested, extract it
  if (
    responseData &&
    typeof responseData === 'object' &&
    'data' in responseData
  ) {
    const nestedData = responseData.data as {
      data?: Participant[];
      pagination?: GetParticipantsResponse['pagination'];
    };

    // Check if it's the nested structure
    if (
      nestedData &&
      typeof nestedData === 'object' &&
      'data' in nestedData &&
      Array.isArray(nestedData.data)
    ) {
      return {
        success: true,
        data: nestedData.data,
        pagination: nestedData.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: nestedData.data.length,
          itemsPerPage: limit,
          hasNext: false,
          hasPrev: false,
        },
        message: responseData.message || 'Participants fetched successfully',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // If data is already an array (expected structure)
  if (Array.isArray(responseData.data)) {
    return {
      success: true,
      data: responseData.data,
      pagination: responseData.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItems: responseData.data.length,
        itemsPerPage: limit,
        hasNext: false,
        hasPrev: false,
      },
      message: responseData.message || 'Participants fetched successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // Fallback: return empty array
  return {
    success: true,
    data: [],
    pagination: {
      currentPage: page,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: limit,
      hasNext: false,
      hasPrev: false,
    },
    message: 'No participants found',
    timestamp: new Date().toISOString(),
  };
};

/**
 * Register for a hackathon
 * Supports both slug-based (public) and organization/hackathon ID (authenticated) endpoints
 */
export const registerForHackathon = async (
  hackathonSlugOrId: string,
  data: RegisterForHackathonRequest,
  organizationId?: string
): Promise<RegisterForHackathonResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/register`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `/hackathons/${hackathonSlugOrId}/register`;
  }

  const res = await api.post(url, data);
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
 * Create a submission for a hackathon
 * Supports both slug-based (public) and organization/hackathon ID (authenticated) endpoints
 */
export const createSubmission = async (
  hackathonSlugOrId: string,
  data: CreateSubmissionRequest,
  organizationId?: string
): Promise<CreateSubmissionResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/submissions`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `/hackathons/${hackathonSlugOrId}/submissions`;
  }

  const res = await api.post(url, data);
  return res.data;
};

/**
 * Update a submission for a hackathon
 */
export const updateSubmission = async (
  hackathonSlugOrId: string,
  submissionId: string,
  data: Omit<CreateSubmissionRequest, 'projectName'>,
  organizationId?: string
): Promise<UpdateSubmissionResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/submissions/${submissionId}`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `/hackathons/${hackathonSlugOrId}/submissions/${submissionId}`;
  }

  const res = await api.put(url, data);
  return res.data;
};

/**
 * Get current user's submission for a hackathon
 * Returns submission if exists, null otherwise
 */
export const getMySubmission = async (
  hackathonSlugOrId: string,
  organizationId?: string
): Promise<GetMySubmissionResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/submissions/me`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `/hackathons/${hackathonSlugOrId}/submissions/me`;
  }

  const res = await api.get(url);
  return res.data;
};

/**
 * Get submission details by ID
 * Returns full submission with votes and comments
 */
export const getSubmissionDetails = async (
  hackathonSlugOrId: string,
  submissionId: string,
  organizationId?: string
): Promise<GetSubmissionDetailsResponse> => {
  let url: string;

  // If organizationId is provided, use authenticated endpoint
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/submissions/${submissionId}`;
  } else {
    // Otherwise, use public slug-based endpoint
    url = `/hackathons/${hackathonSlugOrId}/submissions/${submissionId}`;
  }

  const res = await api.get(url);
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

/**
 * Get public list of hackathons (no authentication required)
 * This endpoint provides server-side filtering, sorting, and pagination
 */
export const getPublicHackathonsList = async (
  filters: PublicHackathonsListFilters = {}
): Promise<PublicHackathonsListResponse> => {
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

  // Use skipAuthRefresh to ensure no auth token is sent for public endpoint
  const config: RequestConfig = { headers: { 'skip-auth-refresh': 'true' } };
  const res = await api.get<PublicHackathonsListResponse>(url, config);

  return res.data;
};

/**
 * Transform PublicHackathon API response to Hackathon type structure
 * This allows the public API response to be used with existing components
 */
export const transformPublicHackathonToHackathon = (
  publicHackathon: PublicHackathon,
  organizationName?: string
): Hackathon & { _organizationName?: string; featured?: boolean } => {
  // Parse totalPrizePool string to number (format: "50,000.00")
  const prizePoolAmount =
    parseFloat(publicHackathon.totalPrizePool.replace(/,/g, '')) || 0;

  // Extract venue from API response or default to virtual
  const venue: HackathonVenue | undefined = publicHackathon.venue
    ? {
        type:
          publicHackathon.venue.type === 'physical'
            ? VenueType.PHYSICAL
            : VenueType.VIRTUAL,
        country: publicHackathon.venue.country,
        state: publicHackathon.venue.state,
        city: publicHackathon.venue.city,
        venueName: publicHackathon.venue.venueName,
        venueAddress: publicHackathon.venue.venueAddress,
      }
    : undefined;

  // Map API status to internal status
  // API uses: upcoming, ongoing, ended
  // Internal uses: published, ongoing, completed, cancelled
  let internalStatus: Hackathon['status'] = 'published';
  if (publicHackathon.status === 'ongoing') {
    internalStatus = 'ongoing';
  } else if (publicHackathon.status === 'ended') {
    internalStatus = 'completed';
  }

  // Map all categories from API response
  const categoriesArray: HackathonCategory[] = publicHackathon.categories
    ? publicHackathon.categories
        .map(cat => {
          // Check if the category string matches any HackathonCategory enum value
          const matchedCategory = Object.values(HackathonCategory).find(
            enumCat => enumCat === cat
          );
          return matchedCategory || null;
        })
        .filter((cat): cat is HackathonCategory => cat !== null)
    : [];

  // Ensure at least one category
  const categories: HackathonCategory[] =
    categoriesArray.length > 0 ? categoriesArray : [HackathonCategory.OTHER];

  // Extract resources (telegram, discord, etc.) from resources array
  const telegram = publicHackathon.resources?.find(
    r => r.includes('t.me') || r.includes('telegram')
  );
  const discord = publicHackathon.resources?.find(r => r.includes('discord'));

  return {
    _id: publicHackathon.id,
    organizationId: '', // Not provided by public API
    status: internalStatus,
    createdAt: publicHackathon.startDate, // Use startDate as fallback
    updatedAt: publicHackathon.endDate, // Use endDate as fallback
    publishedAt: publicHackathon.startDate, // Use startDate as fallback
    title: publicHackathon.title,
    contractId: undefined,
    escrowAddress: undefined,
    transactionHash: undefined,
    escrowDetails: undefined,
    information: {
      title: publicHackathon.title,
      banner: publicHackathon.imageUrl,
      description: publicHackathon.description,
      categories: categories,
      slug: publicHackathon.slug,
      tagline: publicHackathon.tagline,
      venue,
    },
    timeline: {
      startDate: publicHackathon.startDate,
      submissionDeadline: publicHackathon.deadline,
      judgingDate: publicHackathon.deadline, // Use deadline as fallback
      winnerAnnouncementDate: publicHackathon.endDate,
      timezone: 'UTC', // Default timezone
      phases: [],
    },
    participation: {
      participantType: publicHackathon.participantType
        ? publicHackathon.participantType === 'individual'
          ? ParticipantType.INDIVIDUAL
          : publicHackathon.participantType === 'team'
            ? ParticipantType.TEAM
            : ParticipantType.TEAM_OR_INDIVIDUAL
        : undefined,
      teamMin: undefined,
      teamMax: undefined,
      about: publicHackathon.subtitle,
      submissionRequirements: undefined,
      tabVisibility: undefined,
    },
    rewards: {
      prizeTiers:
        prizePoolAmount > 0
          ? [
              {
                position: '1',
                amount: prizePoolAmount,
                currency: 'USDC', // Default currency
                description: 'Total Prize Pool',
              },
            ]
          : [],
    },
    judging: {
      criteria: [],
    },
    collaboration: {
      contactEmail: '',
      telegram,
      discord,
      socialLinks: publicHackathon.resources || [],
      sponsorsPartners: [],
    },
    _organizationName: organizationName || publicHackathon.organizer,
    featured: publicHackathon.featured,
    participants: publicHackathon.participants, // Add participants count for card display
  } as Hackathon & {
    _organizationName?: string;
    featured?: boolean;
    participants?: number;
  };
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

// ============================================
// Discussions API Types and Functions
// ============================================

export interface CreateDiscussionRequest {
  content: string;
  parentCommentId?: string;
}

export interface UpdateDiscussionRequest {
  content: string;
}

export interface ReportDiscussionRequest {
  reason: 'spam' | 'inappropriate' | 'harassment' | 'misinformation' | 'other';
  description?: string;
}

export interface GetHackathonDiscussionsResponse
  extends PaginatedResponse<Discussion> {
  success: true;
  data: Discussion[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message: string;
}

export interface CreateDiscussionResponse extends ApiResponse<Discussion> {
  success: true;
  data: Discussion;
  message: string;
}

export interface UpdateDiscussionResponse extends ApiResponse<Discussion> {
  success: true;
  data: Discussion;
  message: string;
}

export interface DeleteDiscussionResponse extends ApiResponse<null> {
  success: true;
  data: null;
  message: string;
}

export interface ReplyToDiscussionResponse extends ApiResponse<Discussion> {
  success: true;
  data: Discussion;
  message: string;
}

export interface ReportDiscussionResponse extends ApiResponse<null> {
  success: true;
  data: null;
  message: string;
}

/**
 * Get discussions for a hackathon
 */
export const getHackathonDiscussions = async (
  hackathonSlugOrId: string,
  options?: {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'totalReactions';
    sortOrder?: 'asc' | 'desc';
    organizationId?: string;
  }
): Promise<GetHackathonDiscussionsResponse> => {
  const params = new URLSearchParams();

  if (options?.page) {
    params.append('page', options.page.toString());
  }
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }
  if (options?.sortBy) {
    params.append('sortBy', options.sortBy);
  }
  if (options?.sortOrder) {
    params.append('sortOrder', options.sortOrder);
  }

  let url: string;
  if (options?.organizationId) {
    url = `/organizations/${options.organizationId}/hackathons/${hackathonSlugOrId}/discussions?${params.toString()}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/discussions?${params.toString()}`;
  }

  const res = await api.get(url);
  return res.data;
};

/**
 * Create a new discussion/comment
 */
export const createDiscussion = async (
  hackathonSlugOrId: string,
  data: CreateDiscussionRequest,
  organizationId?: string
): Promise<CreateDiscussionResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/discussions`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/discussions`;
  }

  const res = await api.post(url, data);
  return res.data;
};

/**
 * Update a discussion/comment
 */
export const updateDiscussion = async (
  hackathonSlugOrId: string,
  discussionId: string,
  data: UpdateDiscussionRequest,
  organizationId?: string
): Promise<UpdateDiscussionResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/discussions/${discussionId}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/discussions/${discussionId}`;
  }

  const res = await api.put(url, data);
  return res.data;
};

/**
 * Delete a discussion/comment
 */
export const deleteDiscussion = async (
  hackathonSlugOrId: string,
  discussionId: string,
  organizationId?: string
): Promise<DeleteDiscussionResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/discussions/${discussionId}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/discussions/${discussionId}`;
  }

  const res = await api.delete(url);
  return res.data;
};

/**
 * Reply to a discussion/comment
 */
export const replyToDiscussion = async (
  hackathonSlugOrId: string,
  parentCommentId: string,
  data: CreateDiscussionRequest,
  organizationId?: string
): Promise<ReplyToDiscussionResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/discussions/${parentCommentId}/replies`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/discussions/${parentCommentId}/replies`;
  }

  const res = await api.post(url, data);
  return res.data;
};

/**
 * Report a discussion/comment
 */
export const reportDiscussion = async (
  hackathonSlugOrId: string,
  discussionId: string,
  data: ReportDiscussionRequest,
  organizationId?: string
): Promise<ReportDiscussionResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/discussions/${discussionId}/report`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/discussions/${discussionId}/report`;
  }

  const res = await api.post(url, data);
  return res.data;
};

// ============================================
// Resources API Types and Functions
// ============================================

export interface HackathonResource {
  _id: string;
  title: string;
  type: 'pdf' | 'doc' | 'sheet' | 'slide' | 'link' | 'video';
  url: string;
  size?: string;
  description?: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetHackathonResourcesResponse
  extends ApiResponse<HackathonResource[]> {
  success: true;
  data: HackathonResource[];
  message: string;
}

/**
 * Get resources for a hackathon
 */
export const getHackathonResources = async (
  hackathonSlugOrId: string,
  organizationId?: string
): Promise<GetHackathonResourcesResponse> => {
  let url: string;
  if (organizationId) {
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/resources`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/resources`;
  }

  const res = await api.get(url);
  return res.data;
};

// ============================================
// Team Formation API Types and Functions
// ============================================

export interface TeamRecruitmentPost {
  _id: string;
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
  status: 'active' | 'filled' | 'closed';
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
  status?: 'active' | 'filled' | 'closed';
}

export interface GetTeamPostsOptions {
  page?: number;
  limit?: number;
  role?: string;
  skill?: string;
  status?: 'active' | 'filled' | 'closed' | 'all';
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetTeamPostsResponse
  extends PaginatedResponse<TeamRecruitmentPost> {
  success: true;
  data: TeamRecruitmentPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message: string;
}

export interface GetTeamPostDetailsResponse
  extends ApiResponse<TeamRecruitmentPost> {
  success: true;
  data: TeamRecruitmentPost;
  message: string;
}

export interface CreateTeamPostResponse
  extends ApiResponse<TeamRecruitmentPost> {
  success: true;
  data: TeamRecruitmentPost;
  message: string;
}

export interface UpdateTeamPostResponse
  extends ApiResponse<TeamRecruitmentPost> {
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
