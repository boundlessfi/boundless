/**
 * Transaction signing stub. Wallet is managed by the backend; signing is not
 * available until the backend exposes a sign endpoint (e.g. POST /api/wallet/sign).
 * Escrow and funding flows will fail at runtime until then.
 */
interface SignTransactionProps {
  unsignedTransaction: string;
  address: string;
}

export const signTransaction = async (
  _props: SignTransactionProps
): Promise<string> => {
  throw new Error(
    'Transaction signing is not available. Backend must expose a sign endpoint for escrow and funding.'
  );
};
