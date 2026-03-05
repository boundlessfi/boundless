'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SocketProvider } from '@/components/providers/socket-provider';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { MessagesProvider } from '@/components/messages/MessagesProvider';
import { TrustlessWorkProvider } from '@/lib/providers/TrustlessWorkProvider';
import { EscrowProvider } from '@/lib/providers/EscrowProvider';
interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <SocketProvider>
        <WalletProvider>
          <MessagesProvider>
            <TrustlessWorkProvider>
              <EscrowProvider>{children}</EscrowProvider>
            </TrustlessWorkProvider>
          </MessagesProvider>
        </WalletProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
