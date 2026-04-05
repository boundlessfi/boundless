'use client';

import { useState } from 'react';
import {
  ArrowUp,
  DollarSign,
  CheckCircle,
  Share2,
  ThumbsUp,
  HandCoins,
  XCircle,
  Loader2,
} from 'lucide-react';
import { ProjectSidebarActionsProps } from './types';
import { CampaignStatus } from './utils';
import type { CampaignStatusValue } from '@/features/projects/types';
import { BoundlessButton } from '@/components/buttons';
import { SharePopup } from './SharePopup';
import { FollowButton } from '@/components/follow';
import { FundingModal } from '@/components/project-details/funding-modal';
import { useOptionalAuth } from '@/hooks/use-auth';
import { useCrowdfundContract } from '@/hooks/use-crowdfund-contract';
import { deleteCrowdfundingProject } from '@/features/projects/api';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function ProjectSidebarActions({
  vm,
  projectStatus,
  isVoting,
  userVote,
  onVote,
}: ProjectSidebarActionsProps) {
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { user } = useOptionalAuth();
  const { isConnected, cancelCampaign, parseCrowdfundError } =
    useCrowdfundContract();

  const isCreator = !!(user && user.id === vm.creatorId);
  const cancellableStatuses: CampaignStatusValue[] = [
    CampaignStatus.CAMPAIGNING,
    CampaignStatus.IDEA,
    CampaignStatus.REVIEWING,
  ];
  const canCancel =
    isCreator &&
    vm.campaign?.onChainId &&
    cancellableStatuses.includes(projectStatus);

  const handleShareClick = () => {
    setIsSharePopupOpen(true);
  };

  const handleCloseSharePopup = () => {
    setIsSharePopupOpen(false);
  };

  const handleCancelCampaign = async () => {
    if (!vm.campaign?.onChainId) return;

    setIsCancelling(true);
    try {
      const transactionHash = await cancelCampaign(vm.campaign.onChainId);
      await deleteCrowdfundingProject(vm.campaign.campaignId);

      toast.success('Campaign cancelled', {
        description: `Your campaign has been cancelled. Tx: ${transactionHash.slice(0, 8)}...`,
      });

      window.location.reload();
    } catch (err: unknown) {
      const errorMessage = parseCrowdfundError(err);
      toast.error('Failed to cancel campaign', { description: errorMessage });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className='flex flex-wrap gap-2 sm:gap-3'>
      {projectStatus === CampaignStatus.VOTING && (
        <div className='group relative inline-block'>
          <BoundlessButton
            onClick={() => onVote(1)}
            disabled={isVoting || userVote === 1}
            loading={isVoting}
            iconPosition={userVote === 1 ? 'right' : 'left'}
            icon={
              userVote === 1 ? (
                <ThumbsUp className='h-5 w-5' fill='#2EEDAA' />
              ) : (
                <ArrowUp className='h-5 w-5' />
              )
            }
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl sm:h-12 sm:text-base ${
              userVote === 1
                ? 'bg-primary/10 border-primary/24 text-primary border'
                : 'bg-primary hover:bg-primary text-black'
            } `}
          >
            <span>
              {isVoting ? 'Voting...' : userVote === 1 ? 'Upvoted' : 'Upvote'}
            </span>
          </BoundlessButton>

          <div className='absolute top-full left-1/2 z-10 mt-2 hidden w-64 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-lg group-hover:block'>
            Voting is straightforward and individualistic — it&apos;s for
            everyone. Voting power, weight, and eligibility for who can vote are
            currently under implementation.
          </div>
        </div>
      )}

      {vm.campaign && projectStatus === CampaignStatus.CAMPAIGNING && (
        <FundingModal
          campaignId={vm.campaign.campaignId}
          onChainId={vm.campaign.onChainId}
          projectTitle={vm.title}
          currentRaised={vm.campaign.fundingRaised}
          fundingGoal={vm.campaign.fundingGoal}
          escrowAddress={vm.campaign.escrowAddress}
        >
          <BoundlessButton
            className='bg-primary hover:bg-primary flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-black shadow-lg transition-all duration-200 hover:shadow-xl sm:h-12 sm:text-base'
            icon={<HandCoins className='h-5 w-5' />}
            iconPosition='left'
          >
            <span>Back Project</span>
          </BoundlessButton>
        </FundingModal>
      )}

      {projectStatus === CampaignStatus.COMPLETED && (
        <BoundlessButton
          disabled
          className='bg-success-75 border-success-600 text-success-600 flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold shadow-lg transition-all duration-200 sm:h-12 sm:text-base'
          icon={<CheckCircle className='h-5 w-5' />}
          iconPosition='left'
        >
          <span>Completed</span>
        </BoundlessButton>
      )}

      {projectStatus === CampaignStatus.FUNDED && (
        <BoundlessButton
          disabled
          className='bg-secondary-75 border-secondary-600 text-secondary-600 flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold shadow-lg transition-all duration-200 sm:h-12 sm:text-base'
          icon={<DollarSign className='h-5 w-5' />}
          iconPosition='left'
        >
          <span>Funded</span>
        </BoundlessButton>
      )}

      {canCancel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <BoundlessButton
              disabled={isCancelling || !isConnected}
              className='flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 text-sm font-semibold text-red-400 shadow-lg transition-all duration-200 hover:bg-red-500/20 sm:h-12 sm:text-base'
              icon={
                isCancelling ? (
                  <Loader2 className='h-5 w-5 animate-spin' />
                ) : (
                  <XCircle className='h-5 w-5' />
                )
              }
              iconPosition='left'
            >
              <span>{isCancelling ? 'Cancelling...' : 'Cancel Campaign'}</span>
            </BoundlessButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Campaign</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this campaign? This action will
                be recorded on-chain and cannot be undone. Any existing
                contributions will be eligible for refund.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Campaign</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelCampaign}
                className='bg-red-600 text-white hover:bg-red-700'
              >
                Yes, Cancel Campaign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className='flex-1'>
        <FollowButton
          entityType='PROJECT'
          entityId={vm.id}
          className='h-10 w-full sm:h-12'
        />
      </div>

      <div className='relative'>
        <BoundlessButton
          onClick={handleShareClick}
          className='flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-white/24 bg-transparent text-sm font-medium text-gray-300 transition-all duration-200 hover:border-gray-600 hover:bg-transparent hover:text-white sm:h-12 sm:min-w-12 sm:flex-1'
          icon={<Share2 className='h-5 w-5' />}
          iconPosition='left'
        >
          <span className='hidden sm:inline'>Share</span>
        </BoundlessButton>

        <SharePopup
          isOpen={isSharePopupOpen}
          onClose={handleCloseSharePopup}
          projectTitle={vm.title}
          projectUrl={typeof window !== 'undefined' ? window.location.href : ''}
        />
      </div>
    </div>
  );
}
