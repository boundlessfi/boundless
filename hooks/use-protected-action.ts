import { useState, useCallback } from 'react';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { useWalletProtection } from './use-wallet-protection';

interface UseProtectedActionOptions {
  actionName: string;
  onSuccess?: () => void;
  redirectTo?: string;
}

export function useProtectedAction({
  actionName,
  onSuccess,
  redirectTo,
}: UseProtectedActionOptions) {
  const { walletAddress } = useWalletContext();
  const isConnected = Boolean(walletAddress);
  const {
    requireWallet,
    showWalletModal,
    handleWalletConnected,
    closeWalletModal,
  } = useWalletProtection({
    actionName,
    showModal: true,
  });
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const executeProtectedAction = useCallback(
    async (action: () => void | Promise<void>) => {
      if (!isConnected || !walletAddress) {
        setPendingAction(() => action);
        requireWallet();
        return false;
      }

      const isValid = await requireWallet();
      if (!isValid) {
        setPendingAction(() => action);
        return false;
      }

      try {
        await action();
        onSuccess?.();
        return true;
      } catch {
        return false;
      }
    },
    [isConnected, walletAddress, requireWallet, onSuccess]
  );

  const handleWalletConnectedWithRedirect = useCallback(() => {
    handleWalletConnected();
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }

    if (redirectTo) {
      window.location.href = redirectTo;
    }
  }, [handleWalletConnected, pendingAction, redirectTo]);

  const clearPendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  return {
    executeProtectedAction,
    showWalletModal,
    closeWalletModal,
    handleWalletConnected: handleWalletConnectedWithRedirect,
    clearPendingAction,
    hasPendingAction: !!pendingAction,
  };
}
