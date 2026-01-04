'use client';

import { createContext, useContext, ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';

const AuthContext = createContext<ReturnType<
  typeof authClient.useSession
> | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
