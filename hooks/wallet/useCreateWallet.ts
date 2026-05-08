import { useMutation } from '@tanstack/react-query';
import { getKit } from '@/lib/smartwallet/client';
import { useWalletStore } from '@/lib/stores/walletStore';
import { nativeTokenContract } from '@/lib/smartwallet/config';

type CreateWalletInput = {
  appName: string;
  userName: string;
  autoFund?: boolean;
  nativeTokenContract?: string;
};

export function useCreateWallet() {
  const setConnected = useWalletStore(s => s.setConnected);

  return useMutation({
    mutationFn: async ({
      appName,
      userName,
      autoFund = false,
    }: CreateWalletInput) => {
      return getKit().createWallet(appName, userName, {
        autoSubmit: true,
        autoFund,
        nativeTokenContract,
      });
    },

    onSuccess: ({ contractId }) => {
      setConnected(contractId);
    },

    throwOnError: false,
  });
}
