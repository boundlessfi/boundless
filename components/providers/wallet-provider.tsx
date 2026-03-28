import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { walletApi } from '@/lib/api/wallet';
import type {
  SupportedTrustlineAsset,
  ActiveAddressResponse,
} from '@/lib/api/wallet';
import { WalletBalance, WalletTransaction } from '@/types/wallet';
import {
  useWalletRealtime,
  type WalletUpdatePayload,
} from '@/hooks/use-wallet-realtime';

type WalletType = 'smart' | 'custodial';

/** How often to poll wallet data as a fallback (ms) */
const POLL_INTERVAL_CONNECTED = 30_000; // 30s when WebSocket is live
const POLL_INTERVAL_DISCONNECTED = 10_000; // 10s when WebSocket is down

type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  walletType: WalletType | null;
  smartWalletAddress: string | null;
  custodialWalletAddress: string | null;
  balances: WalletBalance[];
  transactions: WalletTransaction[];
  totalPortfolioValue: number;
  isLoading: boolean;
  hasWalletFromSession: boolean;
  isRealtimeConnected: boolean;
  lastRealtimeUpdate: string | null;
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
    try {
      await walletApi.syncWallet();
    } catch {
      // Sync failed — wallet data will refresh on next poll
    }
    try {
      await refreshWallet();
    } catch {
      // Keep previous state on refresh failure
    }
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
    // No-op: wallet is managed by backend
  }, []);

  const clearWalletInfo = useCallback(() => {
    setWalletDetails(null);
    setActiveAddress(null);
  }, []);

  const [realtimeBalances, setRealtimeBalances] = useState<
    WalletBalance[] | null
  >(null);
  const [realtimeTransactions, setRealtimeTransactions] = useState<
    WalletTransaction[] | null
  >(null);

  const handleRealtimeUpdate = useCallback((payload: WalletUpdatePayload) => {
    const { data } = payload;
    if (data.balances?.length) {
      setRealtimeBalances(data.balances);
    }
    if (data.transactions?.length) {
      setRealtimeTransactions(data.transactions);
    }
  }, []);

  const { isConnected: isRealtimeConnected, lastUpdate: lastRealtimeUpdate } =
    useWalletRealtime({
      onUpdate: handleRealtimeUpdate,
      enabled: !!session?.user,
    });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPollHashRef = useRef<string>('');

  const pollWalletData = useCallback(async () => {
    if (!session?.user) return;
    try {
      const details = await walletApi.getWalletDetails();
      const balances = details.balances ?? [];
      const transactions = details.transactions ?? [];

      // Only update state if data actually changed (avoid unnecessary re-renders)
      const hash = JSON.stringify({
        b: balances,
        t: transactions.slice(0, 5),
      });
      if (hash !== lastPollHashRef.current) {
        lastPollHashRef.current = hash;
        setWalletDetails(prev => ({
          address: prev?.address ?? details.address,
          balances,
          transactions,
        }));
      }
    } catch {
      // Silently skip — next poll will retry
    }
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) return;

    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    const interval = isRealtimeConnected
      ? POLL_INTERVAL_CONNECTED
      : POLL_INTERVAL_DISCONNECTED;

    pollRef.current = setInterval(pollWalletData, interval);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [session?.user, isRealtimeConnected, pollWalletData]);

  const refreshWalletWithClear = useCallback(async () => {
    setRealtimeBalances(null);
    setRealtimeTransactions(null);
    lastPollHashRef.current = '';
    await refreshWallet();
  }, [refreshWallet]);

  const apiBalances = walletDetails?.balances ?? [];
  const balances = realtimeBalances ?? apiBalances;
  const transactions =
    realtimeTransactions ?? walletDetails?.transactions ?? [];
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
        isRealtimeConnected,
        lastRealtimeUpdate,
        setWalletInfo,
        clearWalletInfo,
        refreshWallet: refreshWalletWithClear,
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
