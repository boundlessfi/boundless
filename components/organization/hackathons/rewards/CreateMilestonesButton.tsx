'use client';

import React, { useState, useMemo } from 'react';
import { BoundlessButton } from '@/components/buttons';
import { Trophy } from 'lucide-react';
import { Submission } from './types';
import { HackathonEscrowData } from '@/lib/api/hackathons';
import { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import { useWalletAddresses } from '@/hooks/use-wallet-addresses';
import { useMilestoneCreation } from '@/hooks/use-milestone-creation';
import { CreateMilestonesDialog } from './CreateMilestonesDialog';

interface CreateMilestonesButtonProps {
  submissions: Submission[];
  prizeTiers: PrizeTier[];
  escrow: HackathonEscrowData | null;
  organizationId: string;
  hackathonId: string;
  onSuccess?: () => void;
}

export default function CreateMilestonesButton({
  submissions,
  prizeTiers,
  escrow,
  organizationId,
  hackathonId,
  onSuccess,
}: CreateMilestonesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const winners = useMemo(
    () => submissions.filter(s => s.rank !== undefined && s.rank !== null),
    [submissions]
  );

  const hasWinners = winners.length > 0;
  const canCreateMilestones = escrow?.isFunded && hasWinners;

  const { walletAddresses, errors, setErrors, handleWalletAddressChange } =
    useWalletAddresses({
      isOpen,
      winners,
    });

  const { isLoading, createMilestones } = useMilestoneCreation({
    winners,
    prizeTiers,
    escrow,
    organizationId,
    hackathonId,
    walletAddresses,
    setErrors,
    onSuccess,
  });

  const handleCreateMilestones = async () => {
    try {
      await createMilestones();
      setIsOpen(false);
    } catch {
      // Error is handled in the hook
    }
  };

  if (!hasWinners) {
    return null;
  }

  return (
    <>
      <BoundlessButton
        variant='default'
        size='lg'
        onClick={() => setIsOpen(true)}
        disabled={!canCreateMilestones}
        className='gap-2'
      >
        <Trophy className='h-4 w-4' />
        Create Milestones
      </BoundlessButton>

      <CreateMilestonesDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        winners={winners}
        prizeTiers={prizeTiers}
        escrow={escrow}
        walletAddresses={walletAddresses}
        errors={errors}
        isLoading={isLoading}
        onWalletAddressChange={handleWalletAddressChange}
        onCreateMilestones={handleCreateMilestones}
      />
    </>
  );
}
