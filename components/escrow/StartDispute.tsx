'use client';

import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

/**
 * Dispute initiation component.
 * Disputes are now handled by the backend via module contracts.
 * The CoreEscrow contract does not have a dispute mechanism —
 * disputes are resolved at the application layer.
 */
export const StartDispute = () => {
  const { poolId, pool } = useEscrowContext();

  if (!poolId || !pool) {
    return (
      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <p className='text-sm text-gray-600'>
          No escrow pool found. Please initialize an escrow first.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <AlertTriangle className='h-5 w-5 text-yellow-600' />
          Start Dispute
        </CardTitle>
        <CardDescription>
          Disputes are managed through the platform's dispute resolution
          process. Contact support or use the project's dispute mechanism to
          initiate a dispute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
          <p className='text-sm text-yellow-800'>
            The CoreEscrow contract handles fund custody. Dispute resolution is
            handled at the application layer through the backend API. If you
            need to dispute a milestone, please use the project's built-in
            dispute workflow.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
