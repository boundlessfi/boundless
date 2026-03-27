/**
 * Transaction signing via passkey-based smart wallet.
 *
 * When the user has a connected smart wallet, signing is done via WebAuthn
 * passkey (smart-account-kit). The SDK's sign/signAndSubmit methods work
 * with AssembledTransaction objects, so for raw XDR signing we use the
 * kit's signAuthEntry on individual auth entries.
 *
 * Falls back to an error if no smart wallet is available.
 */
interface SignTransactionProps {
  unsignedTransaction: string;
  address: string;
}

export const signTransaction = async (
  props: SignTransactionProps
): Promise<string> => {
  try {
    const { getConnectedKit } = await import('@/lib/smart-wallet/client');
    const kit = await getConnectedKit();

    // Parse the XDR into a transaction, sign auth entries, and return
    const { TransactionBuilder } = await import('@stellar/stellar-sdk');
    const tx = TransactionBuilder.fromXDR(
      props.unsignedTransaction,
      kit.networkPassphrase
    );

    // For Soroban transactions with auth entries, sign each one
    if ('operations' in tx && tx.operations.length > 0) {
      const op = tx.operations[0] as { auth?: unknown[] };
      if (op.auth && op.auth.length > 0) {
        const { xdr } = await import('@stellar/stellar-sdk');
        for (let i = 0; i < op.auth.length; i++) {
          const entry = op.auth[i] as InstanceType<
            typeof xdr.SorobanAuthorizationEntry
          >;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          op.auth[i] = await kit.signAuthEntry(entry as any);
        }
      }
    }

    return tx.toXDR();
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes('NEXT_PUBLIC_SMART_ACCOUNT_WASM_HASH') ||
        err.message.includes('NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS'))
    ) {
      throw new Error(
        'Smart wallet is not configured. Set NEXT_PUBLIC_SMART_ACCOUNT_WASM_HASH and NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS in your environment.'
      );
    }
    throw err;
  }
};
