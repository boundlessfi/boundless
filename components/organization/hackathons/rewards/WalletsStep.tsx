'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { WinnerFormItem } from './WinnerFormItem';
import { PrizeTierValidationAlert } from './PrizeTierValidationAlert';
import type { Submission } from './types';
import type { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { HackathonEscrowData } from '@/lib/api/hackathons';

interface WalletsStepProps {
  winners: Submission[];
  prizeTiers: PrizeTier[];
  escrow: HackathonEscrowData | null;
  walletAddresses: Record<string, string>;
  isPublishing: boolean;
  onWalletAddressChange: (submissionId: string, address: string) => void;
}

export const WalletsStep: React.FC<WalletsStepProps> = ({
  winners,
  prizeTiers,
  escrow,
  walletAddresses,
  isPublishing,
  onWalletAddressChange,
}) => {
  return (
    <div className='space-y-4'>
      <Alert className='border-primary/50 bg-primary/10'>
        <Info className='text-primary h-4 w-4' />
        <AlertTitle className='text-primary'>Mandatory Step</AlertTitle>
        <AlertDescription className='text-gray-300'>
          Creating milestones is <strong>required</strong> before announcing
          winners. Please provide wallet addresses for all winners to proceed.
        </AlertDescription>
      </Alert>

      <PrizeTierValidationAlert winners={winners} prizeTiers={prizeTiers} />

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
          isLoading={isPublishing}
          isEscrowFunded={escrow?.isFunded || false}
          onWalletAddressChange={onWalletAddressChange}
        />
      ))}

      <Alert>
        <Info className='h-4 w-4' />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          After publishing, you'll need to approve each winner milestone and
          then release funds to distribute prizes.
        </AlertDescription>
      </Alert>
    </div>
  );
};
