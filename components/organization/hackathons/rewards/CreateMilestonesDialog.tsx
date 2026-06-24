'use client';

import React from 'react';
import { Loader2, Trophy, AlertCircle, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BoundlessButton } from '@/components/buttons';
import { WinnerFormItem } from './WinnerFormItem';
import type { Submission } from './types';
import type { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { HackathonEscrowData } from '@/lib/api/hackathons';

interface CreateMilestonesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  winners: Submission[];
  prizeTiers: PrizeTier[];
  escrow: HackathonEscrowData | null;
  walletAddresses: Record<string, string>;
  errors: Record<string, string>;
  isLoading: boolean;
  onWalletAddressChange: (submissionId: string, address: string) => void;
  onCreateMilestones: () => Promise<void>;
}

export const CreateMilestonesDialog: React.FC<CreateMilestonesDialogProps> = ({
  open,
  onOpenChange,
  winners,
  prizeTiers,
  escrow,
  walletAddresses,
  errors,
  isLoading,
  onWalletAddressChange,
  onCreateMilestones,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-background-card max-w-2xl border-gray-900'>
        <DialogHeader>
          <DialogTitle className='text-white'>
            Create Winner Milestones
          </DialogTitle>
          <DialogDescription className='text-gray-400'>
            Enter wallet addresses for each winner to create milestones in the
            escrow
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-[60vh] space-y-4 overflow-y-auto'>
          {!escrow?.isFunded && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Cannot Create Milestones</AlertTitle>
              <AlertDescription>
                Escrow is not funded. Please fund the escrow first.
              </AlertDescription>
            </Alert>
          )}

          {winners.map(winner => (
            <WinnerFormItem
              key={winner.id}
              winner={winner}
              prizeTiers={prizeTiers}
              walletAddress={walletAddresses[winner.id] || ''}
              error={errors[winner.id]}
              isLoading={isLoading}
              isEscrowFunded={escrow?.isFunded || false}
              onWalletAddressChange={onWalletAddressChange}
            />
          ))}

          <Alert>
            <Info className='h-4 w-4' />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              After creating milestones, you'll need to approve each winner
              milestone and then release funds to distribute prizes.
            </AlertDescription>
          </Alert>
        </div>

        <div className='flex justify-end gap-3'>
          <BoundlessButton
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </BoundlessButton>
          <BoundlessButton
            variant='default'
            onClick={onCreateMilestones}
            disabled={
              isLoading || !escrow?.isFunded || Object.keys(errors).length > 0
            }
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating...
              </>
            ) : (
              <>
                <Trophy className='mr-2 h-4 w-4' />
                Create Milestones
              </>
            )}
          </BoundlessButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
