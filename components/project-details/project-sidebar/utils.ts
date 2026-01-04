import { Crowdfunding, CrowdfundingProject } from '@/types/project';
import { ProjectStatus } from './types';

/**
 * Determines the project status based on project data and crowdfund information
 */
export function getProjectStatus(
  project: CrowdfundingProject,
  crowdfund?: Crowdfunding
): ProjectStatus {
  if (project.status === 'idea') {
    return 'Validation';
  }
  if (
    crowdfund?.fundingRaised &&
    crowdfund?.fundingGoal &&
    crowdfund?.fundingRaised >= crowdfund?.fundingGoal
  ) {
    return 'Funded';
  }
  if (project.status === 'campaigning') {
    return 'campaigning';
  }
  return project.status as ProjectStatus;
}
