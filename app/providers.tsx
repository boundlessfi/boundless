'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SocketProvider } from '@/components/providers/socket-provider';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { MessagesProvider } from '@/components/messages/MessagesProvider';
import { TrustlessWorkProvider } from '@/lib/providers/TrustlessWorkProvider';
import { EscrowProvider } from '@/lib/providers/EscrowProvider';
import { AuthModalProvider } from '@/components/auth/AuthModalProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthModalProvider>
          <SocketProvider>
            <WalletProvider>
              <MessagesProvider>
                <TrustlessWorkProvider>
                  <EscrowProvider>{children}</EscrowProvider>
                </TrustlessWorkProvider>
              </MessagesProvider>
            </WalletProvider>
          </SocketProvider>
        </AuthModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
