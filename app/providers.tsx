'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/components/providers/auth-provider';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { TrustlessWorkProvider } from '@/lib/providers/TrustlessWorkProvider';
import { EscrowProvider } from '@/lib/providers/EscrowProvider';
interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <WalletProvider>
        <TrustlessWorkProvider>
          <EscrowProvider>{children}</EscrowProvider>
        </TrustlessWorkProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
