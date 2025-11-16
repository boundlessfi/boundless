import { kit } from '@/lib/config/wallet-kit';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { ISupportedWallet } from '@creit.tech/stellar-wallets-kit';

// Type exports for compatibility
export type StellarNetwork = 'testnet' | 'public';

// Stub exports for backward compatibility (these may not be fully implemented)
export const useWalletStore = () => {
  const { walletAddress, walletName } = useWalletContext();
  return {
    network: 'testnet' as StellarNetwork,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initializeWalletKit: async (_network?: StellarNetwork) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    connectWallet: async (_walletId?: string) => {},
    disconnectWallet: async () => {},
    clearError: () => {},
  };
};

export const useWalletInfo = () => {
  const { walletAddress, walletName } = useWalletContext();
  return { address: walletAddress, name: walletName };
};

export const useWalletSigning = () => {
  // Placeholder - implement if needed
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signTransaction: async (_xdr: string) => {
      throw new Error('useWalletSigning is not implemented.');
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signMessage: async (_message: string) => {
      throw new Error('useWalletSigning is not implemented.');
    },
  };
};

export const useAutoReconnect = () => {
  // Placeholder - implement if needed
  return { isReconnecting: false, reconnect: async () => {} };
};

export const useNetworkSwitcher = () => {
  // Placeholder - implement if needed
  return {
    switchNetwork: async () => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    switchToNetwork: async (_network: StellarNetwork) => {},
    currentNetwork: 'testnet' as StellarNetwork,
  };
};

/**
 * Custom hook that provides wallet connection and disconnection functionality
 * Integrates with the Stellar Wallet Kit and manages wallet state through context
 */
export const useWallet = () => {
  // Get wallet management functions from the context
  const { setWalletInfo, clearWalletInfo } = useWalletContext();

  /**
   * Connect to a Stellar wallet using the Wallet Kit
   * Opens a modal for wallet selection and handles the connection process
   * Automatically sets wallet information in the context upon successful connection
   */
  const connectWallet = async () => {
    await kit.openModal({
      modalTitle: 'Connect to your favorite wallet',
      onWalletSelected: async (option: ISupportedWallet) => {
        // Set the selected wallet as the active wallet
        kit.setWallet(option.id);

        // Get the wallet address and name
        const { address } = await kit.getAddress();
        const { name } = option;

        // Store wallet information in the context and localStorage
        setWalletInfo(address, name);
      },
    });
  };

  /**
   * Disconnect from the current wallet
   * Clears wallet information from the context and localStorage
   * Disconnects the wallet from the Stellar Wallet Kit
   */
  const disconnectWallet = async () => {
    await kit.disconnect();
    clearWalletInfo();
  };

  /**
   * Handle wallet connection with error handling
   * Wraps the connectWallet function in a try-catch block for better error management
   */
  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch {
      // You can add additional error handling here, such as showing user notifications
    }
  };

  /**
   * Handle wallet disconnection with error handling
   * Wraps the disconnectWallet function in a try-catch block for better error management
   */
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch {
      // You can add additional error handling here, such as showing user notifications
    }
  };

  return {
    connectWallet,
    disconnectWallet,
    handleConnect,
    handleDisconnect,
  };
};
