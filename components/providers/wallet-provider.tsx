import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authClient } from '@/lib/auth-client';
import { walletApi } from '@/lib/api/wallet';
import type { SupportedTrustlineAsset } from '@/lib/api/wallet';
import { WalletBalance, WalletTransaction } from '@/types/wallet';

type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  balances: WalletBalance[];
  transactions: WalletTransaction[];
  totalPortfolioValue: number;
  isLoading: boolean;
  /** True when session indicates user has a wallet (for entry-point visibility before API load). */
  hasWalletFromSession: boolean;
  setWalletInfo: (address: string, name: string) => void;
  clearWalletInfo: () => void;
  refreshWallet: () => Promise<void>;
  syncWallet: () => Promise<void>;
  getSupportedTrustlineAssets: () => Promise<SupportedTrustlineAsset[]>;
  addTrustline: (assetCode: string) => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_NAME = 'Boundless Wallet';

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const [walletDetails, setWalletDetails] = useState<{
    address: string;
    balances: WalletBalance[];
    transactions: WalletTransaction[];
  } | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const data = await walletApi.getWalletDetails();
      setWalletDetails({
        address: data.address,
        balances: data.balances ?? [],
        transactions: data.transactions ?? [],
      });
    } catch {
      setWalletDetails(null);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSessionLoading) return;
    if (!session?.user) {
      setWalletDetails(null);
      setWalletLoading(false);
      return;
    }
    fetchWallet();
  }, [session?.user, isSessionLoading, fetchWallet]);

  const refreshWallet = useCallback(async () => {
    if (!session?.user) return;
    setWalletLoading(true);
    try {
      const data = await walletApi.getWalletDetails();
      setWalletDetails({
        address: data.address,
        balances: data.balances ?? [],
        transactions: data.transactions ?? [],
      });
    } catch {
      // Keep previous state on refresh failure
    } finally {
      setWalletLoading(false);
    }
  }, [session?.user]);

  const syncWallet = useCallback(async () => {
    await walletApi.syncWallet();
    await refreshWallet();
  }, [refreshWallet]);

  const getSupportedTrustlineAssets = useCallback((): Promise<
    SupportedTrustlineAsset[]
  > => {
    return walletApi.getSupportedTrustlineAssets();
  }, []);

  const addTrustline = useCallback(
    async (assetCode: string) => {
      await walletApi.addTrustline(assetCode);
      await refreshWallet();
    },
    [refreshWallet]
  );

  const setWalletInfo = useCallback((_address: string, _name: string) => {
    // No-op: wallet is managed by backend; no local storage.
  }, []);

  const clearWalletInfo = useCallback(() => {
    setWalletDetails(null);
    // Disconnect only clears local UI state; backend still has the user's wallet.
  }, []);

  const walletAddress = walletDetails?.address ?? null;
  const walletName = walletAddress ? WALLET_NAME : null;
  const balances = walletDetails?.balances ?? [];
  const transactions = walletDetails?.transactions ?? [];
  const totalPortfolioValue = balances.reduce(
    (acc, asset) => acc + (asset.usdValue ?? 0),
    0
  );
  const isLoading = isSessionLoading || walletLoading;
  const hasWalletFromSession = !!session?.user?.wallet?.address;

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletName,
        balances,
        transactions,
        totalPortfolioValue,
        isLoading,
        hasWalletFromSession,
        setWalletInfo,
        clearWalletInfo,
        refreshWallet,
        syncWallet,
        getSupportedTrustlineAssets,
        addTrustline,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
};
