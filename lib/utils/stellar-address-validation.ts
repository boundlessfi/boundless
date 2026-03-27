import { StrKey } from '@stellar/stellar-sdk';

/**
 * Validates a Stellar public key (G... address) or contract address (C... address).
 * G-addresses are verified via the SDK checksum; C-addresses are validated by format.
 */
export const validateStellarAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return StrKey.isValidEd25519PublicKey(trimmed) || isContractAddress(trimmed);
};

/** Check if address is a Stellar contract address (C-address, 56 chars, base32). */
export const isContractAddress = (address: string): boolean => {
  return (
    typeof address === 'string' &&
    address.length === 56 &&
    /^C[A-Z2-7]+$/.test(address)
  );
};
