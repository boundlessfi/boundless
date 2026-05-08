import { useQuery } from '@tanstack/react-query';
import { getKit } from '@/lib/smartwallet/client';
import { useWalletStore } from '@/lib/stores/walletStore';
import { qk } from '@/lib/smartwallet/query-keys';

export function useCredentials() {
  const isConnected = useWalletStore(s => s.isConnected);

  return useQuery({
    queryKey: qk.credentials(),
    queryFn: () => getKit().credentials.getAll(),
    enabled: isConnected,
    staleTime: 30_000,
  });
}

export function useContractDetails() {
  const contractId = useWalletStore(s => s.contractId);

  return useQuery({
    queryKey: qk.contractDetails(contractId!),
    queryFn: () => getKit().getContractDetailsFromIndexer(contractId!),
    enabled: !!contractId,
    staleTime: 60_000,
  });
}

export function useContextRules() {
  const contractId = useWalletStore(s => s.contractId);

  return useQuery({
    queryKey: qk.rules(contractId!),
    queryFn: () => getKit().rules.list(),
    enabled: !!contractId,
  });
}
