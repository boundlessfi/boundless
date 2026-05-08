'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useEscrowContext } from '@/lib/providers/EscrowProvider';
import { initializeEscrow, getPool } from '@/lib/api/escrow';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { reportError } from '@/lib/error-reporting';

/**
 * Component to initialize a multi-release escrow via the backend CoreEscrow contract.
 */
export const InitializeEscrowButton = () => {
  const walletAddress = useWalletStore(s => s.contractId);
  const { setPoolData } = useEscrowContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleInitializeEscrow = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);

    try {
      // Initialize escrow via backend API
      const result = await initializeEscrow({
        module: 'Crowdfund',
        totalAmount: '60000000', // 6 USDC in stroops
        milestones: [
          {
            recipient: walletAddress,
            amount: '10000000', // 1 USDC
          },
          {
            recipient: walletAddress,
            amount: '20000000', // 2 USDC
          },
          {
            recipient: walletAddress,
            amount: '30000000', // 3 USDC
          },
        ],
      });

      // Fetch the full pool data
      const pool = await getPool(result.poolId);
      setPoolData(result.poolId, pool);
      toast.success('Escrow initialized successfully!');
    } catch (err) {
      reportError(err, { context: 'escrow-initialize' });
      toast.error('Failed to initialize escrow');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleInitializeEscrow}
      disabled={isLoading || !walletAddress}
      className='min-w-[200px]'
    >
      {isLoading ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Initializing Escrow...
        </>
      ) : (
        'Initialize Multi-Release Escrow'
      )}
    </Button>
  );
};
