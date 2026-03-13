'use client';

import { useState } from 'react';
import { FamilyWalletButton } from './FamilyWalletButton';
import { FamilyWalletDrawer, DrawerView } from './FamilyWalletDrawer';
import { useAuthStatus } from '@/hooks/use-auth';
import { useWalletContext } from '@/components/providers/wallet-provider';

export function LandingWalletWrapper() {
  const [drawerView, setDrawerView] = useState<DrawerView>('main');
  const { isAuthenticated, isLoading } = useAuthStatus();
  const { isWalletOpen, onOpenWallet, onCloseWallet } = useWalletContext();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <FamilyWalletButton
        onOpenDrawer={view => {
          if (view) setDrawerView(view);
          onOpenWallet();
        }}
      />
      <FamilyWalletDrawer
        open={isWalletOpen}
        initialView={drawerView}
        onOpenChange={onCloseWallet}
      />
    </>
  );
}
