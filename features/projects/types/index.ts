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
