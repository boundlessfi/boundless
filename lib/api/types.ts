import { CrowdfundingProject, Crowdfunding } from '@/features/projects/types';

// Backend API Response Structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  meta: NonNullable<ApiResponse['meta']> & {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  statusCode?: number;
}

// User type
export interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginMethod?: string;
  role: string;
  banned: boolean;
  banReason?: string | null;
  banExpires?: string | null;
  username: string;
  displayUsername: string;
  metadata?: Record<string, unknown>;
  twoFactorEnabled: boolean;
  members?: Array<{
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    createdAt: string;
    organization: {
      id: string;
      name: string;
      slug: string;
      logo: string;
      createdAt: string;
      _count: {
        hackathons: number;
        members: number;
      };
    };
  }>;
  projects?: Array<{
    id: string;
    title: string;
    vision: string;
    category: string;
    status: string;
    banner?: string | null;
    logo?: string | null;
    createdAt: string;
  }>;
  activities?: Array<{
    id: string;
    type: string;
    userId: string;
    projectId?: string | null;
    organizationId?: string | null;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    project?: Record<string, unknown>;
  }>;
  userBadges?: unknown[];
  grantApplicationsAsApplicant?: unknown[];
  hackathonSubmissionsAsParticipant?: Array<{
    id: string;
    status: string;
    rank?: number | null;
    submittedAt: string;
  }>;
  profile?: Record<string, unknown>;
  stats?: {
    followers: number;
    following: number;
  };
}
export interface OrganizationLinks {
  website: string;
  x: string; // Twitter/X handle
  github: string;
  others: string;
}

/**
 * Organization Analytics Trend Data
 */
export interface OrganizationTrend {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  isPositive: boolean;
}

/**
 * Organization Analytics Time Series Data Point
 */
export interface OrganizationTimeSeriesPoint {
  month: string;
  year: number;
  count: number;
  timestamp: string;
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  slug?: string;
  tagline?: string;
  about?: string;
  metadata?: {
    tagline?: string;
    about?: string;
    links?: OrganizationLinks;
  };
  links?: OrganizationLinks;
  members?: string[]; // Array of user emails
  admins?: string[]; // Array of admin emails
  owner?: string; // Owner email or userId
  hackathons?: unknown[]; // Full hackathon objects instead of just IDs
  grants?: unknown[]; // Full grant objects instead of just IDs
  isProfileComplete: boolean;
  pendingInvites?: string[]; // Array of emails invited but not yet accepted
  betterAuthOrgId?: string; // Better Auth organization ID for organizations using Better Auth integration
  isArchived?: boolean;
  archivedBy?: string;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  analytics?: {
    trends: {
      members: OrganizationTrend;
      hackathons: OrganizationTrend;
      grants: OrganizationTrend;
    };
    timeSeries: {
      hackathons: OrganizationTimeSeriesPoint[];
    };
  };
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Register
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  invitation?: string;
}
export interface RegisterResponse {
  message: string;
}

// Login
export interface LoginRequest {
  email: string;
  password: string;
}
export type LoginResponse = AuthTokens;

// GitHub Auth
export interface GithubAuthRequest {
  code: string;
}
export type GithubAuthResponse = AuthTokens;

// Google Auth
export interface GoogleAuthRequest {
  token: string;
}
export type GoogleAuthResponse = AuthTokens;

// GetMe
export interface GetMeResponse {
  user: User;
  stats: {
    projectsCreated: number;
    projectsFunded: number;
    totalContributed: number;
    commentsPosted: number;
    votes: number;
    grants: number;
    hackathons: number;
    followers: number;
    following: number;
    reputation: number;
    communityScore: number;
  };
  chart: Array<{ date: string; count: number }>;
  activitiesGraph: Array<{ date: string; count: number }>;
  recentActivities: Array<{
    id: string;
    type: string;
    userId: string;
    projectId?: string | null;
    organizationId?: string | null;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    project?: Record<string, unknown>;
    organization?: Record<string, unknown>;
  }>;
}

// Logout
export interface LogoutResponse {
  message: string;
}

// Verify OTP
export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
}

// Resend OTP
export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UserOverview {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  badges: string[];
  kycVerified: boolean;
}

export interface DashboardStats {
  totalContributed: number;
  totalRaised: number;
  campaignsBacked: number;
  campaignsCreated: number;
  grantsApplied: number;
  grantsCreated: number;
  milestonesCompleted: number;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  link?: string;
}

export interface UserCampaign {
  id: string;
  title: string;
  status: string;
  fundingGoal: number;
  raisedAmount: number;
  backersCount: number;
  nextMilestoneDue: string | null;
  progressPercent: number;
}

export interface UserBackedProject {
  projectId: string;
  title: string;
  contributedAmount: number;
  currentStatus: string;
  nextUpdate: string | null;
  refundEligible: boolean;
}

export interface UserGrantApplication {
  grantId: string;
  grantTitle: string;
  status: string;
  submittedAt: string;
  nextAction?: string;
  escrowedAmount?: number;
  milestonesCompleted?: number;
}

export interface UserCreatedGrant {
  id: string;
  title: string;
  totalBudget: number;
  totalDisbursed: number;
  proposalsReceived: number;
  proposalsApproved: number;
  status: string;
}

export interface SuggestedAction {
  id: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  icon: string;
}

export interface PlatformMetrics {
  totalCampaigns: number;
  totalGrants: number;
  totalUsers: number;
  totalRaised: number;
  totalMilestonesVerified: number;
}

export interface DashboardOverviewResponse {
  user: UserOverview;
  stats: DashboardStats;
  notifications: Notification[];
  campaigns: UserCampaign[];
  backedProjects: UserBackedProject[];
  grantApplications: UserGrantApplication[];
  createdGrants: UserCreatedGrant[];
  suggestedActions: SuggestedAction[];
  platformMetrics: PlatformMetrics;
}

export interface MilestoneInit {
  title: string;
  description: string;
  deliveryDate: string; // YYYY-MM-DD
  fundPercentage: number; // 0-100
  amount: number; // derived: fundAmount * fundPercentage / 100
}

export interface ProjectInitRequest {
  title: string;
  description: string;
  tagline: string;
  type: 'crowdfund' | 'grant';
  category: string;
  amount: number;
  tags: string[];
  // Optional assets until upload integration is wired
  thumbnail?: string;
  whitepaperUrl?: string;
  // Milestones payload
  milestones: MilestoneInit[];
}

export interface ProjectInitResponse {
  message: string;
  data: {
    projectId: string;
  };
  [key: string]: unknown;
}

// Campaign Review and Launch Types
export interface CampaignDetails {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  amount: number;
  raisedAmount: number;
  tags: string[];
  thumbnail: string;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  engagement: {
    likes: number;
    comments: number;
    backers: number;
    daysLeft: number;
  };
  photos: string[];
  milestones: CampaignMilestone[];
  status: string;
}

export interface CampaignMilestone {
  id: string;
  title: string;
  description: string;
  deliveryDate: string;
  fundPercentage: number;
  fundAmount: number;
}

export interface LaunchCampaignRequest {
  projectId: string;
}

export interface LaunchCampaignResponse {
  success: boolean;
  message: string;
  data: {
    campaignId: string;
    shareLink: string;
  };
}

export interface ShareLinkResponse {
  success: boolean;
  data: {
    shareLink: string;
  };
}

// Crowdfunding Project Types
export interface CrowdfundingMilestone {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  amount: number;
}

export interface CrowdfundingTeamMember {
  name: string;
  role: string;
  email: string;
  linkedin?: string;
  twitter?: string;
}

export interface CrowdfundingContact {
  primary: string;
  backup: string;
}

export interface CrowdfundingSocialLink {
  platform: string;
  url: string;
}

export interface CreateCrowdfundingProjectRequest {
  title: string;
  logo: string;
  banner?: string;
  vision: string;
  category: string;
  details: string;
  fundingAmount: number;
  githubUrl?: string;
  gitlabUrl?: string;
  bitbucketUrl?: string;
  projectWebsite?: string;
  demoVideo?: string;
  milestones: Array<{
    title: string;
    description: string;
    deliverable: string;
    expectedDeliveryDate: string;
    fundingPercentage: number;
    orderIndex: number;
    amount: number;
  }>;
  team: Array<{
    name: string;
    role: string;
    email: string;
    linkedin?: string;
    twitter?: string;
  }>;
  contact: {
    primary: string;
    backup: string;
  };
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  escrowId: string;
  transactionHash: string;
}

// Step 1: Prepare Project Response
export interface PrepareCrowdfundingProjectResponse {
  success: boolean;
  message: string;
  data: {
    unsignedXdr: string; // Transaction to sign
    escrowAddress: string; // Generated escrow address
    network: string; // Network identifier
    projectData: object; // Prepared project data
    milestoneAmount: number; // Calculated milestone amount
    mappedMilestones: Array<object>; // Processed milestones
    teamInvitations: Array<object>; // Team invitations data
  };
}

// Step 2: Confirm Project Response
export interface ConfirmCrowdfundingProjectRequest {
  signedXdr: string; // Signed transaction from user's wallet
  escrowAddress: string; // From step 1 response
  projectData: object; // From step 1 response
  mappedMilestones: Array<object>; // From step 1 response
  teamInvitations: Array<object>; // Team invitations data
}

export interface ConfirmCrowdfundingProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: object; // Created project
    crowdfund: object; // Associated crowdfund record
  };
}

export interface Contributor {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  contributedAt: string;
  anonymous?: boolean;
}

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  twitter?: string;
  linkedin?: string;
}

export interface UserPreferences {
  theme: string;
  skills: string[];
  language: string;
  timezone: string;
  categories: string[];
  pushNotifications: boolean;
  emailNotifications: boolean;
}

export interface CreateCrowdfundingProjectResponse {
  id: string;
  projectId: string;
  fundingGoal: number;
  fundingRaised: number;
  fundingCurrency: string;
  fundingEndDate: string;
  contributors: Contributor[];
  team: TeamMember[];
  contact: {
    backup: string;
    primary: string;
  };
  socialLinks: Array<{
    url: string;
    platform: string;
  }>;
  milestones: Array<{
    name: string;
    amount: number;
    status: string;
    endDate: string;
    startDate: string;
    description: string;
  }>;
  stakeholders: null;
  trustlessWorkStatus: string;
  escrowAddress: string;
  escrowType: string;
  escrowDetails: null;
  creationTxHash: null;
  transactionHash: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    title: string;
    tagline: string | null;
    description: string;
    summary: string | null;
    vision: string | null;
    details: string | null;
    category: string;
    status: string;
    creatorId: string;
    organizationId: string | null;
    teamMembers: TeamMember[];
    banner: string | null;
    logo: string;
    thumbnail: string | null;
    githubUrl: string;
    gitlabUrl: string;
    bitbucketUrl: string;
    projectWebsite: string;
    demoVideo: string;
    whitepaperUrl: string | null;
    pitchVideoUrl: string | null;
    socialLinks: Record<string, string>;
    contact: {
      backup: string;
      primary: string;
    };
    whitepaper: string | null;
    pitchDeck: string | null;
    votes: number;
    voting: {
      isOpen: boolean;
      startDate?: string;
      endDate?: string;
      totalVotes: number;
      upvotes: number;
      downvotes: number;
    };
    tags: string[];
    approvedById: string | null;
    approvedAt: string | null;
    createdAt: string;
    updatedAt: string;
    creator: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image: string;
      createdAt: string;
      updatedAt: string;
      lastLoginMethod: string;
      role: string;
      banned: boolean;
      banReason: string | null;
      banExpires: string | null;
      username: string;
      displayUsername: string;
      metadata: {
        stats: Record<string, number | string>;
        privacy: Record<string, boolean>;
        profile: {
          stats: Record<string, number | string>;
          privacy: Record<string, boolean>;
          profile: {
            stats: Record<string, number | string>;
            privacy: Record<string, boolean>;
            profile: {
              stats: Record<string, number | string>;
              privacy: Record<string, boolean>;
              profile: {
                stats: Record<string, number | string>;
                privacy: Record<string, boolean>;
                profile: {
                  preferences: Record<string, unknown>;
                };
                preferences: {
                  theme: string;
                  skills: string[];
                  language: string;
                  timezone: string;
                  categories: string[];
                  pushNotifications: boolean;
                  emailNotifications: boolean;
                };
              };
              preferences: UserPreferences;
            };
            preferences: {
              theme: string;
              skills: string[];
              language: string;
              timezone: string;
              categories: string[];
              pushNotifications: boolean;
              emailNotifications: boolean;
            };
          };
          preferences: {
            theme: string;
            skills: string[];
            language: string;
            timezone: string;
            categories: string[];
            pushNotifications: boolean;
            emailNotifications: boolean;
          };
        };
        preferences: UserPreferences;
      };
      twoFactorEnabled: boolean;
    };
  };
}

export interface CrowdfundData {
  _id: string;
  projectId: string;
  thresholdVotes: number;
  voteDeadline: string;
  totalVotes: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  isVotingActive: boolean;
  voteProgress: number;
  id: string;
}

// Escrow Response Types
export interface EscrowResponse {
  status: string;
  unsignedTransaction: string;
}

// Stakeholders for trustless system
export interface Stakeholders {
  serviceProvider: string;
  approver: string;
  releaseSigner: string;
  disputeResolver: string;
  receiver: string;
  platformAddress: string;
}

// Grant system types
export interface GrantData {
  isGrant: boolean;
  totalBudget: number;
  totalDisbursed: number;
  proposalsReceived: number;
  proposalsApproved: number;
  status: string;
  applications: Array<object>;
}

export type CrowdfundingCampaign = Crowdfunding;

export interface GetCrowdfundingProjectsResponse {
  data: {
    campaigns: CrowdfundingCampaign[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GetCrowdfundingProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: CrowdfundingProject;
    crowdfund: CrowdfundData;
  };
}

export interface UpdateCrowdfundingProjectRequest {
  title?: string;
  logo?: string;
  vision?: string;
  category?: string;
  details?: string;
  fundingAmount?: number;
  githubUrl?: string;
  gitlabUrl?: string;
  bitbucketUrl?: string;
  projectWebsite?: string;
  demoVideo?: string;
  milestones?: CrowdfundingMilestone[];
  team?: CrowdfundingTeamMember[];
  contact?: CrowdfundingContact;
  socialLinks?: CrowdfundingSocialLink[];
}

export interface UpdateCrowdfundingProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: CrowdfundingProject;
  };
}

export interface DeleteCrowdfundingProjectResponse {
  success: boolean;
  message: string;
}

// Funding Types
export interface FundCrowdfundingProjectRequest {
  amount: number;
  transactionHash?: string;
  anonymous?: boolean;
  message?: string;
}

export interface FundCrowdfundingProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: CrowdfundingProject;
    funding: {
      amount: number;
      transactionHash: string;
      newTotalRaised: number;
      isFullyFunded: boolean;
      remainingGoal: number;
    };
  };
}

// Deprecated: Legacy funding types (kept for backward compatibility)
export interface PrepareFundingRequest {
  amount: number;
  signer: string;
}

export interface PrepareFundingResponse {
  success: boolean;
  message: string;
  data: {
    unsignedXdr: string;
    contractId: string;
    amount: number;
    projectId: string;
    projectTitle: string;
    currentRaised: number;
    fundingGoal: number;
    remainingGoal: number;
  };
}

export interface ConfirmFundingRequest {
  signedXdr: string;
  transactionHash: string;
  amount: number;
}

export interface ConfirmFundingResponse {
  success: boolean;
  message: string;
  data: {
    tx: object;
    project: CrowdfundingProject;
    funding: {
      amount: number;
      transactionHash: string;
      newTotalRaised: number;
      isFullyFunded: boolean;
      remainingGoal: number;
    };
  };
}

// Vote Types
export interface Vote {
  _id: string;
  userId: string;
  projectId: string;
  value: 1 | -1;
  voteType: 'upvote' | 'downvote';
  createdAt: string;
  updatedAt: string;
}

export interface VoteSummary {
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  netVotes: number;
}

export interface VoteRequest {
  value: 1 | -1;
}

export interface VoteResponse {
  success: boolean;
  data: {
    vote: Vote;
    projectVotes: VoteSummary;
    isNewVote: boolean;
  };
  message: string;
}

export interface GetProjectVotesRequest {
  page?: number;
  limit?: number;
  voteType?: 'upvote' | 'downvote';
}

export interface GetProjectVotesResponse {
  success: boolean;
  data: {
    votes: Vote[];
    voteSummary: VoteSummary;
    userVote: Vote | null;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface RemoveVoteResponse {
  success: boolean;
  data: {
    projectVotes: VoteSummary;
  };
  message: string;
}

// Alias for backward compatibility
// export type CrowdfundingCampaign = CreateCrowdfundingProjectResponse;
