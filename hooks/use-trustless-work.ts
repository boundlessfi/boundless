/**
 * @deprecated Trustless Work has been replaced by direct CoreEscrow Soroban contract calls.
 * Use the backend escrow API (`lib/api/escrow.ts`) instead.
 *
 * This file is kept temporarily to avoid breaking any remaining imports.
 * All escrow operations now go through the backend.
 */

/** @deprecated Use backend escrow API instead */
export function useTrustlessWork() {
  return {
    apiKey: '',
    network: 'testnet' as const,
    baseURL: '',
    isConfigured: false,
    isReady: false,
  };
}

/** @deprecated */
export function useTrustlessWorkApiKey() {
  return '';
}

/** @deprecated */
export function useTrustlessWorkNetwork() {
  return 'testnet' as const;
}

/** @deprecated */
export function useTrustlessWorkBaseURL() {
  return '';
}

/** @deprecated */
export function useTrustlessWorkConfigured() {
  return false;
}

export default useTrustlessWork;
