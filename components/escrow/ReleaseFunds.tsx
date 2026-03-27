'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import {
  releaseSlot,
  getSlot,
  getPool,
  type EscrowSlot,
} from '@/lib/api/escrow';
import { toast } from 'sonner';
import { reportError } from '@/lib/error-reporting';
import { Loader2, CheckCircle2, Banknote } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Component to release funds for escrow slots via the backend CoreEscrow contract.
 */
export const ReleaseFunds = () => {
  const { poolId, pool, updatePool } = useEscrowContext();
  const [isLoading, setIsLoading] = useState(false);
  const [slots, setSlots] = useState<(EscrowSlot & { index: number })[]>([]);
  const [releasedIndex, setReleasedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!poolId) return;
    const fetchSlots = async () => {
      const fetched: (EscrowSlot & { index: number })[] = [];
      for (let i = 0; i < 10; i++) {
        try {
          const slot = await getSlot(poolId, i);
          fetched.push({ ...slot, index: i });
        } catch {
          break;
        }
      }
      setSlots(fetched);
    };
    fetchSlots();
  }, [poolId]);

  const handleRelease = async (slotIndex: number) => {
    if (!poolId) return;

    setIsLoading(true);
    setReleasedIndex(null);

    try {
      await releaseSlot({ poolId, slotIndex });

      // Refresh data
      const updatedPool = await getPool(poolId);
      updatePool(updatedPool);

      try {
        const updatedSlot = await getSlot(poolId, slotIndex);
        setSlots(prev =>
          prev.map(s =>
            s.index === slotIndex ? { ...updatedSlot, index: slotIndex } : s
          )
        );
      } catch {
        // Slot might not exist anymore
      }

      setReleasedIndex(slotIndex);
      toast.success(`Slot ${slotIndex + 1} funds released!`);
    } catch (err) {
      reportError(err, { context: 'escrow-release' });
      toast.error('Failed to release funds');
    } finally {
      setIsLoading(false);
    }
  };

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
          <Banknote className='h-5 w-5' />
          Release Funds
        </CardTitle>
        <CardDescription>Release funds from milestone slots</CardDescription>
      </CardHeader>
      <CardContent>
        {slots.length === 0 ? (
          <p className='text-sm text-gray-500'>No release slots found.</p>
        ) : (
          <div className='space-y-3'>
            {slots.map(slot => (
              <div
                key={slot.index}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium'>
                      Slot {slot.index + 1}
                    </span>
                    {slot.released ? (
                      <Badge variant='default' className='bg-blue-600'>
                        Released
                      </Badge>
                    ) : (
                      <Badge variant='outline'>Pending</Badge>
                    )}
                    {releasedIndex === slot.index && (
                      <CheckCircle2 className='h-4 w-4 text-green-600' />
                    )}
                  </div>
                  <p className='mt-1 font-mono text-xs text-gray-500'>
                    Amount: {slot.amount}
                  </p>
                </div>
                <Button
                  size='sm'
                  onClick={() => handleRelease(slot.index)}
                  disabled={isLoading || slot.released}
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    'Release'
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
