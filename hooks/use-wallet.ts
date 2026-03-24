import { useWalletContext } from '@/components/providers/wallet-provider';
import { useSmartWallet } from '@/components/providers/smart-wallet-provider';
import { getCurrentNetwork } from '@/lib/wallet-utils';

export type StellarNetwork = 'testnet' | 'public';

export const useWalletStore = () => {
  const { walletAddress, walletName, clearWalletInfo } = useWalletContext();
  const smartWallet = useSmartWallet();

  // Prefer smart wallet address if connected, otherwise fall back to custodial
  const effectiveAddress = smartWallet.contractId || walletAddress;

  return {
    network: getCurrentNetwork() as StellarNetwork,
    availableWallets: [] as Array<{
      id: string;
      name: string;
      icon: string;
      isAvailable: boolean;
    }>,
    isConnected: !!effectiveAddress,
    isLoading: smartWallet.isLoading,
    error: smartWallet.error,
    selectedWallet: smartWallet.contractId ? 'Smart Wallet' : walletName,
    initializeWalletKit: async (_network?: StellarNetwork) => {},
    connectWallet: async (_walletId?: string) => {
      if (smartWallet.isAvailable) {
        await smartWallet.connect();
      }
    },
    disconnectWallet: async () => {
      smartWallet.disconnect();
      clearWalletInfo();
    },
    clearError: () => {},
  };
};

export const useWalletInfo = () => {
  const { walletAddress, walletName } = useWalletContext();
  const smartWallet = useSmartWallet();
  return {
    address: smartWallet.contractId || walletAddress,
    name: smartWallet.contractId ? 'Smart Wallet' : walletName,
  };
};

export const useWalletSigning = () => {
  const smartWallet = useSmartWallet();
  return {
    signTransaction: async (xdr: string) => {
      if (!smartWallet.contractId) {
        throw new Error(
          'No smart wallet connected. Register or connect a passkey wallet first.'
        );
      }
      const { signTransaction } = await import('@/lib/config/wallet-kit');
      return signTransaction({
        unsignedTransaction: xdr,
        address: smartWallet.contractId,
      });
    },
    signMessage: async (_message: string) => {
      throw new Error(
        'Message signing is not supported for smart wallets. Use signTransaction instead.'
      );
    },
  };
};

export const useAutoReconnect = () => {
  return { isReconnecting: false, reconnect: async () => {} };
};

export const useNetworkSwitcher = () => {
  return {
    switchNetwork: async () => {},
    switchToNetwork: async (_network: StellarNetwork) => {},
    currentNetwork: getCurrentNetwork() as StellarNetwork,
  };
};

/**
 * Wallet connection and disconnection.
 * Smart wallet: uses passkey-based connect/register.
 * Custodial: backend-managed, disconnect clears local UI state only.
 */
export const useWallet = () => {
  const { clearWalletInfo } = useWalletContext();
  const smartWallet = useSmartWallet();

  const connectWallet = async () => {
    if (smartWallet.isAvailable) {
      await smartWallet.connect();
    }
  };

  const disconnectWallet = async () => {
    smartWallet.disconnect();
    clearWalletInfo();
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch {
      // No-op
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch {
      // No-op
    }
  };

  return {
    connectWallet,
    disconnectWallet,
    handleConnect,
    handleDisconnect,
  };
};
