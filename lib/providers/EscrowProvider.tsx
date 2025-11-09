'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MultiReleaseEscrow } from '@trustless-work/escrow';

interface EscrowContextValue {
  contractId: string | null;
  escrow: MultiReleaseEscrow | null;
  setEscrowData: (contractId: string, escrow: MultiReleaseEscrow) => void;
  updateEscrow: (updatedEscrow: MultiReleaseEscrow) => void;
  clearEscrowData: () => void;
}

const EscrowContext = createContext<EscrowContextValue | undefined>(undefined);

interface EscrowProviderProps {
  children: ReactNode;
}

/**
 * Escrow Provider
 *
 * Manages escrow data and contractId from Trustless Work transactions.
 * Stores the escrow object returned directly from sendTransaction.
 */
export function EscrowProvider({ children }: EscrowProviderProps) {
  const [contractId, setContractId] = useState<string | null>(null);
  const [escrow, setEscrow] = useState<MultiReleaseEscrow | null>(null);

  const setEscrowData = (
    newContractId: string,
    newEscrow: MultiReleaseEscrow
  ) => {
    setContractId(newContractId);
    setEscrow(newEscrow);
  };

  const updateEscrow = (updatedEscrow: MultiReleaseEscrow) => {
    setEscrow(updatedEscrow);
  };

  const clearEscrowData = () => {
    setContractId(null);
    setEscrow(null);
  };

  return (
    <EscrowContext.Provider
      value={{
        contractId,
        escrow,
        setEscrowData,
        updateEscrow,
        clearEscrowData,
      }}
    >
      {children}
    </EscrowContext.Provider>
  );
}

/**
 * Hook to access escrow context
 *
 * @returns EscrowContextValue - The escrow context value
 * @throws Error if used outside of EscrowProvider
 */
export function useEscrowContext(): EscrowContextValue {
  const context = useContext(EscrowContext);

  if (context === undefined) {
    throw new Error('useEscrowContext must be used within an EscrowProvider');
  }

  return context;
}
