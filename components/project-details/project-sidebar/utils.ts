import type { ProjectViewModel } from '@/features/projects/types/view-model';
import { ProjectStatus } from './types';

/**
 * Determines the display status based on project view model
 */
export function getProjectStatus(vm: ProjectViewModel): ProjectStatus {
  if (vm.status === 'IDEA' || vm.status === 'idea') {
    return 'Validation';
  }
  if (vm.status === 'LIVE' || vm.status === 'live') {
    return 'Live';
  }
  if (
    vm.status === 'funded' ||
    (vm.campaign &&
      vm.campaign.fundingRaised >= vm.campaign.fundingGoal &&
      vm.campaign.fundingGoal > 0)
  ) {
    return 'Funded';
  }
  if (vm.status === 'campaigning' || vm.status === 'active') {
    return 'Funding';
  }
  if (vm.status === 'completed') {
    return 'Completed';
  }
  return vm.status as ProjectStatus;
}
