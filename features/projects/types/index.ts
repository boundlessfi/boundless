// ─── Project API Types (/api/projects/*) ────────────────────────────────────

/** Minimal creator shape returned in project responses. */
export interface ProjectCreator {
  id: string;
  name: string;
  email: string;
  username: string;
  image: string;
}

/** Shape of `_count` returned on project entities. */
export interface ProjectCounts {
  activities: number;
  crowdfundingCampaigns: number;
  grantApplications: number;
  hackathonSubmissions: number;
  bounties: number;
  comments: number;
  votes: number;
}

/** Campaign milestone for the draft payload. */
export interface DraftMilestone {
  title: string;
  description: string;
  deliverable: string;
  fundingPercentage: number;
  amount: number;
  expectedDeliveryDate: string; // ISO 8601
  successCriteria: string;
  orderIndex: number;
}

/** Team member inside a campaign draft. */
export interface DraftTeamMember {
  name: string;
  role: string;
  email: string;
  linkedin?: string;
  twitter?: string;
}

/** Object-form social links (project level, e.g. { twitter: "…", discord: "…" }). */
export type SocialLinksMap = Record<string, string>;

/** Array-form social links (campaign level, e.g. [{ platform, url }]). */
export interface SocialLinkEntry {
  platform: string;
  url: string;
}

/** Contact shape used in drafts and project entities. */
export interface ProjectContact {
  primary: string;
  backup: string;
}

/** The nested campaign payload inside `draftData`. */
export interface CampaignDraftPayload {
  title: string;
  logo?: string;
  banner?: string;
  vision?: string;
  category: string;
  details?: string;
  fundingAmount: number;
  githubUrl?: string;
  gitlabUrl?: string;
  bitbucketUrl?: string;
  projectWebsite?: string;
  demoVideo?: string;
  milestones: DraftMilestone[];
  team: DraftTeamMember[];
  contact: ProjectContact;
  socialLinks: SocialLinkEntry[];
}

/** `draftData` field on a project entity. */
export interface ProjectDraftData {
  isCampaign: boolean;
  campaign?: CampaignDraftPayload;
}

/**
 * Full payload for POST /api/projects/drafts and PATCH /api/projects/{id}/draft.
 * All fields are optional on PATCH (partial autosave).
 */
export interface ProjectDraftPayload {
  title?: string;
  tagline?: string;
  category?: string;
  description?: string;
  summary?: string;
  vision?: string;
  details?: string;
  banner?: string;
  logo?: string;
  githubUrl?: string;
  gitlabUrl?: string;
  bitbucketUrl?: string;
  projectWebsite?: string;
  demoVideo?: string;
  whitepaperUrl?: string;
  pitchVideoUrl?: string;
  socialLinks?: SocialLinksMap;
  contact?: ProjectContact;
  tags?: string[];
  draftData?: ProjectDraftData;
}

/**
 * The canonical project entity returned by the API.
 * Used for draft creation responses, `GET /api/projects/me`, etc.
 */
export interface Project {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  summary: string | null;
  vision: string | null;
  details: string | null;
  category: string;
  status: string; // e.g. "IDEA", "IN_REVIEW", "APPROVED"
  publicStatus: string; // e.g. "IN_DEVELOPMENT"
  creatorId: string;
  organizationId: string | null;
  slug: string;
  originType: string | null;
  originReferenceId: string | null;
  isFeatured: boolean;
  launchDate: string | null;
  liveUrl: string | null;
  docsUrl: string | null;
  screenshots: string[];
  techStack: string[];
  draftData: ProjectDraftData | null;
  teamMembers: DraftTeamMember[];
  banner: string | null;
  logo: string | null;
  thumbnail: string | null;
  githubUrl: string | null;
  gitlabUrl: string | null;
  bitbucketUrl: string | null;
  projectWebsite: string | null;
  demoVideo: string | null;
  whitepaperUrl: string | null;
  pitchVideoUrl: string | null;
  socialLinks: SocialLinksMap;
  contact: ProjectContact | null;
  whitepaper: string | null;
  pitchDeck: string | null;
  tags: string[];
  approvedById: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  creator: ProjectCreator;
  organization: unknown | null;
  _count: ProjectCounts;
  // Optionally present on some endpoints
  votes?: number;
}

/** Crowdfunding campaign embedded in a project detail response. */
export interface EmbeddedCrowdfundingCampaign {
  id: string;
  projectId: string;
  slug: string;
  fundingGoal: number;
  voteGoal: number;
  fundingRaised: number;
  fundingCurrency: string;
  fundingEndDate: string | null;
  contributors: Contributor[];
  team: TeamMember[];
  contact: Contact;
  socialLinks: SocialLink[];
  stakeholders: unknown | null;
  trustlessWorkStatus: string;
  escrowAddress: string;
  escrowType: string;
  escrowDetails: unknown | null;
  creationTxHash: string | null;
  transactionHash: string;
  onChainId: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
}

/** Full project detail returned by GET /api/projects/{slug}. */
export interface ProjectDetail extends Project {
  crowdfundingCampaigns: EmbeddedCrowdfundingCampaign[];
  journeyTimeline?: Array<{
    occurredAt: string;
    kind: string;
    title?: string;
    status?: string;
  }>;
}

/** Standard API envelope wrapper. */
export interface ProjectApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

/** Paginated list of projects. */
export interface ProjectListData {
  projects: Project[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Query params for GET /api/projects (public listing). */
export interface PublicProjectsQuery {
  page?: number;
  limit?: number;
  category?: string;
  publicStatus?: string;
  originType?: string;
  featured?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/** Paginated response from GET /api/projects. */
export interface PaginatedProjectsResponse {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Publish/submit request payload. */
export interface PublishProjectRequest {
  projectId: string;
  onChainId?: string;
  transactionHash?: string;
  isCampaign: boolean;
}

/** Params for GET /api/projects/me. */
export interface GetMyProjectsParams {
  limit?: number;
  offset?: number;
  status?: string;
}

// ─── Project Edit types ──────────────────────────────────────────────────────

export type ProjectEditType = 'MAJOR' | 'MINOR';

export interface ProjectEditChanges {
  title?: string;
  tagline?: string;
  description?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  socialLinks?: Record<string, string>;
  contact?: { primary: string; backup?: string };
}

export interface SubmitProjectEditRequest {
  editType: ProjectEditType;
  message?: string;
  changes: ProjectEditChanges;
}

export interface ProjectEdit {
  id: string;
  projectId: string;
  submittedById: string;
  editType: ProjectEditType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  payload: ProjectEditChanges;
  message?: string;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Crowdfunding types ───────────────────────────────────────────────────────
// Crowdfunding types
export interface Contributor {
  date: string;
  amount: number;
  userId: string;
  transactionHash: string;
  username: string;
  name: string;
  image: string;
  message?: string;
}

export interface TeamMember {
  id?: string;
  name: string;
  role: string;
  email: string;
  image?: string;
  username?: string;
}

export interface Contact {
  backup: string;
  primary: string;
}

export interface SocialLink {
  url: string;
  platform: string;
}

export interface Milestone {
  id?: string;
  name: string;
  amount: number;
  reviewStatus: string;
  endDate: string;
  startDate: string;
  description: string;
  fundingPercentage: number;
  title: string;
  orderIndex?: string;
}

export interface User {
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
  metadata: any | null;
  twoFactorEnabled: boolean;
}

// Public profile view for other users
export interface PublicUserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  displayUsername: string;
  image: string;
  emailVerified: boolean;
  role: string;
  organizations: any[];
  projects: Array<{
    id: string;
    title: string;
    vision: string;
    category: string;
    status: string;
    banner: string | null;
    logo: string;
    createdAt: string;
  }>;
  hackathonSubmissionsAsParticipant?: Array<{
    id: string;
    projectId: string;
    status: string;
    hackathonId: string;
    projectName: string;
  }>;
  badges: any[];
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
  followStats: {
    following: number;
    followers: number;
  };
  isFollowing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrowdfundingProject {
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
  teamMembers: any[];
  banner: string | null;
  logo: string;
  thumbnail: string | null;
  githubUrl: string;
  gitlabUrl: string | null;
  bitbucketUrl: string | null;
  projectWebsite: string;
  demoVideo: string;
  whitepaperUrl: string | null;
  pitchVideoUrl: string | null;
  socialLinks: SocialLink[];
  contact: Contact;
  whitepaper: string | null;
  pitchDeck: string | null;
  votes: number;
  voting: any | null;
  tags: string[];
  approvedById: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  creator: User;
  organization: any | null;
  documents?: {
    whitepaper: string;
    pitchDeck: string;
  };
  funding?: {
    goal: number;
    raised: number;
    currency: string;
    endDate: string;
  };
  milestones?: Array<{
    name: string;
    description: string;
    amount: number;
    status: string;
    endDate: string;
    startDate: string;
  }>;
  daysToDeadline?: number;
  _count?: {
    votes: number;
  };
}

export interface Crowdfunding {
  id: string;
  projectId: string;
  slug: string;
  fundingGoal: number;
  voteGoal: number;
  fundingRaised: number;
  fundingCurrency: string;
  fundingEndDate: string;
  contributors: Contributor[];
  team: TeamMember[];
  contact: Contact;
  socialLinks: SocialLink[];
  milestones: Milestone[];
  stakeholders: any | null;
  trustlessWorkStatus: string;
  escrowAddress: string;
  escrowType: string;
  escrowDetails: any | null;
  creationTxHash: string | null;
  transactionHash: string;
  createdAt: string;
  updatedAt: string;
  project: CrowdfundingProject;
  // Vote-related properties for UI compatibility
  totalVotes?: number;
  thresholdVotes?: number;
  isVotingActive?: boolean;
  voteProgress?: number;
}
