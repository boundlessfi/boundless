import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getKit } from '@/lib/smartwallet/client';
import { useWalletStore } from '@/lib/stores/walletStore';
import { qk } from '@/lib/smartwallet/query-keys';

export function useAddPasskeySigner() {
  const queryClient = useQueryClient();
  const contractId = useWalletStore(s => s.contractId);

  return useMutation({
    mutationFn: ({
      contextRuleId,
      appName,
      userName,
    }: {
      contextRuleId: number;
      appName: string;
      userName: string;
    }) => getKit().signers.addPasskey(contextRuleId, appName, userName),

    onSuccess: () => {
      if (contractId) {
        queryClient.invalidateQueries({ queryKey: qk.rules(contractId) });
      }
      queryClient.invalidateQueries({ queryKey: qk.credentials() });
    },
  });
}

export function useDeployCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentialId: string) =>
      getKit().credentials.deploy(credentialId, { autoSubmit: true }),

    onSuccess: (_, credentialId) => {
      queryClient.invalidateQueries({ queryKey: qk.credential(credentialId) });
      queryClient.invalidateQueries({ queryKey: qk.credentials() });
    },
  });
}
