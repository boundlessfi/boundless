// Core Hackathon Types and Enums

export type RegistrationDeadlinePolicy =
  | 'custom'
  | 'before_start'
  | 'before_submission_deadline';

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

export interface HackathonVenue {
  type: VenueType;
  country?: string;
  state?: string;
  city?: string;
  venueName?: string;
  venueAddress?: string;
}

// Alias for backward compatibility with different type signature
export interface Venue {
  type: 'virtual' | 'physical';
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
  categories: HackathonCategory[];
  slug: string;
  venue?: HackathonVenue;
}

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

export interface PrizeTier {
  id?: string;
  place?: string;
  currency?: string;
  passMark?: number; // 0-100
  description?: string;
  prizeAmount?: string;
}

export interface HackathonRewards {
  prizeTiers: PrizeTier[];
}

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

export interface HackathonResourceDocument {
  id: string;
  file: {
    url: string;
    name: string;
  };
  link: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

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

  startDate: string;
  endDate: string;
  submissionDeadline: string;
  registrationDeadline: string;
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

  sponsorsPartners: any[];
  submissions: any[];
  followers: any[];
  participants: any[]; // Array of participant objects

  requireGithub: boolean;
  requireDemoVideo: boolean;
  requireOtherLinks: boolean;

  contactEmail: string;
  discord: string;
  telegram: string;
  socialLinks: string[];

  publishedAt: string;
  createdAt: string;
  updatedAt: string;

  _count: {
    participants: number;
    submissions: number;
    followers: number;
  };

  contractId?: string;
  escrowAddress?: string;
  transactionHash?: string;
  escrowDetails?: object;
};

export interface HackathonStatistics {
  participantsCount: number;
  submissionsCount: number;
  activeJudges: number;
  completedMilestones: number;
}

export interface TimeSeriesDataPoint {
  date: string;
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

// Request/Response Types
export interface PublishHackathonRequest extends Hackathon {
  draftId?: string;
  contractId?: string;
  escrowAddress?: string;
  transactionHash?: string;
  escrowDetails?: object;
}

export type UpdateHackathonRequest = Partial<Hackathon>;
