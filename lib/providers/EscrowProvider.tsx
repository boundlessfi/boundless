'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { EscrowPool } from '@/lib/api/escrow';

interface EscrowContextValue {
  poolId: string | null;
  pool: EscrowPool | null;
  setPoolData: (poolId: string, pool: EscrowPool) => void;
  updatePool: (pool: EscrowPool) => void;
  clearPoolData: () => void;
  /** @deprecated Use poolId/pool instead. Kept for transitional compat. */
  contractId: string | null;
}

const EscrowContext = createContext<EscrowContextValue | undefined>(undefined);

interface EscrowProviderProps {
  children: ReactNode;
}

/**
 * Escrow Provider
 *
 * Manages escrow pool data from the Boundless backend (CoreEscrow contract).
 * Replaces the previous Trustless Work-based EscrowProvider.
 */
export function EscrowProvider({ children }: EscrowProviderProps) {
  const [poolId, setPoolId] = useState<string | null>(null);
  const [pool, setPool] = useState<EscrowPool | null>(null);

  const setPoolData = (newPoolId: string, newPool: EscrowPool) => {
    setPoolId(newPoolId);
    setPool(newPool);
  };

  const updatePool = (updatedPool: EscrowPool) => {
    setPool(updatedPool);
  };

  const clearPoolData = () => {
    setPoolId(null);
    setPool(null);
  };

  return (
    <EscrowContext.Provider
      value={{
        poolId,
        pool,
        setPoolData,
        updatePool,
        clearPoolData,
        contractId: poolId,
      }}
    >
      {children}
    </EscrowContext.Provider>
  );
}

/**
 * Hook to access escrow context
 */
export function useEscrowContext(): EscrowContextValue {
  const context = useContext(EscrowContext);

  if (context === undefined) {
    throw new Error('useEscrowContext must be used within an EscrowProvider');
  }

  return context;
}
