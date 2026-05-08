import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletStore } from '@/lib/stores/walletStore';
import { qk } from '@/lib/smartwallet/query-keys';

export function useDisconnect() {
  const queryClient = useQueryClient();
  const disconnect = useWalletStore(s => s.disconnect);
  const contractId = useWalletStore(s => s.contractId);

  return useMutation({
    mutationFn: disconnect,

    onSuccess: () => {
      if (contractId) {
        queryClient.removeQueries({ queryKey: qk.balances(contractId) });
        queryClient.removeQueries({ queryKey: qk.transactions(contractId) });
      }
      queryClient.removeQueries({ queryKey: qk.credentials() });
    },

    throwOnError: false,
  });
}
