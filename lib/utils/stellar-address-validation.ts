import { StrKey } from '@stellar/stellar-sdk';

/**
 * Validates a Stellar public key (G... address).
 * Uses the official SDK to verify format, RFC4648 base32 encoding, and CRC16 checksum.
 */
export const validateStellarAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false;
  const trimmed = address.trim();
  return StrKey.isValidEd25519PublicKey(trimmed);
};
