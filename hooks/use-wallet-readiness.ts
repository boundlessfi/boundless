import { useMemo } from 'react';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { WalletBalance } from '@/types/wallet';

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
  const { walletAddress, balances } = useWalletContext();

  const checkReadiness = (requiredUsdc: number = 0): WalletReadinessResult => {
    if (!walletAddress) {
      return { isReady: false, reasons: [], hasWallet: false };
    }

    const reasons: WalletNotReadyReason[] = [];
    
    const nativeBalance = balances.find(b => b.asset_type === 'native');
    const xlmAmount = nativeBalance ? parseFloat(nativeBalance.balance) : 0;
    
    // 1. Check activation (needs at least 1 XLM to exist)
    if (xlmAmount < 1) {
      reasons.push('not_activated');
    } else if (xlmAmount < MIN_XLM_BALANCE) {
      reasons.push('insufficient_xlm');
    }

    // 2. Check USDC trustline
    const usdcBalance = balances.find(b => b.asset_code === 'USDC');
    if (!usdcBalance) {
      reasons.push('no_usdc_trustline');
    }

    // 3. Check sufficient USDC funds
    if (requiredUsdc > 0) {
      const usdcAmount = usdcBalance ? parseFloat(usdcBalance.balance) : 0;
      if (usdcAmount < requiredUsdc) {
        reasons.push('insufficient_usdc');
      }
    }

    return {
      isReady: reasons.length === 0,
      reasons,
      hasWallet: true
    };
  };

  return {
    checkReadiness
  };
}
