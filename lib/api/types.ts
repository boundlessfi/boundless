import { Project } from '@/types/project';

// Backend API Response Structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
}

// User type
export interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
}

export interface User {
  _id: string;
  email: string;
  profile: UserProfile;
  isVerified: boolean;
  roles: string[];
  lastLogin?: string;
  [key: string]: unknown;
}
export interface OrganizationLinks {
  website: string;
  x: string; // Twitter/X handle
  github: string;
  others: string;
}

export interface Organization {
  _id: string;
  name: string;
  logo: string;
  tagline: string;
  about: string;
  links: OrganizationLinks;
  members: string[]; // Array of user emails
  owner: string; // Owner email or userId
  hackathons: string[]; // Array of hackathon IDs
  grants: string[]; // Array of grant IDs
  isProfileComplete: boolean;
  pendingInvites: string[]; // Array of emails invited but not yet accepted
  createdAt: string;
  updatedAt: string;
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
export type GetMeResponse = User & {
  organizations: Organization[];
  projects: Project[];
  following: User[];
  followers: User[];
  stats: {
    votes: number;
    grants: number;
    hackathons: number;
    donations: number;
    projectsCreated: number;
    projectsFunded: number;
    totalContributed: number;
    reputation: number;
    communityScore: number;
    commentsPosted: number;
    organizations: number;
    followers: number;
    following: number;
  };
  activities: unknown[];
  contributedProjects: unknown[];
};

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
  fundAmount: number; // derived: fundAmount * fundPercentage / 100
}

export interface ProjectInitRequest {
  title: string;
  description: string;
  tagline: string;
  type: 'crowdfund' | 'grant';
  category: string;
  fundAmount: number;
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
  fundAmount: number;
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
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
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
  vision: string;
  category: string;
  details: string;
  fundingAmount: number;
  githubUrl?: string;
  gitlabUrl?: string;
  bitbucketUrl?: string;
  projectWebsite?: string;
  demoVideo?: string;
  milestones: CrowdfundingMilestone[];
  team: CrowdfundingTeamMember[];
  contact: CrowdfundingContact;
  socialLinks?: CrowdfundingSocialLink[];
  // Blockchain transaction data (handled by frontend)
  contractId: string;
  escrowAddress: string;
  transactionHash: string;
  escrowDetails?: object; // Optional escrow details from frontend
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

// Legacy response type for backward compatibility
export interface CreateCrowdfundingProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: {
      _id: string;
      title: string;
      description: string;
      category: string;
      status: string;
      creator: {
        profile: {
          firstName: string;
          lastName: string;
          username: string;
        };
        _id: string;
      };
      owner: {
        type: string;
      };
      vision: string;
      githubUrl?: string;
      projectWebsite?: string;
      demoVideo?: string;
      socialLinks: Array<{
        platform: string;
        url: string;
        _id: string;
      }>;
      contact: {
        primary: string;
        backup: string;
      };
      funding: {
        goal: number;
        raised: number;
        currency: string;
        endDate: string;
        contributors: Array<object>;
      };
      voting: {
        startDate: string;
        endDate: string;
        totalVotes: number;
        positiveVotes: number;
        negativeVotes: number;
        voters: Array<object>;
      };
      milestones: Array<{
        title: string;
        description: string;
        amount: number;
        dueDate: string;
        status: string;
        _id: string;
      }>;
      team: Array<{
        userId: string;
        role: string;
        joinedAt: string;
        _id: string;
      }>;
      media: {
        banner: string;
        logo: string;
        thumbnail: string;
      };
      documents: {
        whitepaper: string;
        pitchDeck: string;
      };
      tags: Array<object>;
      grant: {
        isGrant: boolean;
        totalBudget: number;
        totalDisbursed: number;
        proposalsReceived: number;
        proposalsApproved: number;
        status: string;
        applications: Array<object>;
      };
      summary: string;
      type: string;
      votes: number;
      stakeholders: {
        serviceProvider: string;
        approver: string;
        releaseSigner: string;
        disputeResolver: string;
        receiver: string;
        platformAddress: string;
      };
      trustlessWorkStatus: string;
      escrowType: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    crowdfund: {
      projectId: string;
      thresholdVotes: number;
      voteDeadline: string;
      totalVotes: number;
      status: string;
      _id: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
      isVotingActive: boolean;
      voteProgress: number;
      id: string;
    };
    escrowResponse: {
      status: string;
      unsignedTransaction: string;
    };
  };
}

// Crowdfunding Project Response Types
export interface CrowdfundingProject {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  creator: {
    profile: {
      firstName: string;
      lastName: string;
      username: string;
    };
    _id: string;
  };
  owner: {
    type: string;
  };
  vision: string;
  githubUrl?: string;
  projectWebsite?: string;
  demoVideo?: string;
  socialLinks: Array<{
    platform: string;
    url: string;
    _id: string;
  }>;
  contact: {
    primary: string;
    backup: string;
  };
  funding: {
    goal: number;
    raised: number;
    currency: string;
    endDate: string;
    contributors: Array<object>;
  };
  voting: {
    startDate: string;
    endDate: string;
    totalVotes: number;
    positiveVotes: number;
    negativeVotes: number;
    voters: Array<object>;
  };
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
    _id: string;
  }>;
  team: Array<{
    profile: {
      firstName: string;
      lastName: string;
      username: string;
    };
    role: string;
    joinedAt: string;
    _id: string;
  }>;
  media: {
    banner: string;
    logo: string;
    thumbnail: string;
  };
  documents: {
    whitepaper: string;
    pitchDeck: string;
  };
  tags: Array<object>;
  grant: {
    isGrant: boolean;
    totalBudget: number;
    totalDisbursed: number;
    proposalsReceived: number;
    proposalsApproved: number;
    status: string;
    applications: Array<object>;
  };
  summary: string;
  type: string;
  votes: number;
  stakeholders: {
    serviceProvider: string;
    approver: string;
    releaseSigner: string;
    disputeResolver: string;
    receiver: string;
    platformAddress: string;
  };
  trustlessWorkStatus: string;
  escrowType: string;
  contractId?: string; // Escrow contract ID
  escrowAddress?: string; // Escrow address (same as contractId in Stellar)
  createdAt: string;
  updatedAt: string;
  __v: number;
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

export interface GetCrowdfundingProjectsResponse {
  success: boolean;
  message: string;
  data: {
    projects: CrowdfundingProject[];
    pagination: {
      current: number;
      pages: number;
      total: number;
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
  transactionHash: string; // Blockchain transaction hash from frontend after signing
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
