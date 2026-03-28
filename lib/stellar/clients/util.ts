/**
 * Shared config for generated contract clients.
 * Values are read from environment at runtime via stellar.config.
 */

export const rpcUrl =
  process.env.STELLAR_RPC_URL ||
  (process.env.STELLAR_NETWORK === 'mainnet'
    ? 'https://soroban-rpc.mainnet.stellar.org'
    : 'https://soroban-testnet.stellar.org');

export const networkPassphrase =
  process.env.STELLAR_NETWORK_PASSPHRASE ||
  (process.env.STELLAR_NETWORK === 'mainnet'
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015');
