'use client';

import React from 'react';
import { Wallet } from 'lucide-react';

export const WalletConnectionWarning: React.FC = () => {
  return (
    <div className='rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4'>
      <div className='flex items-start gap-3'>
        <Wallet className='mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400' />
        <div className='flex-1'>
          <h4 className='mb-1 text-sm font-semibold text-yellow-400'>
            Wallet Not Connected
          </h4>
          <p className='text-xs text-yellow-300/80'>
            You need to connect your wallet to publish the hackathon and lock
            funds in escrow.
          </p>
        </div>
      </div>
    </div>
  );
};
