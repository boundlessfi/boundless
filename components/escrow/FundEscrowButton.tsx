'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import { fundPool, getPool } from '@/lib/api/escrow';
import { toast } from 'sonner';
import { reportError } from '@/lib/error-reporting';
import { Loader2, CheckCircle2, DollarSign } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Component to fund an existing escrow pool via the backend CoreEscrow contract.
 */
export const FundEscrowButton = () => {
  const { poolId, pool, updatePool } = useEscrowContext();
  const [isLoading, setIsLoading] = useState(false);
  const [fundingStatus, setFundingStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleFundEscrow = async () => {
    if (!poolId || !pool) {
      toast.error('No escrow pool found. Please initialize an escrow first.');
      return;
    }

    setIsLoading(true);
    setFundingStatus(null);

    try {
      const amount = pool.totalDeposited || '0';

      await fundPool({
        poolId,
        amount,
      });

      // Refresh pool data
      const updatedPool = await getPool(poolId);
      updatePool(updatedPool);

      setFundingStatus({
        success: true,
        message: 'Escrow funded successfully!',
      });

      toast.success('Escrow funded successfully!');
    } catch (err) {
      reportError(err, { context: 'escrow-fund' });
      setFundingStatus({
        success: false,
        message: 'Failed to fund escrow',
      });
      toast.error('Failed to fund escrow');
    } finally {
      setIsLoading(false);
    }
  };

  if (fundingStatus) {
    return (
      <Card
        className={
          fundingStatus.success
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        }
      >
        <CardHeader>
          <div className='flex items-center gap-2'>
            {fundingStatus.success ? (
              <CheckCircle2 className='h-5 w-5 text-green-600' />
            ) : (
              <Loader2 className='h-5 w-5 text-red-600' />
            )}
            <CardTitle
              className={
                fundingStatus.success ? 'text-green-800' : 'text-red-800'
              }
            >
              {fundingStatus.success
                ? 'Escrow Funded Successfully!'
                : 'Funding Failed'}
            </CardTitle>
          </div>
          <CardDescription
            className={
              fundingStatus.success ? 'text-green-700' : 'text-red-700'
            }
          >
            {fundingStatus.message}
          </CardDescription>
        </CardHeader>
        {fundingStatus.success && pool && (
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  Total Deposited:
                </span>
                <span className='font-mono text-sm'>{pool.totalDeposited}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  Total Released:
                </span>
                <span className='font-mono text-sm'>{pool.totalReleased}</span>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setFundingStatus(null)}
              className='mt-4'
            >
              Fund Again
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  if (!poolId || !pool) {
    return (
      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <p className='text-sm text-gray-600'>
          Please initialize an escrow first before funding.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
        <div className='mb-2 flex items-center justify-between'>
          <span className='text-sm font-medium text-gray-700'>
            Pool Status:
          </span>
          <span className='font-mono text-sm'>
            {pool.locked ? 'Locked' : 'Open'}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-gray-700'>Module:</span>
          <span className='text-sm'>{pool.module}</span>
        </div>
      </div>

      <Button
        onClick={handleFundEscrow}
        disabled={isLoading}
        className='min-w-[200px]'
        size='lg'
      >
        {isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Funding Escrow...
          </>
        ) : (
          <>
            <DollarSign className='mr-2 h-4 w-4' />
            Fund Escrow
          </>
        )}
      </Button>
    </div>
  );
};
