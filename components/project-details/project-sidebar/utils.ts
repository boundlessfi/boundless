import { Crowdfunding, CrowdfundingProject } from '@/features/projects/types';
import { ProjectStatus } from './types';

/**
 * Determines the project status based on project data and crowdfund information
 */
export function getProjectStatus(
  project: CrowdfundingProject,
  crowdfund?: Crowdfunding
): ProjectStatus {
  if (project.status === 'IDEA' || project.status === 'idea') {
    return 'Validation';
  }
  if (
    project.status === 'funded' ||
    (crowdfund?.fundingRaised &&
      crowdfund?.fundingGoal &&
      crowdfund?.fundingRaised >= crowdfund?.fundingGoal)
  ) {
    return 'Funded';
  }
  if (project.status === 'campaigning' || project.status === 'active') {
    return 'Funding';
  }
  if (project.status === 'completed') {
    return 'Completed';
  }
  return project.status as ProjectStatus;
}
