'use client';

import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Scale } from 'lucide-react';

/**
 * Dispute resolution component.
 * Disputes are now handled by the backend via module contracts.
 */
export const ResolveDispute = () => {
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
          <Scale className='h-5 w-5' />
          Resolve Dispute
        </CardTitle>
        <CardDescription>
          Dispute resolution is handled through the platform's backend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
          <p className='text-sm text-blue-800'>
            Dispute resolution decisions (release to recipient, refund to
            funder, or partial split) are executed by the backend through the
            CoreEscrow contract's release and refund operations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
