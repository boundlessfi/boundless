import { Crowdfunding, CrowdfundingProject } from '@/features/projects/types';
import { VoteCountResponse } from '@/types/votes';

export interface CrowdfundData {
  _id: string;
  projectId: string;
  thresholdVotes: number;
  voteDeadline: string;
  totalVotes: number;
  status: string;
  isVotingActive: boolean;
  voteProgress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSidebarProps {
  project: CrowdfundingProject;
  crowdfund?: Crowdfunding;
  isMobile?: boolean;
  hideProgress?: boolean;
}

export interface ProjectSidebarHeaderProps {
  project: CrowdfundingProject;
  projectStatus: ProjectStatus;
}

export interface ProjectSidebarProgressProps {
  project: CrowdfundingProject;
  crowdfund?: Crowdfunding;
  projectStatus: string;
  voteCounts: VoteCountResponse | null;
}

export interface ProjectSidebarActionsProps {
  project: CrowdfundingProject;
  crowdfund?: Crowdfunding;
  projectStatus: ProjectStatus;
  isVoting: boolean;
  userVote: 1 | -1 | null;
  onVote: (value: 1 | -1) => void;
}

export interface ProjectSidebarCreatorProps {
  project: CrowdfundingProject;
}

export interface ProjectSidebarLinksProps {
  project: CrowdfundingProject;
}

export type ProjectStatus =
  | 'CAMPAIGNING'
  | 'Funded'
  | 'Completed'
  | 'Validation'
  | 'Funding'
  | 'idea'
  | 'pending'
  | 'SUBMITTED';
