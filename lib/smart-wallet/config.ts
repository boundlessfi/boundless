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
