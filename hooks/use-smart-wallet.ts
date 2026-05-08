import { useWalletStore } from '@/lib/stores/walletStore';
import { useConnect } from '@/hooks/wallet/useConnect';
import { useCreateWallet } from '@/hooks/wallet/useCreateWallet';

export type SmartWalletHook = {
  contractId: string | null;
  isConnected: boolean;
  isRestoring: boolean;
  isAvailable: boolean;
  credentialId: string | null;
  connect: () => Promise<void>;
  register: (appName: string, email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export function useSmartWallet(): SmartWalletHook {
  const contractId = useWalletStore(s => s.contractId);
  const isConnected = useWalletStore(s => s.isConnected);
  const isRestoring = useWalletStore(s => s.isRestoring);
  const error = useWalletStore(s => s.error);

  const connectMutation = useConnect();
  const createMutation = useCreateWallet();

  return {
    contractId,
    isConnected,
    isRestoring,
    isAvailable: isConnected,
    credentialId: null, // contractId is the canonical identifier in this SDK
    error,

    connect: () => connectMutation.mutateAsync(),

    register: (appName, email) =>
      createMutation
        .mutateAsync({ appName, userName: email })
        .then(() => undefined),

    isLoading: connectMutation.isPending || createMutation.isPending,
  };
}
