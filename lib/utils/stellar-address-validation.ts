/**
 * Validates a Stellar address format
 * Stellar addresses start with G and are 56 characters long
 */
export const validateStellarAddress = (address: string): boolean => {
  const stellarAddressRegex = /^G[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{55}$/;
  return stellarAddressRegex.test(address);
};
