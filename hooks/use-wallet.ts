import { useWalletContext } from '@/components/providers/wallet-provider';
import { getCurrentNetwork } from '@/lib/wallet-utils';

export type StellarNetwork = 'testnet' | 'public';

export const useWalletStore = () => {
  const { walletAddress, walletName, clearWalletInfo } = useWalletContext();
  return {
    network: getCurrentNetwork() as StellarNetwork,
    availableWallets: [] as Array<{
      id: string;
      name: string;
      icon: string;
      isAvailable: boolean;
    }>,
    isConnected: !!walletAddress,
    isLoading: false,
    error: null as string | null,
    selectedWallet: walletName,
    initializeWalletKit: async (_network?: StellarNetwork) => {},
    connectWallet: async (_walletId?: string) => {},
    disconnectWallet: async () => {
      clearWalletInfo();
    },
    clearError: () => {},
  };
};

export const useWalletInfo = () => {
  const { walletAddress, walletName } = useWalletContext();
  return { address: walletAddress, name: walletName };
};

export const useWalletSigning = () => {
  return {
    signTransaction: async (_xdr: string) => {
      throw new Error('useWalletSigning is not implemented.');
    },
    signMessage: async (_message: string) => {
      throw new Error('useWalletSigning is not implemented.');
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
 * Wallet connection and disconnection. Wallet is managed by the backend;
 * there is no external "connect wallet" flow. Disconnect only clears local UI state.
 */
export const useWallet = () => {
  const { clearWalletInfo } = useWalletContext();

  const connectWallet = async () => {
    // No-op: no external wallet connection; wallet comes from backend.
  };

  const disconnectWallet = async () => {
    clearWalletInfo();
    // Disconnect only clears local UI state; backend still has the user's wallet.
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
