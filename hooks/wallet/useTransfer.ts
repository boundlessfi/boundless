import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getKit } from '@/lib/smartwallet/client';
import { useWalletStore } from '@/lib/stores/walletStore';
import { qk } from '@/lib/smartwallet/query-keys';
import { SUPPORTED_ASSETS, type AssetSymbol } from '@/lib/smartwallet/config';

type TransferInput = {
  asset: AssetSymbol;
  recipient: string;
  amount: number;
};

export function useTransfer() {
  const queryClient = useQueryClient();
  const contractId = useWalletStore(s => s.contractId);

  return useMutation({
    mutationFn: ({ asset, recipient, amount }: TransferInput) => {
      const { contractId: tokenContract } = SUPPORTED_ASSETS[asset];
      return getKit().transfer(tokenContract, recipient, amount);
    },

    onSuccess: () => {
      if (!contractId) return;
      queryClient.invalidateQueries({ queryKey: qk.balances(contractId) });
      queryClient.invalidateQueries({ queryKey: qk.transactions(contractId) });
    },

    throwOnError: false,
  });
}
