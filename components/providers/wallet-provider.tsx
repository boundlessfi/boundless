import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { walletApi } from '@/lib/api/wallet';
import type {
  SupportedTrustlineAsset,
  ActiveAddressResponse,
} from '@/lib/api/wallet';
import { WalletBalance, WalletTransaction } from '@/types/wallet';
import { fetchSacTokenBalance } from '@/lib/smart-wallet/client';
import { networkCurrencies } from '@/lib/smart-wallet/config';

type WalletType = 'smart' | 'custodial';

type WalletContextType = {
  /** The active wallet address (smart wallet preferred, custodial fallback). */
  walletAddress: string | null;
  walletName: string | null;
  /** The active wallet type: 'smart' or 'custodial'. */
  walletType: WalletType | null;
  /** Smart wallet address (C...) if registered. */
  smartWalletAddress: string | null;
  /** Custodial wallet address (G...) as fallback. */
  custodialWalletAddress: string | null;
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
  isWalletOpen: boolean;
  onOpenWallet: () => void;
  onCloseWallet: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { session: authSession } = useAuthContext();
  const { data: session, isPending: isSessionLoading } = authSession;

  const [activeAddress, setActiveAddress] =
    useState<ActiveAddressResponse | null>(null);
  const [walletDetails, setWalletDetails] = useState<{
    address: string;
    balances: WalletBalance[];
    transactions: WalletTransaction[];
  } | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      // Fetch active address (prefers smart wallet) and wallet details in parallel
      const [activeAddr, details] = await Promise.all([
        walletApi.getActiveAddress().catch(() => null),
        walletApi.getWalletDetails(),
      ]);

      setActiveAddress(activeAddr);
      setWalletDetails({
        address: activeAddr?.address ?? details.address,
        balances: details.balances ?? [],
        transactions: details.transactions ?? [],
      });
    } catch {
      setWalletDetails(null);
      setActiveAddress(null);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSessionLoading) return;
    if (!session?.user) {
      setWalletDetails(null);
      setActiveAddress(null);
      setWalletLoading(false);
      return;
    }
    fetchWallet();
  }, [session?.user, isSessionLoading, fetchWallet]);

  // On-chain SAC token balances for smart wallets
  const [onChainBalances, setOnChainBalances] = useState<WalletBalance[]>([]);

  // Derive wallet address: prefer smart wallet from activeAddress, fall back to details
  const walletType = activeAddress?.type ?? null;
  const walletAddress =
    activeAddress?.address ?? walletDetails?.address ?? null;
  const smartWalletAddress = activeAddress?.smartWallet ?? null;
  const custodialWalletAddress =
    activeAddress?.custodialWallet ?? walletDetails?.address ?? null;

  const walletName = walletAddress
    ? walletType === 'smart'
      ? 'Smart Wallet'
      : 'Boundless Wallet'
    : null;

  // Fetch on-chain SAC token balances when smart wallet is active
  const fetchOnChainBalances = useCallback(async (address: string) => {
    const currencies = Object.values(networkCurrencies);
    const results: WalletBalance[] = [];
    await Promise.all(
      currencies.map(async currency => {
        try {
          const bal = await fetchSacTokenBalance(
            currency.tokenAddress,
            address
          );
          if (bal !== '0.00') {
            const balNum = parseFloat(bal);
            // Stablecoins are pegged ~1:1 to their fiat currency
            const isStable = ['USDC', 'USDGLO'].includes(currency.code);
            const isEurc = currency.code === 'EURC';
            const usdPrice = isStable ? 1 : isEurc ? 1.08 : undefined;
            const usdValue =
              usdPrice !== undefined ? balNum * usdPrice : undefined;

            results.push({
              asset_type:
                currency.issuer === 'native'
                  ? 'native'
                  : currency.code.length <= 4
                    ? 'credit_alphanum4'
                    : 'credit_alphanum12',
              asset_code:
                currency.issuer === 'native' ? undefined : currency.code,
              asset_issuer:
                currency.issuer === 'native' ? undefined : currency.issuer,
              asset_name: currency.name,
              balance: bal,
              usdPrice,
              usdValue,
            });
          }
        } catch {
          // skip on error
        }
      })
    );
    setOnChainBalances(results);
  }, []);

  useEffect(() => {
    if (walletType === 'smart' && smartWalletAddress) {
      fetchOnChainBalances(smartWalletAddress);
    } else {
      setOnChainBalances([]);
    }
  }, [walletType, smartWalletAddress, fetchOnChainBalances]);

  const refreshWallet = useCallback(async () => {
    if (!session?.user) return;
    setWalletLoading(true);
    try {
      const [activeAddr, details] = await Promise.all([
        walletApi.getActiveAddress().catch(() => null),
        walletApi.getWalletDetails(),
      ]);

      setActiveAddress(activeAddr);
      setWalletDetails({
        address: activeAddr?.address ?? details.address,
        balances: details.balances ?? [],
        transactions: details.transactions ?? [],
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
    // Re-fetch on-chain balances for smart wallet
    if (smartWalletAddress && walletType === 'smart') {
      await fetchOnChainBalances(smartWalletAddress);
    }
  }, [refreshWallet, smartWalletAddress, walletType, fetchOnChainBalances]);

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
    setActiveAddress(null);
    // Disconnect only clears local UI state; backend still has the user's wallet.
  }, []);

  // Merge API balances with on-chain balances (on-chain takes precedence for smart wallets)
  const apiBalances = walletDetails?.balances ?? [];
  const balances =
    walletType === 'smart' && onChainBalances.length > 0
      ? onChainBalances
      : apiBalances;
  const transactions = walletDetails?.transactions ?? [];
  const totalPortfolioValue = balances.reduce(
    (acc, asset) => acc + (asset.usdValue ?? 0),
    0
  );
  const isLoading = isSessionLoading || walletLoading;
  const hasWalletFromSession = !!session?.user?.wallet?.address;

  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const onOpenWallet = useCallback(() => {
    setIsWalletOpen(true);
  }, []);

  const onCloseWallet = useCallback(() => {
    setIsWalletOpen(false);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletName,
        walletType,
        smartWalletAddress,
        custodialWalletAddress,
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
        isWalletOpen,
        onOpenWallet,
        onCloseWallet,
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
