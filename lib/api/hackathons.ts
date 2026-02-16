import api from './api';
import { ApiResponse, ErrorResponse, PaginatedResponse } from './types';
// Discussion type removed - using generic Comment type from @/types/comment

export type RegistrationDeadlinePolicy =
  | 'custom'
  | 'before_start'
  | 'before_submission_deadline';

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

export enum SubmissionVisibility {
  PUBLIC = 'PUBLIC',
  PARTICIPANTS_ONLY = 'PARTICIPANTS_ONLY',
}

export enum SubmissionStatusVisibility {
  ALL = 'ALL',
  ACCEPTED_SHORTLISTED = 'ACCEPTED_SHORTLISTED',
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
  name: string;
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
  judgingStart: string; // ISO 8601 date
  endDate: string; // ISO 8601 date
  judgingEnd?: string; // ISO 8601 date
  winnersAnnouncedAt?: string; // ISO 8601 date
  // Legacy fields for backward compatibility
  judgingDate?: string; // ISO 8601 date
  winnerAnnouncementDate?: string; // ISO 8601 date
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
  registrationDeadlinePolicy?: RegistrationDeadlinePolicy;
  registrationDeadline?: string;
  submissionRequirements?: SubmissionRequirements;
  tabVisibility?: TabVisibility;
}

// Rewards Tab Types
export interface PrizeTier {
  id?: string;
  place?: string; // Changed from position to place
  currency?: string;
  passMark?: number; // 0-100
  description?: string;
  prizeAmount?: string; // Changed from number to string to match API
}

export interface HackathonRewards {
  prizeTiers: PrizeTier[];
}

// Judging Tab Types
export interface JudgingCriterion {
  id?: string;
  name?: string;
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

// Resources Tab Types
export interface HackathonResourceItem {
  link?: string;
  description?: string;
  file?: {
    url: string;
    name: string;
  };
  fileName?: string;
}

export interface HackathonResources {
  resources: HackathonResourceItem[];
}

export type SubmissionStatus =
  | 'SUBMITTED'
  | 'SHORTLISTED'
  | 'DISQUALIFIED'
  | 'WITHDRAWN';

export interface HackathonSubmission {
  id: string;
  hackathonId: string;
  organizationId: string;

  projectId: string;
  projectName: string;
  project?: {
    id: string;
    title: string;
    banner: string | null;
    logo: string | null;
  };

  category: string | null;
  description: string;
  introduction: string;

  logo: string | null;
  videoUrl: string | null;

  participationType: ParticipantType;
  teamId: string | null;
  teamName: string | null;
  teamMembers: unknown[];

  participantId: string;
  participant: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };

  status: SubmissionStatus;
  disqualificationReason: string | null;
  rank: number | null;
  comments: number;

  links: Array<{
    label: string;
    url: string;
  }>;

  socialLinks: Record<string, string>;

  submittedAt: string;
  submissionDate: string;
  registeredAt: string;
  reviewedById: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ReviewSubmissionRequest {
  status: 'SHORTLISTED' | 'SUBMITTED';
  notes?: string;
  rank?: number;
}

export interface ReviewSubmissionResponse {
  message: string;
  submission: HackathonSubmission;
}

export interface DisqualifySubmissionRequest {
  disqualificationReason: string;
}

export interface DisqualifySubmissionResponse {
  message: string;
  submission: HackathonSubmission;
}

export interface BulkActionRequest {
  submissionIds: string[];
  action: 'SHORTLISTED' | 'SUBMITTED' | 'DISQUALIFIED';
  reason?: string;
}

export interface BulkActionResponse {
  message: string;
  count: number;
  action: string;
}

export interface UpdateRankRequest {
  rank: number;
}

export interface UpdateRankResponse {
  message: string;
  submission: HackathonSubmission;
}

// Draft Data Structure
export interface HackathonDraftData {
  information?: HackathonInformation;
  timeline?: HackathonTimeline;
  participation?: HackathonParticipation;
  rewards?: HackathonRewards;
  resources?: HackathonResources;
  judging?: HackathonJudging;
  collaboration?: HackathonCollaboration;
}

// Draft Types
export interface HackathonDraft {
  id: string;
  status: 'draft';
  currentStep: number;
  completedSteps: string[];
  data: HackathonDraftData;
  isValidForPublish: boolean;
  validationErrors: Record<string, Array<{ field: string; message: string }>>;
  createdAt: string;
  updatedAt: string;
}

// export interface Participant {
//   id: string;
//   name: string;
//   username: string;
//   image: string;
// }

// Published Hackathon Types
export type Hackathon = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;

  banner: string;

  organizationId: string;
  organization: {
    id: string;
    name: string;
    logo: string;
  };

  status:
    | 'DRAFT'
    | 'PUBLISHED'
    | 'ARCHIVED'
    | 'ONGOING'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'UPCOMING'
    | 'ENDED';
  isActive: boolean;
  isParticipant: boolean;

  venueType: 'VIRTUAL' | 'PHYSICAL';
  venueName: string;
  venueAddress: string;
  city: string;
  state: string;
  country: string;
  timezone: string;

  startDate: string; // ISO date
  endDate: string; // ISO date
  submissionDeadline: string; // ISO date
  registrationDeadline: string; // ISO date
  customRegistrationDeadline: string | null;

  registrationOpen: boolean;
  registrationDeadlinePolicy:
    | 'BEFORE_START'
    | 'BEFORE_SUBMISSION_DEADLINE'
    | 'CUSTOM';

  daysUntilStart: number;
  daysUntilEnd: number;

  participantType: 'INDIVIDUAL' | 'TEAM' | 'TEAM_OR_INDIVIDUAL';
  teamMin: number;
  teamMax: number;

  categories: string[];

  enabledTabs: Array<
    | 'detailsTab'
    | 'participantsTab'
    | 'resourcesTab'
    | 'submissionTab'
    | 'announcementsTab'
    | 'discussionTab'
    | 'winnersTab'
    | 'sponsorsTab'
    | 'joinATeamTab'
    | 'rulesTab'
  >;

  judgingCriteria: Array<{
    id?: string;
    name?: string;
    description?: string;
    weight?: number;
  }>;

  prizeTiers: Array<{
    id?: string;
    place?: string;
    prizeAmount?: string;
    currency?: string;
    description?: string;
    passMark?: number;
  }>;

  phases: Array<{
    id?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
  }>;

  resources: Array<{
    id: string;
    file: {
      url: string;
      name: string;
    };
    link: string;
    description: string;
  }>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sponsorsPartners: any[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submissions: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  followers: any[];

  requireGithub: boolean;
  requireDemoVideo: boolean;
  requireOtherLinks: boolean;

  contactEmail: string;
  discord: string;
  telegram: string;
  socialLinks: string[];

  submissionVisibility?: SubmissionVisibility;
  submissionStatusVisibility?: SubmissionStatusVisibility;

  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];

  _count: {
    participants: number;
    submissions: number;
    followers: number;
  };

  contractId?: string;
  escrowAddress?: string;
  transactionHash?: string | null;
  message?: string;
  escrowDetails?: object;
};

// Request Types
export type CreateDraftRequest = Partial<HackathonDraftData>;

export type UpdateDraftRequest = Partial<HackathonDraftData>;

export interface PublishHackathonRequest extends Hackathon {
  draftId?: string;
  contractId?: string;
  escrowAddress?: string;
  transactionHash?: string;
  escrowDetails?: object;
}

export type UpdateHackathonRequest = Partial<Hackathon>;

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

// Statistics and Analytics Types
export interface HackathonAnalyticsSummary {
  participantsCount: number;
  submissionsCount: number;
  activeJudges: number;
  completedMilestones: number;
}

export interface AnalyticsTrendPoint {
  date: string;
  count: number;
}

export interface HackathonAnalyticsTrends {
  submissionsOverTime: AnalyticsTrendPoint[];
  participantSignupsOverTime: AnalyticsTrendPoint[];
}

export interface TimelineEvent {
  phase: string;
  description: string;
  date: string;
  status: 'completed' | 'ongoing' | 'upcoming';
}

export interface GetHackathonAnalyticsResponse extends ApiResponse<{
  hackathonId: string;
  summary: HackathonAnalyticsSummary;
  trends: HackathonAnalyticsTrends;
  timeline: TimelineEvent[];
}> {
  success: true;
  data: {
    hackathonId: string;
    summary: HackathonAnalyticsSummary;
    trends: HackathonAnalyticsTrends;
    timeline: TimelineEvent[];
  };
}

// Deprecated or legacy statistics types (keeping if still used elsewhere, otherwise replacing if identical)
// Checking usage, it seems these might be used by existing hooks.
// Given the request asks for a specific response structure, I will add the new ones.

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

// Participant Types
export interface ParticipantTeamMember {
  userId: string;
  name: string;
  username: string;
  role: string;
  avatar?: string;
}

export interface ParticipantVote {
  id: string;
  userId: string;
  user: {
    id: string;
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
  id: string;
  userId: string;
  user: {
    id: string;
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
  id: string;
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
    id: string;
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

export interface ExploreSubmissionsResponse {
  id: string;
  hackathonId: string;
  projectId: string;
  participantId: string;
  organizationId: string;
  participationType: 'INDIVIDUAL' | 'TEAM' | 'TEAM_OR_INDIVIDUAL';
  teamId?: string;
  teamName?: string;
  teamMembers?: Array<{
    userId: string;
    name: string;
    username: string;
    role: string;
    avatar?: string;
  }>;
  projectName: string;
  category: string;
  description: string;
  logo?: string;
  videoUrl?: string;
  introduction?: string;
  links: Array<{
    type: string;
    url: string;
  }>;
  socialLinks: {
    github?: string;
    telegram?: string;
    twitter?: string;
    email?: string;
  };
  status: string;
  rank?: number;
  registeredAt: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  hackathonId: string;
  organizationId: string;
  user: {
    id: string;
    profile: {
      name: string;
      username: string;
      image?: string;
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

export interface ParticipantsData {
  participants: Participant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetParticipantsResponse extends ApiResponse<ParticipantsData> {
  success: true;
}

// export interface RegisterForHackathonRequest {
//   participationType: 'individual' | 'team';
//   teamName?: string;
//   teamMembers?: string[];
// }

export interface RegisterForHackathonResponse extends ApiResponse<Participant> {
  success: true;
  data: Participant;
  message: string;
}

export interface CheckRegistrationStatusResponse extends ApiResponse<Participant | null> {
  success: true;
  data: Participant | null;
  message: string;
}

export interface CreateSubmissionRequest {
  hackathonId: string;
  organizationId: string;
  projectId?: string;
  participationType: 'INDIVIDUAL' | 'TEAM';
  teamId?: string;
  teamName?: string;
  teamMembers?: Array<{
    userId?: string;
    email?: string;
    name: string;
    username?: string;
    role: string;
    avatar?: string;
  }>;
  projectName: string;
  category: string;
  description: string;
  logo?: string;
  videoUrl?: string;
  introduction?: string;
  links: Array<{ type: string; url: string }>;
  socialLinks?: {
    github?: string;
    telegram?: string;
    twitter?: string;
    email?: string;
  };
}

export interface UpdateSubmissionRequest extends CreateSubmissionRequest {
  submissionId: string;
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

export interface VoteSubmissionRequest {
  value: 1 | -1;
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

// Judging API Types
export interface CriterionScore {
  criterionTitle: string;
  score: number; // 0-100
}

export interface JudgeScore {
  id: string;
  judge: {
    id: string;
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
    id: string;
    userId: string;
    hackathonId: string;
    organizationId: string;
    user: {
      id: string;
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
    id: string;
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
    id: string;
    userId: string;
    hackathonId: string;
    organizationId: string;
    user: {
      id: string;
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
      id: string;
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
    id: string;
    projectName: string;
    category: string;
    status: 'shortlisted';
  };
  score: {
    id: string;
    weightedScore: number;
    scores: CriterionScore[];
    judgedBy: {
      id: string;
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

export interface GetJudgingSubmissionsResponse extends PaginatedResponse<JudgingSubmission> {
  success: true;
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

export interface GetSubmissionScoresResponse extends ApiResponse<SubmissionScoresResponse> {
  success: true;
  data: SubmissionScoresResponse;
  message: string;
}

export interface SubmitGradeResponse extends ApiResponse<GradeSubmissionResponse> {
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

export interface GetHackathonEscrowResponse extends ApiResponse<HackathonEscrowData> {
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
  status?: 'upcoming' | 'active' | 'ended';
  category?: string;
  search?: string;
  sort?: 'latest' | 'oldest' | 'participants' | 'prize' | 'deadline';
  featured?: boolean;
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
 * Initialize a new hackathon draft (new API)
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
 * Update a specific step in hackathon draft (new API)
 */
export const updateDraftStep = async (
  organizationId: string,
  draftId: string,
  step: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  autoSave?: boolean
) => {
  const res = await api.patch<UpdateDraftResponse>(
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
 * Publish a hackathon draft (new API)
 */
export const publishDraft = async (
  draftId: string,
  organizationId: string
): Promise<PublishHackathonResponse> => {
  const res = await api.put<ApiResponse<PublishHackathonResponse>>(
    `/organizations/${organizationId}/hackathons/draft/${draftId}/publish`
  );

  return res.data as unknown as PublishHackathonResponse;
};

/**
 * Get a single hackathon draft by ID
 */
export const getDraft = async (
  organizationId: string,
  draftId: string
): Promise<GetDraftResponse> => {
  const res = await api.get<GetDraftResponse>(
    `/organizations/${organizationId}/hackathons/draft/${draftId}`
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

  const res = await api.get<ApiResponse<GetDraftsResponse>>(
    `/organizations/${organizationId}/hackathons/drafts?${params.toString()}`
  );

  return res.data as GetDraftsResponse;
};

// Accpet invitation function (Legacy Token-based)
export const acceptTeamInvitationToken = async (
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

/**
 * Update hackathon submission visibility settings
 */
export const updateSubmissionVisibility = async (
  organizationId: string,
  hackathonId: string,
  data: {
    submissionVisibility: SubmissionVisibility;
    submissionStatusVisibility: SubmissionStatusVisibility;
  }
): Promise<ApiResponse<null>> => {
  const res = await api.patch(
    `/organizations/${organizationId}/hackathons/${hackathonId}/visibility`,
    data
  );
  return res.data;
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
 * Get a single hackathon by ID
 */
export const getHackathon = async (
  hackathonId: string
): Promise<GetHackathonResponse> => {
  const res = await api.get(`/hackathons/${hackathonId}`);
  return res.data;
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
    status: 'SHORTLISTED',
  });

  const res = await api.get(
    `/hackathons/${hackathonId}/submissions?${params.toString()}`
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

  const res = await api.get<ApiResponse<ParticipantsData>>(
    `/organizations/${organizationId}/hackathons/${hackathonId}/participants?${params.toString()}`
  );

  return res.data as GetParticipantsResponse;
};

/**
 * Get all submissions for a hackathon (organizer view)
 */
export const getHackathonSubmissions = async (
  hackathonId: string,
  page = 1,
  limit = 10,
  filters?: {
    status?: 'SUBMITTED' | 'SHORTLISTED' | 'DISQUALIFIED' | 'WITHDRAWN';
    type?: 'INDIVIDUAL' | 'TEAM';
    search?: string;
  }
): Promise<
  ApiResponse<{
    submissions: ParticipantSubmission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>
> => {
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
    `/hackathons/${hackathonId}/submissions?${params.toString()}`
  );

  return res.data;
};

/**
 * Explore hackathon submissions (Public showcase)
 */
export const getExploreSubmissions = async (
  hackathonId: string,
  page?: number,
  limit?: number
): Promise<ExploreSubmissionsResponse[]> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  const res = await api.get(
    `/hackathons/${hackathonId}/submissions/explore${params.toString() ? `?${params.toString()}` : ''}`
  );

  return res.data;
};

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

export interface DeleteSubmissionResponse extends ApiResponse<null> {
  success: true;
  data: null;
  message: string;
}

export const deleteSubmission = async (submissionId: string) => {
  const res = await api.delete(`/hackathons/submissions/${submissionId}`);
  return res.data as DeleteSubmissionResponse;
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
/**
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

/**
 * Review a submission (organizer only)
 * Update submission status to SHORTLISTED or move back to SUBMITTED
 */
export const reviewSubmission = async (
  organizationId: string,
  hackathonId: string,
  submissionId: string,
  data: ReviewSubmissionRequest
): Promise<ReviewSubmissionResponse> => {
  const url = `/organizations/${organizationId}/hackathons/${hackathonId}/submissions/${submissionId}/review`;
  const res = await api.patch(url, data);
  return res.data;
};

/**
 * Disqualify a submission (organizer only)
 * Mark a submission as disqualified with a reason
 */
export const disqualifyHackathonSubmission = async (
  organizationId: string,
  hackathonId: string,
  submissionId: string,
  data: DisqualifySubmissionRequest
): Promise<DisqualifySubmissionResponse> => {
  const url = `/organizations/${organizationId}/hackathons/${hackathonId}/submissions/${submissionId}/disqualify`;
  const res = await api.post(url, data);
  return res.data;
};

/**
 * Bulk action on submissions (organizer only)
 * Approve, Disqualify or Move to Submitted multiple submissions
 */
export const bulkActionSubmissions = async (
  organizationId: string,
  hackathonId: string,
  data: BulkActionRequest
): Promise<BulkActionResponse> => {
  const url = `/organizations/${organizationId}/hackathons/${hackathonId}/submissions/bulk-action`;
  const res = await api.post(url, data);
  return res.data;
};

/**
 * Update submission rank (organizer only)
 * Set numerical rank for leaderboard
 */
export const updateSubmissionRank = async (
  organizationId: string,
  hackathonId: string,
  submissionId: string,
  rank: number
): Promise<UpdateRankResponse> => {
  const url = `/organizations/${organizationId}/hackathons/${hackathonId}/submissions/${submissionId}/rank`;
  const res = await api.patch(url, { rank });
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

export const isHackathonDraft = (obj: unknown): obj is HackathonDraft => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'organizationId' in obj &&
    'status' in obj &&
    (obj as unknown as HackathonDraft).status === 'draft'
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
// ============================================
// Discussions API Types and Functions (DEPRECATED)
// ============================================
// These are deprecated. Use the generic comment system:
// - Import from @/lib/api/comment instead
// - Use CommentEntityType.HACKATHON for hackathon discussions
// - Use Comment type from @/types/comment
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

// @deprecated Use GetCommentsResponse from @/types/comment instead
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GetHackathonDiscussionsResponse extends PaginatedResponse<any> {
  success: true;
}

// @deprecated Use CreateCommentResponse from @/types/comment instead
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CreateDiscussionResponse extends ApiResponse<any> {
  success: true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  message: string;
}

// @deprecated Use UpdateCommentResponse from @/types/comment instead
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UpdateDiscussionResponse extends ApiResponse<any> {
  success: true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  message: string;
}

// @deprecated Use DeleteCommentResponse from @/types/comment instead
export interface DeleteDiscussionResponse extends ApiResponse<null> {
  success: true;
  data: null;
  message: string;
}

// @deprecated Use CreateCommentResponse from @/types/comment instead
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ReplyToDiscussionResponse extends ApiResponse<any> {
  success: true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  message: string;
}

// @deprecated Use ReportCommentResponse from @/types/comment instead
export interface ReportDiscussionResponse extends ApiResponse<null> {
  success: true;
  data: null;
  message: string;
}

/**
 * @deprecated Use getComments from @/lib/api/comment with CommentEntityType.HACKATHON instead
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

export interface HackathonResourceDocument {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'sheet' | 'slide' | 'link' | 'video';
  url: string;
  size?: string;
  description?: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetHackathonResourcesResponse extends ApiResponse<
  HackathonResourceDocument[]
> {
  success: true;
  data: HackathonResourceDocument[];
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

export interface UpdateTeamPostRequest {
  teamName?: string;
  description?: string;
  lookingFor?: string[];
  isOpen?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contactInfo?: any;
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

export interface GetTeamPostsResponse extends ApiResponse<{
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

// ============================================
// Team Invitation API Types and Functions
// ============================================

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface TeamInvitation {
  id: string;
  teamId: string;
  hackathon: Partial<Hackathon>;
  invitee: Partial<Participant>;
  inviter: Partial<Participant>;
  status: InvitationStatus;
  message: string;
  role: string;
  expiresAt: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface InviteUserToTeamRequest {
  inviteeIdentifier: string;
  message?: string;
}

export type GetInvitationsResponse =
  | {
      invitations: TeamInvitation[];
      total: number;
    }
  | (ApiResponse<{
      invitations: TeamInvitation[];
      total: number;
    }> & { invitations?: never });

export interface InvitationResponse extends ApiResponse<{
  message: string;
  teamId: string;
  invitation: TeamInvitation;
}> {
  success: true;
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
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/teams`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/teams`;
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
    url = `/organizations/${organizationId}/hackathons/${hackathonSlugOrId}/teams?${params.toString()}`;
  } else {
    url = `/hackathons/${hackathonSlugOrId}/teams?${params.toString()}`;
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

  const res = await api.patch(url, data);
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

    // Check if data is array (based on user feedback) or object
    if (Array.isArray(res.data.data)) {
      if (res.data.data.length > 0) {
        teamData = res.data.data[0] as TeamRecruitmentPost;
      }
    } else {
      teamData = res.data.data as TeamRecruitmentPost;
    }

    if (teamData) {
      // Ensure organizationId is present if missing
      if (!teamData.organizationId && organizationId) {
        teamData.organizationId = organizationId;
      }

      return {
        ...res.data,
        data: teamData,
      };
    }
  }

  return {
    ...res.data,
    data: null,
  };
};

/**
 * Invite a user to join a team
 */
export const inviteUserToTeam = async (
  hackathonId: string,
  teamId: string,
  data: InviteUserToTeamRequest
): Promise<ApiResponse<TeamInvitation>> => {
  const res = await api.post(
    `/hackathons/${hackathonId}/teams/${teamId}/invite`,
    data
  );
  return res.data;
};

/**
 * Get all team invitations received by the current user
 */
export const getMyTeamInvitations = async (
  hackathonId: string,
  status?: InvitationStatus
): Promise<GetInvitationsResponse> => {
  const params = new URLSearchParams();
  if (status) {
    params.append('status', status);
  }
  const queryString = params.toString();
  const url = `/hackathons/${hackathonId}/my-invitations${queryString ? `?${queryString}` : ''}`;
  const res = await api.get(url);
  return res.data;
};

/**
 * Accept a pending team invitation
 */
export const acceptTeamInvitation = async (
  hackathonId: string,
  inviteId: string
): Promise<InvitationResponse> => {
  const res = await api.post(
    `/hackathons/${hackathonId}/invitations/${inviteId}/accept`
  );
  return res.data;
};

/**
 * Reject a pending team invitation
 */
export const rejectTeamInvitation = async (
  hackathonId: string,
  inviteId: string
): Promise<InvitationResponse> => {
  const res = await api.post(
    `/hackathons/${hackathonId}/invitations/${inviteId}/reject`
  );
  return res.data;
};

/**
 * Cancel a pending invitation (Team leader only)
 */
export const cancelTeamInvitation = async (
  hackathonId: string,
  inviteId: string
): Promise<ApiResponse<null>> => {
  const res = await api.delete(
    `/hackathons/${hackathonId}/invitations/${inviteId}`
  );
  return res.data;
};

/**
 * Get all invitations sent by the team (Team leader only)
 */
export const getTeamInvitations = async (
  hackathonId: string,
  teamId: string,
  status?: InvitationStatus
): Promise<GetInvitationsResponse> => {
  const params = new URLSearchParams();
  if (status) {
    params.append('status', status);
  }
  const queryString = params.toString();
  const url = `/hackathons/${hackathonId}/teams/${teamId}/invitations${queryString ? `?${queryString}` : ''}`;
  const res = await api.get(url);
  return res.data;
};

// export const GetHackathonBySlug = async (slug): Promise<Hackathon> => {
//   const res = await api.get(`hackathons/s/${slug}`);
//   return
// }

export const GetHackathonBySlug = async (
  slug: string
): Promise<GetHackathonResponse> => {
  const res = await api.get(`/hackathons/s/${slug}`);

  return {
    success: true,
    data: res.data,
    message: 'Hackathon retrieved successfully',
    meta: {
      timestamp: new Date().toISOString(),
      requestId: '',
    },
  };
};

// Leave Team
export interface LeaveTeamResponse extends ApiResponse<{ message: string }> {
  success: true;
  data: {
    message: string;
  };
  message: string;
}

export const leaveHackathonTeam = async (
  hackathonId: string,
  teamId: string,
  organizationId?: string
): Promise<LeaveTeamResponse> => {
  const orgHeader = organizationId
    ? { 'x-organization-id': organizationId }
    : {};
  const res = await api.post(
    `/hackathons/${hackathonId}/teams/${teamId}/leave`,
    {},
    {
      headers: {
        ...orgHeader,
      },
    }
  );
  return res.data;
};

// ============================================
// Toggle Role Hired Status
// ============================================

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

export interface HackathonWinner {
  rank: number;
  projectName: string;
  projectId?: string;
  teamName: string | null;
  participants: Array<{
    userId?: string;
    username: string;
    avatar?: string;
  }>;
  prize: string;
  submissionId: string;
  slug?: string;
}

export interface GetHackathonWinnersResponse extends ApiResponse<{
  hackathonId: string;
  winners: HackathonWinner[];
}> {
  success: true;
}
