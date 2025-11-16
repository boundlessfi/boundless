import { useState } from 'react';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { toast } from 'sonner';

interface UseWalletProtectionOptions {
  actionName?: string;
  showModal?: boolean;
}

export function useWalletProtection(options: UseWalletProtectionOptions = {}) {
  const { actionName = 'perform this action', showModal = true } = options;
  const { walletAddress } = useWalletContext();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const isConnected = Boolean(walletAddress);

  const requireWallet = async (callback?: () => void) => {
    if (!isConnected || !walletAddress) {
      if (showModal) {
        setShowWalletModal(true);
      } else {
        toast.error(`Wallet connection required to ${actionName}`);
      }
      return false;
    }

    if (callback) {
      callback();
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

  return {
    requireWallet,
    isConnected,
    publicKey: walletAddress,
    showWalletModal,
    handleWalletConnected,
    closeWalletModal,
    isValidating: false,
  };
}
