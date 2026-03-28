/**
 * Smart Wallet (Passkey) configuration.
 *
 * Uses smart-account-kit (OpenZeppelin smart accounts on Stellar/Soroban)
 * for passkey-based self-custodial wallets.
 *
 * Required env vars (or uses testnet defaults):
 *   NEXT_PUBLIC_STELLAR_RPC_URL
 *   NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE
 *   NEXT_PUBLIC_SMART_ACCOUNT_WASM_HASH
 *   NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS
 *
 * Optional env vars:
 *   NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT
 *   NEXT_PUBLIC_SMART_WALLET_INDEXER_URL
 *   NEXT_PUBLIC_SMART_WALLET_RELAYER_URL
 */

import type { SmartAccountConfig } from 'smart-account-kit';

const TESTNET_DEFAULTS = {
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
  accountWasmHash:
    'a12e8fa9621efd20315753bd4007d974390e31fbcb4a7ddc4dd0a0dec728bf2e',
  webauthnVerifierAddress:
    'CBSHV66WG7UV6FQVUTB67P3DZUEJ2KJ5X6JKQH5MFRAAFNFJUAJVXJYV',
  nativeTokenContract:
    'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
};

const MAINNET_DEFAULTS = {
  rpcUrl: 'https://soroban-rpc.mainnet.stellar.org',
  networkPassphrase: 'Public Global Stellar Network ; September 2015',
  accountWasmHash: '',
  webauthnVerifierAddress: '',
  nativeTokenContract: '',
};

const isMainnet =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public' ||
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet';

const defaults = isMainnet ? MAINNET_DEFAULTS : TESTNET_DEFAULTS;

export const smartWalletConfig: SmartAccountConfig = {
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || defaults.rpcUrl,
  networkPassphrase:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
    defaults.networkPassphrase,
  accountWasmHash:
    process.env.NEXT_PUBLIC_SMART_ACCOUNT_WASM_HASH || defaults.accountWasmHash,
  webauthnVerifierAddress:
    process.env.NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS ||
    defaults.webauthnVerifierAddress,
  timeoutInSeconds: 30,
  indexerUrl: process.env.NEXT_PUBLIC_SMART_WALLET_INDEXER_URL || false,
  relayerUrl: process.env.NEXT_PUBLIC_SMART_WALLET_RELAYER_URL || undefined,
};

/** Native XLM token SAC address for testnet funding */
export const nativeTokenContract =
  process.env.NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT || defaults.nativeTokenContract;

// ---------------------------------------------------------------------------
// Network currency definitions (SAC token contracts)
// ---------------------------------------------------------------------------

export interface CurrencyInfo {
  code: string;
  name: string;
  tokenAddress: string;
  issuer: string;
  decimals: number;
}

type NetworkCurrencies = Record<string, CurrencyInfo>;

const TESTNET_CURRENCIES: NetworkCurrencies = {
  USDC: {
    code: 'USDC',
    name: 'USD Coin',
    tokenAddress: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
    issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    decimals: 7,
  },
  XLM: {
    code: 'XLM',
    name: 'Stellar Lumens',
    tokenAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    issuer: 'native',
    decimals: 7,
  },
  EURC: {
    code: 'EURC',
    name: 'Euro Coin',
    tokenAddress: 'CCUUDM434BMZMYWYDITHFXHDMIVTGGD6T2I5UKNX5BSLXLW7HVR4MCGZ',
    issuer: 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO',
    decimals: 7,
  },
};

const MAINNET_CURRENCIES: NetworkCurrencies = {
  USDC: {
    code: 'USDC',
    name: 'USD Coin',
    tokenAddress: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75',
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    decimals: 7,
  },
  USDGLO: {
    code: 'USDGLO',
    name: 'Global Dollar',
    tokenAddress: 'CB226ZOEYXTBPD3QEGABTJYSKZVBP2PASEISLG3SBMTN5CE4QZUVZ3CE',
    issuer: 'GBBS25EGYQPGEZCGCFBKG4OAGFXU6DSOQBGTHELLJT3HZXZJ34HWS6XV',
    decimals: 7,
  },
  XLM: {
    code: 'XLM',
    name: 'Stellar Lumens',
    tokenAddress: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
    issuer: 'native',
    decimals: 7,
  },
  EURC: {
    code: 'EURC',
    name: 'Euro Coin',
    tokenAddress: 'CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV',
    issuer: 'GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2',
    decimals: 7,
  },
};

/** Token currencies for the active network */
export const networkCurrencies: NetworkCurrencies = isMainnet
  ? MAINNET_CURRENCIES
  : TESTNET_CURRENCIES;

// ---------------------------------------------------------------------------
// Known policy contracts
// ---------------------------------------------------------------------------

export interface PolicyInfo {
  type: 'threshold' | 'spending_limit' | 'weighted_threshold' | 'custom';
  name: string;
  description: string;
  address: string;
}

const TESTNET_POLICIES: PolicyInfo[] = [
  {
    type: 'threshold',
    name: 'Threshold (M-of-N)',
    description: 'Requires M signatures out of N total signers',
    address:
      process.env.NEXT_PUBLIC_THRESHOLD_POLICY_ADDRESS ||
      'CCT4MMN5MJ6O2OU6LXPYTCVORQ2QVTBMDJ7MYBZQ2ULSYQVUIYP4IFYD',
  },
  {
    type: 'spending_limit',
    name: 'Spending Limit',
    description: 'Limits spending to a maximum amount per time period',
    address:
      process.env.NEXT_PUBLIC_SPENDING_LIMIT_POLICY_ADDRESS ||
      'CBMMWY54XOV6JJHSWCMKWWPXVRXASR5U26UJMLZDN4SP6CFFTVZARPTY',
  },
  {
    type: 'weighted_threshold',
    name: 'Weighted Threshold',
    description:
      'Requires minimum total weight from signers with different voting weights',
    address:
      process.env.NEXT_PUBLIC_WEIGHTED_THRESHOLD_POLICY_ADDRESS ||
      'CBYDQ5XUBP7G24FI3LLGLW56QZCIEUSVRPX7FVOUCKHJQQ6DTF6BQGBZ',
  },
];

const MAINNET_POLICIES: PolicyInfo[] = [];

/** Known policy contracts for the active network */
export const knownPolicies: PolicyInfo[] = isMainnet
  ? MAINNET_POLICIES
  : TESTNET_POLICIES;

/** WebAuthn verifier address (needed for building passkey signers) */
export const webauthnVerifierAddress: string =
  smartWalletConfig.webauthnVerifierAddress;
