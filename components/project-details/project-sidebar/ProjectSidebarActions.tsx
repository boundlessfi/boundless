'use client';

import { useState } from 'react';
import {
  ArrowUp,
  DollarSign,
  CheckCircle,
  UserPlus,
  Share2,
  ThumbsUp,
  HandCoins,
} from 'lucide-react';
import { ProjectSidebarActionsProps } from './types';
import { BoundlessButton } from '@/components/buttons';
import { SharePopup } from './SharePopup';
import FundProject from '@/components/modals/fund-project';
import { useProtectedAction } from '@/hooks/use-protected-action';
import WalletRequiredModal from '@/components/wallet/WalletRequiredModal';

export function ProjectSidebarActions({
  project,
  projectStatus,
  isVoting,
  userVote,
  onVote,
}: ProjectSidebarActionsProps) {
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  const {
    executeProtectedAction,
    showWalletModal,
    closeWalletModal,
    handleWalletConnected,
  } = useProtectedAction({
    actionName: 'fund project',
    onSuccess: () => setIsFundModalOpen(true),
  });

  const handleShareClick = () => {
    setIsSharePopupOpen(true);
  };

  const handleCloseSharePopup = () => {
    setIsSharePopupOpen(false);
  };

  const handleFundClick = async () => {
    await executeProtectedAction(() => setIsFundModalOpen(true));
  };

  return (
    <div className='flex flex-row gap-3'>
      {projectStatus === 'Validation' && (
        <div className='group relative inline-block'>
          <BoundlessButton
            onClick={() => onVote(1)}
            disabled={isVoting || userVote === 1}
            loading={isVoting}
            iconPosition={userVote === 1 ? 'right' : 'left'}
            icon={
              userVote === 1 ? (
                <ThumbsUp className='h-5 w-5' fill='#A7F950' />
              ) : (
                <ArrowUp className='h-5 w-5' />
              )
            }
            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-base font-semibold shadow-lg transition-all duration-200 hover:shadow-xl ${
              userVote === 1
                ? 'bg-primary/10 border-primary/24 text-primary border'
                : 'bg-[#A7F950] text-black hover:bg-[#A7F950]'
            } `}
          >
            <span>
              {isVoting ? 'Voting...' : userVote === 1 ? 'Upvoted' : 'Upvote'}
            </span>
          </BoundlessButton>

          {/* Dropdown text */}
          <div className='absolute top-full left-1/2 z-10 mt-2 hidden w-64 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-lg group-hover:block'>
            Voting is straightforward and individualistic — it’s for everyone.
            Voting power, weight, and eligibility for who can vote are currently
            under implementation.
          </div>
        </div>
      )}

      {projectStatus === 'funding' ||
        projectStatus === 'Validated' ||
        (projectStatus === 'campaigning' && (
          <BoundlessButton
            onClick={handleFundClick}
            className='flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#A7F950] text-base font-semibold text-black shadow-lg transition-all duration-200 hover:bg-[#A7F950] hover:shadow-xl'
            icon={<HandCoins className='h-5 w-5' />}
            iconPosition='left'
          >
            <span className=''>Back Project</span>
          </BoundlessButton>
        ))}

      {projectStatus === 'Completed' && (
        <BoundlessButton
          disabled
          className='bg-success-75 border-success-600 text-success-600 flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border text-base font-semibold shadow-lg transition-all duration-200'
          icon={<CheckCircle className='h-5 w-5' />}
          iconPosition='left'
        >
          <span className=''>Completed</span>
        </BoundlessButton>
      )}

      {projectStatus === 'Funded' && (
        <BoundlessButton
          disabled
          className='bg-secondary-75 border-secondary-600 text-secondary-600 flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border text-base font-semibold shadow-lg transition-all duration-200'
          icon={<DollarSign className='h-5 w-5' />}
          iconPosition='left'
        >
          <span className=''>Funded</span>
        </BoundlessButton>
      )}

      <BoundlessButton
        className='flex h-12 min-w-12 items-center justify-center gap-2 rounded-lg border border-white/24 bg-transparent text-sm font-medium text-gray-300 transition-all duration-200 hover:border-gray-600 hover:bg-transparent hover:text-white sm:flex-1'
        icon={<UserPlus className='h-5 w-5' />}
        iconPosition='left'
      >
        <span className='hidden sm:inline'>Follow</span>
      </BoundlessButton>

      <div className='relative'>
        <BoundlessButton
          onClick={handleShareClick}
          className='flex h-12 min-w-12 items-center justify-center gap-2 rounded-lg border border-white/24 bg-transparent text-sm font-medium text-gray-300 transition-all duration-200 hover:border-gray-600 hover:bg-transparent hover:text-white sm:flex-1'
          icon={<Share2 className='h-5 w-5' />}
          iconPosition='left'
        >
          <span className='hidden sm:inline'>Share</span>
        </BoundlessButton>

        <SharePopup
          isOpen={isSharePopupOpen}
          onClose={handleCloseSharePopup}
          projectTitle={project.title}
          projectUrl={typeof window !== 'undefined' ? window.location.href : ''}
        />
      </div>

      {/* Fund Project Modal */}
      <FundProject
        open={isFundModalOpen}
        setOpen={setIsFundModalOpen}
        project={{
          _id: project._id,
          title: project.title,
          logo: project.logo || project.media?.logo,
          contractId: project.contractId || project.escrowAddress, // Get contractId from project
          funding: project.funding
            ? {
                goal: project.funding.goal,
                raised: project.funding.raised,
              }
            : undefined,
        }}
      />

      <WalletRequiredModal
        open={showWalletModal}
        onOpenChange={closeWalletModal}
        actionName='fund project'
        onWalletConnected={handleWalletConnected}
      />
    </div>
  );
}
