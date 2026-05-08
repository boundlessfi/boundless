import { useQuery } from '@tanstack/react-query';
import { useWalletStore } from '@/lib/stores/walletStore';
import { qk } from '@/lib/smartwallet/query-keys';
import { fetchOrThrow } from '@/lib/smartwallet/errors';

export type AssetBalance = {
  symbol: string;
  name: string;
  icon: string;
  contractId: string;
  raw: string;
  formatted: string;
  priceUsd: string;
  valueUsd: string;
  // Alias so existing components that read `.code` keep working
  code: string;
};

export type WalletSummary = {
  balances: AssetBalance[];
  totalUsd: string;
};

type SummaryResponse = {
  balances: Omit<AssetBalance, 'code'>[];
  totalUsd: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export function useBalances() {
  const contractId = useWalletStore(s => s.contractId);
  const isConnected = useWalletStore(s => s.isConnected);

  const query = useQuery({
    queryKey: qk.balances(contractId!),
    enabled: isConnected && !!contractId,
    staleTime: 15_000,
    refetchInterval: 30_000,

    queryFn: async () => {
      const res =
        await fetchOrThrow<ApiEnvelope<SummaryResponse>>(`/api/balances/me`);
      return res.data;
    },
    select: (data): WalletSummary => ({
      totalUsd: data.totalUsd,
      balances: data.balances.map(b => ({ ...b, code: b.symbol })),
    }),
  });

  return {
    balances: query.data?.balances ?? [],
    totalUsd: query.data?.totalUsd ?? '0.00',
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
