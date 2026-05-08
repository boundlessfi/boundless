import { useMutation } from '@tanstack/react-query';
import { useWalletStore } from '@/lib/stores/walletStore';

export function useConnect() {
  const connect = useWalletStore(s => s.connect);

  return useMutation({
    mutationFn: connect,
    throwOnError: false,
  });
}
