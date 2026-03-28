'use client';

import { useState } from 'react';
import {
  ArrowUp,
  DollarSign,
  CheckCircle,
  Share2,
  ThumbsUp,
  HandCoins,
} from 'lucide-react';
import { ProjectSidebarActionsProps } from './types';
import { BoundlessButton } from '@/components/buttons';
import { SharePopup } from './SharePopup';
import { FollowButton } from '@/components/follow';
import { FundingModal } from '@/components/project-details/funding-modal';

export function ProjectSidebarActions({
  vm,
  projectStatus,
  isVoting,
  userVote,
  onVote,
}: ProjectSidebarActionsProps) {
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);

  const handleShareClick = () => {
    setIsSharePopupOpen(true);
  };

  const handleCloseSharePopup = () => {
    setIsSharePopupOpen(false);
  };

  return (
    <div className='flex flex-wrap gap-2 sm:gap-3'>
      {projectStatus === 'Validation' && (
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

      {/* Back Project — only for campaigns in funding phase */}
      {vm.campaign && projectStatus === 'CAMPAIGNING' && (
        <FundingModal
          campaignId={vm.campaign.campaignId}
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

      {projectStatus === 'Completed' && (
        <BoundlessButton
          disabled
          className='bg-success-75 border-success-600 text-success-600 flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold shadow-lg transition-all duration-200 sm:h-12 sm:text-base'
          icon={<CheckCircle className='h-5 w-5' />}
          iconPosition='left'
        >
          <span>Completed</span>
        </BoundlessButton>
      )}

      {projectStatus === 'Funded' && (
        <BoundlessButton
          disabled
          className='bg-secondary-75 border-secondary-600 text-secondary-600 flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold shadow-lg transition-all duration-200 sm:h-12 sm:text-base'
          icon={<DollarSign className='h-5 w-5' />}
          iconPosition='left'
        >
          <span>Funded</span>
        </BoundlessButton>
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
