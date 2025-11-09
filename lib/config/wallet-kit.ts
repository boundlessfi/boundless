import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  AlbedoModule,
  FreighterModule,
} from '@creit.tech/stellar-wallets-kit';

/**
 * Get the current network from environment variable or default to TESTNET
 */
const getNetwork = (): WalletNetwork => {
  const envNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK;
  if (envNetwork === 'public' || envNetwork === 'mainnet') {
    return WalletNetwork.PUBLIC;
  }
  return WalletNetwork.TESTNET;
};

/**
 * Main configuration for Stellar Wallet Kit
 * This kit supports multiple wallet types including Freighter and Albedo
 * Configure for TESTNET during development and MAINNET for production
 */
export const kit: StellarWalletsKit = new StellarWalletsKit({
  network: getNetwork(),
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule(), new AlbedoModule()],
});

/**
 * Interface for transaction signing parameters
 */
interface SignTransactionProps {
  unsignedTransaction: string;
  address: string;
}

/**
 * Sign a Stellar transaction using the connected wallet
 * This function handles the signing process and returns the signed transaction
 *
 * @param unsignedTransaction - The XDR string of the unsigned transaction
 * @param address - The wallet address that will sign the transaction
 * @returns Promise<string> - The signed transaction XDR
 */
export const signTransaction = async ({
  unsignedTransaction,
  address,
}: SignTransactionProps): Promise<string> => {
  const currentNetwork = getNetwork();
  const { signedTxXdr } = await kit.signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: currentNetwork,
  });

  return signedTxXdr;
};
