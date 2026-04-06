import type { Contributor, Milestone, SocialLink } from '.';

export type ProjectType = 'generic' | 'campaign' | 'submission';

export type ProjectOrigin = 'crowdfunding' | 'hackathon' | 'manual';

export interface VMCreator {
  id: string;
  name: string;
  username: string;
  image: string;
}

export interface VMTeamMember {
  name: string;
  role: string;
  email?: string;
  image?: string;
  username?: string;
}

export interface VMCampaign {
  campaignId: string;
  campaignSlug: string;
  onChainId: string | null;
  fundingGoal: number;
  fundingRaised: number;
  fundingCurrency: string;
  fundingEndDate: string;
  voteGoal: number;
  escrowAddress: string;
  escrowType: string;
  trustlessWorkStatus: string;
  contributors: Contributor[];
  milestones: Milestone[];
  transactionHash: string;
}

export interface VMSubmission {
  hackathonId?: string;
  hackathonName?: string;
  milestones: Milestone[];
}

export interface ProjectViewModel {
  id: string;
  slug: string;
  projectType: ProjectType;
  origin: ProjectOrigin;
  title: string;
  tagline: string | null;
  description: string;
  summary: string | null;
  vision: string | null;
  details: string | null;
  category: string;
  status: string;
  banner: string | null;
  logo: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  creator: VMCreator;
  creatorId: string;
  organizationId: string | null;
  organization: unknown | null;
  socialLinks: SocialLink[];
  githubUrl: string | null;
  gitlabUrl: string | null;
  bitbucketUrl: string | null;
  projectWebsite: string | null;
  demoVideo: string | null;
  whitepaperUrl: string | null;
  pitchVideoUrl: string | null;
  whitepaper: string | null;
  pitchDeck: string | null;
  team: VMTeamMember[];
  campaign: VMCampaign | null;
  submission: VMSubmission | null;
  voting: unknown | null;
  voteCount: number;
}
