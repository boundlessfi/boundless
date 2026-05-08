import { useState, useCallback } from 'react';
import { useWalletStore } from '@/lib/stores/walletStore';
import {
  useWalletReadiness,
  WalletNotReadyReason,
} from './use-wallet-readiness';
import { toast } from 'sonner';

interface UseWalletProtectionOptions {
  actionName?: string;
  showModal?: boolean;
}

export function useWalletProtection(options: UseWalletProtectionOptions = {}) {
  const { actionName = 'perform this action', showModal = true } = options;
  const walletAddress = useWalletStore(s => s.contractId);
  const walletType: 'smart' | 'custodial' | null = walletAddress
    ? 'smart'
    : null;
  const { checkReadiness } = useWalletReadiness();

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showNotReadyModal, setShowNotReadyModal] = useState(false);
  const [notReadyReasons, setNotReadyReasons] = useState<
    WalletNotReadyReason[]
  >([]);

  const isConnected = Boolean(walletAddress);

  const requireWallet = async (
    callback?: () => void,
    requiredUsdcAmount: number = 0
  ) => {
    // 1. Check if wallet is connected at all
    if (!isConnected || !walletAddress) {
      if (showModal) {
        setShowWalletModal(true);
      } else {
        toast.error(`Wallet connection required to ${actionName}`);
      }
      return false;
    }

    // 2. Check if wallet is ready (activated, trustlines, balance)
    const result = checkReadiness(requiredUsdcAmount);
    if (!result.isReady) {
      if (showModal) {
        setNotReadyReasons(result.reasons);
        setShowNotReadyModal(true);
      } else {
        toast.error(
          `Wallet not ready to ${actionName}. Please check your activation and balances.`
        );
      }
      return false;
    }

    // 3. All good, proceed
    if (callback) {
      await callback();
    }

    return true;
  };

  const handleWalletConnected = () => {
    setShowWalletModal(false);
    toast.success('Wallet connected successfully!');
  };

  const closeWalletModal = () => {
    setShowWalletModal(false);
  };

  const closeNotReadyModal = () => {
    setShowNotReadyModal(false);
  };

  return {
    requireWallet,
    isConnected,
    publicKey: walletAddress,
    walletType,
    showWalletModal,
    showNotReadyModal,
    notReadyReasons,
    handleWalletConnected,
    closeWalletModal,
    closeNotReadyModal,
    isValidating: false,
  };
}
