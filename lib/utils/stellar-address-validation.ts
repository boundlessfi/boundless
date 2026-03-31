/**
 * Re-exports from wallet-utils for backward compatibility.
 * Prefer importing directly from '@/lib/wallet-utils' in new code.
 */
export {
  validateAddress as validateStellarAddress,
  isContractAddress,
} from '@/lib/wallet-utils';
