'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWalletStore } from '@/lib/stores/walletStore';
import { fundPool, getPool, type EscrowPool } from '@/lib/api/escrow';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, DollarSign, AlertCircle } from 'lucide-react';
import { fundCrowdfundingProject } from '@/features/projects/api';

interface ProjectFundEscrowProps {
  projectId: string;
  contractId: string;
  onSuccess?: () => void;
}

/**
 * Component to fund escrow for a specific project.
 * Uses the backend CoreEscrow contract instead of Trustless Work SDK.
 */
export const ProjectFundEscrow = ({
  projectId,
  contractId,
  onSuccess,
}: ProjectFundEscrowProps) => {
  const walletAddress = useWalletStore(s => s.contractId);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEscrow, setIsFetchingEscrow] = useState(false);
  const [pool, setPool] = useState<EscrowPool | null>(null);
  const [fundingStatus, setFundingStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch pool data
  useEffect(() => {
    if (!contractId) return;

    setIsFetchingEscrow(true);
    getPool(contractId)
      .then(data => setPool(data))
      .catch(() => toast.error('Failed to fetch escrow data'))
      .finally(() => setIsFetchingEscrow(false));
  }, [contractId]);

  const handleFundEscrow = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!contractId || !pool) {
      toast.error('No escrow data found. Please try again.');
      return;
    }

    setIsLoading(true);
    setFundingStatus(null);

    try {
      const amount = pool.totalDeposited || '0';

      if (amount === '0') {
        throw new Error('Total amount is zero.');
      }

      // Fund via backend
      await fundPool({
        poolId: contractId,
        amount,
      });

      // Refresh pool data
      const updatedPool = await getPool(contractId);
      setPool(updatedPool);

      // Notify backend about the funding
      try {
        await fundCrowdfundingProject(projectId, {
          amount: Number(amount),
          transactionHash: contractId,
        });
      } catch {
        toast.warning(
          'Escrow funded, but failed to update project. Please refresh the page.'
        );
      }

      setFundingStatus({
        success: true,
        message: 'Escrow funded successfully!',
      });

      toast.success('Project funded successfully!');
      onSuccess?.();
    } catch {
      setFundingStatus({
        success: false,
        message: 'Failed to fund escrow',
      });
      toast.error('Failed to fund escrow');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingEscrow) {
    return (
      <Card>
        <CardContent className='py-6'>
          <div className='flex items-center justify-center gap-2'>
            <Loader2 className='h-5 w-5 animate-spin text-gray-400' />
            <span className='text-sm text-gray-400'>
              Loading escrow data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              <AlertCircle className='h-5 w-5 text-red-600' />
            )}
            <CardTitle
              className={
                fundingStatus.success ? 'text-green-800' : 'text-red-800'
              }
            >
              {fundingStatus.success
                ? 'Project Funded Successfully!'
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
      </Card>
    );
  }

  if (!pool) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fund Project</CardTitle>
          <CardDescription>
            Escrow data not found for this project.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Fund Project Escrow</CardTitle>
          <CardDescription>
            Fund the escrow to support this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  Pool Status:
                </span>
                <span className='text-sm'>
                  {pool.locked ? 'Locked' : 'Open'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-700'>
                  Total Deposited:
                </span>
                <span className='font-mono text-lg font-semibold'>
                  {pool.totalDeposited}
                </span>
              </div>
            </div>

            <Button
              onClick={handleFundEscrow}
              disabled={isLoading || !walletAddress}
              className='w-full'
              size='lg'
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Funding Project...
                </>
              ) : (
                <>
                  <DollarSign className='mr-2 h-4 w-4' />
                  Fund Project
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
