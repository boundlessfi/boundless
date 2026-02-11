'use client';

import { useState } from 'react';
import { FamilyWalletButton } from './FamilyWalletButton';
import { FamilyWalletDrawer, DrawerView } from './FamilyWalletDrawer';
import { useAuthStatus } from '@/hooks/use-auth';

export function LandingWalletWrapper() {
  const [open, setOpen] = useState(false);
  const [drawerView, setDrawerView] = useState<DrawerView>('main');
  const { isAuthenticated, isLoading } = useAuthStatus();

  if (isLoading || !isAuthenticated) {
    return null;
  }

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
