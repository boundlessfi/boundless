'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HackathonEscrowData } from '@/types/hackathon';

interface EscrowStatusCardProps {
  escrow: HackathonEscrowData | null;
  isLoading?: boolean;
}

export default function EscrowStatusCard({
  escrow,
  isLoading,
}: EscrowStatusCardProps) {
  const formatAmount = (amount: number) => amount.toFixed(2);

  return (
    <Card className='bg-background-card border-gray-900'>
      <CardContent>
        <p className='text-sm text-gray-400'>Balance</p>
        <p className='text-lg font-semibold text-white'>
          {isLoading || !escrow ? '—' : `$${formatAmount(escrow.balance)} USDC`}
        </p>
      </CardContent>
    </Card>
  );
}
