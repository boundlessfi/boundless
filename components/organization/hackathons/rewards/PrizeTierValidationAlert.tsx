'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { validatePrizeTiers } from '@/lib/utils/prize-tier-validation';
import type { Submission } from './types';
import type { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';

interface PrizeTierValidationAlertProps {
  winners: Submission[];
  prizeTiers: PrizeTier[];
}

export const PrizeTierValidationAlert: React.FC<
  PrizeTierValidationAlertProps
> = ({ winners, prizeTiers }) => {
  const tierValidation = validatePrizeTiers(winners, prizeTiers);

  if (tierValidation.valid) {
    return null;
  }

  const ranksStr = tierValidation.missingRanks
    .map(r => `${r}${r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th'}`)
    .join(', ');

  return (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Missing Prize Tiers</AlertTitle>
      <AlertDescription className='space-y-2'>
        <p>
          No prize tier found for rank
          {tierValidation.missingRanks.length > 1 ? 's' : ''} {ranksStr}.
        </p>
        <p className='text-sm'>
          <strong>To fix this:</strong>
        </p>
        <ol className='ml-2 list-inside list-decimal space-y-1 text-sm'>
          <li>Go to the hackathon edit page</li>
          <li>Open the Rewards tab</li>
          <li>
            Add prize tiers with positions matching the ranks (e.g., "1" or
            "1st" for rank 1)
          </li>
          <li>Set the amount, currency, and description for each tier</li>
          <li>Save the hackathon</li>
        </ol>
        <p className='mt-2 text-sm'>
          <strong>Supported position formats:</strong> "1", "1st", "First", "2",
          "2nd", "Second", etc.
        </p>
      </AlertDescription>
    </Alert>
  );
};
