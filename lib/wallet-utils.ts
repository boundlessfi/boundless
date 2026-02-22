/**
 * Wallet Utilities
 * Comprehensive helper functions for Stellar wallet operations
 */

import { StellarNetwork } from '@/hooks/use-wallet';

// Environment variables
const rawNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
const STELLAR_NETWORK =
  rawNetwork === 'public' || rawNetwork === 'mainnet' ? 'public' : 'testnet';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

// Network configurations
export const NETWORKS = {
  testnet: {
    name: 'Testnet',
    horizon: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    explorer: 'https://stellar.expert/explorer/testnet',
    color: '#fbbf24', // yellow
  },
  public: {
    name: 'Public',
    horizon: 'https://horizon.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    explorer: 'https://stellar.expert/explorer/public',
    color: '#3b82f6', // blue
  },
} as const;

export type NetworkType = keyof typeof NETWORKS;

/**
 * Format a Stellar address for display
 * @param address - The full Stellar address
 * @param length - Number of characters to show from start and end
 * @returns Formatted address like "GABC...XYZ"
 */
export function formatAddress(address: string, length: number = 4): string {
  if (!address || address.length < length * 2 + 3) {
    return address;
  }

  const start = address.slice(0, length);
  const end = address.slice(-length);
  return `${start}...${end}`;
}

/**
 * Validate a Stellar address format
 * @param address - The address to validate
 * @returns True if valid Stellar address format
 */
export function validateAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Stellar addresses are 56 characters long and start with G, M, S, or T
  const stellarAddressRegex = /^[GMS][A-Z2-7]{55}$/;
  return stellarAddressRegex.test(address);
}

/**
 * Get explorer URL for an address
 * @param address - The Stellar address
 * @param network - The network (testnet or public)
 * @returns Full explorer URL
 */
export function getExplorerUrl(
  address: string,
  network: NetworkType = getCurrentNetwork()
): string {
  if (!validateAddress(address)) {
    throw new Error('Invalid Stellar address');
  }

  const networkConfig = NETWORKS[network];
  return `${networkConfig.explorer}/account/${address}`;
}

/**
 * Get transaction explorer URL
 * @param txHash - The transaction hash
 * @param network - The network (testnet or public)
 * @returns Full transaction explorer URL
 */
export function getTransactionExplorerUrl(
  txHash: string,
  network: NetworkType = getCurrentNetwork()
): string {
  const networkConfig = NETWORKS[network];
  return `${networkConfig.explorer}/tx/${txHash}`;
}

/**
 * Get asset explorer URL
 * @param assetCode - The asset code
 * @param assetIssuer - The asset issuer address
 * @param network - The network (testnet or public)
 * @returns Full asset explorer URL
 */
export function getAssetExplorerUrl(
  assetCode: string,
  assetIssuer: string,
  network: NetworkType = getCurrentNetwork()
): string {
  const networkConfig = NETWORKS[network];
  return `${networkConfig.explorer}/asset/${assetCode}-${assetIssuer}`;
}

/**
 * Get network configuration
 * @param network - The network type
 * @returns Network configuration object
 */
export function getNetworkConfig(network: NetworkType) {
  return NETWORKS[network];
}

/**
 * Get current network from environment
 * @returns Current network type
 */
export function getCurrentNetwork(): NetworkType {
  return STELLAR_NETWORK as NetworkType;
}

/**
 * Get horizon URL for current network
 * @param network - The network type
 * @returns Horizon server URL
 */
export function getHorizonUrl(
  network: NetworkType = getCurrentNetwork()
): string {
  return NETWORKS[network].horizon;
}

/**
 * Get network passphrase
 * @param network - The network type
 * @returns Network passphrase
 */
export function getNetworkPassphrase(
  network: NetworkType = getCurrentNetwork()
): string {
  return NETWORKS[network].networkPassphrase;
}

/**
 * Get network color
 * @param network - The network type
 * @returns Network color hex code
 */
export function getNetworkColor(
  network: NetworkType = getCurrentNetwork()
): string {
  return NETWORKS[network].color;
}

/**
 * Convert network type to display name
 * @param network - The network type
 * @returns Display name
 */
export function getNetworkDisplayName(network: NetworkType): string {
  return NETWORKS[network].name;
}

/**
 * Check if address is valid and format it
 * @param address - The address to validate and format
 * @returns Object with validation result and formatted address
 */
export function validateAndFormatAddress(address: string) {
  const isValid = validateAddress(address);
  const formatted = isValid ? formatAddress(address) : address;

  return {
    isValid,
    formatted,
    full: address,
  };
}

/**
 * Generate wallet connection metadata
 * @returns Wallet connection metadata object
 */
export function getWalletMetadata() {
  return {
    name: 'Boundless',
    description: 'Stellar-based application',
    url: APP_URL,
    icons: [`${APP_URL}/logo.svg`],
  };
}

/**
 * Get WalletConnect configuration
 * @returns WalletConnect config object
 */
export function getWalletConnectConfig() {
  if (!WALLET_CONNECT_PROJECT_ID) {
    throw new Error('WALLET_CONNECT_PROJECT_ID is required for WalletConnect');
  }

  return {
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: getWalletMetadata(),
  };
}

/**
 * Format XDR for display
 * @param xdr - The XDR string
 * @param maxLength - Maximum length to show
 * @returns Formatted XDR string
 */
export function formatXDR(xdr: string, maxLength: number = 50): string {
  if (!xdr || xdr.length <= maxLength) {
    return xdr;
  }

  return `${xdr.slice(0, maxLength)}...`;
}

/**
 * Validate XDR format
 * @param xdr - The XDR string to validate
 * @returns True if valid XDR format
 */
export function validateXDR(xdr: string): boolean {
  if (!xdr || typeof xdr !== 'string') {
    return false;
  }

  // Basic XDR validation - should be base64 encoded
  try {
    // Check if it's valid base64
    atob(xdr);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get wallet display name from wallet ID
 * @param walletId - The wallet identifier
 * @returns Display name for the wallet
 */
export function getWalletDisplayName(walletId: string): string {
  const walletNames: Record<string, string> = {
    freighter: 'Freighter',
    albedo: 'Albedo',
    rabet: 'Rabet',
    xbull: 'xBull',
    lobstr: 'Lobstr',
    hana: 'Hana',
    'hot-wallet': 'HOT Wallet',
    'wallet-connect': 'WalletConnect',
  };

  return walletNames[walletId] || walletId;
}

/**
 * Get wallet icon path
 * @param walletId - The wallet identifier
 * @returns Path to wallet icon
 */
export function getWalletIcon(walletId: string): string {
  return `/wallets/${walletId}.svg`;
}

/**
 * Check if wallet supports specific feature
 * @param walletId - The wallet identifier
 * @param feature - The feature to check
 * @returns True if wallet supports the feature
 */
export function walletSupportsFeature(
  walletId: string,
  feature: 'transaction' | 'message' | 'auth-entry'
): boolean {
  const capabilities: Record<string, Record<string, boolean>> = {
    freighter: {
      transaction: true,
      message: true,
      'auth-entry': true,
    },
    albedo: {
      transaction: true,
      message: false,
      'auth-entry': false,
    },
    rabet: {
      transaction: true,
      message: true,
      'auth-entry': true,
    },
    xbull: {
      transaction: true,
      message: true,
      'auth-entry': true,
    },
    lobstr: {
      transaction: true,
      message: false,
      'auth-entry': false,
    },
    hana: {
      transaction: true,
      message: false,
      'auth-entry': false,
    },
    'hot-wallet': {
      transaction: true,
      message: true,
      'auth-entry': true,
    },
    'wallet-connect': {
      transaction: true,
      message: true,
      'auth-entry': true,
    },
  };

  return capabilities[walletId]?.[feature] || false;
}

/**
 * Generate a unique session ID for wallet connections
 * @returns Unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse network from string
 * @param network - Network string
 * @returns Network type or null if invalid
 */
export function parseNetwork(network: string): NetworkType | null {
  if (network === 'testnet' || network === 'public') {
    return network as NetworkType;
  }
  return null;
}

/**
 * Convert StellarNetwork type to NetworkType
 * @param network - StellarNetwork type value
 * @returns NetworkType
 */
export function stellarNetworkToType(network: StellarNetwork): NetworkType {
  return network === 'testnet' ? 'testnet' : 'public';
}

/**
 * Convert NetworkType to StellarNetwork type
 * @param network - NetworkType
 * @returns StellarNetwork type value
 */
export function networkTypeToStellar(network: NetworkType): StellarNetwork {
  return network === 'testnet' ? 'testnet' : 'public';
}
