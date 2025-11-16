import type { CrowdfundingProject } from '@/lib/api/types';

export interface ExtendedProject extends CrowdfundingProject {
  // Additional fields that might be added during transformation
  daysToDeadline?: number;
  additionalCreator?: {
    name: string;
    role: string;
    avatar: string;
  };
  links?: Array<{
    type: string;
    url: string;
    icon: string;
  }>;
  // Legacy fields for backward compatibility
  name?: string;
  logo?: string;
  validation?: string;
  date?: string;
  totalVotes?: number;
  // Escrow fields
  contractId?: string;
  escrowAddress?: string;
}

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
  project: ExtendedProject;
  crowdfund?: CrowdfundData;
  isMobile?: boolean;
}

export interface ProjectSidebarHeaderProps {
  project: ExtendedProject;
  projectStatus: ProjectStatus;
}

export interface ProjectSidebarProgressProps {
  project: ExtendedProject;
  crowdfund?: CrowdfundData;
  projectStatus: string;
}

export interface ProjectSidebarActionsProps {
  project: ExtendedProject;
  crowdfund?: CrowdfundData;
  projectStatus: string;
  isVoting: boolean;
  userVote: 1 | -1 | null;
  onVote: (value: 1 | -1) => void;
}

export interface ProjectSidebarCreatorProps {
  project: ExtendedProject;
}

export interface ProjectSidebarLinksProps {
  project: ExtendedProject;
}

export type ProjectStatus =
  | 'campaigning'
  | 'Funded'
  | 'Completed'
  | 'Validation'
  | 'idea';
