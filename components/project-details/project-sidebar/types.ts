import type { ProjectViewModel } from '@/features/projects/types/view-model';
import type { CampaignStatusValue } from '@/features/projects/types';
import { VoteCountResponse } from '@/types/votes';

export type ProjectStatus = CampaignStatusValue;

export interface ProjectSidebarProps {
  vm: ProjectViewModel;
  isMobile?: boolean;
  onRefresh?: () => void;
}

export interface ProjectSidebarHeaderProps {
  vm: ProjectViewModel;
  projectStatus: ProjectStatus;
}

export interface ProjectSidebarProgressProps {
  vm: ProjectViewModel;
  projectStatus: ProjectStatus;
  voteCounts: VoteCountResponse | null;
  refreshTrigger?: number;
}

export interface ProjectSidebarActionsProps {
  vm: ProjectViewModel;
  projectStatus: ProjectStatus;
  isVoting: boolean;
  userVote: 1 | -1 | null;
  onVote: (value: 1 | -1) => void;
  onRefresh?: () => void;
}

export interface ProjectSidebarCreatorProps {
  vm: ProjectViewModel;
}

export interface ProjectSidebarLinksProps {
  vm: ProjectViewModel;
}
