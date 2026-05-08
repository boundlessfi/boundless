'use client';

import { useState } from 'react';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useAuthStatus } from '@/hooks/use-auth';
import { FamilyWalletButton } from './FamilyWalletButton';
import { FamilyWalletDrawer, type DrawerView } from './FamilyWalletDrawer';

export function LandingWalletWrapper() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const isConnected = useWalletStore(s => s.isConnected);
  const [open, setOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>('main');

  if (isLoading || !isAuthenticated || !isConnected) return null;

  return (
    <>
      <FamilyWalletButton
        onOpenDrawer={view => {
          if (view) setDrawerView(view);
          setOpen(true);
        }}
      />
      <FamilyWalletDrawer
        open={open}
        initialView={drawerView}
        onOpenChange={setOpen}
      />
    </>
  );
}
