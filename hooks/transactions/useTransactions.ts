import { useInfiniteQuery } from '@tanstack/react-query';
import { useWalletStore } from '@/lib/stores/walletStore';
import { qk } from '@/lib/smartwallet/query-keys';
import { fetchOrThrow } from '@/lib/smartwallet/errors';

export type Transaction = {
  id: string;
  hash: string;
  type: string;
  asset: string;
  amount: string;
  amountFormatted: string;
  from: string;
  to: string;
  createdAt: string;
  ledger: number;
  successful: boolean;
};

type TransactionsPage = {
  records: Transaction[];
  nextCursor: string | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export function useTransactions() {
  const contractId = useWalletStore(s => s.contractId);
  const isConnected = useWalletStore(s => s.isConnected);

  const query = useInfiniteQuery({
    queryKey: qk.transactions(contractId!),
    enabled: isConnected && !!contractId,
    staleTime: 20_000,
    refetchInterval: 30_000,

    initialPageParam: undefined as string | undefined,

    queryFn: async ({ pageParam }) => {
      const cursor = pageParam
        ? `?cursor=${encodeURIComponent(pageParam)}`
        : '';
      const res = await fetchOrThrow<ApiEnvelope<TransactionsPage>>(
        `/api/transactions/me${cursor}`
      );
      return res.data;
    },

    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,

    select: data => ({
      pages: data.pages,
      transactions: data.pages.flatMap(p => p.records),
      isEmpty: data.pages[0]?.records.length === 0,
    }),

    throwOnError: false,
  });

  return {
    transactions: query.data?.transactions ?? [],
    isEmpty: query.data?.isEmpty ?? false,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
