import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authClient } from '@/lib/auth-client';
import { WalletBalance, WalletTransaction } from '@/types/wallet';

/**
 * Type definition for the wallet context
 * Contains wallet address, name, and functions to manage wallet state
 */
type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  balances: WalletBalance[];
  transactions: WalletTransaction[];
  totalPortfolioValue: number;
  isLoading: boolean;
  setWalletInfo: (address: string, name: string) => void;
  clearWalletInfo: () => void;
};

/**
 * Create the React context for wallet state management
 */
const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Wallet Provider component that wraps the application
 * Manages wallet state and provides wallet information to child components
 * Automatically loads saved wallet information from localStorage on initialization
 */
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const [localWalletAddress, setLocalWalletAddress] = useState<string | null>(
    null
  );
  const [localWalletName, setLocalWalletName] = useState<string | null>(null);

  /**
   * Load saved wallet information from localStorage when the component mounts
   * This ensures the wallet state persists across browser sessions
   */
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    const storedName = localStorage.getItem('walletName');

    if (storedAddress) setLocalWalletAddress(storedAddress);
    if (storedName) setLocalWalletName(storedName);
  }, []);

  /**
   * Set wallet information and save it to localStorage
   * This function is called when a wallet is successfully connected
   *
   * @param address - The wallet's public address
   * @param name - The name/identifier of the wallet (e.g., "Freighter", "Albedo")
   */
  const setWalletInfo = (address: string, name: string) => {
    setLocalWalletAddress(address);
    setLocalWalletName(name);
    localStorage.setItem('walletAddress', address);
    localStorage.setItem('walletName', name);
  };

  /**
   * Clear wallet information and remove it from localStorage
   * This function is called when disconnecting a wallet
   */
  const clearWalletInfo = () => {
    setLocalWalletAddress(null);
    setLocalWalletName(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletName');
  };

  // Derive wallet data from session (priority) or local state
  const walletAddress = session?.user?.wallet?.address || localWalletAddress;
  const walletName = session?.user?.wallet?.address
    ? 'Boundless Wallet'
    : localWalletName;

  // Cast the wallet properties to their formatted types if they exist in the session
  // We use 'any' casting here because the inferred type from auth-client might not strictly match our interfaces yet
  const balances =
    (session?.user?.wallet?.balances as unknown as WalletBalance[]) || [];
  const transactions =
    (session?.user?.wallet?.transactions as unknown as WalletTransaction[]) ||
    [];

  // Calculate total portfolio value derived from USD values of all balances
  const totalPortfolioValue = balances.reduce(
    (acc, asset) => acc + (asset.usdValue || 0),
    0
  );

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletName,
        balances,
        transactions,
        totalPortfolioValue,
        isLoading: isSessionLoading,
        setWalletInfo,
        clearWalletInfo,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

/**
 * Custom hook to access the wallet context
 * Provides wallet state and functions to components
 * Throws an error if used outside of WalletProvider
 */
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
};
