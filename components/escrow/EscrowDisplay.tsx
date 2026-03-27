'use client';

import { useState, useEffect } from 'react';
import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import { getSlot, type EscrowSlot } from '@/lib/api/escrow';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/wallet-utils';

/**
 * Component to display escrow pool details from the backend CoreEscrow contract.
 */
export const EscrowDisplay = () => {
  const { poolId, pool, clearPoolData } = useEscrowContext();
  const [slots, setSlots] = useState<EscrowSlot[]>([]);

  useEffect(() => {
    if (!poolId) return;
    // Try to fetch first 10 slots (best-effort)
    const fetchSlots = async () => {
      const fetched: EscrowSlot[] = [];
      for (let i = 0; i < 10; i++) {
        try {
          const slot = await getSlot(poolId, i);
          fetched.push(slot);
        } catch {
          break; // No more slots
        }
      }
      setSlots(fetched);
    };
    fetchSlots();
  }, [poolId]);

  if (!poolId || !pool) {
    return null;
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Copied to clipboard');
  };

  const getStellarViewerUrl = (id: string): string => {
    const network =
      process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public' ||
      process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
        ? 'public'
        : 'testnet';
    return `https://stellar.expert/explorer/${network}/contract/${id}`;
  };

  return (
    <div className='space-y-6'>
      {/* Success Header */}
      <Card className='border-green-200 bg-green-50'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-5 w-5 text-green-600' />
            <CardTitle className='text-green-800'>Escrow Pool Active</CardTitle>
          </div>
          <CardDescription className='text-green-700'>
            On-chain CoreEscrow pool data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <p className='mb-1 text-sm font-medium text-gray-700'>Pool ID:</p>
              <div className='flex items-center gap-2'>
                <code className='rounded bg-gray-100 px-3 py-1.5 font-mono text-sm'>
                  {poolId}
                </code>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleCopyAddress(poolId)}
                  className='h-8 w-8 p-0'
                >
                  <Copy className='h-4 w-4' />
                </Button>
              </div>
            </div>
            <a
              href={getStellarViewerUrl(poolId)}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline'
            >
              <ExternalLink className='h-4 w-4' />
              View on Stellar
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Pool Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pool Information</CardTitle>
          <CardDescription>On-chain escrow pool state</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Module
              </label>
              <p className='mt-1 text-sm'>{pool.module}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>
                Status
              </label>
              <p className='mt-1'>
                <Badge variant={pool.locked ? 'default' : 'outline'}>
                  {pool.locked ? 'Locked' : 'Open'}
                </Badge>
              </p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>Owner</label>
              <div className='mt-1 flex items-center gap-2'>
                <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                  {formatAddress(pool.owner)}
                </code>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleCopyAddress(pool.owner)}
                  className='h-6 w-6 p-0'
                >
                  <Copy className='h-3 w-3' />
                </Button>
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-500'>Asset</label>
              <div className='mt-1 flex items-center gap-2'>
                <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                  {formatAddress(pool.asset)}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-500'>
              Total Deposited
            </span>
            <span className='font-mono text-sm'>{pool.totalDeposited}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-500'>
              Total Released
            </span>
            <span className='font-mono text-sm text-green-700'>
              {pool.totalReleased}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-500'>
              Total Refunded
            </span>
            <span className='font-mono text-sm text-red-700'>
              {pool.totalRefunded}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Release Slots */}
      {slots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Release Slots</CardTitle>
            <CardDescription>Milestone release slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className='rounded-lg border border-gray-200 bg-gray-50 p-4'
                >
                  <div className='mb-3 flex items-center justify-between'>
                    <Badge variant='outline' className='font-mono'>
                      Slot {index + 1}
                    </Badge>
                    {slot.released && (
                      <Badge variant='default' className='bg-blue-600'>
                        Released
                      </Badge>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <div>
                      <label className='text-xs font-medium text-gray-500'>
                        Amount
                      </label>
                      <p className='mt-1 font-mono text-sm'>{slot.amount}</p>
                    </div>
                    <div>
                      <label className='text-xs font-medium text-gray-500'>
                        Recipient
                      </label>
                      <div className='mt-1 flex items-center gap-2'>
                        <code className='rounded bg-gray-100 px-2 py-1 font-mono text-xs'>
                          {formatAddress(slot.recipient)}
                        </code>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleCopyAddress(slot.recipient)}
                          className='h-6 w-6 p-0'
                        >
                          <Copy className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className='flex justify-end'>
        <Button variant='outline' onClick={clearPoolData}>
          Clear Escrow Data
        </Button>
      </div>
    </div>
  );
};
