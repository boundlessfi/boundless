import type { ProjectViewModel } from '@/features/projects/types/view-model';
import { VoteCountResponse } from '@/types/votes';

export interface ProjectSidebarProps {
  vm: ProjectViewModel;
  isMobile?: boolean;
}

export interface ProjectSidebarHeaderProps {
  vm: ProjectViewModel;
  projectStatus: ProjectStatus;
}

export interface ProjectSidebarProgressProps {
  vm: ProjectViewModel;
  projectStatus: string;
  voteCounts: VoteCountResponse | null;
}

export interface ProjectSidebarActionsProps {
  vm: ProjectViewModel;
  projectStatus: ProjectStatus;
  isVoting: boolean;
  userVote: 1 | -1 | null;
  onVote: (value: 1 | -1) => void;
}

export interface ProjectSidebarCreatorProps {
  vm: ProjectViewModel;
}

export interface ProjectSidebarLinksProps {
  vm: ProjectViewModel;
}

export type ProjectStatus =
  | 'CAMPAIGNING'
  | 'Funded'
  | 'Completed'
  | 'Validation'
  | 'Funding'
  | 'idea'
  | 'pending'
  | 'SUBMITTED'
  | 'Live'
  | 'VOTING';
