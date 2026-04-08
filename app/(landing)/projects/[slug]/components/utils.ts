import {
  CampaignStatus,
  type CampaignStatusValue,
  normalizeCampaignStatus,
} from '@/features/projects/types';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

export { CampaignStatus };
export type { CampaignStatusValue };

/**
 * Resolve the effective campaign status for a project.
 * If the campaign has met or exceeded its funding goal we treat it as FUNDED
 * regardless of the raw backend status — this matches the legacy behavior in
 * components/project-details/project-sidebar/utils.ts.
 */
export function getProjectStatus(vm: ProjectViewModel): CampaignStatusValue {
  if (
    vm.campaign &&
    vm.campaign.fundingRaised >= vm.campaign.fundingGoal &&
    vm.campaign.fundingGoal > 0
  ) {
    return CampaignStatus.FUNDED;
  }
  return normalizeCampaignStatus(vm.status);
}
