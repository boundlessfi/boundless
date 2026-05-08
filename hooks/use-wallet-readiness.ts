import { useWalletStore } from '@/lib/stores/walletStore';
import { useBalances } from '@/hooks/assets/useBalances';

export type WalletNotReadyReason =
  | 'not_activated'
  | 'insufficient_xlm'
  | 'insufficient_usdc';

export interface WalletReadinessResult {
  isReady: boolean;
  reasons: WalletNotReadyReason[];
  hasWallet: boolean;
}

/**
 * Smart-wallet-only readiness check. Smart wallets (C-addresses) don't need
 * classic activation or trustlines — they talk to SAC token contracts directly.
 * So the only runtime check is: does the user have enough USDC for the action?
 */
export function useWalletReadiness() {
  const walletAddress = useWalletStore(s => s.contractId);
  const { balances } = useBalances();

  const checkReadiness = (requiredUsdc = 0): WalletReadinessResult => {
    if (!walletAddress) {
      return { isReady: false, reasons: [], hasWallet: false };
    }

    const reasons: WalletNotReadyReason[] = [];
    if (requiredUsdc > 0) {
      const usdc = balances.find(b => b.code === 'USDC');
      const amount = usdc ? parseFloat(usdc.formatted) : 0;
      if (amount < requiredUsdc) reasons.push('insufficient_usdc');
    }

    return {
      isReady: reasons.length === 0,
      reasons,
      hasWallet: true,
    };
  };

  return { checkReadiness };
}
