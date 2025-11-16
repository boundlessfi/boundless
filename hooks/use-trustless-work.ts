/**
 * Trustless Work Hook
 *
 * Provides easy access to Trustless Work SDK functions and configuration.
 * This hook re-exports and provides convenient access to escrow operations.
 */

import { useTrustlessWorkConfig } from '@/lib/providers/TrustlessWorkProvider';

/**
 * Main hook to access Trustless Work functionality
 *
 * @returns Trustless Work configuration and utilities
 *
 * @example
 * ```tsx
 * function EscrowComponent() {
 *   const { apiKey, network, baseURL, isConfigured } = useTrustlessWork();
 *
 *   if (!isConfigured) {
 *     return <div>Please configure Trustless Work API key</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Network: {network}</p>
 *       <p>Base URL: {baseURL}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTrustlessWork() {
  const config = useTrustlessWorkConfig();

  return {
    ...config,
    /**
     * Check if Trustless Work is properly configured
     */
    isReady: config.isConfigured && Boolean(config.apiKey),
  };
}

/**
 * Hook to get only the API key
 *
 * @returns API key string
 */
export function useTrustlessWorkApiKey() {
  const { apiKey } = useTrustlessWorkConfig();
  return apiKey;
}

/**
 * Hook to get only the network configuration
 *
 * @returns Network type ('testnet' | 'public')
 */
export function useTrustlessWorkNetwork() {
  const { network } = useTrustlessWorkConfig();
  return network;
}

/**
 * Hook to get only the base URL
 *
 * @returns Base URL string
 */
export function useTrustlessWorkBaseURL() {
  const { baseURL } = useTrustlessWorkConfig();
  return baseURL;
}

/**
 * Hook to check if Trustless Work is configured
 *
 * @returns Boolean indicating if Trustless Work is configured
 */
export function useTrustlessWorkConfigured() {
  const { isConfigured } = useTrustlessWorkConfig();
  return isConfigured;
}

// Re-export the main hook as default
export default useTrustlessWork;
