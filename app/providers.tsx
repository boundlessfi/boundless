'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SessionProvider } from '@/components/providers/AuthProvider';
import { SocketProvider } from '@/components/providers/socket-provider';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { SmartWalletProvider } from '@/components/providers/smart-wallet-provider';
import { OnboardingGuardProvider } from '@/components/providers/onboarding-guard-provider';
import { MessagesProvider } from '@/components/messages/MessagesProvider';
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
        <SessionProvider>
          <AuthModalProvider>
            <SocketProvider>
              <WalletProvider>
                <SmartWalletProvider>
                  <OnboardingGuardProvider>
                    <MessagesProvider>
                      <EscrowProvider>{children}</EscrowProvider>
                    </MessagesProvider>
                  </OnboardingGuardProvider>
                </SmartWalletProvider>
              </WalletProvider>
            </SocketProvider>
          </AuthModalProvider>
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
