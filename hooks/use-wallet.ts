import { useWalletContext } from '@/components/providers/wallet-provider';
import { useSmartWallet } from '@/components/providers/smart-wallet-provider';
import { getCurrentNetwork } from '@/lib/wallet-utils';

export type StellarNetwork = 'testnet' | 'public';

export const useWalletStore = () => {
  const { walletAddress, walletName, walletType, clearWalletInfo } =
    useWalletContext();
  const smartWallet = useSmartWallet();

  // Smart wallet is the primary wallet. WalletProvider already resolves this,
  // but we also check the local smart wallet state for immediate reactivity
  // (e.g. right after connect, before backend refresh).
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
    selectedWallet: smartWallet.contractId
      ? 'Smart Wallet'
      : walletType === 'smart'
        ? 'Smart Wallet'
        : walletName,
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
  const { walletAddress, walletType, smartWalletAddress } = useWalletContext();
  const smartWallet = useSmartWallet();

  // Prefer local smart wallet state for immediate reactivity
  const address = smartWallet.contractId || smartWalletAddress || walletAddress;
  const isSmartWallet = !!(smartWallet.contractId || walletType === 'smart');

  return {
    address,
    name: isSmartWallet ? 'Smart Wallet' : 'Boundless Wallet',
    type: isSmartWallet ? ('smart' as const) : ('custodial' as const),
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
 * Smart wallet (passkey-based) is the default and preferred method.
 * Custodial wallet is a backend-managed fallback.
 */
export const useWallet = () => {
  const { clearWalletInfo, refreshWallet } = useWalletContext();
  const smartWallet = useSmartWallet();

  const connectWallet = async () => {
    if (smartWallet.isAvailable) {
      await smartWallet.connect();
      // Refresh the wallet provider to pick up the new smart wallet address
      await refreshWallet();
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
