'use client';

import { useState, useEffect } from 'react';
import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import { getSlot, type EscrowSlot } from '@/lib/api/escrow';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Component to view milestone status.
 * Status changes are now handled by module contracts via the backend API.
 */
export const ChangeMilestoneStatus = () => {
  const { poolId, pool } = useEscrowContext();
  const [slots, setSlots] = useState<(EscrowSlot & { index: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!poolId) return;
    setIsLoading(true);
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
      setIsLoading(false);
    };
    fetchSlots();
  }, [poolId]);

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
        <CardTitle>Milestone Status</CardTitle>
        <CardDescription>
          Milestone status is managed by module contracts via the backend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span className='text-sm text-gray-500'>Loading...</span>
          </div>
        ) : slots.length === 0 ? (
          <p className='text-sm text-gray-500'>No slots found.</p>
        ) : (
          <div className='space-y-3'>
            {slots.map(slot => (
              <div key={slot.index} className='rounded-lg border p-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    Slot {slot.index + 1}
                  </span>
                  <Badge variant={slot.released ? 'default' : 'outline'}>
                    {slot.released ? 'Released' : 'Pending'}
                  </Badge>
                </div>
                <p className='mt-1 font-mono text-xs text-gray-500'>
                  Amount: {slot.amount} | Recipient: {slot.recipient}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
