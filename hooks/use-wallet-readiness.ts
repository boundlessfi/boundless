import { useWalletContext } from '@/components/providers/wallet-provider';

export type WalletNotReadyReason =
  | 'not_activated'
  | 'no_usdc_trustline'
  | 'insufficient_xlm'
  | 'insufficient_usdc';

export interface WalletReadinessResult {
  isReady: boolean;
  reasons: WalletNotReadyReason[];
  hasWallet: boolean;
}

const MIN_XLM_BALANCE = 2; // 1 XLM for account + 0.5 for trustline + fees

export function useWalletReadiness() {
  const { walletAddress, walletType, balances } = useWalletContext();

  const checkReadiness = (requiredUsdc: number = 0): WalletReadinessResult => {
    if (!walletAddress) {
      return { isReady: false, reasons: [], hasWallet: false };
    }

    const reasons: WalletNotReadyReason[] = [];

    // Smart wallets (C-addresses) don't need activation or classic trustlines.
    // They interact with SAC token contracts directly via Soroban.
    const isSmartWallet = walletType === 'smart';

    if (!isSmartWallet) {
      const xlmBalance = balances.find(b => b.asset_type === 'native');
      const xlmAmount = xlmBalance ? parseFloat(xlmBalance.balance) : 0;

      // 1. Check activation (needs at least 1 XLM to exist)
      if (xlmAmount < 1) {
        reasons.push('not_activated');
      } else if (xlmAmount < MIN_XLM_BALANCE) {
        reasons.push('insufficient_xlm');
      }

      // 2. Check USDC trustline (only for custodial wallets)
      const usdcBalance = balances.find(b => b.asset_code === 'USDC');
      if (!usdcBalance) {
        reasons.push('no_usdc_trustline');
      }
    }

    // 3. Check sufficient USDC funds (applies to both wallet types)
    if (requiredUsdc > 0) {
      const usdcBalance = balances.find(b => b.asset_code === 'USDC');
      const usdcAmount = usdcBalance ? parseFloat(usdcBalance.balance) : 0;
      if (usdcAmount < requiredUsdc) {
        reasons.push('insufficient_usdc');
      }
    }

    return {
      isReady: reasons.length === 0,
      reasons,
      hasWallet: true,
    };
  };

  return {
    checkReadiness,
  };
}
