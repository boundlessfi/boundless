import type { ProjectViewModel } from '@/features/projects/types/view-model';
import {
  CampaignStatus,
  normalizeCampaignStatus,
} from '@/features/projects/types';
import { ProjectStatus } from './types';

export { CampaignStatus };

export function getProjectStatus(vm: ProjectViewModel): ProjectStatus {
  if (
    vm.campaign &&
    vm.campaign.fundingRaised >= vm.campaign.fundingGoal &&
    vm.campaign.fundingGoal > 0
  ) {
    return CampaignStatus.FUNDED;
  }
  return normalizeCampaignStatus(vm.status);
}
