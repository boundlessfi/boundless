'use client';

import { useEffect } from 'react';
import { useWalletStore } from '@/lib/stores/walletStore';

export function WalletBootstrap() {
  const restoreSession = useWalletStore(s => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
