import { Crowdfunding, CrowdfundingProject } from '@/features/projects/types';
import { Project as UserProject } from '@/types/user';

export type ProjectCardStatus =
  | 'Validation'
  | 'Funding'
  | 'Funded'
  | 'Completed';

export interface ProjectCardData {
  id: string;
  slug: string;
  title: string;
  vision: string;
  banner: string | null;
  logo: string | null;
  category: string;
  creator: {
    name: string;
    image: string;
  };
  status: ProjectCardStatus;
  stats: {
    votes?: {
      current: number;
      goal: number;
    };
    funding?: {
      raised: number;
      goal: number;
      currency: string;
    };
    milestones?: {
      completed: number;
      total: number;
    };
    daysLeft: number;
  };
}

export const mapCrowdfundingToCardData = (
  item: Crowdfunding
): ProjectCardData => {
  const { project } = item;

  // Calculate days left
  let daysLeft = 0;
  if (item.fundingEndDate) {
    try {
      const now = new Date();
      const end = new Date(item.fundingEndDate);
      daysLeft = Math.max(
        0,
        Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
    } catch {
      daysLeft = 0;
    }
  }

  // Determine status map
  let status: ProjectCardStatus = 'Funding';
  const rawStatus = project.status;
  if (rawStatus === 'IDEA') status = 'Validation';
  else if (rawStatus === 'ACTIVE') status = 'Funding';
  else if (rawStatus === 'LIVE') status = 'Funded';
  else if (rawStatus === 'COMPLETED') status = 'Completed';
  // Add other status mappings as needed

  // Milestones
  const completedMilestones =
    item.milestones?.filter(m => m.reviewStatus === 'completed')?.length || 0;
  const totalMilestones = item.milestones?.length || 0;

  return {
    id: item.projectId,
    slug: item.slug,
    title: project.title,
    vision: project.vision || '',
    banner: project.banner,
    logo: project.logo,
    category: project.category,
    creator: {
      name: project.creator?.name || 'Unknown Creator',
      image: project.creator?.image || '/user.png',
    },
    status,
    stats: {
      votes: {
        current: item.voteProgress || 0, // Using voteProgress from new type if available
        goal: item.voteGoal || 100,
      },
      funding: {
        raised: item.fundingRaised,
        goal: item.fundingGoal,
        currency: item.fundingCurrency,
      },
      milestones: {
        completed: completedMilestones,
        total: totalMilestones,
      },
      daysLeft,
    },
  };
};

export const mapProjectToCardData = (
  project: UserProject,
  creator: { name: string; image: string }
): ProjectCardData => {
  // Map simplified status
  let status: ProjectCardStatus = 'Validation';
  if (project.status === 'funding' || project.status === 'in_progress')
    status = 'Funding';
  else if (project.status === 'LIVE') status = 'Funded';
  else if (project.status === 'completed') status = 'Completed';

  return {
    id: project.id,
    slug: project.id, // Fallback slug to id if not available
    title: project.title,
    vision: project.vision || '',
    banner: project.banner || null,
    logo: project.logo || null,
    category: project.category,
    creator,
    status,
    stats: {
      daysLeft: 30, // Default for simple view
      funding: {
        raised: 0,
        goal: 10000,
        currency: 'USDC',
      },
      votes: {
        current: 0,
        goal: 100,
      },
    },
  };
};

export const mapCrowdfundingProjectToCardData = (
  project: CrowdfundingProject
): ProjectCardData => {
  // Keep logic similar to existing usage
  let status: ProjectCardStatus = 'Validation';
  if (project.status === 'active' || project.status === 'funding')
    status = 'Funding';
  else if (project.status === 'funded') status = 'Funded';
  else if (project.status === 'completed') status = 'Completed';

  // Calculate days left if needed, or default
  const daysLeft = project.daysToDeadline || 30;

  return {
    id: project.id,
    slug: project.id,
    title: project.title,
    vision: project.vision || '',
    banner: project.banner,
    logo: project.logo,
    category: project.category,
    creator: {
      name: project.creator?.name || 'Creator',
      image: project.creator?.image || '/user.png',
    },
    status,
    stats: {
      funding: {
        raised: project.funding?.raised || 0,
        goal: project.funding?.goal || 0,
        currency: project.funding?.currency || 'USDC',
      },
      daysLeft,
    },
  };
};
